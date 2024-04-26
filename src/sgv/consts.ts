import {DataFactory} from 'rdf-data-factory';

const prefix = 'https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/';
const rdfPrefix = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const shaclPrefix = 'http://www.w3.org/ns/shacl#';


const DF = new DataFactory();

export const rdfTypePredicateURL = `${rdfPrefix}type`;
export const rdfTypePredicate = DF.namedNode(rdfTypePredicateURL);
export const shaclNodeShapeUrl = `${shaclPrefix}NodeShape`;
export const shaclNodeShape = DF.namedNode(shaclNodeShapeUrl);
export const shaclTargetNodeUrl = `${shaclPrefix}targetNode`;
export const shaclTargetNode = DF.namedNode(shaclTargetNodeUrl);

// Containers
export const typeCanonicalCollectionURL = `${prefix}#canonical-collection`;
export const typeCanonicalCollection = DF.namedNode(typeCanonicalCollectionURL);
export const predicateOneFileOneResourceURL = `${prefix}#one-file-one-resource`;
export const predicateOneFileOneResource = DF.namedNode(predicateOneFileOneResourceURL);

// Update conditions
export const updateConditionPredicateURL = `${prefix}#update-condition`;
export const updateConditionPredicate = DF.namedNode(updateConditionPredicateURL);
export const typeUpdateConditionPreferStaticURL = `${prefix}#update-prefer-static`;
export const typeUpdateConditionPreferStatic = DF.namedNode(typeUpdateConditionPreferStaticURL);

// Save Conditions
export const saveConditionPredicateURL = `${prefix}#save-condition`;
export const saveConditionPredicate = DF.namedNode(saveConditionPredicateURL);
export const typeSaveConditionAlwaysStoreURL = `${prefix}#always-stored`;
export const typeSaveConditionAlwaysStore = DF.namedNode(typeSaveConditionAlwaysStoreURL);


// Resource description
export const resourceDescriptionPredicateURL = `${prefix}#resource-description`;
export const resourceDescriptionPredicate = DF.namedNode(resourceDescriptionPredicateURL);
export const typeResourceDescriptionShaclURL = `${prefix}#shacl-descriptor`;
export const typeResourceDescriptionShacl = DF.namedNode(typeResourceDescriptionShaclURL);
export const shaclShapeLinkUrl = `${prefix}#shacl-shape`;
export const shaclShapeLink = DF.namedNode(shaclShapeLinkUrl);


// Group strategies
export const groupStrategyPredicateURL = `${prefix}#group-strategy`;
export const groupStrategyPredicate = DF.namedNode(groupStrategyPredicateURL);
export const typeGroupStrategyUriTemplateURL = `${prefix}#group-strategty-uri-template`;
export const typeGroupStrategyUriTemplate = DF.namedNode(typeGroupStrategyUriTemplateURL);
export const groupStrategyUriTemplateUrl = `${prefix}#uri-template`;
export const groupStrategyUriTemplate = DF.namedNode(groupStrategyUriTemplateUrl);
export const groupStrategyRegexMatchUrl = `${prefix}#regex-match`;
export const groupStrategyRegexMatch = DF.namedNode(groupStrategyRegexMatchUrl);
export const groupStrategyRegexReplaceUrl = `${prefix}#regex-replace`;
export const groupStrategyRegexReplace = DF.namedNode(groupStrategyRegexReplaceUrl);

