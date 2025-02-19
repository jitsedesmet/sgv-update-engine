import { ParsedSGV } from './treeStructure/ParsedSGV';
import { RdfStore } from 'rdf-stores';
import { QueryEngine } from '@comunica/query-sparql-file';
/**
 * Transforms a pods SGV to a structured representation
 */
export declare class SGVParser {
    pod: string;
    sgvStore: RdfStore;
    constructor(pod: string, sgvStore: RdfStore);
    static init(engine: QueryEngine, podUri: string): Promise<SGVParser>;
    parse(): ParsedSGV;
    private parseCanonicalCollection;
    private getOne;
    private parseGroupStrategy;
    private parseResourceDescription;
    private parseSaveCondition;
    private parseUpdateCondition;
}
