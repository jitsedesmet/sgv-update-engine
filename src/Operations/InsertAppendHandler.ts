import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {SGVParser} from "../sgv/SGVParser";
import {fileResourceToStore, getPrunedStore, storeFromTriples, storeUnion, translateStore} from "../helpers/Helpers";
import {BaseOperationhandler, ParserInsertType, SgvOperation} from "./BaseOperationhandler";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export class OperationAddToResourceHandler extends BaseOperationhandler {
    public operation: SgvOperation = "append to resource";

    public constructor(private parsedOperation: ParserInsertType) {
        super()
    }

    private async getResourceNode(): Promise<RDF.NamedNode> {
        return <RDF.NamedNode> this.parsedOperation.insert[0].triples[0].subject;
    }

    private async getOriginalResource(): Promise<RdfStore> {
        const resourceToGet = await this.getResourceNode();
        const completeStore = await fileResourceToStore(this.engine, resourceToGet.value);
        return await getPrunedStore(completeStore, resourceToGet);
    }

    private async getInsertResource(): Promise<RdfStore> {
        return await storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    public async handleOperation(pod: string): Promise<void> {
        const focusedResource = await this.getResourceNode();

        // Evaluate what resource would remain when we insert
        const originalResource = await this.getOriginalResource();

        // Parse SGV
        const parsedSgv = (await SGVParser.init(pod)).parse();

        // Get the Collection the resource is in now.
        const currentCollection = this.getContainingCollection(focusedResource, parsedSgv);

        // Validate the newResource store against the shapes
        const newResource = await storeUnion(originalResource, await this.getInsertResource());

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

        await this.addStoreToResource(await translateStore(newResource, focusedResource, newBaseUri), newBaseUri);
    }
}
