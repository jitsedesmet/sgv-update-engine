import * as RDF from "@rdfjs/types";

export interface ResourceDescriptionSHACL {
    type: "SHACL";
    descriptions: RDF.DatasetCore[];
}

export type ResourceDescription = ResourceDescriptionSHACL;
