import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";

export interface RawResourceDescriptionSHACL {
    type: "SHACL";
    descriptions: RDF.DatasetCore[];
}

export class ResourceDescriptionSHACL implements RawResourceDescriptionSHACL {
    public type: "SHACL" = "SHACL";
    public descriptions: RDF.DatasetCore[];

    public constructor(sgvStore: RdfStore, shaclShapes: RDF.Quad_Object[]) {
        this.descriptions = [];
        for (const shapeId of shaclShapes) {

            const focusStore = RdfStore.createDefault();
            let storeSize = 0;
            for (const quad of sgvStore.getQuads(shapeId)) {
                focusStore.addQuad(quad);
            }
            while (storeSize !== focusStore.size) {
                storeSize = focusStore.size;
                for (const quad of focusStore.getQuads()) {
                    for (const subjectQuad of sgvStore.getQuads(quad.object)) {
                        focusStore.addQuad(subjectQuad);
                    }
                }
            }
            this.descriptions.push(focusStore.asDataset())
        }
    }

}

export type ResourceDescription = ResourceDescriptionSHACL;
