import { GraphOrDefault, IriTerm, Pattern, Quads } from 'sparqljs';
import * as RDF from '@rdfjs/types';
import { Quad } from '@rdfjs/types';
import { QueryEngine } from '@comunica/query-sparql-file';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { RootedCanonicalCollection, RootedStructuredCollection } from '../sgv/treeStructure/StructuredCollection';
import { RdfStore } from 'rdf-stores';
export type SgvOperation = 'non-update' | 'insert resource' | 'append to resource' | 'remove' | 'delete insert';
export declare abstract class BaseOperationHandler {
    protected engine: QueryEngine;
    protected parsedSgv: ParsedSGV;
    abstract operation: SgvOperation;
    abstract handleOperation(pod: string): Promise<void>;
    protected constructor(engine: QueryEngine, parsedSgv: ParsedSGV);
    protected getContainingCollection(focusNode: RDF.NamedNode): RootedCanonicalCollection;
    protected collectionOfResultingResource(resultingResource: RdfStore, resource: RDF.NamedNode): RootedStructuredCollection | undefined;
    protected addStoreToResource(store: RdfStore, resource: RDF.NamedNode): Promise<void>;
    protected addQuadsToResource(store: Quad[], resource: RDF.NamedNode): Promise<void>;
    protected removeStoreFromResource(store: RdfStore, resource: RDF.NamedNode): Promise<void>;
}
export declare class NonUpdateOperationHandler extends BaseOperationHandler {
    private query;
    operation: SgvOperation;
    constructor(engine: QueryEngine, parsedSgv: ParsedSGV, query: string);
    handleOperation(pod: string): Promise<void>;
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
