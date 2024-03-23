import {ParsedSGV} from "./treeStructure/ParsedSGV";
import type * as RDF from '@rdfjs/types';
import {RdfStore} from "rdf-stores";
import {
    groupStrategyPredicate, groupStrategyUriTemplate,
    rdfTypePredicate,
    rdfTypePredicateURL,
    resourceDescriptionPredicate,
    saveConditionPredicate, shaclShapeLink,
    typeCanonicalCollection, typeGroupStrategyUriTemplate, typeResourceDescriptionShacl,
    typeSaveConditionAlwaysStore,
    typeSaveConditionAlwaysStoreURL, typeUpdateConditionPreferStatic, updateConditionPredicate
} from "./consts";
import {DefinedTriple, RootedCanonicalCollection} from "./treeStructure/StructuredCollection";
import {UpdateCondition} from "./treeStructure/UpdateCondition";
import {SaveCondition} from "./treeStructure/SaveCondition";
import {ResourceDescription} from "./treeStructure/ResourceDescription";
import {GroupStrategy} from "./treeStructure/GroupStrategy";
import {getOne} from "../helpers/Helpers";


export class SGVParser {
    public parseSGV(sgv: RdfStore): ParsedSGV {
        console.log(typeCanonicalCollection);
        return {
            collections: sgv.getQuads(undefined, undefined, typeCanonicalCollection).map(quad => {
                if (quad.subject.termType !== "NamedNode" && quad.subject.termType !== "BlankNode") {
                    throw new Error("Expected a NamedNode or BlankNode as subject");
                }
                return this.parseCanonicalCollection(sgv, <DefinedTriple> quad.subject);
            })
        }
    }

    private parseCanonicalCollection(sgv: RdfStore, container: DefinedTriple): RootedCanonicalCollection {
        return {
            type: "Canonical Collection",
            uri: container,
            oneFileOneResource: false,
            updateCondition: this.parseUpdateCondition(sgv, container),
            saveCondition: this.parseSaveCondition(sgv, container),
            resourceDescription: this.parseResourceDescription(sgv, container),
            groupStrategy: this.parseGroupStrategy(sgv, container),
        }
    }

    private parseGroupStrategy(sgv: RdfStore, container: DefinedTriple): GroupStrategy {
        const groupStrategy = getOne(sgv, container, groupStrategyPredicate);
        const type = getOne(sgv, groupStrategy.object, rdfTypePredicate);

        if (type.object.equals(typeGroupStrategyUriTemplate)) {
            return {
                type: "URI template",
                template: getOne(sgv, groupStrategy.object, groupStrategyUriTemplate).object.value
            }
        }
        throw new Error("Unknown group strategy");
    }

    private parseResourceDescription(sgv: RdfStore, container: DefinedTriple): ResourceDescription {
        const resourceDescription = getOne(sgv, container, resourceDescriptionPredicate);
        const type = getOne(sgv, resourceDescription.object, rdfTypePredicate);

        if (type.object.equals(typeResourceDescriptionShacl)) {
            // Parse the shacl shape
            const descriptions: RDF.DatasetCore[] = [];
            for (const shapeLink of sgv.getQuads(resourceDescription.object, shaclShapeLink)) {
                const rootShapes = shapeLink.object;

                const focusStore = RdfStore.createDefault();
                let storeSize = 0;
                for (const quad of sgv.getQuads(rootShapes)) {
                    focusStore.addQuad(quad);
                }
                while (storeSize !== focusStore.size) {
                    storeSize = focusStore.size;
                    for (const quad of focusStore.getQuads()) {
                        for (const subjectQuad of sgv.getQuads(quad.object)) {
                            focusStore.addQuad(subjectQuad);
                        }
                    }
                }
                descriptions.push(focusStore.asDataset())
            }

            return {
                type: "SHACL",
                descriptions
            }
        }
        throw new Error("Unknown resource description");
    }


    private parseSaveCondition(sgv: RdfStore, container: DefinedTriple): SaveCondition {
        const saveCondition = getOne(sgv, container, saveConditionPredicate);
        const type = getOne(sgv, saveCondition.object, rdfTypePredicate);

        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return {
                type: "always stored"
            }
        }
        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return {
                type: "always stored"
            }
        }
        throw new Error("Unknown save condition");
    }

    private parseUpdateCondition(sgv: RdfStore, container: DefinedTriple): UpdateCondition {
        const updateCondition = getOne(sgv, container, updateConditionPredicate);
        const type = getOne(sgv, updateCondition.object, rdfTypePredicate);

        if (type.object.equals(typeUpdateConditionPreferStatic)) {
            return {
                type: "prefer static"
            }
        }
        throw new Error("Unknown update condition");
    }



}
