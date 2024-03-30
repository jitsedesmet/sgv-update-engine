import {GraphOrDefault, IriTerm, Pattern, Quads} from "sparqljs";
import * as RDF from "@rdfjs/types";
import {QueryEngine} from "@comunica/query-sparql-file";
import {ParsedSGV} from "../sgv/treeStructure/ParsedSGV";
import {RootedCanonicalCollection, RootedStructuredCollection} from "../sgv/treeStructure/StructuredCollection";
import {RdfStore} from "rdf-stores";
import {quadToString} from "../helpers/Helpers";

export type SgvOperation = "non-update" | "insert resource" | "append to resource" | "remove" | "delete insert";

export abstract class BaseOperationHandler {
    public abstract operation: SgvOperation;
    public abstract handleOperation(pod: string): Promise<void>;
    protected engine: QueryEngine;

    protected constructor(protected parsedSgv?: ParsedSGV) {
        this.engine = new QueryEngine();
    }


    protected getContainingCollection(focusNode: RDF.NamedNode, parsedSgv: ParsedSGV): RootedStructuredCollection {
        return parsedSgv
            .collections
            .filter(collection => {
                return focusNode.value.startsWith(collection.uri.value);
            })[0];
    }

    protected collectionOfResultingResource(parsedSgv: ParsedSGV, resultingResource: RdfStore, resource: RDF.NamedNode): RootedStructuredCollection {
        const matchedCollections = parsedSgv
            .collections
            .filter(collection => {
                return collection
                    .resourceDescription
                    .resourceMatchesDescription(resultingResource, resource);
            });
        if (matchedCollections.length == 0) {
            // TODO: you should ask for a new SGV collection?
            throw new Error("No matching shape found, cannot update resource!");
        }

        const RootedCanCol = matchedCollections as RootedCanonicalCollection[];
        return RootedCanCol.filter(collection =>
            collection.saveCondition.wantsGivenCompetitors(RootedCanCol)
        )[0];
    }

    protected async addStoreToResource(store: RdfStore, resource: RDF.NamedNode): Promise<void> {
        if (store.size === 0) {
            return;
        }
        const query = `
            INSERT DATA {
                ${store.getQuads().map(quad => quadToString(quad)).join('\n')}
            }
        `;
        await this.engine.queryVoid(query, {
            sources: [resource.value],
        });
    }

    protected async removeStoreFromResource(store: RdfStore, resource: RDF.NamedNode): Promise<void> {
        if (store.size === 0) {
            return;
        }
        await this.engine.queryVoid(`
            DELETE DATA {
                ${store.getQuads().map(quad => quadToString(quad)).join('\n')}
            }
        `, {
            sources: [resource.value],
        });
    }
}

export class NonUpdateOperationHandler extends BaseOperationHandler {
    public operation: SgvOperation = "non-update";

    public constructor(private query: string) {
        super();
    }

    public async handleOperation(pod: string): Promise<void> {
        // Read query: just do it
        for await (const quad of await this
            .engine
            .queryQuads(this.query, { sources: [pod] })) {
            console.log(quadToString(quad));
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

export interface ParserInsertDeleteType {
    updateType: "insertdelete";
    graph?: GraphOrDefault;
    insert?: Quads[];
    delete?: Quads[];
    using?: {
default: IriTerm[];
    named: IriTerm[];
};
    where?: Pattern[];
}
