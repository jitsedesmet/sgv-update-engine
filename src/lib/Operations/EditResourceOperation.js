"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditResourceOperation = void 0;
const BaseOperationHandler_1 = require("./BaseOperationHandler.js");
const Helpers_1 = require("../helpers/Helpers.js");
const rdf_data_factory_1 = require("rdf-data-factory");
const DF = new rdf_data_factory_1.DataFactory();
class EditResourceOperation extends BaseOperationHandler_1.BaseOperationHandler {
    async getOriginalResource() {
        const resourceToGet = this.getResourceNode();
        const completeStore = await (0, Helpers_1.fileResourceToStore)(this.engine, resourceToGet.value);
        return (0, Helpers_1.getPrunedStore)(completeStore, resourceToGet);
    }
    /**
     * @return a new store that you should still make sure exists like that!
     */
    async computeAndHandleRelocation() {
        const focusedResource = this.getResourceNode();
        // Evaluate what resource would remain when we insert
        const originalResource = await this.getOriginalResource();
        // Get the Collection the resource is in now.
        const currentCollection = this.getContainingCollection(focusedResource);
        // Validate the newResource store against the shapes
        const newResource = await this.getResultingResource();
        const wantsRelocation = currentCollection.saveConditions
            .map(condition => condition.updateCondition)
            .every(condition => condition.wantsRelocation(newResource, focusedResource));
        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));
        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = (0, Helpers_1.assertVal)(this.collectionOfResultingResource(newResource, focusedResource));
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }
        let finalizeOperation = Promise.resolve();
        if (newBaseUri.equals(focusedResource)) {
            // console.log("No relocation needed, updating resource in place");
        }
        else {
            // console.log(`Relocating resource to ${newBaseUri.value}`);
            // Remove the old resource:
            finalizeOperation = this.removeStoreFromResource(originalResource, focusedResource);
        }
        return {
            store: (0, Helpers_1.translateStore)(newResource, focusedResource, newBaseUri),
            resource: newBaseUri,
            didClear: !newBaseUri.equals(focusedResource),
            finalizeOperation,
        };
    }
}
exports.EditResourceOperation = EditResourceOperation;
//# sourceMappingURL=EditResourceOperation.js.map