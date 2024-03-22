import {DataFactory} from "rdf-data-factory";

const prefix = "https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/";
const rdfPrefix = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"

const DF = new DataFactory();

export const rdfTypeURL = `${rdfPrefix}#type`;
export const rdfType = DF.namedNode(rdfTypeURL);

// Containers
export const typeCanonicalCollectionURL = `${prefix}#canonical-collection`;
export const typeCanonicalCollection = DF.namedNode(typeCanonicalCollectionURL);

// Update conditions
export const updateConditionPredicateURL = `${prefix}#update-condition`;
export const updateConditionPredicate = DF.namedNode(updateConditionPredicateURL);
export const typeUpdateConditionPreferStaticURL = `${prefix}#update-prefer-static`;
export const typeUpdateConditionPreferStatic = DF.namedNode(typeUpdateConditionPreferStaticURL);

// Save Conditions
export const saveConditionPredicateURL = `${prefix}#save-condition`;
export const saveConditionPredicate = DF.namedNode(saveConditionPredicateURL);
export const typeSaveConditionAlwaysStoreURL = `${prefix}#save-stored`;
export const typeSaveConditionAlwaysStore = DF.namedNode(typeSaveConditionAlwaysStoreURL);


// Resource description
export const resourceDescriptionPredicateURL = `${prefix}#resource-description`;
export const resourceDescriptionPredicate = DF.namedNode(resourceDescriptionPredicateURL);
export const typeResourceDescriptionShaclURL = `${prefix}#shacl-descriptor`;
export const typeResourceDescriptionShacl = DF.namedNode(typeResourceDescriptionShaclURL);
export const shaclShapeLinkUrl = `${prefix}#shacl-shape`;
export const shaclShapeLink = DF.namedNode(shaclShapeLinkUrl);

