import {BaseOperationHandler, ParserInsertDeleteType, SgvOperation} from './BaseOperationHandler';
import {SparqlQuery} from 'sparqljs';
import {
    fileResourceToStore,
    getPrunedStore,
    getQueryWithoutPrefixes,
    quadToString,
    storeMinus,
    storeUnion,
    translateStore
} from '../helpers/Helpers';
import {RdfStore} from 'rdf-stores';
import * as RDF from '@rdfjs/types';
import {SGVParser} from '../sgv/SGVParser';
import {DataFactory} from 'rdf-data-factory';
import {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

const DF = new DataFactory();

export class DeleteInsertOperationHandler extends BaseOperationHandler {
    public operation: SgvOperation = 'delete insert';

    public constructor(
        engine: QueryEngine,
        private parsedOperation: ParserInsertDeleteType,
        private completeQuery: SparqlQuery,
        private focussedResource: RDF.NamedNode,
        parsedSgv: ParsedSGV) {
        super(engine, parsedSgv);
    }


    public async handleOperation(): Promise<void> {
        // We construct the resource we will delete and insert by looking at the where clause in the parsed operation.
        const rawQuery = getQueryWithoutPrefixes(this.completeQuery);
        // Either delete is present, or it is not:
        let rawDelete = '';
        let rawInsert = '';
        let rawWhere = '';
        if (this.parsedOperation.delete?.length) {
            const selection = rawQuery.replaceAll(
                /^DELETE \{(.*)\}\s+(INSERT \{(.*)\}\s+)?WHERE \{(.*)\}$/gu,
                '$1\t$3\t$4'
            ).split('\t');
            rawDelete = selection[0];
            rawInsert = selection[1];
            rawWhere = selection[2];
        } else {
            const selection = rawQuery.replaceAll(
                /^INSERT \{(.*)\}\s+WHERE \{(.*)\}$/gu,
                '$1\t$2'
            ).split('\t');
            rawInsert = selection[0];
            rawWhere = selection[1];
        }


        const resourceStore = getPrunedStore(
            await fileResourceToStore(this.engine, this.focussedResource.value),
            this.focussedResource
        );

        // Instantiate the delete clause
        const removalStore = RdfStore.createDefault();
        if (rawDelete) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`
                CONSTRUCT {
                    ${rawDelete}
                } WHERE {
                    ${rawWhere}
                }
            `, {
                sources: [resourceStore],
            })
                ) {
                removalStore.addQuad(quad);
            }
        }

        const additionStore = RdfStore.createDefault();
        if (rawInsert) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`
                CONSTRUCT {
                    ${rawInsert}
                } WHERE {
                    ${rawWhere}
                }
            `, {
                sources: [resourceStore],
            })
                ) {
                additionStore.addQuad(quad);
            }
        }

        const newResource = storeUnion(
            storeMinus(resourceStore, removalStore),
            additionStore);

        const currentCollection = this.getContainingCollection(this.focussedResource);

        const wantsRelocation = currentCollection.updateCondition.wantsRelocation(newResource, this.focussedResource);

        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));

        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = this.collectionOfResultingResource(newResource, this.focussedResource);
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        if (newBaseUri.equals(this.focussedResource)) {
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
            await this.engine.queryVoid(query, {sources: [this.focussedResource.value]});

        } else {
            // Remove the old resource:
            await this.removeStoreFromResource(resourceStore, this.focussedResource);

            const remainingStore = translateStore(
                newResource, this.focussedResource, newBaseUri
            );

            await this.addStoreToResource(remainingStore, newBaseUri);
        }
    }
}
