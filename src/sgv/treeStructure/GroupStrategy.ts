import {RdfStore} from 'rdf-stores';
import type * as RDF from '@rdfjs/types';

/**
 * @deprecated
 */
export interface RawGroupStrategySPARQLMap {
    type: 'SPARQL map';
    encodeURI: string;
}

export interface RawGroupStrategyURITemplate {
    type: 'URI template';
    template: string;
}

export interface RawGroupStrategyURITemplateWithRegex {
    type: 'URI template with REGEX';
    template: string;
    regexMatch: string;
    regexReplace: string;
}


export class GroupStrategySPARQLMap implements RawGroupStrategySPARQLMap {
    public type = 'SPARQL map' as const;

    public constructor(public encodeURI: string) { }

    public getResourceURI(resourceStore: RdfStore): Promise<string> {
        throw new Error();
    }
}

export class GroupStrategyURITemplate implements RawGroupStrategyURITemplate {
    public type = 'URI template' as const;

    public constructor(public template: string, public collectionUri: RDF.NamedNode) { }


    public async getResourceURI(resourceStore: RdfStore): Promise<string> {
        const {parseTemplate} = await import('url-template');
        type PrimitiveValue = string | number | boolean | null;

        const expansionContext: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>> = {};

        resourceStore.getQuads().forEach(quad => {
            expansionContext[encodeURIComponent(quad.predicate.value)] = quad.object.value;
        });

        return this.collectionUri.value + parseTemplate(this.template).expand(expansionContext);
    }
}


export class GroupStrategyURITemplateWithRegex implements RawGroupStrategyURITemplateWithRegex {
    public type = 'URI template with REGEX' as const;

    public constructor(public template: string, public regexMatch: string, public regexReplace: string) { }

    public async getResourceURI(resourceStore: RdfStore): Promise<string> {
        const {parseTemplate} = await import('url-template');
        type PrimitiveValue = string | number | boolean | null;

        const expansionContext: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>> = {};

        resourceStore.getQuads().forEach(quad => {
            expansionContext[encodeURIComponent(quad.predicate.value)] = quad.object.value;
        });

        const rawRegex = parseTemplate(this.template).expand(expansionContext);

        return rawRegex.replaceAll(new RegExp(this.regexMatch), this.regexReplace);
    }
}

export type GroupStrategy = GroupStrategyURITemplate | GroupStrategySPARQLMap | GroupStrategyURITemplateWithRegex;
