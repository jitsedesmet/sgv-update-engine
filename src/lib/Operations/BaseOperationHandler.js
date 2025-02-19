"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonUpdateOperationHandler = exports.BaseOperationHandler = void 0;
const Helpers_1 = require("../helpers/Helpers.js");
class BaseOperationHandler {
    engine;
    parsedSgv;
    constructor(engine, parsedSgv) {
        this.engine = engine;
        this.parsedSgv = parsedSgv;
    }
    getContainingCollection(focusNode) {
        return this.parsedSgv
            .collections
            .filter(collection => {
            return focusNode.value.startsWith(collection.uri.value);
        })[0];
    }
    collectionOfResultingResource(resultingResource, resource) {
        // key = uri of collection
        const matches = {};
        let matchFound = false;
        for (const collection of this.parsedSgv.collections) {
            for (const condition of collection.saveConditions) {
                if (condition.updateCondition.resourceDescription.resourceMatchesDescription(resultingResource, resource)) {
                    if (!(collection.uri.value in matches)) {
                        matchFound = true;
                        matches[collection.uri.value] = [];
                    }
                    matches[collection.uri.value].push(condition);
                }
            }
        }
        if (!matchFound) {
            // TODO: you should ask for a new SGV collection?
            throw new Error('No matching shape found, cannot update resource!');
        }
        const matchedCollections = this.parsedSgv.collections.filter(collection => collection.uri.value in matches);
        for (const [collection, conditions] of Object.entries(matches)) {
            for (const condition of conditions) {
                if (condition.wantsGivenCompetitors(matchedCollections, resultingResource, resource)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return matchedCollections.find(x => x.uri.value === collection);
                }
            }
        }
        return undefined;
    }
    async addStoreToResource(store, resource) {
        if (store.size === 0) {
            return;
        }
        const query = `
            INSERT DATA {
                ${store.getQuads().map(quad => (0, Helpers_1.quadToString)(quad)).join('\n')}
            }
        `;
        await this.engine.invalidateHttpCache();
        await this.engine.queryVoid(query, {
            sources: [resource.value],
        });
    }
    async addQuadsToResource(store, resource) {
        if (store.length === 0) {
            return;
        }
        const query = `
            INSERT DATA {
                ${store.map(quad => (0, Helpers_1.quadToString)(quad)).join('\n')}
            }
        `;
        await this.engine.invalidateHttpCache();
        await this.engine.queryVoid(query, {
            sources: [resource.value],
        });
    }
    async removeStoreFromResource(store, resource) {
        if (store.size === 0) {
            return;
        }
        await this.engine.invalidateHttpCache();
        await this.engine.queryVoid(`
            DELETE DATA {
                ${store.getQuads().map(quad => (0, Helpers_1.quadToString)(quad)).join('\n')}
            }
        `, {
            sources: [resource.value],
        });
    }
}
exports.BaseOperationHandler = BaseOperationHandler;
class NonUpdateOperationHandler extends BaseOperationHandler {
    query;
    operation = 'non-update';
    constructor(engine, parsedSgv, query) {
        super(engine, parsedSgv);
        this.query = query;
    }
    async handleOperation(pod) {
        // Read query: just do it
        for await (const quad of await this
            .engine
            .queryQuads(this.query, { sources: [pod] })) {
            console.log((0, Helpers_1.quadToString)(quad));
        }
    }
}
exports.NonUpdateOperationHandler = NonUpdateOperationHandler;
//# sourceMappingURL=BaseOperationHandler.js.map