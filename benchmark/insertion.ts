import {benchmarker, data, deleteResource, insertResource, Pod, PodFragmentation, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';

export function addInsertionBench(bench: benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    {
        // get random long id
        let id = randomId();

        for (const [description, pod] of Object.entries(pods)) {
            bench
                .add(`insert post ${description}`, async () => {
                        await insertResource(engine, id.toString(), pod.host, pod.sgv);
                    }, {
                        afterEach: async () => {
                            await deleteResource(engine, id.toString(), pod.host, pod.sgv);

                            id = randomId();
                        }
                    }
                );
        }
    }

    {
        const pod = pods[PodFragmentation.BY_CREATION_DATE];
        // get random long id
        let id = randomId();
        let url = `${pod.host}posts/2024-05-08#${id}`;
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
                    await deleteResource(engine, id.toString(), pod.host, pod.sgv);
                    id = randomId();
                    url = `${pod.host}posts/2024-05-08#${id}`;
                }
            });
    }
}
