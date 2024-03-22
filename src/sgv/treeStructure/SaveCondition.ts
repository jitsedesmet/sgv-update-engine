/**
 * @deprecated
 */
export interface SaveConditionStateRequired {
    type: "state required";
}

export interface SaveConditionAlwaysStored {
    type: "always stored";
}

/**
 * @deprecated
 */
export interface SaveConditionPreferStored {
    type: "prefer stored";
}

/**
 * @deprecated
 */
export interface SaveConditionPreferMostSpecific {
    type: "prefer most specific";
}

/**
 * @deprecated
 */
export interface SaveConditionOnlyStoredWhenNotRedundant {
    type: "only stored when not redundant";
}

/**
 * @deprecated
 */
export interface SaveConditionNeverStored {
    type: "never stored";
}

export type SaveCondition = SaveConditionStateRequired | SaveConditionAlwaysStored | SaveConditionPreferStored | SaveConditionPreferMostSpecific | SaveConditionOnlyStoredWhenNotRedundant | SaveConditionNeverStored;
