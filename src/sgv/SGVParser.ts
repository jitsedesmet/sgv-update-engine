import {ParsedSGV} from './treeStructure/ParsedSGV';
import type * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {
    groupStrategyPredicate, groupStrategyRegexMatch, groupStrategyRegexReplace,
    groupStrategyUriTemplate, predicateOneFileOneResource,
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
} from './consts';
import {CollectionType, RootedCanonicalCollection} from './treeStructure/StructuredCollection';
import {UpdateCondition, UpdateConditionPreferStatic} from './treeStructure/UpdateCondition';
import {SaveCondition, SaveConditionAlwaysStored} from './treeStructure/SaveCondition';
import {ResourceDescription, ResourceDescriptionSHACL} from './treeStructure/ResourceDescription';
import {GroupStrategy, GroupStrategyURITemplate} from './treeStructure/GroupStrategy';
import {fileResourceToStore, getOne} from '../helpers/Helpers';
import {QueryEngine} from '@comunica/query-sparql-file';

export class SGVParser {
    public constructor(public sgvStore: RdfStore) {
    }

    public static async init(engine: QueryEngine, podUri: string): Promise<SGVParser>  {
        return new SGVParser(await fileResourceToStore(engine, `${podUri}sgv`));
    }


    public parse(): ParsedSGV {
        return {
            collections: this.sgvStore.getQuads(undefined, undefined, typeCanonicalCollection).map(quad => {
                if (quad.subject.termType !== 'NamedNode' && quad.subject.termType !== 'BlankNode') {
                    throw new Error('Expected a NamedNode or BlankNode as subject');
                }
                return this.parseCanonicalCollection((quad.subject as RDF.NamedNode));
            })
        };
    }

    private parseCanonicalCollection(container: RDF.NamedNode): RootedCanonicalCollection {
        const app = this.sgvStore.getQuads(container, saveConditionPredicate);
        return {
            type: CollectionType.canonical,
            uri: container,
            oneFileOneResource: this.sgvStore.getQuads(container, predicateOneFileOneResource)[0].object.value === 'true',
            saveConditions: this.sgvStore.getQuads(container, saveConditionPredicate)
                .map(x => this.parseSaveCondition(x.object as RDF.NamedNode)) as [SaveCondition, ...SaveCondition[]],
            groupStrategy: this.parseGroupStrategy(container, container),
        };
    }

    private getOne(subject?: RDF.Quad_Object, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Subject): RDF.Quad {
        return getOne(this.sgvStore, subject, predicate, object);
    }

    private parseGroupStrategy(container: RDF.NamedNode, collectionUri: RDF.NamedNode): GroupStrategy {
        const groupStrategy = this.getOne(container, groupStrategyPredicate);
        const type = this.getOne(groupStrategy.object, rdfTypePredicate);

        if (type.object.equals(typeGroupStrategyUriTemplate)) {
            return new GroupStrategyURITemplate(
                this.getOne(groupStrategy.object, groupStrategyUriTemplate).object.value,
                collectionUri,
                this.sgvStore.getQuads(groupStrategy.object, groupStrategyRegexMatch)[0]?.object?.value,
                this.sgvStore.getQuads(groupStrategy.object, groupStrategyRegexReplace)[0]?.object?.value,
            );
        }
        throw new Error('Unknown group strategy');
    }

    private parseResourceDescription(descriptionSubject: RDF.Quad_Subject): ResourceDescription {
        const type = this.getOne(descriptionSubject, rdfTypePredicate);

        if (type.object.equals(typeResourceDescriptionShacl)) {
            return new ResourceDescriptionSHACL(
                this.sgvStore,
                this.getOne(descriptionSubject, shaclShapeLink).object
            );
        }
        throw new Error('Unknown resource description');
    }


    private parseSaveCondition(saveCondSubject: RDF.Quad_Subject): SaveCondition {
        const updateCondition = this.parseUpdateCondition(
            this.getOne(saveCondSubject, updateConditionPredicate).object as RDF.Quad_Subject
        );

        const type = this.getOne(saveCondSubject, rdfTypePredicate);

        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored(updateCondition);
        }
        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored(updateCondition);
        }
        throw new Error('Unknown save condition');
    }

    private parseUpdateCondition(updateCond: RDF.Quad_Subject): UpdateCondition {
        const resourceDescription: ResourceDescription = this.parseResourceDescription(
            this.getOne(updateCond, resourceDescriptionPredicate).object as RDF.Quad_Subject
        );
        const type = this.getOne(updateCond, rdfTypePredicate);

        if (type.object.equals(typeUpdateConditionPreferStatic)) {
            return new UpdateConditionPreferStatic(resourceDescription);
        }
        throw new Error('Unknown update condition');
    }
}
