import {RdfStore} from "rdf-stores";
import type * as RDF from "@rdfjs/types";

export function getOne(sgv: RdfStore, subject?: RDF.Quad_Object, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Subject): RDF.Quad {
    const quads = sgv.getQuads(subject, predicate, object);
    if (quads.length !== 1) {
        throw new Error(`Expected one quad, got ${quads.length}`);
    }
    return quads[0];
}
