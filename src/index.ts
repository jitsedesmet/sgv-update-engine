import {OperationParser} from "./Operations/OperationParser";


async function main(pod: string, query_file: string): Promise<void> {
    const operation = await (await OperationParser.fromFile(query_file)).parse();
    await operation.handleOperation(pod);
}

// main('http://localhost:3000/pods/00000000000000000096/', './queries/INSERT_whole_post.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/INSERT_append_tag.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/INSERT_illegal_append_id.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELETE_data_tag.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELETE_illegal_remove_id.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELINS_id.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELETE_tags.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/INSERT_where_tag.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELETE_data_complete.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './queries/DELETE_where_complete.sparql').catch(console.error);
