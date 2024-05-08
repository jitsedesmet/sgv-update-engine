import {Benchmarker, data, Pod, randomId} from './helpers';
import {QueryEngine} from '@comunica/query-sparql-file';
import {OperationParser} from '../src/Operations/OperationParser';

function getQuery(id: string, url: string): string {
    return `
        prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
        prefix xsd: <http://www.w3.org/2001/XMLSchema#>
        DELETE DATA {
            <${url}> ns1:id "${id}"^^xsd:long ; .
        }
    `;
}

export function addDeleteDataIdBench(bench: Benchmarker, engine: QueryEngine, pods: Record<string, Pod>): void {
    for (const [description, pod] of Object.entries(pods)) {
        for (const raw of [false, true]) {
            const id = randomId();
            const url = pod.updatedResource(id.toString());

            let fn: () => Promise<void>;

            if (raw) {
                fn = async () => {
                    await engine.queryVoid(getQuery(id.toString(), url), {
                        sources: [url],
                    });
                };
            } else {
                fn = async () => {
                    try {
                        await (await new OperationParser(engine, getQuery(id.toString(), url))
                            .parse(pod.sgv, url)).handleOperation(pod.host);
                    } catch {
                        return;
                    }
                    throw new Error('Should have thrown an error');
                };
            }

            bench
                .add(`Delete data id ${description}: ${raw ? 'RAW' : 'SGV'}`, fn, {
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
                                INSERT DATA {
                                    <${url}>
                                    <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/hasTag>
                                    <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Austria> .
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
