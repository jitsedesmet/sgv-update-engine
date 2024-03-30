import {ParserDeleteType, SgvOperation} from "./BaseOperationHandler";
import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {storeFromTriples, storeMinus} from "../helpers/Helpers";
import {EditResourceOperation} from "./EditResourceOperation";

export class OperationRemoveHandler extends EditResourceOperation {
    public operation: SgvOperation = "remove";

    public constructor(private parsedOperation: ParserDeleteType) {
        super()
    }

    protected getResourceNode(): RDF.NamedNode {
        return this.parsedOperation.delete[0].triples[0].subject as RDF.NamedNode;
    }

    protected getDeleteResource(): RdfStore {
        return storeFromTriples(this.parsedOperation.delete[0].triples);
    }

    protected async getResultingResource(): Promise<RdfStore> {
        return storeMinus(await this.getOriginalResource(), this.getDeleteResource());
    }

    public async handleOperation(pod: string): Promise<void> {
        const { store, resource, didClear } = await this.computeAndHandleRelocation(pod);

        if (didClear) {
            await this.addStoreToResource(store, resource);
        } else {
            const deleteStore = this.getDeleteResource();
            await this.removeStoreFromResource(deleteStore, resource);
        }
    }
}
