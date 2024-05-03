import {SGVParser} from '../src/sgv/SGVParser';
import {QueryEngine} from '@comunica/query-sparql-file';
import {addInsertionBench} from './insertion';
import {Pod, PodFragmentation} from './helpers';

async function main() {
    const {Bench} = await import('tinybench');

    const bench = new Bench({ iterations: 100, throws: true });

    const engine = new QueryEngine();
    const parsedSgv = (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000096/')).parse();
    const pods: Record<PodFragmentation, Pod> = {
        [PodFragmentation.BY_CREATION_DATE]: {
            host: 'http://localhost:3000/pods/00000000000000000096/',
            sgv: (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000096/')).parse(),
        },
        [PodFragmentation.ALL_IN_ONE_FILE]: {
            host: 'http://localhost:3000/pods/00000000000000000094/',
            sgv: (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000094/')).parse(),
        },
        [PodFragmentation.OWN_FILE]: {
            host: 'http://localhost:3000/pods/00000000000000000143/',
            sgv: (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000143/')).parse(),
        },
        [PodFragmentation.BY_CREATION_LOCATION]: {
            host: 'http://localhost:3000/pods/00000000000000000150/',
            sgv: (await SGVParser.init(engine, 'http://localhost:3000/pods/00000000000000000150/')).parse(),
        },
    };

    addInsertionBench(bench, engine, pods);
    // addDeletionBench(bench, engine, pod, parsedSgv);

    await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run();

    console.table(bench.table());
}

main().catch(console.error);
