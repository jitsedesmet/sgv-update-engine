import type * as RDF from '@rdfjs/types';
import {ResourceDescription} from './ResourceDescription';
import {SaveCondition} from './SaveCondition';
import {UpdateCondition} from './UpdateCondition';
import {GroupStrategy} from './GroupStrategy';

export type OneFileOneResourceType = true | false;


export enum CollectionType {
    canonical = 'Canonical Collection',
    derived = 'Derived Collection',
}


interface BaseStructuredContainer {
    groupStrategy: GroupStrategy;
    oneFileOneResource: OneFileOneResourceType;
}

interface Pinpoint {
    'uri': RDF.NamedNode;
}


export interface CanonicalCollection extends BaseStructuredContainer {
    type: CollectionType.canonical;
    saveConditions: [SaveCondition, ...SaveCondition[]];
}

/**
 * @deprecated
 */
export interface DerivedCollection extends BaseStructuredContainer {
    type: CollectionType.derived;
    derives: {
        description: ResourceDescription;
        source: StructuredCollection
    }[];
}

export type RootedCanonicalCollection = CanonicalCollection & Pinpoint;

/**
 * @deprecated
 */
export type RootedDerivedCollection = DerivedCollection & Pinpoint;


export type RootedStructuredCollection = RootedCanonicalCollection | RootedDerivedCollection;
export type StructuredCollection = CanonicalCollection | DerivedCollection;


