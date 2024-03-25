import {ParsedSGV} from "./treeStructure/ParsedSGV";
import type * as RDF from '@rdfjs/types';
import {Quad_Object, Quad_Predicate, Quad_Subject} from "@rdfjs/types";
import {RdfStore} from "rdf-stores";
import {
    groupStrategyPredicate,
    groupStrategyUriTemplate,
    rdfTypePredicate,
    resourceDescriptionPredicate,
    saveConditionPredicate,
    shaclShapeLink,
    typeCanonicalCollection,
    typeGroupStrategyUriTemplate,
    typeResourceDescriptionShacl,
    typeSaveConditionAlwaysStore,
    typeUpdateConditionPreferStatic,
    updateConditionPredicate
} from "./consts";
import {DefinedTriple, RootedCanonicalCollection} from "./treeStructure/StructuredCollection";
import {UpdateCondition, UpdateConditionPreferStatic} from "./treeStructure/UpdateCondition";
import {SaveCondition, SaveConditionAlwaysStored} from "./treeStructure/SaveCondition";
import {ResourceDescription, ResourceDescriptionSHACL} from "./treeStructure/ResourceDescription";
import {GroupStrategy, GroupStrategyURITemplate} from "./treeStructure/GroupStrategy";
import {fileResourceToStore, getOne} from "../helpers/Helpers";
import {DataFactory} from "rdf-data-factory";
import {QueryEngine} from "@comunica/query-sparql-file";

const DF = new DataFactory();
const myEngine = new QueryEngine();

export class SGVParser {
    public constructor(public sgvStore: RdfStore) { }

    public static async init(podUri: string): Promise<SGVParser>  {
        return new SGVParser(await fileResourceToStore(myEngine, `${podUri}sgv`));
    }


    public parse(): ParsedSGV {
        console.log(typeCanonicalCollection);
        return {
            collections: this.sgvStore.getQuads(undefined, undefined, typeCanonicalCollection).map(quad => {
                if (quad.subject.termType !== "NamedNode" && quad.subject.termType !== "BlankNode") {
                    throw new Error("Expected a NamedNode or BlankNode as subject");
                }
                return this.parseCanonicalCollection(<DefinedTriple> quad.subject);
            })
        }
    }

    private parseCanonicalCollection(container: DefinedTriple): RootedCanonicalCollection {
        const resourceDescription = this.parseResourceDescription(container);
        return {
            type: "Canonical Collection",
            uri: container,
            oneFileOneResource: false,
            resourceDescription,
            updateCondition: this.parseUpdateCondition(container, resourceDescription),
            saveCondition: this.parseSaveCondition(container),
            groupStrategy: this.parseGroupStrategy(container),
        }
    }

    private getOne(subject?: RDF.Quad_Object, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Subject): RDF.Quad {
        return getOne(this.sgvStore, subject, predicate, object);
    }

    private parseGroupStrategy(container: DefinedTriple): GroupStrategy {
        const groupStrategy = this.getOne(container, groupStrategyPredicate);
        const type = this.getOne(groupStrategy.object, rdfTypePredicate);

        if (type.object.equals(typeGroupStrategyUriTemplate)) {
            return new GroupStrategyURITemplate(
                this.getOne(groupStrategy.object, groupStrategyUriTemplate).object.value
            );
        }
        throw new Error("Unknown group strategy");
    }

    private parseResourceDescription(container: DefinedTriple): ResourceDescription {
        const resourceDescription = this.getOne(container, resourceDescriptionPredicate);
        const type = this.getOne(resourceDescription.object, rdfTypePredicate);

        if (type.object.equals(typeResourceDescriptionShacl)) {
            return new ResourceDescriptionSHACL(
                this.sgvStore,
                this.sgvStore.getQuads(resourceDescription.object, shaclShapeLink).map(x => x.object)
            );
        }
        throw new Error("Unknown resource description");
    }


    private parseSaveCondition(container: DefinedTriple): SaveCondition {
        const saveCondition = this.getOne(container, saveConditionPredicate);
        const type = this.getOne(saveCondition.object, rdfTypePredicate);

        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored();
        }
        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored();
        }
        throw new Error("Unknown save condition");
    }

    private parseUpdateCondition(container: DefinedTriple, resourceDescription: ResourceDescription): UpdateCondition {
        const updateCondition = this.getOne(container, updateConditionPredicate);
        const type = this.getOne(updateCondition.object, rdfTypePredicate);

        if (type.object.equals(typeUpdateConditionPreferStatic)) {
            return new UpdateConditionPreferStatic(resourceDescription);
        }
        throw new Error("Unknown update condition");
    }
}
