"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInsertOperationHandler = void 0;
const BaseOperationHandler_1 = require("./BaseOperationHandler.js");
const Helpers_1 = require("../helpers/Helpers.js");
const rdf_stores_1 = require("rdf-stores");
const rdf_data_factory_1 = require("rdf-data-factory");
const DF = new rdf_data_factory_1.DataFactory();
class DeleteInsertOperationHandler extends BaseOperationHandler_1.BaseOperationHandler {
    parsedOperation;
    completeQuery;
    operation = 'delete insert';
    constructor(engine, parsedOperation, completeQuery, parsedSgv) {
        super(engine, parsedSgv);
        this.parsedOperation = parsedOperation;
        this.completeQuery = completeQuery;
    }
    async findAlteredResource(pod, rawDelete, rawInsert, rawWhere) {
        // Where can we expect posts?
        const posts = rdf_stores_1.RdfStore.createDefault();
        const postDirLocation = this.parsedSgv.collections.filter(collection => collection.uri.value.indexOf('posts') !== -1)[0].uri;
        const postsLocations = [];
        for await (const quad of await this.engine.queryQuads('CONSTRUCT WHERE { ?s ?p ?o }', {
            sources: [postDirLocation.value]
        })) {
            if (quad.predicate.equals(DF.namedNode('http://www.w3.org/ns/ldp#contains'))) {
                postsLocations.push(quad.object.value);
            }
            posts.addQuad(quad);
        }
        if (postsLocations.length !== 0) {
            posts.removeMatches();
            for await (const quad of await this.engine.queryQuads('CONSTRUCT WHERE { ?s ?p ?o }', {
                sources: postsLocations
            })) {
                posts.addQuad(quad);
            }
        }
        const postsIds = (0, Helpers_1.getRootResources)(posts);
        const removalStore = rdf_stores_1.RdfStore.createDefault();
        const additionStore = rdf_stores_1.RdfStore.createDefault();
        if (rawDelete) {
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawDelete} } WHERE { ${rawWhere} }`, {
                sources: [posts]
            })) {
                removalStore.addQuad(quad);
            }
        }
        if (rawInsert) {
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawInsert} } WHERE { ${rawWhere} }`, {
                sources: [posts]
            })) {
                additionStore.addQuad(quad);
            }
        }
        const newResource = (0, Helpers_1.storeUnion)(additionStore, removalStore);
        // This only works when not nesting properties
        const focussedResource = (0, Helpers_1.getRootResources)(newResource)[0];
        return focussedResource;
    }
    async handleOperation(pod) {
        // We construct the resource we will delete and insert by looking at the where clause in the parsed operation.
        const rawQuery = (0, Helpers_1.getQueryWithoutPrefixes)(this.completeQuery);
        // Either delete is present, or it is not:
        let rawDelete = '';
        let rawInsert = '';
        let rawWhere = '';
        if (this.parsedOperation.delete?.length) {
            const selection = rawQuery.replaceAll(/^DELETE \{(.*)\}\s+(INSERT \{(.*)\}\s+)?WHERE \{(.*)\}$/gu, '$1\t$3\t$4').split('\t');
            rawDelete = selection[0];
            rawInsert = selection[1];
            rawWhere = selection[2];
        }
        else {
            const selection = rawQuery.replaceAll(/^INSERT \{(.*)\}\s+WHERE \{(.*)\}$/gu, '$1\t$2').split('\t');
            rawInsert = selection[0];
            rawWhere = selection[1];
        }
        const focussedResource = await this.findAlteredResource(pod, rawDelete, rawInsert, rawWhere);
        const resourceStore = (0, Helpers_1.getPrunedStore)(await (0, Helpers_1.fileResourceToStore)(this.engine, focussedResource.value), focussedResource);
        // Instantiate the delete clause
        const removalStore = rdf_stores_1.RdfStore.createDefault();
        if (rawDelete) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawDelete} } WHERE { ${rawWhere} }`, {
                sources: [resourceStore],
            })) {
                removalStore.addQuad(quad);
            }
        }
        const additionStore = rdf_stores_1.RdfStore.createDefault();
        if (rawInsert) {
            await this.engine.invalidateHttpCache();
            for await (const quad of await this.engine.queryQuads(`CONSTRUCT { ${rawInsert} } WHERE { ${rawWhere} }`, {
                sources: [resourceStore],
            })) {
                additionStore.addQuad(quad);
            }
        }
        const newResource = (0, Helpers_1.storeUnion)((0, Helpers_1.storeMinus)(resourceStore, removalStore), additionStore);
        const currentCollection = this.getContainingCollection(focussedResource);
        const wantsRelocation = currentCollection.saveConditions
            .map(condition => condition.updateCondition)
            .every(condition => condition.wantsRelocation(newResource, focussedResource));
        let newBaseUri = DF.namedNode(await currentCollection
            .groupStrategy
            .getResourceURI(newResource));
        if (wantsRelocation) {
            // Check what collection we should relocate to
            const collectionToInsertIn = (0, Helpers_1.assertVal)(this.collectionOfResultingResource(newResource, focussedResource));
            newBaseUri = DF.namedNode(await collectionToInsertIn.groupStrategy.getResourceURI(newResource));
        }
        if (newBaseUri.equals(focussedResource)) {
            let query = '';
            if (removalStore.size !== 0) {
                query += `
                    DELETE DATA {
                        ${removalStore.getQuads().map(quad => (0, Helpers_1.quadToString)(quad)).join('\n')}
                    };
                `;
            }
            if (additionStore.size !== 0) {
                query += `
                    INSERT DATA {
                        ${additionStore.getQuads().map(quad => (0, Helpers_1.quadToString)(quad)).join('\n')}
                    }
                `;
            }
            await this.engine.invalidateHttpCache();
            await this.engine.queryVoid(query, { sources: [focussedResource.value] });
        }
        else {
            const remainingStore = (0, Helpers_1.translateStore)(newResource, focussedResource, newBaseUri);
            // Remove the old resource and create new at once!:
            await Promise.all([
                this.removeStoreFromResource(resourceStore, focussedResource),
                this.addStoreToResource(remainingStore, newBaseUri)
            ]);
        }
    }
}
exports.DeleteInsertOperationHandler = DeleteInsertOperationHandler;
//# sourceMappingURL=DeleteInsertOperationHandler.js.map