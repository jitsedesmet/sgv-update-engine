"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceDescriptionSHEX = exports.ResourceDescriptionSHACL = exports.ResourceDescription = exports.ResourceDescriptionType = void 0;
const rdf_stores_1 = require("rdf-stores");
const Helpers_1 = require("../../helpers/Helpers.js");
const consts_1 = require("../consts.js");
const rdf_validate_shacl_1 = __importDefault(require("rdf-validate-shacl"));
const rdf_data_factory_1 = require("rdf-data-factory");
const DF = new rdf_data_factory_1.DataFactory();
var ResourceDescriptionType;
(function (ResourceDescriptionType) {
    ResourceDescriptionType["shacl"] = "SHACL";
    ResourceDescriptionType["shex"] = "SHEX";
})(ResourceDescriptionType || (exports.ResourceDescriptionType = ResourceDescriptionType = {}));
class ResourceDescription {
    resourceMatchesDescription(resourceStore, baseResource) {
        throw new Error(`Resource description of type ${this.type} is deprecated.
        We can not check if ${resourceStore.getQuads().toString()} on base ${baseResource.value} matches the description.`);
    }
}
exports.ResourceDescription = ResourceDescription;
class ResourceDescriptionSHACL extends ResourceDescription {
    sgvStore;
    type = ResourceDescriptionType.shacl;
    description;
    constructor(sgvStore, shaclShape) {
        super();
        this.sgvStore = sgvStore;
        const focusStore = rdf_stores_1.RdfStore.createDefault();
        let storeSize = 0;
        for (const quad of sgvStore.getQuads(shaclShape)) {
            focusStore.addQuad(quad);
        }
        while (storeSize !== focusStore.size) {
            storeSize = focusStore.size;
            for (const quad of focusStore.getQuads()) {
                for (const subjectQuad of sgvStore.getQuads(quad.object)) {
                    focusStore.addQuad(subjectQuad);
                }
            }
        }
        this.description = focusStore.asDataset();
    }
    resourceMatchesDescription(resourceStore, baseResource) {
        // Add the focus node to the description, removing it again when we are done.
        const nodeShape = (0, Helpers_1.getOne)(this.sgvStore, undefined, consts_1.rdfTypePredicate, consts_1.shaclNodeShape).subject;
        const focusNodeLink = DF.quad(nodeShape, consts_1.shaclTargetNode, baseResource);
        this.description.add(focusNodeLink);
        const validator = new rdf_validate_shacl_1.default(this.description);
        const report = validator.validate(resourceStore.asDataset());
        this.description.delete(focusNodeLink);
        // for (const result of report.results) {
        //     console.log(result.message);
        //     console.log(result.sourceShape);
        //     console.log(result.term);
        //     console.log(result.sourceConstraintComponent);
        //     console.log(result.path);
        // }
        return report.conforms;
    }
}
exports.ResourceDescriptionSHACL = ResourceDescriptionSHACL;
/**
 * @deprecated
 */
class ResourceDescriptionSHEX extends ResourceDescription {
    type = ResourceDescriptionType.shex;
}
exports.ResourceDescriptionSHEX = ResourceDescriptionSHEX;
//# sourceMappingURL=ResourceDescription.js.map