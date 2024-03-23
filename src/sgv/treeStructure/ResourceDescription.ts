import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {getOne} from "../../helpers/Helpers";
import {rdfTypePredicate, shaclNodeShape} from "../consts";
import {Quad_Subject} from "@rdfjs/types";
import SHACLValidator from "rdf-validate-shacl";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export interface RawResourceDescriptionSHACL {
    type: "SHACL";
    descriptions: RDF.DatasetCore[];
}

export class ResourceDescriptionSHACL implements RawResourceDescriptionSHACL {
    public type: "SHACL" = "SHACL";
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

    public resourceMatchesDescription(resourceStore: RdfStore, resourceBaseUrl: string): boolean {
        let allMatch = true;
        for (const description of this.descriptions) {
            // Add the focus node to the description, removing it again when we are done.
            const nodeShape = getOne(this.sgvStore, undefined, rdfTypePredicate, shaclNodeShape).object;

            const focusNodeLink = DF.quad(
                <Quad_Subject> nodeShape,
                rdfTypePredicate,
                DF.namedNode(resourceBaseUrl)
            );
            description.add(focusNodeLink);

            const validator = new SHACLValidator(description);

            description.delete(focusNodeLink);

            const report = validator.validate(resourceStore.asDataset());
            for (const result of report.results) {
                console.log(result.message);
                console.log(result.sourceShape);
                console.log(result.term);
                console.log(result.sourceConstraintComponent);
                console.log(result.path);

            }
            allMatch = allMatch && report.conforms;
        }
        return allMatch;
    }

}

export type ResourceDescription = ResourceDescriptionSHACL;