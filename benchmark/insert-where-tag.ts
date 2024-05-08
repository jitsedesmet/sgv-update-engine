import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

function getQuery(url: string): string {
    return `
        prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
        INSERT {
            <${url}> ?p tag:Cheese
        } where {
            <${url}> ?p tag:Austria
        }
    `;
}

export function addInsertWhereTagBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>): void {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            const id = randomId();
            const url = pod.updatedResource(id.toString());

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
                .add(`insert where tag ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
                        beforeAll: async () => {
                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                            INSERT DATA {
                                ${data(id.toString(), url)}
                            }
                            `, {
                                sources: [url],
                            });
                        },
                        afterAll: async () => {
                            await engine.invalidateHttpCache();
                            const query = `
                            DELETE DATA {
                                ${data(id.toString(), url)}
                            }
                            `;

                            await engine.queryVoid(query, {
                                sources: [url],
                            });
                        },
                        beforeEach: async () => {
                            await engine.invalidateHttpCache();
                        },
                        afterEach: async () => {
                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                                DELETE DATA {
                                    <${url}>
                                    <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/hasTag>
                                    <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Cheese> .
                                }
                            `, {
                                sources: [url],
                            });
                        }
                    }
                );
        }
    }
}
