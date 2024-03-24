import {RdfStore} from "rdf-stores";
import * as RDF from "@rdfjs/types";
import {GraphOrDefault, InsertDeleteOperation, Parser, Quads, SparqlParser, Update} from "sparqljs";
import {Quad_Predicate} from "@rdfjs/types";
import {DataFactory} from "rdf-data-factory";
import * as fs from "fs";
import { QueryEngine } from "@comunica/query-sparql-file";
import {SGVParser} from "../sgv/SGVParser";
import {RootedCanonicalCollection} from "../sgv/treeStructure/StructuredCollection";
import {quadToString} from "./Helpers";

const DF = new DataFactory();

type SgvOperation = "non-update" | "insert resource" | "append to resource";

interface Operationhandler {
    operation: SgvOperation;
    handleOperation(pod: string): Promise<void>;
    // getResultingResourceStore(parsedUpdate: Update): RdfStore;
}

export class NonUpdateOperationHandler implements Operationhandler {
    public operation: SgvOperation = "non-update";
    private engine: QueryEngine;
    constructor(private query: string) {
        this.engine = new QueryEngine();
    }
    public async handleOperation(pod: string): Promise<void> {
        // Read query: just do it
        for await (const binding of await this.engine.queryBindings(this.query, { sources: [pod] })) {
            console.log(binding.toString());
        }
    }
}

interface ParserInsertType {
    updateType: "insert";
    graph?: GraphOrDefault;
    insert: Quads[];
}

export class InsertOperationHandler implements Operationhandler {
    public operation: SgvOperation = "insert resource";
    private engine: QueryEngine;

    constructor(private parsedOperation: ParserInsertType, private resource: RDF.NamedNode) {
        this.engine = new QueryEngine();
    }
    private getResultingResourceStore(): RdfStore {
        const resourceStore = RdfStore.createDefault();

        const triples = this.parsedOperation.insert[0].triples;
        for (const triple of triples) {
            resourceStore.addQuad(DF.quad(
                triple.subject,
                <Quad_Predicate> triple.predicate,
                triple.object,
            ));
        }

        return resourceStore;
    }

    public async handleOperation(pod: string): Promise<void> {
        // Raw insert operation

        // Construct the type we would insert:
        const insertWithBaseUri = this.getResultingResourceStore();

        // Parse SGV
        const sgvParser = await SGVParser.init(pod)
        const parsedSgv = sgvParser.parse();
        // Validate the resource store against the shapes
        const matchedCollections = parsedSgv
            .collections
            .filter(collection => {
                return collection.resourceDescription.resourceMatchesDescription(insertWithBaseUri, this.resource.value);
            });
        if (matchedCollections.length == 0) {
            console.log("No matching shape found, cannot automatically insert resource");
        }

        const RootedCanCol = <RootedCanonicalCollection[]> matchedCollections;
        const collectionToInsertIn = RootedCanCol.filter(collection =>
                collection.saveCondition.wantsGivenCompetitors(RootedCanCol)
        )[0];


        console.log(`Resource conforms to shape ${collectionToInsertIn.uri.value}`);

        const resultingUri = await collectionToInsertIn.groupStrategy.getResourceURI(insertWithBaseUri);
        console.log(resultingUri);

        // Map the resulting resource to the correct URI
        const resultingResource = RdfStore.createDefault();
        for (const quad of insertWithBaseUri.getQuads()) {
            resultingResource.addQuad(DF.quad(
                quad.subject.equals(this.resource) ? DF.namedNode(resultingUri) : quad.subject,
                quad.predicate,
                quad.object,
                quad.graph,
            ));
        }

        const finalInsertQuery =  `
            INSERT DATA {
                ${resultingResource.getQuads()
            .map(quad => quadToString(quad))
            .join(`\n`)}
            }
        `;


        await this.engine.queryVoid(finalInsertQuery, {
            sources: [resultingUri],
            baseIRI: resultingUri,
        });
    }
}

export class OperationParser {
    public baseIRI: string;
    public sparqlParser: SparqlParser;
    constructor(private query_file: string) {
        // Use a uuid_v4 as baseIRI
        this.baseIRI = "file:///8ea79435-ffe1-4357-9010-0970114970ad";
        this.sparqlParser = new Parser({
            baseIRI: this.baseIRI,
        });
    }

    public async parse(): Promise<Operationhandler> {
        const query = await fs.promises.readFile(this.query_file, 'utf8');
        const parsedQuery = this.sparqlParser.parse(query);

        if (parsedQuery.type  === 'update') {
            // check if raw insert
            if (parsedQuery.updates.length === 1) {
                const operation = <InsertDeleteOperation> parsedQuery.updates[0];
                if (operation.updateType === 'insert') {
                    return new InsertOperationHandler(operation, DF.namedNode(this.baseIRI));
                }
            }
            // We have an update to handle
            console.log(parsedQuery);
        } else {
            return new NonUpdateOperationHandler(query);
        }
        throw new Error("No operation found");
    }
}
