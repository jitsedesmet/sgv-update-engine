import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

export function addInertWhereTagBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>) {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            let id = randomId();
            let url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    const query = `
                        prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                        prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
                        INSERT {
                            ?id ns1:hasTag tag:Cheese
                        } where {
                            ?id ns1:hasTag tag:Austria
                        }
                    `;
                    await (await new OperationParser(engine, query).parse(pod.sgv, url)).handleOperation(pod.host);
                };
            } else {
                fn = async () => {
                    const query = `
                        prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                        prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
                        INSERT {
                            ?id ns1:hasTag tag:Cheese
                        } where {
                            ?id ns1:hasTag tag:Austria
                        }
                    `;
                    await engine.queryVoid(query, {
                        sources: [url],
                    });
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
