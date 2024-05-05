import {Benchmarker, data, deleteResource, insertResource, Pod, PodFragmentation, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';


/*
Result:
┌─────────┬────────────────────────────────────┬─────────┬───────────────────┬──────────┬─────────┐
│ (index) │ Task Name                          │ ops/sec │ Average Time (ns) │ Margin   │ Samples │
├─────────┼────────────────────────────────────┼─────────┼───────────────────┼──────────┼─────────┤
│ 0       │ 'insert post by creation date'     │ '11'    │ 88736317.1299998  │ '±0.94%' │ 100     │
│ 1       │ 'insert post all in one file'      │ '6'     │ 158565708.6800002 │ '±2.37%' │ 100     │
│ 2       │ 'insert post own file'             │ '10'    │ 93292689.83000046 │ '±3.90%' │ 100     │
│ 3       │ 'insert post by creation location' │ '13'    │ 72605532.2800002  │ '±4.39%' │ 100     │
│ 4       │ 'insert post RAW'                  │ '13'    │ 76710538.45000206 │ '±1.39%' │ 100     │
└─────────┴────────────────────────────────────┴─────────┴───────────────────┴──────────┴─────────┘
 */

export function addInsertionBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    {
        for (const [description, pod] of Object.entries(pods)) {
            let id = randomId();
            bench
                .add(`insert ${description}: SGV`, async () => {
                        await insertResource(engine, id.toString(), pod.host, pod.sgv);
                    }, {
                        beforeEach: async () => {
                            await engine.invalidateHttpCache();
                        },
                        afterEach: async () => {
                            await engine.invalidateHttpCache();
                            await deleteResource(engine, pod.host, pod.updatedResource(id.toString()), pod.sgv);

                            id = randomId();
                        }
                    }
                );
        }
    }

    {
        for (const [description, pod] of Object.entries(pods)) {
            let id = randomId();
            let url = pod.updatedResource(id.toString());
            bench
                .add(`insert ${description}: RAW`, async () => {
                    await engine.queryVoid(`
                    INSERT DATA {
                        ${data(id.toString(), url)}
                    }
                `, {
                        sources: [url],
                    });
                }, {
                    beforeEach: async () => {
                        await engine.invalidateHttpCache();
                    },
                    afterEach: async () => {
                        await engine.invalidateHttpCache();
                        await deleteResource(engine, pod.host, url, pod.sgv);

                        id = randomId();
                        url = pod.updatedResource(id.toString());
                    }
                });
        }
    }
}
