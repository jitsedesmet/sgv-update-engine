import {type InsertDeleteOperation, Parser, type SparqlParser, type SparqlQuery} from 'sparqljs';
import {BaseOperationHandler, NonUpdateOperationHandler} from './BaseOperationHandler';
import {InsertResourceOperationHandler} from './InsertResourceHandler';
import {OperationAddToResourceHandler} from './InsertAppendHandler';
import {DataFactory} from 'rdf-data-factory';
import {OperationRemoveHandler} from './OperationRemoveHandler';
import {DeleteInsertOperationHandler} from './DeleteInsertOperationHandler';
import {getQueryWithoutPrefixes} from '../helpers/Helpers';
import type {ParsedSGV} from '../sgv/treeStructure/ParsedSGV';
import {QueryEngine} from '@comunica/query-sparql-file';

const DF = new DataFactory();

/**
 * Parses a query amd can use a given engine to prepare the operation.
 */
export class OperationParser {
    public baseIRI: string;
    public sparqlParser: SparqlParser;

    constructor(private engine: QueryEngine, private query: string) {
        // Use a uuid_v4 as baseIRI
        const id = Math.floor(Math.random() * 1000000000000000);

        this.baseIRI = `file:///${id}-8ea79435-ffe1-4357-9010-0970114970ad`;
        this.sparqlParser = new Parser({
            baseIRI: this.baseIRI,
        });
    }

  /**
   * Actually parse the query, in the context of some parsed SGV.
   * Returns a query plan (kinda)
   */
  public async parse(parsedSgv: ParsedSGV): Promise<BaseOperationHandler> {
        const parsedQuery: SparqlQuery = this.sparqlParser.parse(this.query);

        if (parsedQuery.type  === 'update') {
            // check if raw insert: INSERT DATA { ... }
            if (parsedQuery.updates.length === 1) {
                // The resource we want to insert is either already present, or should be inserted.
                // In this DEMO software we assume it is one or the other, and that we the presence of the baseIri is enough to determine this.
                // We also assume that only one resource is updated in a single query.
                const operation = parsedQuery.updates[0] as InsertDeleteOperation;
                if (operation.updateType === 'insert') {
                    if (operation.insert.some(quad => quad.triples.some(triple => triple.subject.equals(DF.namedNode(this.baseIRI))))) {
                        return new InsertResourceOperationHandler(this.engine, operation, DF.namedNode(this.baseIRI), parsedSgv);
                    } else {
                        return new OperationAddToResourceHandler(this.engine, operation, parsedSgv);
                    }
                }
                if (operation.updateType === 'delete') {
                    return new OperationRemoveHandler(this.engine, operation, parsedSgv);
                }
                if (operation.updateType === 'insertdelete') {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return new DeleteInsertOperationHandler(this.engine, <any> operation, parsedQuery, parsedSgv);
                }
                if (operation.updateType === 'deletewhere') {
                    // We rewrite to a delete ... where ... query (insertdelete)
                    const rawQuery = getQueryWithoutPrefixes(parsedQuery);

                    const rewrittenQuery = rawQuery.replaceAll(
                        /DELETE\s+WHERE\s*\{([^}]*)\}/gu,
                        'DELETE { $1 } WHERE { $1 }'
                    );
                    return await new OperationParser(this.engine, rewrittenQuery).parse(parsedSgv);
                }
            }
        } else {
            return new NonUpdateOperationHandler(this.engine, parsedSgv, this.query);
        }
        throw new Error('No operation found');
    }
}
