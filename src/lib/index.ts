import {OperationParser} from './Operations/OperationParser';
import {SGVParser} from './sgv/SGVParser';
import {QueryEngine} from '@comunica/query-sparql-file';
import type {ParsedSGV} from './sgv/treeStructure/ParsedSGV';
// import fs from 'fs';


export class SgvEngine {
  private constructor(private queryEngine: QueryEngine, public pod: string, private parsedSgv: ParsedSGV) {
  }
  public static async init(queryEngine: QueryEngine, pod: string): Promise<SgvEngine> {
    const parsedSgv = (await SGVParser.init(queryEngine, pod)).parse();
    return new SgvEngine(queryEngine, pod, parsedSgv);
  }
  public async performOperation(query: string, dryRun: boolean): Promise<string[]> {
    const parsedOperation = await new OperationParser(this.queryEngine, query)
      .parse(this.parsedSgv);
    return await parsedOperation.handleOperation(this.pod, dryRun);
  }
}

// async function main(focusPod: string, queryFile: string) {
//   const engine = new QueryEngine();
//   const sgvEngine = await SgvEngine.init(engine, focusPod);
//   const query = await fs.promises.readFile(queryFile, 'utf8');
//   await sgvEngine.performOperation(query);
// }

// const printError = (e: Error) => console.error(e);
// const focusPod = '${podBaseUrl}pods/00000000000000000096/';

// main(focusPod, './queries/INSERT_whole_post.sparql').catch(printError);
// main(focusPod, './queries/DELINS_id.sparql').catch(printError);

// main(focusPod, './queries/INSERT_append_tag.sparql').catch(printError);
// main(focusPod, './queries/INSERT_illegal_append_id.sparql').catch(printError);
// main(focusPod, './queries/DELETE_data_tag.sparql').catch(printError);
// main(focusPod, './queries/DELETE_illegal_remove_id.sparql').catch(printError);

// main(focusPod, './queries/DELETE_tags.sparql').catch(printError);
// main(focusPod, './queries/INSERT_append_tag.sparql').catch(printError);
// main(focusPod, './queries/INSERT_where_tag.sparql').catch(printError);
// main(focusPod, './queries/DELETE_where_complete.sparql').catch(printError);
// main(focusPod, './queries/DELETE_data_complete.sparql').catch(printError);
