import {benchmarker, deleteResource, data, insertResource, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {ParsedSGV} from '../src/sgv/treeStructure/ParsedSGV';

export function addDeletionBench(bench: benchmarker, engine: QueryEngine, pod: string, parsedSgv: ParsedSGV) {
    (() => {
        let id = randomId();
        bench
            .add('delete post sorted by creation date', async () => {
                await deleteResource(engine, id.toString(), pod, parsedSgv);

            }, {
                beforeEach: async () => {
                    id = randomId();
                    await insertResource(engine, id.toString(), pod, parsedSgv);
                }
            });
    })();

    (() => {
        let id = randomId();
        let url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
        bench
            .add('delete post where RAW', async () => {
                await engine.invalidateHttpCache();
                await engine.queryVoid(`
                    DELETE WHERE {
                        <${url}> ?p ?o .
                    }
                `, {
                    sources: [url],
                });
            }, {
                beforeEach: async () => {
                    id = randomId();
                    url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
                    await insertResource(engine, id.toString(), pod, parsedSgv);
                }
            });
    })();
}
