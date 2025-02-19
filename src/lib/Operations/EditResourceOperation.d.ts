import { BaseOperationHandler } from './BaseOperationHandler';
import * as RDF from '@rdfjs/types';
import { RdfStore } from 'rdf-stores';
export declare abstract class EditResourceOperation extends BaseOperationHandler {
    protected abstract getResourceNode(): RDF.NamedNode;
    protected getOriginalResource(): Promise<RdfStore>;
    protected abstract getResultingResource(): Promise<RdfStore>;
    /**
     * @return a new store that you should still make sure exists like that!
     */
    protected computeAndHandleRelocation(): Promise<{
        store: RdfStore;
        resource: RDF.NamedNode;
        didClear: boolean;
        finalizeOperation: Promise<void>;
    }>;
}
