import { RdfStore } from 'rdf-stores';
import type * as RDF from '@rdfjs/types';
declare enum GroupStrategyType {
    SPARQL_MAP = "SPARQL map",
    URI_TEMPLATE = "URI template"
}
/**
 * @deprecated
 */
export interface RawGroupStrategySPARQLMap {
    type: GroupStrategyType.SPARQL_MAP;
}
export interface RawGroupStrategyURITemplate {
    type: GroupStrategyType.URI_TEMPLATE;
    template: string;
    regexMatch?: string;
    regexReplace?: string;
}
export declare abstract class GroupStrategy {
    abstract type: GroupStrategyType;
    getResourceURI(resourceStore: RdfStore): Promise<string>;
}
export declare class GroupStrategySPARQLMap extends GroupStrategy implements RawGroupStrategySPARQLMap {
    type: GroupStrategyType.SPARQL_MAP;
}
export declare class GroupStrategyURITemplate extends GroupStrategy implements RawGroupStrategyURITemplate {
    template: string;
    collectionUri: RDF.NamedNode;
    regexMatch?: string | undefined;
    regexReplace?: string | undefined;
    type: GroupStrategyType.URI_TEMPLATE;
    constructor(template: string, collectionUri: RDF.NamedNode, regexMatch?: string | undefined, regexReplace?: string | undefined);
    getResourceURI(resourceStore: RdfStore): Promise<string>;
}
export {};
