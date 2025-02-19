"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationAddToResourceHandler = void 0;
const Helpers_1 = require("../helpers/Helpers.js");
const EditResourceOperation_1 = require("./EditResourceOperation.js");
class OperationAddToResourceHandler extends EditResourceOperation_1.EditResourceOperation {
    parsedOperation;
    operation = 'append to resource';
    constructor(engine, parsedOperation, parsedSgv) {
        super(engine, parsedSgv);
        this.parsedOperation = parsedOperation;
    }
    getResourceNode() {
        return this.parsedOperation.insert[0].triples[0].subject;
    }
    getInsertResource() {
        return (0, Helpers_1.storeFromTriples)(this.parsedOperation.insert[0].triples);
    }
    async getResultingResource() {
        return (0, Helpers_1.storeUnion)(await this.getOriginalResource(), this.getInsertResource());
    }
    async handleOperation() {
        const { store, resource, finalizeOperation } = await this.computeAndHandleRelocation();
        await Promise.all([finalizeOperation, this.addStoreToResource(store, resource)]);
    }
}
exports.OperationAddToResourceHandler = OperationAddToResourceHandler;
//# sourceMappingURL=InsertAppendHandler.js.map