import {QueryEngine} from "@comunica/query-sparql-file";
import type * as RDF from '@rdfjs/types';
import {Quad_Object, Quad_Predicate, Quad_Subject} from "@rdfjs/types";
import {DataFactory} from "rdf-data-factory";
import SHACLValidator from 'rdf-validate-shacl'
import {InsertDeleteOperation, Parser, UpdateOperation} from "sparqljs";

import {RdfStore} from "rdf-stores";
import * as fs from "fs";

const DF = new DataFactory();
const myEngine = new QueryEngine();

async function main(pod: string, query_file: string): Promise<void> {
    // Copy the SGV data to a store
    const sgvStore = RdfStore.createDefault();
    for await (const bindings of await myEngine.queryBindings(
        `select * where { ?s ?p ?o }`,
        { sources: [`${pod.trim()}sgv`]}
    )) {
        sgvStore.addQuad(
            DF.quad(
                <Quad_Subject>bindings.get('s')!,
                <Quad_Predicate>bindings.get('p')!,
                <Quad_Object>bindings.get('o')!
            )
        )
    }

    // Copy the resource data to a store
    const baseIRI = "file:///8ea79435-ffe1-4357-9010-0970114970ad";
    const parser = new Parser({
        baseIRI
    });
    const query = fs.readFileSync(query_file, 'utf8');
    const parsedQuery = parser.parse(query);
    if (parsedQuery.type !== 'update') {
        throw new Error('Expected an update query');
    }

    const resourceStore = RdfStore.createDefault();
    const operation = <InsertDeleteOperation> parsedQuery.updates[0];
    if (operation.updateType !== 'insert') {
        throw new Error('Expected an insert operation');
    }
    const triples = operation.insert[0].triples;
    for (const triple of triples) {
        resourceStore.addQuad(DF.quad(
            triple.subject,
            <Quad_Predicate> triple.predicate,
            triple.object,
        ));
    }

    // Get all shape URIs described by SGV.
    const shapes: [RDF.NamedNode, RDF.NamedNode][] = [];
    for await (const bindings of await myEngine.queryBindings(`
        prefix sgv: <https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/#>
        select * where {
            ?container sgv:resource-description [
                a sgv:shacl-descriptor ;
                sgv:shacl-shape ?shape ;
            ] .
        }
    `, { sources: [sgvStore]}
    )) {
        shapes.push([<RDF.NamedNode>bindings.get('container'), <RDF.NamedNode>bindings.get('shape')]);
    }

    /// Extract the shapes in their own store and set focus node in the shape stores
    const mappedShapes: [RDF.NamedNode, RdfStore][] = shapes.map(([container, shape]) => {
        const focusStore = RdfStore.createDefault();
        let storeSize = 0;
        for (const quad of sgvStore.getQuads(shape)) {
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
        focusStore.addQuad(DF.quad(
            shape,
            DF.namedNode('http://www.w3.org/ns/shacl#targetNode'),
            DF.namedNode(baseIRI),
        ));
        return [container, focusStore];
    });

    // Validate the resource store against the shapes
    const matchedShapes = mappedShapes.filter(([container, store]) => {
        const validator = new SHACLValidator(store.asDataset());
        const report = validator.validate(resourceStore.asDataset());
        for (const result of report.results) {
            console.log(result.message);
            console.log(result.sourceShape);
            console.log(result.term);
            console.log(result.sourceConstraintComponent);
            console.log(result.path);

        }
        return report.conforms;
    });


    // console.log(matchedShapes)

    if (matchedShapes.length > 0) {
        // For now, let's take the first match, and let's place it there
        const [container, store] = matchedShapes[0];
        console.log(`Resource conforms to shape ${container.value}`);

        let uriTemplate = null;
        for await (const bindings of await myEngine.queryBindings(`
            prefix sgv: <https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/#> 
            select * where {
                <${container.value}> sgv:group-strategy [
                    sgv:uri-template ?uriTemplate ;
                ] ;
            }
        `, { sources: [sgvStore]}
        )) {
            uriTemplate = bindings.get('uriTemplate')!.value;
            break;
        }
        console.log(uriTemplate);

        if (uriTemplate) {
            const {parseTemplate} = await import("url-template");
            type PrimitiveValue = string | number | boolean | null;

            const expansionContext: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>> = {};

            resourceStore.getQuads().forEach(quad => {
                expansionContext[encodeURIComponent(quad.predicate.value)] = quad.object.value;
            });

            const resultingUri = parseTemplate(uriTemplate).expand(expansionContext);

            console.log(resultingUri);
            const result = await myEngine.queryVoid(query, {
                sources: [resultingUri],
                baseIRI: resultingUri,
            });
        }

    }
}

main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
