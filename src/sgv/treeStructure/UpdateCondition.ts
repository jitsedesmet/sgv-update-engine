/**
 * @deprecated
 */
export interface UpdateConditionKeepAndAlwaysWidenIndex {
    type: "keep and always widen index";
}

/**
 * @deprecated
 */
export interface UpdateConditionKeepAndWidenForDistance {
    type: "keep and widen for distance";
}

/**
 * @deprecated
 */
export interface UpdateConditionPreferStatic {
    type: "prefer static";
}

/**
 * @deprecated
 */
export interface UpdateConditionMoveToBestMatched {
    type: "move to best matched";
}

export interface UpdateConditionDisallow {
    type: "disallow";
}

export type UpdateCondition = UpdateConditionKeepAndAlwaysWidenIndex | UpdateConditionKeepAndWidenForDistance | UpdateConditionPreferStatic | UpdateConditionMoveToBestMatched | UpdateConditionDisallow;
