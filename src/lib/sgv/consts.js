"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupStrategyRegexReplace = exports.groupStrategyRegexReplaceUrl = exports.groupStrategyRegexMatch = exports.groupStrategyRegexMatchUrl = exports.groupStrategyUriTemplate = exports.groupStrategyUriTemplateUrl = exports.typeGroupStrategyUriTemplate = exports.typeGroupStrategyUriTemplateURL = exports.groupStrategyPredicate = exports.groupStrategyPredicateURL = exports.shaclShapeLink = exports.shaclShapeLinkUrl = exports.typeResourceDescriptionShacl = exports.typeResourceDescriptionShaclURL = exports.resourceDescriptionPredicate = exports.resourceDescriptionPredicateURL = exports.typeSaveConditionAlwaysStore = exports.typeSaveConditionAlwaysStoreURL = exports.saveConditionPredicate = exports.saveConditionPredicateURL = exports.typeUpdateConditionPreferStatic = exports.typeUpdateConditionPreferStaticURL = exports.updateConditionPredicate = exports.updateConditionPredicateURL = exports.predicateOneFileOneResource = exports.predicateOneFileOneResourceURL = exports.typeCanonicalCollection = exports.typeCanonicalCollectionURL = exports.shaclTargetNode = exports.shaclTargetNodeUrl = exports.shaclNodeShape = exports.shaclNodeShapeUrl = exports.rdfTypePredicate = exports.rdfTypePredicateURL = void 0;
const rdf_data_factory_1 = require("rdf-data-factory");
const prefix = 'https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/';
const rdfPrefix = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const shaclPrefix = 'http://www.w3.org/ns/shacl#';
const DF = new rdf_data_factory_1.DataFactory();
exports.rdfTypePredicateURL = `${rdfPrefix}type`;
exports.rdfTypePredicate = DF.namedNode(exports.rdfTypePredicateURL);
exports.shaclNodeShapeUrl = `${shaclPrefix}NodeShape`;
exports.shaclNodeShape = DF.namedNode(exports.shaclNodeShapeUrl);
exports.shaclTargetNodeUrl = `${shaclPrefix}targetNode`;
exports.shaclTargetNode = DF.namedNode(exports.shaclTargetNodeUrl);
// Containers
exports.typeCanonicalCollectionURL = `${prefix}#canonical-collection`;
exports.typeCanonicalCollection = DF.namedNode(exports.typeCanonicalCollectionURL);
exports.predicateOneFileOneResourceURL = `${prefix}#one-file-one-resource`;
exports.predicateOneFileOneResource = DF.namedNode(exports.predicateOneFileOneResourceURL);
// Update conditions
exports.updateConditionPredicateURL = `${prefix}#update-condition`;
exports.updateConditionPredicate = DF.namedNode(exports.updateConditionPredicateURL);
exports.typeUpdateConditionPreferStaticURL = `${prefix}#update-prefer-static`;
exports.typeUpdateConditionPreferStatic = DF.namedNode(exports.typeUpdateConditionPreferStaticURL);
// Save Conditions
exports.saveConditionPredicateURL = `${prefix}#save-condition`;
exports.saveConditionPredicate = DF.namedNode(exports.saveConditionPredicateURL);
exports.typeSaveConditionAlwaysStoreURL = `${prefix}#always-stored`;
exports.typeSaveConditionAlwaysStore = DF.namedNode(exports.typeSaveConditionAlwaysStoreURL);
// Resource description
exports.resourceDescriptionPredicateURL = `${prefix}#resource-description`;
exports.resourceDescriptionPredicate = DF.namedNode(exports.resourceDescriptionPredicateURL);
exports.typeResourceDescriptionShaclURL = `${prefix}#shacl-descriptor`;
exports.typeResourceDescriptionShacl = DF.namedNode(exports.typeResourceDescriptionShaclURL);
exports.shaclShapeLinkUrl = `${prefix}#shacl-shape`;
exports.shaclShapeLink = DF.namedNode(exports.shaclShapeLinkUrl);
// Group strategies
exports.groupStrategyPredicateURL = `${prefix}#group-strategy`;
exports.groupStrategyPredicate = DF.namedNode(exports.groupStrategyPredicateURL);
exports.typeGroupStrategyUriTemplateURL = `${prefix}#group-strategty-uri-template`;
exports.typeGroupStrategyUriTemplate = DF.namedNode(exports.typeGroupStrategyUriTemplateURL);
exports.groupStrategyUriTemplateUrl = `${prefix}#uri-template`;
exports.groupStrategyUriTemplate = DF.namedNode(exports.groupStrategyUriTemplateUrl);
exports.groupStrategyRegexMatchUrl = `${prefix}#regex-match`;
exports.groupStrategyRegexMatch = DF.namedNode(exports.groupStrategyRegexMatchUrl);
exports.groupStrategyRegexReplaceUrl = `${prefix}#regex-replace`;
exports.groupStrategyRegexReplace = DF.namedNode(exports.groupStrategyRegexReplaceUrl);
//# sourceMappingURL=consts.js.map