import type * as RDF from '@rdfjs/types';
import {RootedCanonicalCollection} from './StructuredCollection';

/**
 * @deprecated
 */
export interface RawSaveConditionStateRequired {
    type: 'state required';
    sparqlQuery: string;
}

export interface RawSaveConditionAlwaysStored {
    type: 'always stored';
}

export interface RawSaveConditionPreferOther {
    type: 'prefer other';
    preferredCollections: (RDF.NamedNode | RDF.BlankNode)[];
}

/**
 * @deprecated
 */
export interface RawSaveConditionPreferMostSpecific {
    type: 'prefer most specific';
}

export interface RawSaveConditionOnlyStoredWhenNotRedundant {
    type: 'only stored when not redundant';
}

export interface RawSaveConditionNeverStored {
    type: 'never stored';
}

/**
 * @deprecated
 */
export class SaveConditionStateRequired implements RawSaveConditionStateRequired {
    public type = 'state required' as const;
    public constructor(public sparqlQuery: string) { }
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        throw new Error();
    }
}

export class SaveConditionAlwaysStored implements RawSaveConditionAlwaysStored {
    public type = 'always stored' as const;
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        return true;
    }
}

export class SaveConditionPreferOther implements RawSaveConditionPreferOther {
    public type = 'prefer other' as const;
    public constructor(public preferredCollections: (RDF.NamedNode | RDF.BlankNode)[]) { }
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        let competitorsPresent =  false;

        for (const competitor of competitors) {
            if (this.preferredCollections
                .some(preference => preference.equals(competitor.uri))) {
                competitorsPresent = true;
            }
        }

        return !competitorsPresent;
    }
}

/**
 * @deprecated
 */
export class SaveConditionPreferMostSpecific implements RawSaveConditionPreferMostSpecific {
    public type = 'prefer most specific' as const;
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        throw new Error();
    }
}

export class SaveConditionOnlyStoredWhenNotRedundant implements RawSaveConditionOnlyStoredWhenNotRedundant {
    public type = 'only stored when not redundant' as const;
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        let othersSeenThatWantToStore = false;

        for (const competitor of competitors.map(x => x.saveCondition)) {
            if (competitor.type === 'always stored' || competitor.type === 'prefer other' || competitor.type === 'prefer most specific') {
                othersSeenThatWantToStore = true;
            }

        }

        return othersSeenThatWantToStore;
    }
}

export class SaveConditionNeverStored implements RawSaveConditionNeverStored {
    public type = 'never stored' as const;
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[]): boolean {
        return false;
    }
}


export type SaveCondition = SaveConditionStateRequired
    | SaveConditionAlwaysStored
    | SaveConditionNeverStored
    | SaveConditionOnlyStoredWhenNotRedundant
    | SaveConditionPreferMostSpecific
    | SaveConditionPreferOther;
