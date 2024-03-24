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
}

export class NonUpdateOperationHandler implements Operationhandler {
    public operation: SgvOperation = "non-update";
    private engine: QueryEngine;

    public constructor(private query: string) {
        this.engine = new QueryEngine();
    }

    public async handleOperation(pod: string): Promise<void> {
        // Read query: just do it
        for await (const binding of await this
            .engine
            .queryBindings(this.query, { sources: [pod] })) {
            console.log(binding.toString());
        }
    }
}

interface ParserInsertType {
    updateType: "insert";
    graph?: GraphOrDefault;
    insert: Quads[];
}

export class InsertResourceOperationHandler implements Operationhandler {
    public operation: SgvOperation = "insert resource";
    private engine: QueryEngine;

    public constructor(private parsedOperation: ParserInsertType, private resource: RDF.NamedNode) {
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
        // Construct the type we would insert:
        const insertWithBaseUri = this.getResultingResourceStore();

        // Parse SGV
        const sgvParser = await SGVParser.init(pod)
        const parsedSgv = sgvParser.parse();
        // Validate the resource store against the shapes
        const matchedCollections = parsedSgv
            .collections
            .filter(collection => {
                return collection
                    .resourceDescription
                    .resourceMatchesDescription(insertWithBaseUri, this.resource);
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

export class OperationAddToResourceHandler implements Operationhandler {
    public operation: SgvOperation = "append to resource";
    private engine: QueryEngine;

    public constructor(private parsedOperation: ParserInsertType) {
        this.engine = new QueryEngine();
    }

    private async getResourceNode(): Promise<RDF.NamedNode> {
        return <RDF.NamedNode> this.parsedOperation.insert[0].triples[0].subject;
    }

    private async getOriginalResource(): Promise<RdfStore> {
        const completeStore = RdfStore.createDefault();

        const resourceToGet = await this.getResourceNode();
        for await (const quad of await this.engine.queryBindings(`
            SELECT ?s ?p ?o
            WHERE {
                ?s ?p ?o
            } 
            `, {
            sources: [ resourceToGet.value ]
        })) {
            completeStore.addQuad(DF.quad(
                <RDF.Quad_Subject> quad.get('s'),
                <RDF.Quad_Predicate> quad.get('p'),
                <RDF.Quad_Object> quad.get('o'),
            ));
        }

        const resourceStore = RdfStore.createDefault();
        for (const quad of completeStore.getQuads()) {
            resourceStore.addQuad(quad);
        }
        let storeSize = resourceStore.size;
        while (storeSize !== resourceStore.size) {
            storeSize = resourceStore.size;
            for (const quad of resourceStore.getQuads()) {
                for (const subjectQuad of completeStore.getQuads(quad.object)) {
                    resourceStore.addQuad(subjectQuad);
                }
            }
        }

        return resourceStore;
    }

    private async getInsertResource(): Promise<RdfStore> {
        const insertionStore = RdfStore.createDefault();
        for (const triple of this.parsedOperation.insert[0].triples) {
            insertionStore.addQuad(DF.quad(
                triple.subject,
                <Quad_Predicate> triple.predicate,
                triple.object,
            ));
        }
        return insertionStore;
    }

    public async handleOperation(pod: string): Promise<void> {
        const focusedResource = await this.getResourceNode();

        // Evaluate what resource would remain when we insert
        const originalResource = await this.getOriginalResource();

        // Parse SGV
        const sgvParser = await SGVParser.init(pod)
        const parsedSgv = sgvParser.parse();

        // Get the Collection the resource is in now.
        const currentCollection = parsedSgv
            .collections
            .filter(collection => {
                return focusedResource.value.startsWith(collection.uri.value);
            })[0];

        // Validate the newResource store against the shapes
        const newResource = RdfStore.createDefault();
        // Copy over original resource
        for (const quad of originalResource.getQuads()) {
            newResource.addQuad(quad);
        }
        // Add new triples
        const insertResource = await this.getInsertResource();
        for (const quad of insertResource.getQuads()) {
            newResource.addQuad(quad);
        }
        const wantsRelocation = currentCollection.updateCondition.wantsRelocation(newResource, focusedResource);

        let newBaseUri = DF.namedNode(
            await currentCollection.groupStrategy.getResourceURI(newResource));
        if (wantsRelocation) {
            // Check what collection we should relocate to
            const matchedCollections = parsedSgv
                .collections
                .filter(collection => {
                    return collection
                        .resourceDescription
                        .resourceMatchesDescription(newResource, focusedResource);
                });
            if (matchedCollections.length == 0) {
                console.log("No matching shape found, cannot update resource!");
            }

            const RootedCanCol = <RootedCanonicalCollection[]> matchedCollections;
            const collectionToInsertIn = RootedCanCol.filter(collection =>
                collection.saveCondition.wantsGivenCompetitors(RootedCanCol)
            )[0];

            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        if (newBaseUri.equals(focusedResource)) {
            console.log("No relocation needed, updating resource in place");
        } else {
            console.log(`Relocating resource to ${newBaseUri.value}`);
            // Remove the old resource:
            await this.engine.queryVoid(`
                DELETE DATA {
                    ${originalResource.getQuads().map(quad => quadToString(quad)).join('\n')}
                }
            `, {
                sources: [focusedResource.value],
            });
        }

        // Insert the new resource
        await this.engine.queryVoid(`
            INSERT DATA {
                ${newResource.getQuads().map(quad => quadToString(DF.quad(
                    quad.subject.equals(focusedResource) ? newBaseUri : quad.subject,
                    quad.predicate,
                    quad.object,
                    quad.graph,
                ))).join('\n')}
            }
        `, {
            sources: [newBaseUri.value],
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
            // check if raw insert: INSERT DATA { ... }
            if (parsedQuery.updates.length === 1) {
                // The resource we want to insert is either already present, or should be inserted.
                // In this DEMO software we assume it is one or the other, and that we the presence of the baseIri is enough to determine this.
                // We also assume that only one resource is updated in a single query.

                const operation = <InsertDeleteOperation> parsedQuery.updates[0];
                if (operation.updateType === 'insert') {
                    if (operation.insert.some(quad => quad.triples.some(triple => triple.subject.equals(DF.namedNode(this.baseIRI))))) {
                        return new InsertResourceOperationHandler(operation, DF.namedNode(this.baseIRI));
                    } else {
                        return new OperationAddToResourceHandler(operation);
                    }
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
