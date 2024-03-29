import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {storeFromTriples, storeUnion} from "../helpers/Helpers";
import {ParserInsertType, SgvOperation} from "./BaseOperationHandler";
import {DataFactory} from "rdf-data-factory";
import {EditResourceOperation} from "./EditResourceOperation";

const DF = new DataFactory();

export class OperationAddToResourceHandler extends EditResourceOperation {
    public operation: SgvOperation = "append to resource";

    public constructor(private parsedOperation: ParserInsertType) {
        super()
    }

    protected getResourceNode(): RDF.NamedNode {
        return <RDF.NamedNode> this.parsedOperation.insert[0].triples[0].subject;
    }

    private getInsertResource(): RdfStore {
        return storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    protected async getResultingResource(): Promise<RdfStore> {
        return storeUnion(await this.getOriginalResource(), this.getInsertResource());
    }


    public async handleOperation(pod: string): Promise<void> {
        const { store, resource } = await this.computeAndHandleRelocation(pod);
        await this.addStoreToResource(store, resource);
    }
}
