"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SGVParser = void 0;
const consts_1 = require("./consts.js");
const StructuredCollection_1 = require("./treeStructure/StructuredCollection.js");
const UpdateCondition_1 = require("./treeStructure/UpdateCondition.js");
const SaveCondition_1 = require("./treeStructure/SaveCondition.js");
const ResourceDescription_1 = require("./treeStructure/ResourceDescription.js");
const GroupStrategy_1 = require("./treeStructure/GroupStrategy.js");
const Helpers_1 = require("../helpers/Helpers.js");
/**
 * Transforms a pods SGV to a structured representation
 */
class SGVParser {
    pod;
    sgvStore;
    constructor(pod, sgvStore) {
        this.pod = pod;
        this.sgvStore = sgvStore;
    }
    static async init(engine, podUri) {
        return new SGVParser(podUri, await (0, Helpers_1.fileResourceToStore)(engine, `${podUri}sgv`));
    }
    parse() {
        return {
            collections: this.sgvStore.getQuads(undefined, undefined, consts_1.typeCanonicalCollection).map(quad => {
                if (quad.subject.termType !== 'NamedNode' && quad.subject.termType !== 'BlankNode') {
                    throw new Error('Expected a NamedNode or BlankNode as subject');
                }
                return this.parseCanonicalCollection(quad.subject);
            })
        };
    }
    parseCanonicalCollection(container) {
        const app = this.sgvStore.getQuads(container, consts_1.saveConditionPredicate);
        return {
            type: StructuredCollection_1.CollectionType.canonical,
            uri: container,
            oneFileOneResource: this.sgvStore.getQuads(container, consts_1.predicateOneFileOneResource)[0].object.value === 'true',
            saveConditions: this.sgvStore.getQuads(container, consts_1.saveConditionPredicate)
                .map(x => this.parseSaveCondition(x.object)),
            groupStrategy: this.parseGroupStrategy(container, container),
        };
    }
    getOne(subject, predicate, object) {
        return (0, Helpers_1.getOne)(this.sgvStore, subject, predicate, object);
    }
    parseGroupStrategy(container, collectionUri) {
        const groupStrategy = this.getOne(container, consts_1.groupStrategyPredicate);
        const type = this.getOne(groupStrategy.object, consts_1.rdfTypePredicate);
        if (type.object.equals(consts_1.typeGroupStrategyUriTemplate)) {
            return new GroupStrategy_1.GroupStrategyURITemplate(this.getOne(groupStrategy.object, consts_1.groupStrategyUriTemplate).object.value, collectionUri, this.sgvStore.getQuads(groupStrategy.object, consts_1.groupStrategyRegexMatch)[0]?.object?.value, this.sgvStore.getQuads(groupStrategy.object, consts_1.groupStrategyRegexReplace)[0]?.object?.value);
        }
        throw new Error('Unknown group strategy');
    }
    parseResourceDescription(descriptionSubject) {
        const type = this.getOne(descriptionSubject, consts_1.rdfTypePredicate);
        if (type.object.equals(consts_1.typeResourceDescriptionShacl)) {
            return new ResourceDescription_1.ResourceDescriptionSHACL(this.sgvStore, this.getOne(descriptionSubject, consts_1.shaclShapeLink).object);
        }
        throw new Error('Unknown resource description');
    }
    parseSaveCondition(saveCondSubject) {
        const updateCondition = this.parseUpdateCondition(this.getOne(saveCondSubject, consts_1.updateConditionPredicate).object);
        const type = this.getOne(saveCondSubject, consts_1.rdfTypePredicate);
        if (type.object.equals(consts_1.typeSaveConditionAlwaysStore)) {
            return new SaveCondition_1.SaveConditionAlwaysStored(updateCondition);
        }
        if (type.object.equals(consts_1.typeSaveConditionAlwaysStore)) {
            return new SaveCondition_1.SaveConditionAlwaysStored(updateCondition);
        }
        throw new Error('Unknown save condition');
    }
    parseUpdateCondition(updateCond) {
        const resourceDescription = this.parseResourceDescription(this.getOne(updateCond, consts_1.resourceDescriptionPredicate).object);
        const type = this.getOne(updateCond, consts_1.rdfTypePredicate);
        if (type.object.equals(consts_1.typeUpdateConditionPreferStatic)) {
            return new UpdateCondition_1.UpdateConditionPreferStatic(resourceDescription);
        }
        throw new Error('Unknown update condition');
    }
}
exports.SGVParser = SGVParser;
//# sourceMappingURL=SGVParser.js.map