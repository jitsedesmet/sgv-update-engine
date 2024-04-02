import {OperationParser} from '../src/Operations/OperationParser';
import {SGVParser} from '../src/sgv/SGVParser';
import {ParsedSGV} from '../src/sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';


async function insertResource(engine: QueryEngine, id: string, pod: string, parsedSgv: ParsedSGV) {
    const prefixes = `
                prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                prefix xsd: <http://www.w3.org/2001/XMLSchema#>
            `;
    const data = `
                <> a ns1:Post ;
                    ns1:browserUsed "Chrome" ;
                    ns1:content "I want to eat an apple while scavenging for mushrooms in the forest. The sun will be such a blessing." ;
                    ns1:creationDate "2024-05-08T23:23:56.830000+00:00"^^xsd:dateTime ;
                    ns1:id "${id}"^^xsd:long ;
                    ns1:hasCreator <http://localhost:3000/pods/00000000000000000096/profile/card#me> ;
                    ns1:hasTag <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Alanis_Morissette>,
                        <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Austria> ;
                    ns1:isLocatedIn <http://localhost:3000/dbpedia.org/resource/China> ;
                    ns1:locationIP "1.83.28.23" .
            `;

    await (await new OperationParser(engine, `
                ${prefixes}
                INSERT DATA {
                    ${data}
                }
            `).parse(parsedSgv)).handleOperation(pod);
}

async function deleteResource(engine: QueryEngine, id: string, pod: string, parsedSgv: ParsedSGV) {
    const resource = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
    await (await new OperationParser(engine, `
        DELETE WHERE { <${resource}> ?p ?o . }
    `).parse(parsedSgv, resource)).handleOperation(pod);
}

async function main() {
    const {Bench} = await import('tinybench');

    const bench = new Bench({ /*time: 1_000 * 10,*/ throws: true, warmupIterations: 0, iterations: 0});

    const parsedSgv = (await SGVParser.init('http://localhost:3000/pods/00000000000000000096/')).parse();
    const pod = 'http://localhost:3000/pods/00000000000000000096/';
    const engine = new QueryEngine();

    (() => {
        // get random long id
        let id = Math.floor(Math.random() * 1000000000000000);
        bench
            .add('insert task sorted by creation date providing SGV', async () => {
                // const id = Math.floor(Math.random() * 1000000000000000);
                console.log(id);
                await insertResource(engine, id.toString(), pod, parsedSgv);
            }, {
                afterEach: async () => {
                    const curId = id;
                    await engine.queryVoid(`
                        DELETE WHERE { <http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${curId}> ?p ?o . }
                    `, {
                        sources: ['http://localhost:3000/pods/00000000000000000096/posts/2024-05-08']
                    });
                    // await deleteResource(engine, curId.toString(), pod, parsedSgv);

                    id = Math.floor(Math.random() * 1000000000000000);
                }
            });
    });

    const id = Math.floor(Math.random() * 1000000000000000);
    console.log(id);
    await insertResource(engine, id.toString(), pod, parsedSgv);
    await engine.queryVoid(`
        DELETE WHERE { <http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}> ?p ?o . }
    `, {
        sources: ['http://localhost:3000/pods/00000000000000000096/posts/2024-05-08']
    });


    // (() => {
    //     // get random long id
    //     let id = Math.floor(Math.random() * 1000000000000000);
    //     let url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
    //     bench
    //         .add('insert task RAW', async () => {
    //             await engine.queryVoid(`
    //             prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
    //             prefix xsd: <http://www.w3.org/2001/XMLSchema#>
    //             INSERT DATA {
    //                 <${url}> a ns1:Post ;
    //                     ns1:browserUsed "Chrome" ;
    //                     ns1:content "I want to eat an apple while scavenging for mushrooms in the forest. The sun will be such a blessing." ;
    //                     ns1:creationDate "2024-05-08T23:23:56.830000+00:00"^^xsd:dateTime ;
    //                     ns1:id "${id}"^^xsd:long ;
    //                     ns1:hasCreator <http://localhost:3000/pods/00000000000000000096/profile/card#me> ;
    //                     ns1:hasTag <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Alanis_Morissette>,
    //                         <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Austria> ;
    //                     ns1:isLocatedIn <http://localhost:3000/dbpedia.org/resource/China> ;
    //                     ns1:locationIP "1.83.28.23" .
    //             }
    //             `, {
    //                 sources: [url],
    //             })
    //         }, {
    //             beforeEach: async () => {
    //                 await new Promise(resolve => setTimeout(resolve, 100));
    //                 id = Math.floor(Math.random() * 1000000000000000);
    //                 url = `http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#${id}`;
    //             },
    //             afterEach: async () => {
    //                 await deleteResource(engine, id.toString(), pod, parsedSgv);
    //             }
    //         });
    // })();

    // await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run();

    console.table(bench.table());
}

main().catch(console.error);
