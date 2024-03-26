import {RdfStore} from "rdf-stores";
import type * as RDF from "@rdfjs/types";
import {Quad_Object, Quad_Predicate, Quad_Subject} from "@rdfjs/types";
import {QueryEngine} from "@comunica/query-sparql-file";
import {DataFactory} from "rdf-data-factory";
import {Generator, SparqlQuery, Triple} from "sparqljs";

const DF = new DataFactory();

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

export async function fileResourceToStore(engine: QueryEngine, resource: string): Promise<RdfStore> {
    const fileStore = RdfStore.createDefault();
    for await (const bindings of await engine.queryBindings(
        `select * where { ?s ?p ?o }`,
        { sources: [resource]}
    )) {
        fileStore.addQuad(
            DF.quad(
                <Quad_Subject>bindings.get('s')!,
                <Quad_Predicate>bindings.get('p')!,
                <Quad_Object>bindings.get('o')!
            )
        )
    }
    return fileStore;
}

export async function getPrunedStore(store: RdfStore, focusResource: RDF.NamedNode | RDF.BlankNode): Promise<RdfStore> {
    const resourceStore = RdfStore.createDefault();
    for (const quad of store.getQuads(focusResource)) {
        resourceStore.addQuad(quad);
    }
    let storeSize = resourceStore.size;
    while (storeSize !== resourceStore.size) {
        storeSize = resourceStore.size;
        for (const quad of resourceStore.getQuads()) {
            for (const subjectQuad of store.getQuads(quad.object)) {
                resourceStore.addQuad(subjectQuad);
            }
        }
    }

    return resourceStore;
}

export async function storeFromTriples(triples: Triple[]): Promise<RdfStore> {
    const store = RdfStore.createDefault();
    for (const triple of triples) {
        store.addQuad(DF.quad(
            triple.subject,
            <Quad_Predicate> triple.predicate,
            triple.object,
        ));
    }
    return store;
}

export async function storeUnion(store1: RdfStore, store2: RdfStore): Promise<RdfStore> {
    const store = RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.addQuad(quad);
    }
    return store;
}

export async function storeMinus(store1: RdfStore, store2: RdfStore): Promise<RdfStore> {
    const store = RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.removeQuad(quad);
    }
    return store;
}

export async function translateStore(store: RdfStore, from: RDF.NamedNode, to: RDF.NamedNode): Promise<RdfStore> {
    const newStore = RdfStore.createDefault();
    for (const quad of store.getQuads()) {
        newStore.addQuad(DF.quad(
            quad.subject.equals(from) ? to : quad.subject,
            quad.predicate,
            quad.object,
        ));
    }
    return newStore;
}

export async function getQueryWithoutPrefixes(query: SparqlQuery): Promise<string> {
    const shallowCopy = { ...query };

    shallowCopy.prefixes = {};
    shallowCopy.base = undefined;

    return new Generator().stringify(shallowCopy);
}

