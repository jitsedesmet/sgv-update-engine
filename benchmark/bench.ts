import {OperationParser} from "../src/Operations/OperationParser";
import {SGVParser} from "../src/sgv/SGVParser";

async function main() {
    const { Bench } = await import('tinybench');

    const bench = new Bench({ time: 1_000 * 10 });

    const parsedSgv = (await SGVParser.init('http://localhost:3000/pods/00000000000000000096/')).parse();

    bench
        .add('insert task sorted by creation date', async() => {
            // get random long id
            const id = Math.floor(Math.random() * 1000000000000000);
            const parsedOperation = await new OperationParser(`
                prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                prefix xsd: <http://www.w3.org/2001/XMLSchema#>
                
                INSERT DATA {
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
                }
            `).parse();
            await parsedOperation.handleOperation('http://localhost:3000/pods/00000000000000000096/');
        })
        .add('insert task sorted by creation date providing SGV', async () => {
            // get random long id
            const id = Math.floor(Math.random() * 1000000000000000);
            const parsedOperation = await new OperationParser(`
                prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
                prefix xsd: <http://www.w3.org/2001/XMLSchema#>
                
                INSERT DATA {
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
                }
            `).parse(parsedSgv);
            await parsedOperation.handleOperation('http://localhost:3000/pods/00000000000000000096/');
        })
        // .todo('unimplemented bench')

    await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run();

    console.table(bench.table());
}

main().catch(console.error);
