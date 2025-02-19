import { BaseOperationHandler, ParserInsertDeleteType, SgvOperation } from './BaseOperationHandler';
import { SparqlQuery } from 'sparqljs';
import * as RDF from '@rdfjs/types';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { QueryEngine } from '@comunica/query-sparql-file';
export declare class DeleteInsertOperationHandler extends BaseOperationHandler {
    private parsedOperation;
    private completeQuery;
    operation: SgvOperation;
    constructor(engine: QueryEngine, parsedOperation: ParserInsertDeleteType, completeQuery: SparqlQuery, parsedSgv: ParsedSGV);
    findAlteredResource(pod: string, rawDelete: string | undefined, rawInsert: string | undefined, rawWhere: string): Promise<RDF.NamedNode>;
    handleOperation(pod: string): Promise<void>;
}
