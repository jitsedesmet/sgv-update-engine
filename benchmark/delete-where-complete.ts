import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

function getQuery(url: string): string {
    return `
        DELETE WHERE {
            <${url}> ?p ?o
        }
    `;
}

export function addDeleteWhereCompleteBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            let id = randomId();
            let url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    await engine.queryVoid(getQuery(url), {
                        sources: [url],
                    });
                };
            } else {
                fn = async () => {
                    await (await new OperationParser(engine, getQuery(url))
                        .parse(pod.sgv, url)).handleOperation(pod.host);
                };
            }

            bench
                .add(`delete where complete ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
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
