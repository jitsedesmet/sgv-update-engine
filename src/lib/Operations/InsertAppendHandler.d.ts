import * as RDF from '@rdfjs/types';
import { RdfStore } from 'rdf-stores';
import { ParserInsertType, SgvOperation } from './BaseOperationHandler';
import { EditResourceOperation } from './EditResourceOperation';
import { ParsedSGV } from '../sgv/treeStructure/ParsedSGV';
import { QueryEngine } from '@comunica/query-sparql-file';
export declare class OperationAddToResourceHandler extends EditResourceOperation {
    private parsedOperation;
    operation: SgvOperation;
    constructor(engine: QueryEngine, parsedOperation: ParserInsertType, parsedSgv: ParsedSGV);
    protected getResourceNode(): RDF.NamedNode;
    private getInsertResource;
    protected getResultingResource(): Promise<RdfStore>;
    handleOperation(): Promise<void>;
}
