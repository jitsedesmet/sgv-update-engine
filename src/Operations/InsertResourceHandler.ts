import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {SGVParser} from "../sgv/SGVParser";
import {storeFromTriples, translateStore} from "../helpers/Helpers";
import {BaseOperationHandler, ParserInsertType, SgvOperation} from "./BaseOperationHandler";
import {DataFactory} from "rdf-data-factory";
import {ParsedSGV} from "../sgv/treeStructure/ParsedSGV";

const DF = new DataFactory();

export class InsertResourceOperationHandler extends BaseOperationHandler {
    public operation: SgvOperation = "insert resource";

    public constructor(
        private parsedOperation: ParserInsertType,
        private resource: RDF.NamedNode,
        parsedSgv?: ParsedSGV) {
        super(parsedSgv);
    }

    private getResultingResourceStore(): RdfStore {
        return storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    public async handleOperation(pod: string): Promise<void> {
        // Construct the type we would insert:
        const insertWithBaseUri = this.getResultingResourceStore();

        // Parse SGV
        const parsedSgv = this.parsedSgv ?? (await SGVParser.init(pod)).parse();

        // Validate the resource store against the shapes
        const collectionToInsertIn = this.collectionOfResultingResource(parsedSgv, insertWithBaseUri, this.resource);

        const resultingUri = await collectionToInsertIn.groupStrategy.getResourceURI(insertWithBaseUri);

        const resultingResource = DF.namedNode(resultingUri);
        await this.addStoreToResource(translateStore(insertWithBaseUri, this.resource, resultingResource), resultingResource);
    }
}
