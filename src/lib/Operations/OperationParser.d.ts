import { SparqlParser } from 'sparqljs';
import { BaseOperationHandler } from './BaseOperationHandler';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { QueryEngine } from '@comunica/query-sparql-file';
/**
 * Parses a query amd can use a given engine to prepare the operation.
 */
export declare class OperationParser {
    private engine;
    private query;
    baseIRI: string;
    sparqlParser: SparqlParser;
    constructor(engine: QueryEngine, query: string);
    static fromFile(engine: QueryEngine, query_file: string): Promise<OperationParser>;
    /**
     * Actually parse the query, in the context of some parsed SGV.
     * Returns a query plan (kinda)
     */
    parse(parsedSgv: ParsedSGV): Promise<BaseOperationHandler>;
}
