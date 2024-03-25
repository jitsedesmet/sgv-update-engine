import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {SGVParser} from "../sgv/SGVParser";
import {fileResourceToStore, getPrunedStore, storeFromTriples, storeUnion, translateStore} from "../helpers/Helpers";
import {BaseOperationhandler, ParserInsertType, SgvOperation} from "./BaseOperationhandler";
import {DataFactory} from "rdf-data-factory";
import {EditResourceOperation} from "./EditResourceOperation";

const DF = new DataFactory();

export class OperationAddToResourceHandler extends EditResourceOperation {
    public operation: SgvOperation = "append to resource";

    public constructor(private parsedOperation: ParserInsertType) {
        super()
    }

    protected async getResourceNode(): Promise<RDF.NamedNode> {
        return <RDF.NamedNode> this.parsedOperation.insert[0].triples[0].subject;
    }

    private async getInsertResource(): Promise<RdfStore> {
        return await storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    protected async getResultingResource(): Promise<RdfStore> {
        return await storeUnion(await this.getOriginalResource(), await this.getInsertResource());
    }


    public async handleOperation(pod: string): Promise<void> {
        const { store, resource } = await this.computeAndHandleRelocation(pod);
        await this.addStoreToResource(store, resource);
    }
}
