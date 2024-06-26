import {BaseOperationHandler} from './BaseOperationHandler';
import * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {assertVal, fileResourceToStore, getPrunedStore, translateStore} from '../helpers/Helpers';
import {DataFactory} from 'rdf-data-factory';

const DF = new DataFactory();

export abstract class EditResourceOperation extends BaseOperationHandler {
    protected abstract getResourceNode(): RDF.NamedNode;

    protected async getOriginalResource(): Promise<RdfStore> {
        const resourceToGet = this.getResourceNode();
        const completeStore = await fileResourceToStore(this.engine, resourceToGet.value);
        return getPrunedStore(completeStore, resourceToGet);
    }

    protected abstract getResultingResource(): Promise<RdfStore>;

    /**
     * @return a new store that you should still make sure exists like that!
     */
    protected async computeAndHandleRelocation(): Promise<{ store: RdfStore, resource: RDF.NamedNode, didClear: boolean, finalizeOperation: Promise<void> }> {
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
            const collectionToInsertIn = assertVal(
                this.collectionOfResultingResource(newResource, focusedResource)
            );
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        let finalizeOperation = Promise.resolve();
        if (newBaseUri.equals(focusedResource)) {
            // console.log("No relocation needed, updating resource in place");
        } else {
            // console.log(`Relocating resource to ${newBaseUri.value}`);
            // Remove the old resource:
            finalizeOperation = this.removeStoreFromResource(originalResource, focusedResource);
        }

        return {
            store: translateStore(newResource, focusedResource, newBaseUri),
            resource: newBaseUri,
            didClear: !newBaseUri.equals(focusedResource),
            finalizeOperation,
        };
    }
}
