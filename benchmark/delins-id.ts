import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

function getQuery(id: number, url: string): string {
    return `
        prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
        prefix xsd: <http://www.w3.org/2001/XMLSchema#>
        DELETE {
            ?id ns1:id "${id.toString()}"^^xsd:long .
        } INSERT {
            ?id ns1:id "${(id + 1).toString()}"^^xsd:long .
        } where {
            BIND(<${url}> as ?id)
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
                    await (await new OperationParser(engine, getQuery(id, url))
                        .parse(pod.sgv, url)).handleOperation(pod.host);
                };
            } else {
                fn = async () => {
                    await engine.queryVoid(getQuery(id, url), {
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
                                prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                                prefix xsd: <http://www.w3.org/2001/XMLSchema#>
                                DELETE {
                                    <${url}> ns1:id "${(id + 1).toString()}"^^xsd:long .
                                } INSERT {
                                    <${url}> ns1:id "${(id).toString()}"^^xsd:long .
                                }
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
