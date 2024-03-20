import {QueryEngine} from "@comunica/query-sparql-file";
import type * as RDF from '@rdfjs/types';
import {DataFactory} from "rdf-data-factory";
import SHACLValidator from 'rdf-validate-shacl'

import {RdfStore} from "rdf-stores";
import {IDataSourceExpanded, IDataSourceSerialized} from "@comunica/types/lib/IDataSource";
import * as fs from "fs";
import {Quad_Object, Quad_Predicate, Quad_Subject} from "@rdfjs/types";

type IDataSource = string | RDF.Source | IDataSourceExpanded | IDataSourceSerialized;
type SourceList = [IDataSource, ...IDataSource[]];

interface QueryConfig {
    /**
     * The root URL of the pods to query.
     */
    pods: SourceList;
}

const DF = new DataFactory();
const myEngine = new QueryEngine();

async function queryToDataset(query: string,
                              bindingsCallBack: (bindings: RDF.Bindings) => void,
                               config: QueryConfig): Promise<void> {
    const result = await myEngine.queryBindings(query, {sources: config.pods});
    result.on('data', bindingsCallBack)
    await new Promise((resolve, reject) => {
        result.on('end', resolve)
        result.on('error', reject)
    });
}

// async function loadDataset(filePath) {
//     const parser = new ParserN3({factory})
//     return factory.dataset().import(parser.import(stream))
// }

async function matchShape(): Promise<void> {
    // Copy the SGV data to a store
    const sgvStore = RdfStore.createDefault();
    await queryToDataset(`
        select * where { ?s ?p ?o }
    `, (bindings) => sgvStore.addQuad(
        DF.quad(
            <Quad_Subject> bindings.get('s')!,
            <Quad_Predicate> bindings.get('p')!,
            <Quad_Object> bindings.get('o')!
        )
    ),{pods: ['http://localhost:3000/pods/00000000000000000096/sgv']});

    // Copy the resource data to a store
    const resourceStore = RdfStore.createDefault();
    await queryToDataset(`
        select * where { ?s ?p ?o }
    `, (bindings) => resourceStore.addQuad(
        DF.quad(
            <Quad_Subject> bindings.get('s')!,
            <Quad_Predicate> bindings.get('p')!,
            <Quad_Object> bindings.get('o')!
        )
    ), {pods: ['./resource-to-insert.ttl']});

    const focusName = "file:///home/jitsedesmet/Documents/school/2023-2024/thesis/sgv-comunica/resource-to-insert.ttl";

    // Get all shape URIs described by SGV.
    const shapes: [RDF.NamedNode, RDF.NamedNode][] = [];
    await queryToDataset(`
        prefix sgv: <https://thesis.jitsedesmet.be/solution/storage-guidance-vocabulary/#>
        select * where {
            ?container sgv:resource-description [
                a sgv:shacl-descriptor ;
                sgv:shacl-shape ?shape ;
            ] .
        }
    `, (bindings) => shapes.push(
        [<RDF.NamedNode> bindings.get('container'), <RDF.NamedNode> bindings.get('shape')]),
        {pods: [sgvStore]});

    /// Extract the shapes in their own store and set focus node in the shape stores
    const mappedShapes: [RDF.NamedNode, RdfStore][] = shapes.map(([container, shape]) => {
        const focusStore = RdfStore.createDefault();
        let storeSize = 0;
        for (const quad of sgvStore.getQuads(shape)) {
            focusStore.addQuad(quad);
        }
        while (storeSize !== focusStore.size) {
            storeSize = focusStore.size;
            for (const quad of focusStore.getQuads()) {
                for (const subjectQuad of sgvStore.getQuads(quad.object)) {
                    focusStore.addQuad(subjectQuad);
                }
            }
        }
        focusStore.addQuad(DF.quad(
            shape,
            DF.namedNode('http://www.w3.org/ns/shacl#targetNode'),
            DF.namedNode(focusName),
        ));
        return [container, focusStore];
    });


    const validator = new SHACLValidator(mappedShapes[0][1].asDataset());
    const report = validator.validate(resourceStore.asDataset());
    console.log(report.conforms)

    for (const result of report.results) {
        // See https://www.w3.org/TR/shacl/#results-validation-result for details
        // about each property
        console.log(result.message)
    }

    // myEngine.queryQuads()

}

// async function readSGV({pods}: QueryConfig): Promise<RDF.DatasetCore> {
//
//     const store: RDF.DatasetCore = RdfStore.createDefault().asDataset();
//
//     const result = await myEngine.queryBindings(`
//         select * where {
//             ?s ?p ?o
//         }
//     `, {
//         sources: [pods[0].concat('sgv'), ...pods.splice(1).map(pod => pod.concat('sgv'))],
//     });
//     result.on('data', (quad: RDF.Bindings) => {
//         store.add(DF.quad(
//             DF.namedNode(quad.get('s').value),
//             DF.namedNode(quad.get('p').value),
//             DF.namedNode(quad.get('o').value)
//         ));
//     });
//     await new Promise((resolve, reject) => {
//         result.on('end', resolve);
//         result.on('error', reject);
//     });
//     return store;
//
//
//     // const res = await myEngine.queryVoid(`
//     //         prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
//     //         prefix xsd: <http://www.w3.org/2001/XMLSchema#>
//     //
//     //     INSERT DATA {
//     //         <> a ns1:Post ;
//     //             ns1:browserUsed "Chrome" ;
//     //             ns1:content "I want to eat an apple while scavenging for mushrooms in the forest. The sun will be such a blessing." ;
//     //             ns1:creationDate "2012-05-08T23:23:56.830000+00:00"^^xsd:dateTime ;
//     //             ns1:hasCreator <http://localhost:3000/pods/00000000000000000096/profile/card#me> ;
//     //             ns1:hasTag <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Alanis_Morissette>,
//     //                 <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Austria> ;
//     //             ns1:id "416608218494388"^^xsd:long ;
//     //             ns1:isLocatedIn <http://localhost:3000/dbpedia.org/resource/China> ;
//     //             ns1:locationIP "1.83.28.23" .
//     //     }`, {
//     //     sources: pods,
//     // });
// }

async function main(config: QueryConfig): Promise<void> {
    // const store = await readSGV(config);
    // console.log(store.getQuads());
    await matchShape()
}

main({
    pods: ['http://localhost:3000/pods/00000000000000000096/'],
}).catch(console.error);
