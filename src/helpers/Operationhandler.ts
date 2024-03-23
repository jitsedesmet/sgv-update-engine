import {RdfStore} from "rdf-stores";
import {InsertDeleteOperation, Update} from "sparqljs";
import {Quad_Predicate} from "@rdfjs/types";
import {DataFactory} from "rdf-data-factory";

const DF = new DataFactory();

interface Operationhandler {
    getResultingResourceStore(parsedUpdate: Update): RdfStore
}

export class InsertOperationHandler implements Operationhandler {
    public getResultingResourceStore(parsedUpdate: Update): RdfStore {
        const resourceStore = RdfStore.createDefault();

        const operation = <InsertDeleteOperation> parsedUpdate.updates[0];
        if (operation.updateType !== 'insert') {
            throw new Error('Expected an insert operation');
        }
        const triples = operation.insert[0].triples;
        for (const triple of triples) {
            resourceStore.addQuad(DF.quad(
                triple.subject,
                <Quad_Predicate> triple.predicate,
                triple.object,
            ));
        }

        return resourceStore;
    }
}
