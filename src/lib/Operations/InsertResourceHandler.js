"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertResourceOperationHandler = void 0;
const Helpers_1 = require("../helpers/Helpers.js");
const BaseOperationHandler_1 = require("./BaseOperationHandler.js");
const rdf_data_factory_1 = require("rdf-data-factory");
const DF = new rdf_data_factory_1.DataFactory();
class InsertResourceOperationHandler extends BaseOperationHandler_1.BaseOperationHandler {
    parsedOperation;
    resource;
    operation = 'insert resource';
    constructor(engine, parsedOperation, resource, parsedSgv) {
        super(engine, parsedSgv);
        this.parsedOperation = parsedOperation;
        this.resource = resource;
    }
    getResultingResourceStore() {
        return (0, Helpers_1.storeFromTriples)(this.parsedOperation.insert[0].triples);
    }
    async handleOperation() {
        // Construct the type we would insert:
        const triples = this.parsedOperation.insert[0].triples;
        const insertWithBaseUri = this.getResultingResourceStore();
        // Validate the resource store against the shapes
        const collectionToInsertIn = (0, Helpers_1.assertVal)(this.collectionOfResultingResource(insertWithBaseUri, this.resource));
        const resultingUri = await collectionToInsertIn.groupStrategy.getResourceURI(insertWithBaseUri);
        const resultingResource = DF.namedNode(resultingUri);
        await this.addQuadsToResource(triples.map(quad => DF.quad(quad.subject.equals(this.resource) ? resultingResource : quad.subject, quad.predicate, quad.object.equals(this.resource) ? resultingResource : quad.object)), resultingResource);
    }
}
exports.InsertResourceOperationHandler = InsertResourceOperationHandler;
//# sourceMappingURL=InsertResourceHandler.js.map