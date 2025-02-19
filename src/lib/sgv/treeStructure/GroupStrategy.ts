import {RdfStore} from 'rdf-stores';
import type * as RDF from '@rdfjs/types';

enum GroupStrategyType {
    SPARQL_MAP = 'SPARQL map',
    URI_TEMPLATE = 'URI template',
}

/**
 * @deprecated
 */
export interface RawGroupStrategySPARQLMap {
    type: GroupStrategyType.SPARQL_MAP;
}


export interface RawGroupStrategyURITemplate {
    type: GroupStrategyType.URI_TEMPLATE;
    template: string;
    regexMatch?: string;
    regexReplace?: string;
}

export abstract class GroupStrategy {
    public abstract type: GroupStrategyType;

    public getResourceURI(resourceStore: RdfStore): Promise<string> {
        throw new Error(`Group strategy of type ${this.type} is deprecated.
        Resource ${resourceStore.getQuads().toString()} cannot be grouped.`);
    }
}

export class GroupStrategySPARQLMap extends GroupStrategy implements RawGroupStrategySPARQLMap {
    public type = GroupStrategyType.SPARQL_MAP as const;
}

export class GroupStrategyURITemplate extends GroupStrategy implements RawGroupStrategyURITemplate {
    public type = GroupStrategyType.URI_TEMPLATE as const;

    public constructor(public template: string, public collectionUri: RDF.NamedNode, public regexMatch?: string, public regexReplace?: string) {
        super();
    }

    public async getResourceURI(resourceStore: RdfStore): Promise<string> {
        const {parseTemplate} = await import('url-template');
        type PrimitiveValue = string | number | boolean | null;

        const expansionContext: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>> = {};

        resourceStore.getQuads().forEach(quad => {
            expansionContext[encodeURIComponent(quad.predicate.value)] = quad.object.value;
        });

        const preRegex = parseTemplate(this.template).expand(expansionContext);

        if (this.regexMatch && this.regexReplace) {
            return this.collectionUri.value + preRegex.replaceAll(new RegExp(this.regexMatch, 'gu'), this.regexReplace);
        }
        return this.collectionUri.value + preRegex;
    }
}
