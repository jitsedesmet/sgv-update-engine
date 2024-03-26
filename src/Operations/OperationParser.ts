import {InsertDeleteOperation, Parser, SparqlParser} from "sparqljs";
import fs from "fs";
import {BaseOperationhandler, NonUpdateOperationHandler} from "./BaseOperationhandler";
import {InsertResourceOperationHandler} from "./InsertResourceHandler";
import {OperationAddToResourceHandler} from "./InsertAppendHandler";
import {DataFactory} from "rdf-data-factory";
import {OperationRemoveHandler} from "./OperationRemoveHandler";
import {DeleteInsertOperationHandler} from "./DeleteInsertOperationHandler";

const DF = new DataFactory();

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

    public async parse(): Promise<BaseOperationhandler> {
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
                if (operation.updateType === 'delete') {
                    return new OperationRemoveHandler(operation);
                }
                if (operation.updateType === 'insertdelete') {
                    return new DeleteInsertOperationHandler(operation, parsedQuery, DF.namedNode("http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#416608218494388"));
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
