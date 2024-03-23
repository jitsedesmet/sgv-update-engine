import {QueryEngine} from "@comunica/query-sparql-file";
import type * as RDF from '@rdfjs/types';
import {Quad_Object, Quad_Predicate, Quad_Subject} from "@rdfjs/types";
import {DataFactory} from "rdf-data-factory";
import SHACLValidator from 'rdf-validate-shacl'
import {InsertDeleteOperation, Parser, UpdateOperation} from "sparqljs";

import {RdfStore} from "rdf-stores";
import * as fs from "fs";
import {SGVParser} from "./sgv/SGVParser";
import {getOne} from "./helpers/Helpers";
import {rdfTypePredicate, shaclNodeShape} from "./sgv/consts";
import {CanonicalCollection, RootedCanonicalCollection} from "./sgv/treeStructure/StructuredCollection";
import {GroupStrategyURITemplate} from "./sgv/treeStructure/GroupStrategy";

const DF = new DataFactory();
const myEngine = new QueryEngine();

function chooseCollection(collections: RootedCanonicalCollection[]): RootedCanonicalCollection {
    return collections[0];
}

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
    // Use a uuid_v4 as baseIRI
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

    const parsedSgv = new SGVParser().parseSGV(sgvStore)

    // Validate the resource store against the shapes
    const matchedCollections = parsedSgv.collections.filter(collection => {
        let allMatch = true;
        for (const description of collection.resourceDescription.descriptions) {
            // Add the focus node to the description, removing it again when we are done.
            const nodeShape = getOne(sgvStore, undefined, rdfTypePredicate, shaclNodeShape).object;

            const focusNodeLink = DF.quad(
                <Quad_Subject> nodeShape,
                rdfTypePredicate,
                DF.namedNode(baseIRI)
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
    });

    if (matchedCollections.length == 0) {
        console.log("No matching shape found");
    }
    const collection = chooseCollection(
        <RootedCanonicalCollection[]> matchedCollections
            .filter(x => x.type === 'Canonical Collection')
    );

    console.log(`Resource conforms to shape ${collection.uri.value}`);

    const uriTemplate = (<GroupStrategyURITemplate> collection.groupStrategy).template;
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

main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
