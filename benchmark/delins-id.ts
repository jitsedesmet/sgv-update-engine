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

export function addDeleteInsertIdBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>): void {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            const id = randomId();
            const url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    await engine.queryVoid(getQuery(id, url), {
                        sources: [url],
                    });
                };
            } else {
                fn = async () => {
                    await (await new OperationParser(engine, getQuery(id, url))
                        .parse(pod.sgv, url)).handleOperation(pod.host);
                };
            }

            bench
                .add(`delete insert id ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
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
                        afterEach: async () => {
                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                                DELETE WHERE {
                                    <${pod.updatedResource((id +1).toString())}> ?p ?o .
                                };
                                DELETE WHERE {
                                    <${url}> ?p ?o .
                                };
                            `, {
                                sources: [url],
                            });

                            await engine.invalidateHttpCache();

                            await engine.invalidateHttpCache();

                            await engine.queryVoid(`
                            INSERT DATA {
                                ${data(id.toString(), url)}
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
