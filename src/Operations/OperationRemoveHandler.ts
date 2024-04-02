import {ParserDeleteType, SgvOperation} from './BaseOperationHandler';
import * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {storeFromTriples, storeMinus} from '../helpers/Helpers';
import {EditResourceOperation} from './EditResourceOperation';
import {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

export class OperationRemoveHandler extends EditResourceOperation {
    public operation: SgvOperation = 'remove';

    public constructor(engine: QueryEngine, private parsedOperation: ParserDeleteType, parsedSgv: ParsedSGV) {
        super(engine, parsedSgv);
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

    public async handleOperation(): Promise<void> {
        const { store, resource, didClear } = await this.computeAndHandleRelocation();

        if (didClear) {
            await this.addStoreToResource(store, resource);
        } else {
            const deleteStore = this.getDeleteResource();
            await this.removeStoreFromResource(deleteStore, resource);
        }
    }
}
