import {ParsedSGV} from './treeStructure/ParsedSGV';
import type * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
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
} from './consts';
import {RootedCanonicalCollection} from './treeStructure/StructuredCollection';
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
        const resourceDescription = this.parseResourceDescription(container);
        return {
            type: 'Canonical Collection',
            uri: container,
            oneFileOneResource: false,
            resourceDescription,
            updateCondition: this.parseUpdateCondition(container, resourceDescription),
            saveCondition: this.parseSaveCondition(container),
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
                collectionUri
            );
        }
        throw new Error('Unknown group strategy');
    }

    private parseResourceDescription(container: RDF.NamedNode): ResourceDescription {
        const resourceDescription = this.getOne(container, resourceDescriptionPredicate);
        const type = this.getOne(resourceDescription.object, rdfTypePredicate);

        if (type.object.equals(typeResourceDescriptionShacl)) {
            return new ResourceDescriptionSHACL(
                this.sgvStore,
                this.sgvStore.getQuads(resourceDescription.object, shaclShapeLink).map(x => x.object)
            );
        }
        throw new Error('Unknown resource description');
    }


    private parseSaveCondition(container: RDF.NamedNode): SaveCondition {
        const saveCondition = this.getOne(container, saveConditionPredicate);
        const type = this.getOne(saveCondition.object, rdfTypePredicate);

        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored();
        }
        if (type.object.equals(typeSaveConditionAlwaysStore)) {
            return new SaveConditionAlwaysStored();
        }
        throw new Error('Unknown save condition');
    }

    private parseUpdateCondition(container: RDF.NamedNode, resourceDescription: ResourceDescription): UpdateCondition {
        const updateCondition = this.getOne(container, updateConditionPredicate);
        const type = this.getOne(updateCondition.object, rdfTypePredicate);

        if (type.object.equals(typeUpdateConditionPreferStatic)) {
            return new UpdateConditionPreferStatic(resourceDescription);
        }
        throw new Error('Unknown update condition');
    }
}
