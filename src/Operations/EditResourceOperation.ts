import {BaseOperationhandler} from "./BaseOperationhandler";
import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {fileResourceToStore, getPrunedStore, translateStore} from "../helpers/Helpers";
import {SGVParser} from "../sgv/SGVParser";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export abstract class EditResourceOperation extends BaseOperationhandler {
    protected abstract getResourceNode(): Promise<RDF.NamedNode>;

    protected async getOriginalResource(): Promise<RdfStore> {
        const resourceToGet = await this.getResourceNode();
        const completeStore = await fileResourceToStore(this.engine, resourceToGet.value);
        return await getPrunedStore(completeStore, resourceToGet);
    }

    protected abstract getResultingResource(): Promise<RdfStore>;

    /**
     * @return a new store that you should still make sure exists like that!
     */
    protected async computeAndHandleRelocation(pod: string): Promise<{ store: RdfStore, resource: RDF.NamedNode, didClear: boolean }> {
        const focusedResource = await this.getResourceNode();

        // Evaluate what resource would remain when we insert
        const originalResource = await this.getOriginalResource();

        // Parse SGV
        const parsedSgv = (await SGVParser.init(pod)).parse();

        // Get the Collection the resource is in now.
        const currentCollection = this.getContainingCollection(focusedResource, parsedSgv);

        // Validate the newResource store against the shapes
        const newResource = await this.getResultingResource();

        const wantsRelocation = currentCollection.updateCondition.wantsRelocation(newResource, focusedResource);

        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));

        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = await this.collectionOfResultingResource(parsedSgv, newResource, focusedResource);
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }

        if (newBaseUri.equals(focusedResource)) {
            console.log("No relocation needed, updating resource in place");
        } else {
            console.log(`Relocating resource to ${newBaseUri.value}`);
            // Remove the old resource:
            await this.removeStoreFromResource(originalResource, focusedResource);
        }

        return {
            store: await translateStore(newResource, focusedResource, newBaseUri),
            resource: newBaseUri,
            didClear: !newBaseUri.equals(focusedResource),
        };
    }
}
