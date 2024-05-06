import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

export function addDeletionBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            let id = randomId();
            let url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    const query = `
                            DELETE DATA {
                                ${data(id.toString(), url)}
                            }
                        `;

                    await engine.queryVoid(query, {
                        sources: [url],
                    });
                };
            } else {
                fn = async () => {
                    const query = `
                        DELETE DATA {
                            ${data(id.toString(), url)}
                        }
                    `;
                    await (await new OperationParser(engine, query).parse(pod.sgv, url)).handleOperation(pod.host);
                };
            }

            bench
                .add(`delete data ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
                        beforeEach: async () => {
                            id = randomId();
                            url = pod.updatedResource(id.toString());
                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                    INSERT DATA {
                        ${data(id.toString(), url)}
                    }
                    `, {
                                sources: [url],
                            });

                            await engine.invalidateHttpCache();
                        },
                    }
                );
        }
    }
}
