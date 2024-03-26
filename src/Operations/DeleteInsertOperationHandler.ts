import {BaseOperationhandler, ParserInsertDeleteType, SgvOperation} from "./BaseOperationhandler";
import {InsertDeleteOperation, Parser, SparqlGenerator, Generator, SparqlQuery} from "sparqljs";
import {
    fileResourceToStore,
    getPrunedStore,
    quadToString,
    storeFromTriples,
    storeMinus,
    storeUnion, translateStore
} from "../helpers/Helpers";
import {RdfStore} from "rdf-stores";
import * as RDF from "@rdfjs/types";
import {SGVParser} from "../sgv/SGVParser";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export class DeleteInsertOperationHandler extends BaseOperationhandler {
    public operation: SgvOperation = "delete insert";

    public constructor(
        private parsedOperation: ParserInsertDeleteType,
        private completeQuery: SparqlQuery,
        private focussedResource: RDF.NamedNode) {
        super();
    }


    public async handleOperation(pod: string): Promise<void> {
        // We construct the resource we will delete and insert by looking at the where clause in the parsed operation.
        this.completeQuery.prefixes = {};
        this.completeQuery.base = undefined;

        const rawQuery = new Generator().stringify(this.completeQuery);
        // Either delete is present, or it is not:
        let rawDelete = "";
        let rawInsert = "";
        let rawWhere = "";
        if (this.parsedOperation.delete?.length) {
            const selection = rawQuery.replaceAll(
                /^DELETE \{(.*)\}\s+(INSERT \{(.*)\}\s+)?WHERE \{(.*)\}$/gu,
                "$1\t$3\t$4"
            ).split("\t");
            rawDelete = selection[0];
            rawInsert = selection[1];
            rawWhere = selection[2];
        } else {
            const selection = rawQuery.replaceAll(
                /^INSERT \{(.*)\}\s+WHERE \{(.*)\}$/gu,
                "$1\t$2"
            ).split("\t");
            rawInsert = selection[0];
            rawWhere = selection[1];
        }


        const resourceStore = await getPrunedStore(
            await fileResourceToStore(this.engine, this.focussedResource.value),
            this.focussedResource
        );

        // Instantiate the delete clause
        const removalStore = RdfStore.createDefault();
        if (rawDelete) {
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

        const newResource = await storeUnion(
            await storeMinus(resourceStore, removalStore),
            additionStore);

        const parsedSgv = (await SGVParser.init(pod)).parse();
        const currentCollection = this.getContainingCollection(this.focussedResource, parsedSgv);

        const wantsRelocation = currentCollection.updateCondition.wantsRelocation(newResource, this.focussedResource);

        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));

        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = await this.collectionOfResultingResource(parsedSgv, newResource, this.focussedResource);
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        if (newBaseUri.equals(this.focussedResource)) {
            console.log("No relocation needed, updating resource in place");
            let query = "";
            if (removalStore.size !== 0) {
                query += `
                    DELETE DATA {
                        ${removalStore.getQuads().map(quad => quadToString(quad)).join('\n')}
                    };
                `
            }
            if (additionStore.size !== 0) {
                query += `
                    INSERT DATA {
                        ${additionStore.getQuads().map(quad => quadToString(quad)).join('\n')}
                    }
                `
            }

            await this.engine.queryVoid(query, {sources: [this.focussedResource.value]});

        } else {
            console.log(`Relocating resource to ${newBaseUri.value}`);
            // Remove the old resource:
            await this.removeStoreFromResource(resourceStore, this.focussedResource);

            await this.addStoreToResource(await translateStore(
                newResource, this.focussedResource, newBaseUri
            ), newBaseUri);
        }
    }
}
