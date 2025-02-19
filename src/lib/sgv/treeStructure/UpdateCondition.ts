import {ResourceDescription} from './ResourceDescription';
import * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';

export enum UpdateConditionType {
    keepAndAlwaysWidenIndex = 'keep and always widen index',
    keepAndWidenForDistance = 'keep and widen for distance',
    preferStatic = 'prefer static',
    moveToBestMatched = 'move to best matched',
    disallow = 'disallow',
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

export abstract class UpdateCondition {
    public abstract type: UpdateConditionType;
    public constructor(public resourceDescription: ResourceDescription) {}

    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        throw new Error(`Update condition of type ${this.type} is deprecated.
        We can not check if we would relocate ${resourceStore.getQuads().toString()} with base ${resourceBaseUrl.value}.`);
    }
}

/**
 * @deprecated
 */
export class UpdateConditionKeepAndAlwaysWidenIndex extends UpdateCondition implements RawUpdateConditionKeepAndAlwaysWidenIndex {
    public type = UpdateConditionType.keepAndAlwaysWidenIndex as const;
}

/**
 * @deprecated
 */
export class UpdateConditionKeepAndWidenForDistance extends UpdateCondition implements RawUpdateConditionKeepAndWidenForDistance {
    public type = UpdateConditionType.keepAndWidenForDistance as const;
}

export class UpdateConditionPreferStatic extends UpdateCondition implements RawUpdateConditionPreferStatic {
    public type = UpdateConditionType.preferStatic as const;
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        return !this.resourceDescription.resourceMatchesDescription(resourceStore, resourceBaseUrl);
    }
}

export class UpdateConditionMoveToBestMatched extends UpdateCondition implements RawUpdateConditionMoveToBestMatched {
    public type = UpdateConditionType.moveToBestMatched as const;
    public wantsRelocation(): boolean {
        return true;
    }
}

export class UpdateConditionDisallow extends UpdateCondition implements RawUpdateConditionDisallow {
    public type = UpdateConditionType.disallow as const;
    public wantsRelocation(): boolean {
        throw new Error('Update Condition disallows updates');
    }
}
