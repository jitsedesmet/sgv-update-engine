import {RdfStore} from 'rdf-stores';
import type * as RDF from '@rdfjs/types';
import {Quad_Object, Quad_Predicate, Quad_Subject} from '@rdfjs/types';
import {QueryEngine} from '@comunica/query-sparql-file';
import {DataFactory} from 'rdf-data-factory';
import {Generator, SparqlQuery, Triple} from 'sparqljs';

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
    await engine.invalidateHttpCache();
    for await (const bindings of await engine.queryBindings(
        'select * where { ?s ?p ?o }',
        { sources: [resource]}
    )) {
        fileStore.addQuad(
            DF.quad(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (bindings.get('s')! as Quad_Subject),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (bindings.get('p')! as Quad_Predicate),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (bindings.get('o')! as Quad_Object)
            )
        );
    }
    return fileStore;
}

export function getPrunedStore(store: RdfStore, focusResource: RDF.NamedNode | RDF.BlankNode): RdfStore {
    const resourceStore = RdfStore.createDefault();
    let storeSize = resourceStore.size;
    for (const quad of store.getQuads(focusResource)) {
        resourceStore.addQuad(quad);
    }
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

export function storeFromTriples(triples: Triple[]): RdfStore {
    const store = RdfStore.createDefault();
    for (const triple of triples) {
        store.addQuad(DF.quad(
            triple.subject,
            (triple.predicate as Quad_Predicate),
            triple.object,
        ));
    }
    return store;
}

export function storeUnion(store1: RdfStore, store2: RdfStore): RdfStore {
    const store = RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.addQuad(quad);
    }
    return store;
}

export function coreStoreUnion(store1: RDF.DatasetCore, store2: RDF.DatasetCore): RDF.DatasetCore {
    const store = RdfStore.createDefault().asDataset();
    for (const quad of store2) {
        store.add(quad);
    }
    return store;
}

export function storeMinus(store1: RdfStore, store2: RdfStore): RdfStore {
    const store = RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.removeQuad(quad);
    }
    return store;
}

export function translateStore(store: RdfStore, from: RDF.NamedNode, to: RDF.NamedNode): RdfStore {
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

export function getQueryWithoutPrefixes(query: SparqlQuery): string {
    const shallowCopy = { ...query };

    shallowCopy.prefixes = {};
    shallowCopy.base = undefined;

    return new Generator().stringify(shallowCopy);
}

