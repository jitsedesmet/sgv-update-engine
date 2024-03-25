import {QueryEngine} from "@comunica/query-sparql-file";
import * as RDF from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {Quad_Predicate} from "@rdfjs/types";
import {SGVParser} from "../sgv/SGVParser";
import {RootedCanonicalCollection} from "../sgv/treeStructure/StructuredCollection";
import {quadToString, storeFromTriples, translateStore} from "../helpers/Helpers";
import {BaseOperationhandler, ParserInsertType, SgvOperation} from "./BaseOperationhandler";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

export class InsertResourceOperationHandler extends BaseOperationhandler {
    public operation: SgvOperation = "insert resource";

    public constructor(private parsedOperation: ParserInsertType, private resource: RDF.NamedNode) {
        super();
    }

    private getResultingResourceStore(): Promise<RdfStore> {
        return storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    public async handleOperation(pod: string): Promise<void> {
        // Construct the type we would insert:
        const insertWithBaseUri = await this.getResultingResourceStore();

        // Parse SGV
        const parsedSgv = (await SGVParser.init(pod)).parse();

        // Validate the resource store against the shapes
        const collectionToInsertIn = await this.collectionOfResultingResource(parsedSgv, insertWithBaseUri, this.resource);

        console.log(`Resource conforms to shape ${collectionToInsertIn.uri.value}`);

        const resultingUri = await collectionToInsertIn.groupStrategy.getResourceURI(insertWithBaseUri);
        console.log(resultingUri);

        const resultingResource = DF.namedNode(resultingUri);
        await this.addStoreToResource(await translateStore(insertWithBaseUri, this.resource, resultingResource), resultingResource);
    }
}
