import {QueryEngine} from "@comunica/query-sparql-file";
import {InsertDeleteOperation, Parser as SparqlParser, SparqlQuery} from "sparqljs";
import * as fs from "fs";
import {SGVParser} from "./sgv/SGVParser";
import {RootedCanonicalCollection} from "./sgv/treeStructure/StructuredCollection";
import {OperationParser} from "./Operations/BaseOperationhandler";

const myEngine = new QueryEngine();

async function main(pod: string, query_file: string): Promise<void> {
    const operation = await new OperationParser(query_file).parse();
    await operation.handleOperation(pod);
}

// main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './INSERT_append_tag.sparql').catch(console.error);
main('http://localhost:3000/pods/00000000000000000096/', './INSERT_where_tag.sparql').catch(console.error);
