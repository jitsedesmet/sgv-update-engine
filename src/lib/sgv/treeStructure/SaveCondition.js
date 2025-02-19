"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveConditionNeverStored = exports.SaveConditionOnlyStoredWhenNotRedundant = exports.SaveConditionPreferMostSpecific = exports.SaveConditionPreferOther = exports.SaveConditionAlwaysStored = exports.SaveConditionStateRequired = exports.SaveCondition = exports.SaveConditionType = void 0;
var SaveConditionType;
(function (SaveConditionType) {
    SaveConditionType["STATE_REQUIRED"] = "state required";
    SaveConditionType["ALWAYS_STORED"] = "always stored";
    SaveConditionType["PREFER_OTHER"] = "prefer other";
    SaveConditionType["PREFER_MOST_SPECIFIC"] = "prefer most specific";
    SaveConditionType["ONLY_STORED_WHEN_NOT_REDUNDANT"] = "only stored when not redundant";
    SaveConditionType["NEVER_STORED"] = "never stored";
})(SaveConditionType || (exports.SaveConditionType = SaveConditionType = {}));
class SaveCondition {
    updateCondition;
    constructor(updateCondition) {
        this.updateCondition = updateCondition;
    }
    wantsGivenCompetitors(competitors, resourceStore, baseResource) {
        throw new Error(`Save condition of type ${this.type} is deprecated.
        We can not check if we would save given the competitors ${competitors.toString()} and store:
        ${resourceStore.getQuads().toString()} on base ${baseResource.value}.`);
    }
}
exports.SaveCondition = SaveCondition;
/**
 * @deprecated
 */
class SaveConditionStateRequired extends SaveCondition {
    sparqlQuery;
    type = SaveConditionType.STATE_REQUIRED;
    constructor(updateCondition, sparqlQuery) {
        super(updateCondition);
        this.sparqlQuery = sparqlQuery;
    }
}
exports.SaveConditionStateRequired = SaveConditionStateRequired;
class SaveConditionAlwaysStored extends SaveCondition {
    type = SaveConditionType.ALWAYS_STORED;
    wantsGivenCompetitors() {
        return true;
    }
}
exports.SaveConditionAlwaysStored = SaveConditionAlwaysStored;
class SaveConditionPreferOther extends SaveCondition {
    preferredCollections;
    type = SaveConditionType.PREFER_OTHER;
    constructor(updateCondition, preferredCollections) {
        super(updateCondition);
        this.preferredCollections = preferredCollections;
    }
    wantsGivenCompetitors(competitors) {
        let competitorsPresent = false;
        for (const competitor of competitors) {
            if (this.preferredCollections
                .some(preference => preference.equals(competitor.uri))) {
                competitorsPresent = true;
            }
        }
        return !competitorsPresent;
    }
}
exports.SaveConditionPreferOther = SaveConditionPreferOther;
/**
 * @deprecated
 */
class SaveConditionPreferMostSpecific extends SaveCondition {
    type = SaveConditionType.PREFER_MOST_SPECIFIC;
}
exports.SaveConditionPreferMostSpecific = SaveConditionPreferMostSpecific;
class SaveConditionOnlyStoredWhenNotRedundant extends SaveCondition {
    type = SaveConditionType.ONLY_STORED_WHEN_NOT_REDUNDANT;
    wantsGivenCompetitors(competitors, resourceStore, baseResource) {
        let othersSeenThatWantToStore = false;
        for (const competitor of competitors.flatMap(x => x.saveConditions)) {
            if (competitor.type === SaveConditionType.ALWAYS_STORED ||
                competitor.type === SaveConditionType.PREFER_OTHER ||
                competitor.type === SaveConditionType.PREFER_MOST_SPECIFIC) {
                othersSeenThatWantToStore = competitor.updateCondition.resourceDescription
                    .resourceMatchesDescription(resourceStore, baseResource);
            }
        }
        return othersSeenThatWantToStore;
    }
}
exports.SaveConditionOnlyStoredWhenNotRedundant = SaveConditionOnlyStoredWhenNotRedundant;
class SaveConditionNeverStored extends SaveCondition {
    type = SaveConditionType.NEVER_STORED;
    wantsGivenCompetitors() {
        return false;
    }
}
exports.SaveConditionNeverStored = SaveConditionNeverStored;
//# sourceMappingURL=SaveCondition.js.map