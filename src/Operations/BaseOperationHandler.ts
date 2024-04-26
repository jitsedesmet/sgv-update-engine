import {GraphOrDefault, IriTerm, Pattern, Quads} from 'sparqljs';
import * as RDF from '@rdfjs/types';
import {Quad} from '@rdfjs/types';
import {QueryEngine} from '@comunica/query-sparql-file';
import {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {RootedCanonicalCollection, RootedStructuredCollection} from '../sgv/treeStructure/StructuredCollection';
import {RdfStore} from 'rdf-stores';
import {quadToString} from '../helpers/Helpers';
import {SaveCondition} from '../sgv/treeStructure/SaveCondition';

export type SgvOperation = 'non-update' | 'insert resource' | 'append to resource' | 'remove' | 'delete insert';

export abstract class BaseOperationHandler {
    public abstract operation: SgvOperation;
    public abstract handleOperation(pod: string): Promise<void>;

    protected constructor(protected engine: QueryEngine, protected parsedSgv: ParsedSGV) {
    }


    protected getContainingCollection(focusNode: RDF.NamedNode): RootedCanonicalCollection {
        return this.parsedSgv
            .collections
            .filter(collection => {
                return focusNode.value.startsWith(collection.uri.value);
            })[0];
    }

    protected collectionOfResultingResource(resultingResource: RdfStore, resource: RDF.NamedNode): RootedStructuredCollection | undefined {
        // key = uri of collection
        const matches: Record<string, SaveCondition[]> = {};
        let matchFound = false;
        for (const collection of this.parsedSgv.collections) {
            for (const condition of collection.saveConditions) {
                if (condition.updateCondition.resourceDescription.resourceMatchesDescription(resultingResource, resource)) {
                    if (!(collection.uri.value in matches)) {
                        matchFound = true;
                        matches[collection.uri.value] = [];
                    }
                    matches[collection.uri.value].push(condition);
                }
            }
        }
        if (!matchFound) {
            // TODO: you should ask for a new SGV collection?
            throw new Error('No matching shape found, cannot update resource!');
        }

        const matchedCollections = this.parsedSgv.collections.filter(collection =>
            collection.uri.value in matches
        );

        for (const [collection, conditions] of Object.entries(matches)) {
            for (const condition of conditions) {
                if (condition.wantsGivenCompetitors(matchedCollections, resultingResource, resource)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return matchedCollections.find(x => x.uri.value === collection)!;
                }
            }
        }
        return undefined;
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
        await this.engine.invalidateHttpCache();
        await this.engine.queryVoid(query, {
            sources: [resource.value],
        });
    }

    protected async addQuadsToResource(store: Quad[], resource: RDF.NamedNode): Promise<void> {
        if (store.length === 0) {
            return;
        }
        const query = `
            INSERT DATA {
                ${store.map(quad => quadToString(quad)).join('\n')}
            }
        `;
        await this.engine.invalidateHttpCache();
        await this.engine.queryVoid(query, {
            sources: [resource.value],
        });
    }

    protected async removeStoreFromResource(store: RdfStore, resource: RDF.NamedNode): Promise<void> {
        if (store.size === 0) {
            return;
        }
        await this.engine.invalidateHttpCache();
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
    public operation: SgvOperation = 'non-update';

    public constructor(engine: QueryEngine, parsedSgv: ParsedSGV, private query: string) {
        super(engine, parsedSgv);
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
    updateType: 'insert';
    graph?: GraphOrDefault;
    insert: Quads[];
}

export interface ParserDeleteType {
    updateType: 'delete';
    graph?: GraphOrDefault;
    delete: Quads[];
}

export interface ParserInsertDeleteType {
    updateType: 'insertdelete';
    graph?: GraphOrDefault;
    insert?: Quads[];
    delete?: Quads[];
    using?: {
default: IriTerm[];
    named: IriTerm[];
};
    where?: Pattern[];
}
