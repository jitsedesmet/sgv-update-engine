import { ParserDeleteType, SgvOperation } from './BaseOperationHandler';
import * as RDF from '@rdfjs/types';
import { RdfStore } from 'rdf-stores';
import { EditResourceOperation } from './EditResourceOperation';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { QueryEngine } from '@comunica/query-sparql-file';
export declare class OperationRemoveHandler extends EditResourceOperation {
    private parsedOperation;
    operation: SgvOperation;
    constructor(engine: QueryEngine, parsedOperation: ParserDeleteType, parsedSgv: ParsedSGV);
    protected getResourceNode(): RDF.NamedNode;
    protected getDeleteResource(): RdfStore;
    protected getResultingResource(): Promise<RdfStore>;
    handleOperation(): Promise<void>;
}
