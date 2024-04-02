import {benchmarker, deleteResource, data, insertResource, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {ParsedSGV} from '../src/sgv/treeStructure/ParsedSGV';

export function addInsertionBench(bench: benchmarker, engine: QueryEngine, pod: string, parsedSgv: ParsedSGV) {
    (() => {
        // get random long id
        let id = randomId();
        bench
            .add('insert post sorted by creation date', async () => {
                await insertResource(engine, id.toString(), pod, parsedSgv);
            }, {
                afterEach: async () => {
                    await deleteResource(engine, id.toString(), pod, parsedSgv);

                    id = randomId();
                }
            });
    })();

    (() => {
        // get random long id
        let id = randomId();
        let url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
        bench
            .add('insert post RAW', async () => {
                await engine.invalidateHttpCache();
                await engine.queryVoid(`
                    INSERT DATA {
                        ${data(id.toString(), url)}
                    }
                `, {
                    sources: [url],
                });
            }, {
                afterEach: async () => {
                    await deleteResource(engine, id.toString(), pod, parsedSgv);
                    id = randomId();
                    url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
                }
            });
    })();
}
