import {ResourceDescription} from "./ResourceDescription";
import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";

/**
 * @deprecated
 */
export interface RawUpdateConditionKeepAndAlwaysWidenIndex {
    type: "keep and always widen index";
}

/**
 * @deprecated
 */
export interface RawUpdateConditionKeepAndWidenForDistance {
    type: "keep and widen for distance";
}

export interface RawUpdateConditionPreferStatic {
    type: "prefer static";
}

export interface RawUpdateConditionMoveToBestMatched {
    type: "move to best matched";
}

export interface RawUpdateConditionDisallow {
    type: "disallow";
}

/**
 * @deprecated
 */
export class UpdateConditionKeepAndAlwaysWidenIndex implements RawUpdateConditionKeepAndAlwaysWidenIndex {
    public type: "keep and always widen index" = "keep and always widen index";
    constructor() { }
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        throw new Error();
    }
}

/**
 * @deprecated
 */
export class UpdateConditionKeepAndWidenForDistance implements RawUpdateConditionKeepAndWidenForDistance {
    public type: "keep and widen for distance" = "keep and widen for distance";
    constructor() { }
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        throw new Error();
    }
}

export class UpdateConditionPreferStatic implements RawUpdateConditionPreferStatic {
    public type: "prefer static" = "prefer static";
    constructor(private resourceDescription: ResourceDescription) { }
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        return !this.resourceDescription.resourceMatchesDescription(resourceStore, resourceBaseUrl);
    }
}

export class UpdateConditionMoveToBestMatched implements RawUpdateConditionMoveToBestMatched {
    public type: "move to best matched" = "move to best matched";
    constructor() { }
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        return true;
    }
}

export class UpdateConditionDisallow implements RawUpdateConditionDisallow {
    public type: "disallow" = "disallow";
    constructor() { }
    public wantsRelocation(resourceStore: RdfStore, resourceBaseUrl: RDF.NamedNode): boolean {
        throw new Error("Update Condition disallows updates");
    }
}

export type UpdateCondition =
    UpdateConditionKeepAndAlwaysWidenIndex |
    UpdateConditionKeepAndWidenForDistance |
    UpdateConditionPreferStatic |
    UpdateConditionMoveToBestMatched |
    UpdateConditionDisallow;
