import * as RDF from '@rdfjs/types';
import { RdfStore } from 'rdf-stores';
export declare enum ResourceDescriptionType {
    shacl = "SHACL",
    shex = "SHEX"
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
export declare abstract class ResourceDescription {
    abstract type: ResourceDescriptionType;
    resourceMatchesDescription(resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean;
}
export declare class ResourceDescriptionSHACL extends ResourceDescription implements RawResourceDescriptionSHACL {
    private sgvStore;
    type: ResourceDescriptionType.shacl;
    description: RDF.DatasetCore;
    constructor(sgvStore: RdfStore, shaclShape: RDF.Quad_Object);
    resourceMatchesDescription(resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean;
}
/**
 * @deprecated
 */
export declare class ResourceDescriptionSHEX extends ResourceDescription implements RawResourceDescriptionSHEX {
    type: ResourceDescriptionType.shex;
}
