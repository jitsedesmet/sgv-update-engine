"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupStrategyURITemplate = exports.GroupStrategySPARQLMap = exports.GroupStrategy = void 0;
var GroupStrategyType;
(function (GroupStrategyType) {
    GroupStrategyType["SPARQL_MAP"] = "SPARQL map";
    GroupStrategyType["URI_TEMPLATE"] = "URI template";
})(GroupStrategyType || (GroupStrategyType = {}));
class GroupStrategy {
    getResourceURI(resourceStore) {
        throw new Error(`Group strategy of type ${this.type} is deprecated.
        Resource ${resourceStore.getQuads().toString()} cannot be grouped.`);
    }
}
exports.GroupStrategy = GroupStrategy;
class GroupStrategySPARQLMap extends GroupStrategy {
    type = GroupStrategyType.SPARQL_MAP;
}
exports.GroupStrategySPARQLMap = GroupStrategySPARQLMap;
class GroupStrategyURITemplate extends GroupStrategy {
    template;
    collectionUri;
    regexMatch;
    regexReplace;
    type = GroupStrategyType.URI_TEMPLATE;
    constructor(template, collectionUri, regexMatch, regexReplace) {
        super();
        this.template = template;
        this.collectionUri = collectionUri;
        this.regexMatch = regexMatch;
        this.regexReplace = regexReplace;
    }
    async getResourceURI(resourceStore) {
        const { parseTemplate } = await import('url-template');
        const expansionContext = {};
        resourceStore.getQuads().forEach(quad => {
            expansionContext[encodeURIComponent(quad.predicate.value)] = quad.object.value;
        });
        const preRegex = parseTemplate(this.template).expand(expansionContext);
        if (this.regexMatch && this.regexReplace) {
            return this.collectionUri.value + preRegex.replaceAll(new RegExp(this.regexMatch, 'gu'), this.regexReplace);
        }
        return this.collectionUri.value + preRegex;
    }
}
exports.GroupStrategyURITemplate = GroupStrategyURITemplate;
//# sourceMappingURL=GroupStrategy.js.map