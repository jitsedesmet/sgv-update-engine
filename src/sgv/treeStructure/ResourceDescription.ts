import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {getOne} from "../../helpers/Helpers";
import {rdfTypePredicate, shaclNodeShape, shaclTargetNode} from "../consts";
import SHACLValidator from "rdf-validate-shacl";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export interface RawResourceDescriptionSHACL {
    type: "SHACL";
    descriptions: RDF.DatasetCore[];
}

export class ResourceDescriptionSHACL implements RawResourceDescriptionSHACL {
    public type = "SHACL" as const;
    public descriptions: RDF.DatasetCore[];

    public constructor(private sgvStore: RdfStore, shaclShapes: RDF.Quad_Object[]) {
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

    public resourceMatchesDescription(resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean {
        let allMatch = true;
        for (const description of this.descriptions) {
            // Add the focus node to the description, removing it again when we are done.
            const nodeShape = getOne(this.sgvStore, undefined, rdfTypePredicate, shaclNodeShape).subject;

            const focusNodeLink = DF.quad(
                nodeShape,
                shaclTargetNode,
                baseResource
            );
            description.add(focusNodeLink);

            const validator = new SHACLValidator(description);

            const report = validator.validate(resourceStore.asDataset());

            description.delete(focusNodeLink);
            // for (const result of report.results) {
            //     console.log(result.message);
            //     console.log(result.sourceShape);
            //     console.log(result.term);
            //     console.log(result.sourceConstraintComponent);
            //     console.log(result.path);
            // }
            allMatch = allMatch && report.conforms;
        }
        return allMatch;
    }

}

export type ResourceDescription = ResourceDescriptionSHACL;
