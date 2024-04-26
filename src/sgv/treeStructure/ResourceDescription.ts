import * as RDF from '@rdfjs/types';
import {RdfStore} from 'rdf-stores';
import {getOne} from '../../helpers/Helpers';
import {rdfTypePredicate, shaclNodeShape, shaclTargetNode} from '../consts';
import SHACLValidator from 'rdf-validate-shacl';
import {DataFactory} from 'rdf-data-factory';

const DF = new DataFactory();

export enum ResourceDescriptionType {
    shacl = 'SHACL',
    shex = 'SHEX',
}

export interface RawResourceDescriptionSHACL {
    type: ResourceDescriptionType.shacl;
    description: RDF.DatasetCore;
}

/**
 * @deprecated
 */
export interface RawResourceDescriptionSHEX {
    type: ResourceDescriptionType.shex;
}

export abstract class ResourceDescription {
    public abstract type: ResourceDescriptionType;

    public resourceMatchesDescription(resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean {
        throw new Error(`Resource description of type ${this.type} is deprecated.
        We can not check if ${resourceStore.getQuads().toString()} on base ${baseResource.value} matches the description.`);
    }
}

export class ResourceDescriptionSHACL extends ResourceDescription implements RawResourceDescriptionSHACL {
    public type = ResourceDescriptionType.shacl as const;
    public description: RDF.DatasetCore;

    public constructor(private sgvStore: RdfStore, shaclShape: RDF.Quad_Object) {
        super();
        const focusStore = RdfStore.createDefault();
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

    public resourceMatchesDescription(resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean {
        // Add the focus node to the description, removing it again when we are done.
        const nodeShape = getOne(this.sgvStore, undefined, rdfTypePredicate, shaclNodeShape).subject;

        const focusNodeLink = DF.quad(
            nodeShape,
            shaclTargetNode,
            baseResource
        );
        this.description.add(focusNodeLink);

        const validator = new SHACLValidator(this.description);

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

/**
 * @deprecated
 */
export class ResourceDescriptionSHEX extends ResourceDescription implements RawResourceDescriptionSHEX {
    public type = ResourceDescriptionType.shex as const;
}
