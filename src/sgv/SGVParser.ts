import {ParsedSGV} from "./treeStructure/ParsedSGV";
import type * as RDF from '@rdfjs/types';
import {RdfStore} from "rdf-stores";
import {
    rdfType,
    rdfTypeURL,
    resourceDescriptionPredicate,
    saveConditionPredicate, shaclShapeLink,
    typeCanonicalCollection, typeResourceDescriptionShacl,
    typeSaveConditionAlwaysStore,
    typeSaveConditionAlwaysStoreURL, typeUpdateConditionPreferStatic, updateConditionPredicate
} from "./consts";
import {DefinedTriple, RootedCanonicalCollection} from "./treeStructure/StructuredCollection";
import {UpdateCondition} from "./treeStructure/UpdateCondition";
import {SaveCondition} from "./treeStructure/SaveCondition";
import {ResourceDescription} from "./treeStructure/ResourceDescription";


export class SGVParser {
    public functionParseSGV(sgv: RdfStore): ParsedSGV {
        // Get a list of containers and parse them


        // Get the shape IRIs and the shape we should match for them



        // Get the group strategies

        return {
            collections: sgv.getQuads(typeCanonicalCollection).map(quad => {
                if (quad.subject.termType !== "NamedNode" && quad.subject.termType !== "BlankNode") {
                    throw new Error("Expected a NamedNode or BlankNode as subject");
                }
                return this.parseCanonicalCollection(sgv, <DefinedTriple> quad.subject);
            })
        }
    }

    private parseCanonicalCollection(sgv: RdfStore, container: DefinedTriple): RootedCanonicalCollection {
        return {
            type: "Canonical collection",
            uri: container,
            oneFileOneResource: false,
            updateCondition: this.parseUpdateCondition(sgv, container),
            saveCondition: this.parseSaveCondition(sgv, container),
            resourceDescription: this.parseResourceDescription(sgv, container),
        }
    }

    private parseResourceDescription(sgv: RdfStore, container: DefinedTriple): ResourceDescription {
        const resourceDescription = this.getOne(sgv, container, resourceDescriptionPredicate);
        const type = this.getOne(sgv, resourceDescription.object, rdfType);

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
        const saveCondition = this.getOne(sgv, container, saveConditionPredicate);
        const type = this.getOne(sgv, saveCondition.object, rdfType);

        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return {
                type: "always stored"
            }
        }
        throw new Error("Unknown save condition");
    }

    private parseUpdateCondition(sgv: RdfStore, container: DefinedTriple): UpdateCondition {
        const updateCondition = this.getOne(sgv, container, updateConditionPredicate);
        const type = this.getOne(sgv, updateCondition.object, rdfType);

        if (type.object.equals(typeUpdateConditionPreferStatic)) {
            return {
                type: "prefer static"
            }
        }
        throw new Error("Unknown update condition");
    }

    private getOne(sgv: RdfStore, subject?: RDF.Quad_Object, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Subject): RDF.Quad {
        const quads = sgv.getQuads(subject, predicate, object);
        if (quads.length !== 1) {
            throw new Error(`Expected one quad, got ${quads.length}`);
        }
        return quads[0];
    }

}
