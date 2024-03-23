import {QueryEngine} from "@comunica/query-sparql-file";
import {Quad_Predicate} from "@rdfjs/types";
import {DataFactory} from "rdf-data-factory";
import {InsertDeleteOperation, Parser as SparqlParser} from "sparqljs";

import {RdfStore} from "rdf-stores";
import * as fs from "fs";
import {SGVParser} from "./sgv/SGVParser";
import {RootedCanonicalCollection} from "./sgv/treeStructure/StructuredCollection";

const DF = new DataFactory();
const myEngine = new QueryEngine();

function chooseCollection(collections: RootedCanonicalCollection[]): RootedCanonicalCollection {
    return collections[0];
}

async function main(pod: string, query_file: string): Promise<void> {
    // Copy the resource data to a store
    // Use a uuid_v4 as baseIRI
    const baseIRI = "file:///8ea79435-ffe1-4357-9010-0970114970ad";
    const sparqlParser = new SparqlParser({
        baseIRI
    });
    const query = fs.readFileSync(query_file, 'utf8');
    const parsedQuery = sparqlParser.parse(query);
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

    const sgvParser = await SGVParser.init(pod)
    const parsedSgv = sgvParser.parse();

    // Validate the resource store against the shapes
    const matchedCollections = parsedSgv
        .collections
        .filter(collection => {
        return collection.resourceDescription.resourceMatchesDescription(resourceStore, baseIRI);
    });

    if (matchedCollections.length == 0) {
        console.log("No matching shape found");
    }
    const collection = chooseCollection(
        <RootedCanonicalCollection[]> matchedCollections
            .filter(x => x.type === 'Canonical Collection')
    );

    console.log(`Resource conforms to shape ${collection.uri.value}`);

    const resultingUri = await collection.groupStrategy.getResourceURI(resourceStore);


    console.log(resultingUri);
    const result = await myEngine.queryVoid(query, {
        sources: [resultingUri],
        baseIRI: resultingUri,
    });
}

main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
