import * as RDF from '@rdfjs/types';
import { BaseOperationHandler, ParserInsertType, SgvOperation } from './BaseOperationHandler';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { QueryEngine } from '@comunica/query-sparql-file';
export declare class InsertResourceOperationHandler extends BaseOperationHandler {
    private parsedOperation;
    private resource;
    operation: SgvOperation;
    constructor(engine: QueryEngine, parsedOperation: ParserInsertType, resource: RDF.NamedNode, parsedSgv: ParsedSGV);
    private getResultingResourceStore;
    handleOperation(): Promise<void>;
}
