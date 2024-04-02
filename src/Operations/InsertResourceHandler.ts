import * as RDF from '@rdfjs/types';
import {Quad_Predicate} from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {SGVParser} from '../sgv/SGVParser';
import {storeFromTriples} from '../helpers/Helpers';
import {BaseOperationHandler, ParserInsertType, SgvOperation} from './BaseOperationHandler';
import {DataFactory} from 'rdf-data-factory';
import {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

const DF = new DataFactory();

export class InsertResourceOperationHandler extends BaseOperationHandler {
    public operation: SgvOperation = 'insert resource';

    public constructor(
        engine: QueryEngine,
        private parsedOperation: ParserInsertType,
        private resource: RDF.NamedNode,
        parsedSgv?: ParsedSGV) {
        super(engine, parsedSgv);
    }

    private getResultingResourceStore(): RdfStore {
        return storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    public async handleOperation(pod: string): Promise<void> {
        // Construct the type we would insert:
        const triples = this.parsedOperation.insert[0].triples;
        const insertWithBaseUri = this.getResultingResourceStore();

        // Parse SGV
        const parsedSgv = this.parsedSgv ?? (await SGVParser.init(pod)).parse();

        // Validate the resource store against the shapes
        const collectionToInsertIn = this.collectionOfResultingResource(parsedSgv, insertWithBaseUri, this.resource);

        const resultingUri = await collectionToInsertIn.groupStrategy.getResourceURI(insertWithBaseUri);

        const resultingResource = DF.namedNode(resultingUri);
        await this.addQuadsToResource(triples.map(quad => DF.quad(
            quad.subject.equals(this.resource) ? resultingResource : quad.subject,
            quad.predicate as Quad_Predicate,
            quad.object.equals(this.resource) ? resultingResource : quad.object,
        )), resultingResource);
    }
}
