import {RdfStore} from "rdf-stores";
import type * as RDF from "@rdfjs/types";

export function getOne(sgv: RdfStore, subject?: RDF.Quad_Object, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Subject): RDF.Quad {
    const quads = sgv.getQuads(subject, predicate, object);
    if (quads.length !== 1) {
        throw new Error(`Expected one quad, got ${quads.length}`);
    }
    return quads[0];
}

export function termToString(rdf: RDF.Term): string {
    if (rdf.termType === 'NamedNode') {
        return `<${rdf.value}>`;
    } else if (rdf.termType === 'Literal') {
        if (rdf.language) {
            return `"${rdf.value}"@${rdf.language}`;
        }
        if (rdf.datatype) {
            return `"${rdf.value}"^^<${rdf.datatype.value}>`;
        }
        return `"${rdf.value}"`;
    } else if (rdf.termType === 'BlankNode') {
        return `_:${rdf.value}`;
    } else {
        return rdf.value;
    }
}

export function quadToString(rdf: RDF.Quad): string {
    return `${termToString(rdf.subject)} ${termToString(rdf.predicate)} ${termToString(rdf.object)} .`;
}
