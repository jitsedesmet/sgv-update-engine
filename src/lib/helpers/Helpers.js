"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertVal = exports.getQueryWithoutPrefixes = exports.translateStore = exports.storeMinus = exports.coreStoreUnion = exports.storeUnion = exports.storeFromTriples = exports.getRootResources = exports.getPrunedStore = exports.fileResourceToStore = exports.quadToString = exports.termToString = exports.getOne = void 0;
const rdf_stores_1 = require("rdf-stores");
const rdf_data_factory_1 = require("rdf-data-factory");
const sparqljs_1 = require("sparqljs");
const DF = new rdf_data_factory_1.DataFactory();
function getOne(sgv, subject, predicate, object) {
    const quads = sgv.getQuads(subject, predicate, object);
    if (quads.length !== 1) {
        throw new Error(`Expected one quad, got ${quads.length}`);
    }
    return quads[0];
}
exports.getOne = getOne;
function termToString(rdf) {
    if (rdf.termType === 'NamedNode') {
        return `<${rdf.value}>`;
    }
    else if (rdf.termType === 'Literal') {
        if (rdf.language) {
            return `"${rdf.value}"@${rdf.language}`;
        }
        if (rdf.datatype) {
            return `"${rdf.value}"^^<${rdf.datatype.value}>`;
        }
        return `"${rdf.value}"`;
    }
    else if (rdf.termType === 'BlankNode') {
        return `_:${rdf.value}`;
    }
    else {
        return rdf.value;
    }
}
exports.termToString = termToString;
function quadToString(rdf) {
    return `${termToString(rdf.subject)} ${termToString(rdf.predicate)} ${termToString(rdf.object)} .`;
}
exports.quadToString = quadToString;
async function fileResourceToStore(engine, resource) {
    const fileStore = rdf_stores_1.RdfStore.createDefault();
    await engine.invalidateHttpCache();
    for await (const bindings of await engine.queryBindings('select * where { ?s ?p ?o }', { sources: [resource] })) {
        fileStore.addQuad(DF.quad(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        bindings.get('s'), 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        bindings.get('p'), 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        bindings.get('o')));
    }
    return fileStore;
}
exports.fileResourceToStore = fileResourceToStore;
function getPrunedStore(store, focusResource) {
    const resourceStore = rdf_stores_1.RdfStore.createDefault();
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
exports.getPrunedStore = getPrunedStore;
function getRootResources(store) {
    const resources = new Set();
    for (const quad of store.getQuads()) {
        if (quad.subject.termType === 'NamedNode') {
            resources.add(quad.subject.value);
        }
    }
    return [...resources.values()]
        .map(x => DF.namedNode(x))
        .filter(root => store.getQuads(null, null, root).length === 0);
}
exports.getRootResources = getRootResources;
function storeFromTriples(triples) {
    const store = rdf_stores_1.RdfStore.createDefault();
    for (const triple of triples) {
        store.addQuad(DF.quad(triple.subject, triple.predicate, triple.object));
    }
    return store;
}
exports.storeFromTriples = storeFromTriples;
function storeUnion(store1, store2) {
    const store = rdf_stores_1.RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.addQuad(quad);
    }
    return store;
}
exports.storeUnion = storeUnion;
function coreStoreUnion(store1, store2) {
    const store = rdf_stores_1.RdfStore.createDefault().asDataset();
    for (const quad of store2) {
        store.add(quad);
    }
    return store;
}
exports.coreStoreUnion = coreStoreUnion;
function storeMinus(store1, store2) {
    const store = rdf_stores_1.RdfStore.createDefault();
    for (const quad of store1.getQuads()) {
        store.addQuad(quad);
    }
    for (const quad of store2.getQuads()) {
        store.removeQuad(quad);
    }
    return store;
}
exports.storeMinus = storeMinus;
function translateStore(store, from, to) {
    const newStore = rdf_stores_1.RdfStore.createDefault();
    for (const quad of store.getQuads()) {
        newStore.addQuad(DF.quad(quad.subject.equals(from) ? to : quad.subject, quad.predicate, quad.object));
    }
    return newStore;
}
exports.translateStore = translateStore;
function getQueryWithoutPrefixes(query) {
    const shallowCopy = { ...query };
    shallowCopy.prefixes = {};
    shallowCopy.base = undefined;
    return new sparqljs_1.Generator().stringify(shallowCopy);
}
exports.getQueryWithoutPrefixes = getQueryWithoutPrefixes;
function assertVal(val) {
    return val ?? (() => {
        throw new Error('did not work');
    })();
}
exports.assertVal = assertVal;
//# sourceMappingURL=Helpers.js.map