import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

export function addInsertDataCompleteBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            let id = randomId();
            let url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    await engine.queryVoid(`
                    INSERT DATA {
                        ${data(id.toString(), url)}
                    }
                `, {
                        sources: [url],
                    });
                };
            } else {
                fn = async () => {
                    const query = `
                        INSERT DATA {
                            ${data(id.toString())}
                        }
                    `;
                    await (await new OperationParser(engine, query).parse(pod.sgv)).handleOperation(pod.host);
                };
            }

            bench
                .add(`insert data complete ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
                        beforeEach: async () => {
                            await engine.invalidateHttpCache();
                        },
                        afterEach: async () => {
                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                            DELETE WHERE {
                                <${url}> ?p ?o
                            }
                        `, {
                                sources: [pod.updatedResource(id.toString())],
                            });

                            id = randomId();
                            url = pod.updatedResource(id.toString());
                        }
                    }
                );
        }
    }
}
