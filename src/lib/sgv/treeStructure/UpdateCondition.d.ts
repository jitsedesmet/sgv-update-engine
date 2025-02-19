import { ResourceDescription } from './ResourceDescription';
import * as RDF from '@rdfjs/types';
import { RdfStore } from 'rdf-stores';
export declare enum UpdateConditionType {
    keepAndAlwaysWidenIndex = "keep and always widen index",
    keepAndWidenForDistance = "keep and widen for distance",
    preferStatic = "prefer static",
    moveToBestMatched = "move to best matched",
    disallow = "disallow"
}
/**
 * @deprecated
 */
export interface RawUpdateConditionKeepAndAlwaysWidenIndex {
    type: UpdateConditionType.keepAndAlwaysWidenIndex;
}
/**
 * @deprecated
 */
export interface RawUpdateConditionKeepAndWidenForDistance {
    type: UpdateConditionType.keepAndWidenForDistance;
}
export interface RawUpdateConditionPreferStatic {
    type: UpdateConditionType.preferStatic;
}
export interface RawUpdateConditionMoveToBestMatched {
    type: UpdateConditionType.moveToBestMatched;
}
export interface RawUpdateConditionDisallow {
    type: UpdateConditionType.disallow;
}
export declare abstract class UpdateCondition {
    resourceDescription: ResourceDescription;
    abstract type: UpdateConditionType;
    constructor(resourceDescription: ResourceDescription);
    wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean;
}
/**
 * @deprecated
 */
export declare class UpdateConditionKeepAndAlwaysWidenIndex extends UpdateCondition implements RawUpdateConditionKeepAndAlwaysWidenIndex {
    type: UpdateConditionType.keepAndAlwaysWidenIndex;
}
/**
 * @deprecated
 */
export declare class UpdateConditionKeepAndWidenForDistance extends UpdateCondition implements RawUpdateConditionKeepAndWidenForDistance {
    type: UpdateConditionType.keepAndWidenForDistance;
}
export declare class UpdateConditionPreferStatic extends UpdateCondition implements RawUpdateConditionPreferStatic {
    type: UpdateConditionType.preferStatic;
    wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean;
}
export declare class UpdateConditionMoveToBestMatched extends UpdateCondition implements RawUpdateConditionMoveToBestMatched {
    type: UpdateConditionType.moveToBestMatched;
    wantsRelocation(): boolean;
}
export declare class UpdateConditionDisallow extends UpdateCondition implements RawUpdateConditionDisallow {
    type: UpdateConditionType.disallow;
    wantsRelocation(): boolean;
}
