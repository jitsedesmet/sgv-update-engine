import type * as RDF from '@rdfjs/types';
import { RootedCanonicalCollection } from './StructuredCollection';
import { RdfStore } from 'rdf-stores';
import { UpdateCondition } from './UpdateCondition';
export declare enum SaveConditionType {
    STATE_REQUIRED = "state required",
    ALWAYS_STORED = "always stored",
    PREFER_OTHER = "prefer other",
    PREFER_MOST_SPECIFIC = "prefer most specific",
    ONLY_STORED_WHEN_NOT_REDUNDANT = "only stored when not redundant",
    NEVER_STORED = "never stored"
}
/**
 * @deprecated
 */
export interface RawSaveConditionStateRequired {
    type: SaveConditionType.STATE_REQUIRED;
    sparqlQuery: string;
}
export interface RawSaveConditionAlwaysStored {
    type: SaveConditionType.ALWAYS_STORED;
}
export interface RawSaveConditionPreferOther {
    type: SaveConditionType.PREFER_OTHER;
    preferredCollections: RDF.NamedNode[];
}
/**
 * @deprecated
 */
export interface RawSaveConditionPreferMostSpecific {
    type: SaveConditionType.PREFER_MOST_SPECIFIC;
}
/**
 * @deprecated
 */
export interface RawSaveConditionOnlyStoredWhenNotRedundant {
    type: SaveConditionType.ONLY_STORED_WHEN_NOT_REDUNDANT;
}
/**
 * @deprecated
 */
export interface RawSaveConditionNeverStored {
    type: SaveConditionType.NEVER_STORED;
}
export declare abstract class SaveCondition {
    updateCondition: UpdateCondition;
    abstract type: SaveConditionType;
    constructor(updateCondition: UpdateCondition);
    wantsGivenCompetitors(competitors: RootedCanonicalCollection[], resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean;
}
/**
 * @deprecated
 */
export declare class SaveConditionStateRequired extends SaveCondition implements RawSaveConditionStateRequired {
    sparqlQuery: string;
    type: SaveConditionType.STATE_REQUIRED;
    constructor(updateCondition: UpdateCondition, sparqlQuery: string);
}
export declare class SaveConditionAlwaysStored extends SaveCondition implements RawSaveConditionAlwaysStored {
    type: SaveConditionType.ALWAYS_STORED;
    wantsGivenCompetitors(): boolean;
}
export declare class SaveConditionPreferOther extends SaveCondition implements RawSaveConditionPreferOther {
    preferredCollections: RDF.NamedNode[];
    type: SaveConditionType.PREFER_OTHER;
    constructor(updateCondition: UpdateCondition, preferredCollections: RDF.NamedNode[]);
    wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean;
}
/**
 * @deprecated
 */
export declare class SaveConditionPreferMostSpecific extends SaveCondition implements RawSaveConditionPreferMostSpecific {
    type: SaveConditionType.PREFER_MOST_SPECIFIC;
}
export declare class SaveConditionOnlyStoredWhenNotRedundant extends SaveCondition implements RawSaveConditionOnlyStoredWhenNotRedundant {
    type: SaveConditionType.ONLY_STORED_WHEN_NOT_REDUNDANT;
    wantsGivenCompetitors(competitors: RootedCanonicalCollection[], resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean;
}
export declare class SaveConditionNeverStored extends SaveCondition implements RawSaveConditionNeverStored {
    type: SaveConditionType.NEVER_STORED;
    wantsGivenCompetitors(): boolean;
}
