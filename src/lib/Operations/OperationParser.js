"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationParser = void 0;
const sparqljs_1 = require("sparqljs");
const fs_1 = __importDefault(require("fs"));
const BaseOperationHandler_1 = require("./BaseOperationHandler.js");
const InsertResourceHandler_1 = require("./InsertResourceHandler.js");
const InsertAppendHandler_1 = require("./InsertAppendHandler.js");
const rdf_data_factory_1 = require("rdf-data-factory");
const OperationRemoveHandler_1 = require("./OperationRemoveHandler.js");
const DeleteInsertOperationHandler_1 = require("./DeleteInsertOperationHandler.js");
const Helpers_1 = require("../helpers/Helpers.js");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * Parses a query amd can use a given engine to prepare the operation.
 */
class OperationParser {
    engine;
    query;
    baseIRI;
    sparqlParser;
    constructor(engine, query) {
        this.engine = engine;
        this.query = query;
        // Use a uuid_v4 as baseIRI
        const id = Math.floor(Math.random() * 1000000000000000);
        this.baseIRI = `file:///${id}-8ea79435-ffe1-4357-9010-0970114970ad`;
        this.sparqlParser = new sparqljs_1.Parser({
            baseIRI: this.baseIRI,
        });
    }
    static async fromFile(engine, query_file) {
        const query = await fs_1.default.promises.readFile(query_file, 'utf8');
        return new OperationParser(engine, query);
    }
    /**
     * Actually parse the query, in the context of some parsed SGV.
     * Returns a query plan (kinda)
     */
    async parse(parsedSgv) {
        const parsedQuery = this.sparqlParser.parse(this.query);
        if (parsedQuery.type === 'update') {
            // check if raw insert: INSERT DATA { ... }
            if (parsedQuery.updates.length === 1) {
                // The resource we want to insert is either already present, or should be inserted.
                // In this DEMO software we assume it is one or the other, and that we the presence of the baseIri is enough to determine this.
                // We also assume that only one resource is updated in a single query.
                const operation = parsedQuery.updates[0];
                if (operation.updateType === 'insert') {
                    if (operation.insert.some(quad => quad.triples.some(triple => triple.subject.equals(DF.namedNode(this.baseIRI))))) {
                        return new InsertResourceHandler_1.InsertResourceOperationHandler(this.engine, operation, DF.namedNode(this.baseIRI), parsedSgv);
                    }
                    else {
                        return new InsertAppendHandler_1.OperationAddToResourceHandler(this.engine, operation, parsedSgv);
                    }
                }
                if (operation.updateType === 'delete') {
                    return new OperationRemoveHandler_1.OperationRemoveHandler(this.engine, operation, parsedSgv);
                }
                if (operation.updateType === 'insertdelete') {
                    return new DeleteInsertOperationHandler_1.DeleteInsertOperationHandler(this.engine, operation, parsedQuery, parsedSgv);
                }
                if (operation.updateType === 'deletewhere') {
                    // We rewrite to a delete ... where ... query (insertdelete)
                    const rawQuery = (0, Helpers_1.getQueryWithoutPrefixes)(parsedQuery);
                    const rewrittenQuery = rawQuery.replaceAll(/^DELETE WHERE \{(.*)\}$/gu, 'DELETE { $1 } WHERE { $1 }');
                    return await new OperationParser(this.engine, rewrittenQuery).parse(parsedSgv);
                }
            }
        }
        else {
            return new BaseOperationHandler_1.NonUpdateOperationHandler(this.engine, parsedSgv, this.query);
        }
        throw new Error('No operation found');
    }
}
exports.OperationParser = OperationParser;
//# sourceMappingURL=OperationParser.js.map