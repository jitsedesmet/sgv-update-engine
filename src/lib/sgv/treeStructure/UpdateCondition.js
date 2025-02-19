"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConditionDisallow = exports.UpdateConditionMoveToBestMatched = exports.UpdateConditionPreferStatic = exports.UpdateConditionKeepAndWidenForDistance = exports.UpdateConditionKeepAndAlwaysWidenIndex = exports.UpdateCondition = exports.UpdateConditionType = void 0;
var UpdateConditionType;
(function (UpdateConditionType) {
    UpdateConditionType["keepAndAlwaysWidenIndex"] = "keep and always widen index";
    UpdateConditionType["keepAndWidenForDistance"] = "keep and widen for distance";
    UpdateConditionType["preferStatic"] = "prefer static";
    UpdateConditionType["moveToBestMatched"] = "move to best matched";
    UpdateConditionType["disallow"] = "disallow";
})(UpdateConditionType || (exports.UpdateConditionType = UpdateConditionType = {}));
class UpdateCondition {
    resourceDescription;
    constructor(resourceDescription) {
        this.resourceDescription = resourceDescription;
    }
    wantsRelocation(resourceStore, resourceBaseUrl) {
        throw new Error(`Update condition of type ${this.type} is deprecated.
        We can not check if we would relocate ${resourceStore.getQuads().toString()} with base ${resourceBaseUrl.value}.`);
    }
}
exports.UpdateCondition = UpdateCondition;
/**
 * @deprecated
 */
class UpdateConditionKeepAndAlwaysWidenIndex extends UpdateCondition {
    type = UpdateConditionType.keepAndAlwaysWidenIndex;
}
exports.UpdateConditionKeepAndAlwaysWidenIndex = UpdateConditionKeepAndAlwaysWidenIndex;
/**
 * @deprecated
 */
class UpdateConditionKeepAndWidenForDistance extends UpdateCondition {
    type = UpdateConditionType.keepAndWidenForDistance;
}
exports.UpdateConditionKeepAndWidenForDistance = UpdateConditionKeepAndWidenForDistance;
class UpdateConditionPreferStatic extends UpdateCondition {
    type = UpdateConditionType.preferStatic;
    wantsRelocation(resourceStore, resourceBaseUrl) {
        return !this.resourceDescription.resourceMatchesDescription(resourceStore, resourceBaseUrl);
    }
}
exports.UpdateConditionPreferStatic = UpdateConditionPreferStatic;
class UpdateConditionMoveToBestMatched extends UpdateCondition {
    type = UpdateConditionType.moveToBestMatched;
    wantsRelocation() {
        return true;
    }
}
exports.UpdateConditionMoveToBestMatched = UpdateConditionMoveToBestMatched;
class UpdateConditionDisallow extends UpdateCondition {
    type = UpdateConditionType.disallow;
    wantsRelocation() {
        throw new Error('Update Condition disallows updates');
    }
}
exports.UpdateConditionDisallow = UpdateConditionDisallow;
//# sourceMappingURL=UpdateCondition.js.map