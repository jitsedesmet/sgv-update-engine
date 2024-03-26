import {OperationParser} from "./Operations/OperationParser";


async function main(pod: string, query_file: string): Promise<void> {
    const operation = await new OperationParser(query_file).parse();
    await operation.handleOperation(pod);
}

// main('http://localhost:3000/pods/00000000000000000096/', './INSERT_whole_post.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './INSERT_append_tag.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './INSERT_illegal_append_id.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './DELETE_data_tag.sparql').catch(console.error);
// main('http://localhost:3000/pods/00000000000000000096/', './DELETE_illegal_remove_id.sparql').catch(console.error);
main('http://localhost:3000/pods/00000000000000000096/', './DELINS_id.sparql').catch(console.error);
