import type * as RDF from '@rdfjs/types';
import {ResourceDescription} from "./ResourceDescription";
import { SaveCondition } from "./SaveCondition";
import {UpdateCondition} from "./UpdateCondition";
import {RetentionPolicy} from "./RetentionPolicy";
import {GroupStrategy} from "./GroupStrategy";

export type OneFileOneResource = true | false;


interface BaseStructuredContainer {
    updateCondition: UpdateCondition;
    retentionPolicy?: RetentionPolicy;
    groupStrategy: GroupStrategy;
    oneFileOneResource: OneFileOneResource;
}

interface Pinpoint {
    "uri": RDF.NamedNode;
}

export interface CanonicalCollection extends BaseStructuredContainer {
    type: "Canonical Collection";
    resourceDescription: ResourceDescription;
    saveCondition: SaveCondition;
    updateCondition: UpdateCondition;
}

/**
 * @deprecated
 */
export interface DerivedCollection extends BaseStructuredContainer {
    type: "Derived Collection";
    resourceDescription: ResourceDescription;
    derivedFrom: CanonicalCollection;
}

export type RootedCanonicalCollection = CanonicalCollection & Pinpoint;
export type RootedDerivedCollection = DerivedCollection & Pinpoint;


export type RootedStructuredCollection = RootedCanonicalCollection | RootedDerivedCollection;
export type StructuredCollection = CanonicalCollection | DerivedCollection;


