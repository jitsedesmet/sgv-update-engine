import {GraphOrDefault, Quads} from "sparqljs";
import * as RDF from "@rdfjs/types";
import {QueryEngine} from "@comunica/query-sparql-file";
import {ParsedSGV} from "../sgv/treeStructure/ParsedSGV";
import {RootedCanonicalCollection, RootedStructuredCollection} from "../sgv/treeStructure/StructuredCollection";
import {RdfStore} from "rdf-stores";
import {quadToString} from "../helpers/Helpers";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export type SgvOperation = "non-update" | "insert resource" | "append to resource" | "remove";

export abstract class BaseOperationhandler {
    public abstract operation: SgvOperation;
    public abstract handleOperation(pod: string): Promise<void>;
    protected engine: QueryEngine;

    protected constructor() {
        this.engine = new QueryEngine();
    }


    protected getContainingCollection(focusNode: RDF.NamedNode, parsedSgv: ParsedSGV): RootedStructuredCollection {
        return parsedSgv
            .collections
            .filter(collection => {
                return focusNode.value.startsWith(collection.uri.value);
            })[0];
    }

    protected async collectionOfResultingResource(parsedSgv: ParsedSGV, resulingResource: RdfStore, resource: RDF.NamedNode): Promise<RootedStructuredCollection> {
        const matchedCollections = parsedSgv
            .collections
            .filter(collection => {
                return collection
                    .resourceDescription
                    .resourceMatchesDescription(resulingResource, resource);
            });
        if (matchedCollections.length == 0) {
            // TODO: you should ask for a new SGV collection?
            throw new Error("No matching shape found, cannot update resource!");
        }

        const RootedCanCol = <RootedCanonicalCollection[]> matchedCollections;
        return RootedCanCol.filter(collection =>
            collection.saveCondition.wantsGivenCompetitors(RootedCanCol)
        )[0];
    }

    protected async addStoreToResource(store: RdfStore, resource: RDF.NamedNode): Promise<void> {
        await this.engine.queryVoid(`
            INSERT DATA {
                ${store.getQuads().map(quad => quadToString(quad)).join('\n')}
            }
        `, {
            sources: [resource.value],
        });
    }

    protected async removeStoreFromResource(store: RdfStore, resource: RDF.NamedNode): Promise<void> {
        await this.engine.queryVoid(`
            DELETE DATA {
                ${store.getQuads().map(quad => quadToString(quad)).join('\n')}
            }
        `, {
            sources: [resource.value],
        });
    }
}

export class NonUpdateOperationHandler extends BaseOperationhandler {
    public operation: SgvOperation = "non-update";

    public constructor(private query: string) {
        super();
    }

    public async handleOperation(pod: string): Promise<void> {
        // Read query: just do it
        for await (const binding of await this
            .engine
            .queryBindings(this.query, { sources: [pod] })) {
            console.log(binding.toString());
        }
    }
}

export interface ParserInsertType {
    updateType: "insert";
    graph?: GraphOrDefault;
    insert: Quads[];
}

export interface ParserDeleteType {
    updateType: "delete";
    graph?: GraphOrDefault;
    delete: Quads[];
}
