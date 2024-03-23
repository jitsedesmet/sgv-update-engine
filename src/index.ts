import {QueryEngine} from "@comunica/query-sparql-file";
import {InsertDeleteOperation, Parser as SparqlParser} from "sparqljs";
import * as fs from "fs";
import {SGVParser} from "./sgv/SGVParser";
import {RootedCanonicalCollection} from "./sgv/treeStructure/StructuredCollection";
import {InsertOperationHandler} from "./helpers/Operationhandler";

const myEngine = new QueryEngine();

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

    const resultingResource = new InsertOperationHandler().getResultingResourceStore(parsedQuery);

    const sgvParser = await SGVParser.init(pod)
    const parsedSgv = sgvParser.parse();
    // Validate the resource store against the shapes
    const matchedCollections = parsedSgv
        .collections
        .filter(collection => {
        return collection.resourceDescription.resourceMatchesDescription(resultingResource, baseIRI);
    });
    if (matchedCollections.length == 0) {
        console.log("No matching shape found");
    }

    const RootedCanCol = <RootedCanonicalCollection[]> matchedCollections;
    const collection = RootedCanCol.filter(collection => {
        if ((<InsertDeleteOperation> parsedQuery.updates[0]).updateType === "insert") {
            return collection.saveCondition.wantsGivenCompetitors(RootedCanCol);
        } else {
            return collection.updateCondition.shouldRelocate
        }
    })[0];


    console.log(`Resource conforms to shape ${collection.uri.value}`);

    const resultingUri = await collection.groupStrategy.getResourceURI(resultingResource);


    console.log(resultingUri);
    const result = await myEngine.queryVoid(query, {
        sources: [resultingUri],
        baseIRI: resultingUri,
    });
}

main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
