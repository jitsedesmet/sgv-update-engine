import {SGVParser} from '../src/sgv/SGVParser';
import {QueryEngine} from '@comunica/query-sparql-file';
import {addInsertionBench} from './insertion';
import {addDeletionBench} from './removal';


async function main() {
    const {Bench} = await import('tinybench');

    const bench = new Bench({ time: 1_000 * 10, throws: true });

    const engine = new QueryEngine();
    const parsedSgv = (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000096/')).parse();
    const pod = 'http://localhost:3000/pods/00000000000000000096/';

    addInsertionBench(bench, engine, pod, parsedSgv);
    addDeletionBench(bench, engine, pod, parsedSgv);

    await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run();

    console.table(bench.table());
}

main().catch(console.error);
