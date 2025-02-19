"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationRemoveHandler = void 0;
const Helpers_1 = require("../helpers/Helpers.js");
const EditResourceOperation_1 = require("./EditResourceOperation.js");
class OperationRemoveHandler extends EditResourceOperation_1.EditResourceOperation {
    parsedOperation;
    operation = 'remove';
    constructor(engine, parsedOperation, parsedSgv) {
        super(engine, parsedSgv);
        this.parsedOperation = parsedOperation;
    }
    getResourceNode() {
        return this.parsedOperation.delete[0].triples[0].subject;
    }
    getDeleteResource() {
        return (0, Helpers_1.storeFromTriples)(this.parsedOperation.delete[0].triples);
    }
    async getResultingResource() {
        return (0, Helpers_1.storeMinus)(await this.getOriginalResource(), this.getDeleteResource());
    }
    async handleOperation() {
        const { store, resource, didClear, finalizeOperation } = await this.computeAndHandleRelocation();
        if (didClear) {
            await Promise.all([finalizeOperation, this.addStoreToResource(store, resource)]);
        }
        else {
            const deleteStore = this.getDeleteResource();
            await Promise.all([finalizeOperation, this.removeStoreFromResource(deleteStore, resource)]);
        }
    }
}
exports.OperationRemoveHandler = OperationRemoveHandler;
//# sourceMappingURL=OperationRemoveHandler.js.map