import type * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {storeFromTriples, storeUnion} from '../helpers/Helpers';
import type {ParserInsertType, SgvOperation} from './BaseOperationHandler';
import {EditResourceOperation} from './EditResourceOperation';
import type {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

export class OperationAddToResourceHandler extends EditResourceOperation {
    public operation: SgvOperation = 'append to resource';

    public constructor(engine: QueryEngine, private parsedOperation: ParserInsertType, parsedSgv: ParsedSGV) {
        super(engine, parsedSgv);
    }

    protected getResourceNode(): RDF.NamedNode {
        return this.parsedOperation.insert[0].triples[0].subject as RDF.NamedNode;
    }

    private getInsertResource(): RdfStore {
        return storeFromTriples(this.parsedOperation.insert[0].triples);
    }

    protected async getResultingResource(): Promise<RdfStore> {
        return storeUnion(await this.getOriginalResource(), this.getInsertResource());
    }


    public override async handleOperation(pod: string, dryRun: boolean): Promise<string[]> {
        const { store, resource, finalizeOperation } = await this.computeAndHandleRelocation(dryRun);
        if (dryRun) {
            return [resource.value];
        }
        await Promise.all([finalizeOperation, this.addStoreToResource(store, resource)]);
        return [resource.value];
    }
}
