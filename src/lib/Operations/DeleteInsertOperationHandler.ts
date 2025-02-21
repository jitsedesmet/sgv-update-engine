import {BaseOperationHandler, type ParserInsertDeleteType, type SgvOperation} from './BaseOperationHandler';
import type {SparqlQuery} from 'sparqljs';
import {
  assertVal,
  fileResourceToStore,
  getPrunedStore,
  getQueryWithoutPrefixes, getRootResources,
  quadToString,
  storeMinus,
  storeUnion,
  translateStore
} from '../helpers/Helpers';
import {RdfStore} from 'rdf-stores';
import type * as RDF from '@rdfjs/types';
import {DataFactory} from 'rdf-data-factory';
import type {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

const DF = new DataFactory();

export class DeleteInsertOperationHandler extends BaseOperationHandler {
    public operation: SgvOperation = 'delete insert';

    public constructor(
        engine: QueryEngine,
        private parsedOperation: ParserInsertDeleteType,
        private completeQuery: SparqlQuery,
        parsedSgv: ParsedSGV) {
        super(engine, parsedSgv);
    }

    public async findAlteredResource(pod: string, rawDelete: string | undefined, rawInsert: string | undefined, rawWhere: string): Promise<RDF.NamedNode> {
      // Where can we expect posts?
      const posts = RdfStore.createDefault();

      const postDirLocation = this.parsedSgv
        .collections.filter(collection => collection.uri.value.indexOf('posts') !== -1)[0].uri;

      // get posts locations
      const postsLocations: string[] = [];
      if (postDirLocation.value.slice(-1) !== '/') {
        postsLocations.push(postDirLocation.value);
      } else {
        for await (const binding of await this.engine.queryBindings('SELECT ?o WHERE { ?s <http://www.w3.org/ns/ldp#contains> ?o }', {
          sources: [postDirLocation.value]
        })) {
          postsLocations.push(binding.get('o')!.value);
        }
      }

      if (postsLocations.length !== 0) {
        posts.removeMatches();
        for await (const quad of await this.engine.queryQuads('CONSTRUCT WHERE { ?s ?p ?o }', {
          sources: postsLocations as [string, ...string[]]
        })) {
          posts.addQuad(quad);
        }
      }

      const removalStore = RdfStore.createDefault();
      const additionStore = RdfStore.createDefault();

      if (rawDelete) {
        for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawDelete} } WHERE { ${rawWhere} }`, {
          sources: [posts]
        })) {
          removalStore.addQuad(quad);
        }
      }
      if (rawInsert) {
        for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawInsert} } WHERE { ${rawWhere} }`, {
          sources: [posts]
        })) {
          additionStore.addQuad(quad);
        }
      }

      const newResource = storeUnion(
        additionStore, removalStore
      );

      // This only works when not nesting properties
      const focussedResource = getRootResources(newResource)[0];


      return focussedResource;
    }


    public override async handleOperation(pod: string, dryRun : boolean): Promise<string[]> {
        // We construct the resource we will delete and insert by looking at the where clause in the parsed operation.
        const rawQuery = getQueryWithoutPrefixes(this.completeQuery);
        // Either delete is present, or it is not:
        let rawDelete = '';
        let rawInsert = '';
        let rawWhere = '';
        if (this.parsedOperation.delete?.length) {
            const selection = rawQuery.replaceAll(
                /DELETE\s*\{([^}]*)\}\s*(INSERT\s*\{([^}]*)\}\s*)?WHERE\s*\{([^}]*)\}/gui,
                '$1\t$3\t$4'
            ).split('\t');
            rawDelete = selection[0];
            rawInsert = selection[1];
            rawWhere = selection[2];

            console.log(selection)
        } else {
            const selection = rawQuery.replaceAll(
                /INSERT\s*\{([^}]*)\}\s*WHERE\s*\{([^}]*)\}/gui,
                '$1\t$2'
            ).split('\t');
            rawInsert = selection[0];
            rawWhere = selection[1];
        }


        const focussedResource = await this.findAlteredResource(pod, rawDelete, rawInsert, rawWhere);

        if (!focussedResource) {
          return [];
        }
        const resourceStore = getPrunedStore(
            await fileResourceToStore(this.engine, focussedResource.value),
            focussedResource
        );

        // Instantiate the delete clause
        const removalStore = RdfStore.createDefault();
        if (rawDelete) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawDelete} } WHERE { ${rawWhere} }`, {
                sources: [resourceStore],
            })) {
                removalStore.addQuad(quad);
            }
        }

        const additionStore = RdfStore.createDefault();
        if (rawInsert) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawInsert} } WHERE { ${rawWhere} }`, {
                sources: [resourceStore],
            })) {
                additionStore.addQuad(quad);
            }
        }

        const newResource = storeUnion(
            storeMinus(resourceStore, removalStore),
            additionStore);

        const currentCollection = this.getContainingCollection(focussedResource);

        const wantsRelocation = currentCollection.saveConditions
            .map(condition => condition.updateCondition)
            .every(condition => condition.wantsRelocation(newResource, focussedResource));

        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));

        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = assertVal(
                this.collectionOfResultingResource(newResource, focussedResource)
            );
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        if (dryRun) {
          return [newBaseUri.value];
        }

        if (newBaseUri.equals(focussedResource)) {
            let query = '';
            if (removalStore.size !== 0) {
                query += `
                    DELETE DATA {
                        ${removalStore.getQuads().map(quad => quadToString(quad)).join('\n')}
                    };
                `;
            }
            if (additionStore.size !== 0) {
                query += `
                    INSERT DATA {
                        ${additionStore.getQuads().map(quad => quadToString(quad)).join('\n')}
                    }
                `;
            }

            await this.engine.invalidateHttpCache();
            await this.engine.queryVoid(query, {sources: [focussedResource.value]});

        } else {
            const remainingStore = translateStore(
                newResource, focussedResource, newBaseUri
            );

            // Remove the old resource and create new at once!:
            await Promise.all([
                this.removeStoreFromResource(resourceStore, focussedResource),
                this.addStoreToResource(remainingStore, newBaseUri)
            ]);
        }
        return [newBaseUri.value];
    }
}
