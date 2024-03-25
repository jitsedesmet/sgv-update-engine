import {ParserDeleteType, SgvOperation} from "./BaseOperationhandler";
import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {storeFromTriples, storeMinus} from "../helpers/Helpers";
import {EditResourceOperation} from "./EditResourceOperation";

export class OperationRemoveHandler extends EditResourceOperation {
    public operation: SgvOperation = "remove";

    public constructor(private parsedOperation: ParserDeleteType) {
        super()
    }

    protected async getResourceNode(): Promise<RDF.NamedNode> {
        return <RDF.NamedNode> this.parsedOperation.delete[0].triples[0].subject;
    }

    protected async getDeleteResource(): Promise<RdfStore> {
        return await storeFromTriples(this.parsedOperation.delete[0].triples);
    }

    protected async getResultingResource(): Promise<RdfStore> {
        return await storeMinus(await this.getOriginalResource(), await this.getDeleteResource());
    }

    public async handleOperation(pod: string): Promise<void> {
        const { store, resource, didClear } = await this.computeAndHandleRelocation(pod);

        if (didClear) {
            await this.addStoreToResource(store, resource);
        } else {
            const deleteStore = await this.getDeleteResource();
            await this.removeStoreFromResource(deleteStore, resource);
        }
    }
}
