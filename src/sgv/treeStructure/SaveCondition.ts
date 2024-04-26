import type * as RDF from '@rdfjs/types';
import {RootedCanonicalCollection} from './StructuredCollection';
import {RdfStore} from 'rdf-stores';
import {UpdateCondition} from './UpdateCondition';

export enum SaveConditionType {
    STATE_REQUIRED = 'state required',
    ALWAYS_STORED = 'always stored',
    PREFER_OTHER = 'prefer other',
    PREFER_MOST_SPECIFIC = 'prefer most specific',
    ONLY_STORED_WHEN_NOT_REDUNDANT = 'only stored when not redundant',
    NEVER_STORED = 'never stored',
}

/**
 * @deprecated
 */
export interface RawSaveConditionStateRequired {
    type: SaveConditionType.STATE_REQUIRED;
    sparqlQuery: string;
}

export interface RawSaveConditionAlwaysStored {
    type: SaveConditionType.ALWAYS_STORED;
}

export interface RawSaveConditionPreferOther {
    type: SaveConditionType.PREFER_OTHER;
    preferredCollections: RDF.NamedNode[];
}

/**
 * @deprecated
 */
export interface RawSaveConditionPreferMostSpecific {
    type: SaveConditionType.PREFER_MOST_SPECIFIC;
}

/**
 * @deprecated
 */
export interface RawSaveConditionOnlyStoredWhenNotRedundant {
    type: SaveConditionType.ONLY_STORED_WHEN_NOT_REDUNDANT;
}

/**
 * @deprecated
 */
export interface RawSaveConditionNeverStored {
    type: SaveConditionType.NEVER_STORED;
}

export abstract class SaveCondition {
    public abstract type: SaveConditionType;
    public constructor(public updateCondition: UpdateCondition) {}

    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[], resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean {
        throw new Error(`Save condition of type ${this.type} is deprecated.
        We can not check if we would save given the competitors ${competitors.toString()} and store:
        ${resourceStore.getQuads().toString()} on base ${baseResource.value}.`);
    }
}

/**
 * @deprecated
 */
export class SaveConditionStateRequired extends SaveCondition implements RawSaveConditionStateRequired {
    public type = SaveConditionType.STATE_REQUIRED as const;
    public constructor(updateCondition: UpdateCondition, public sparqlQuery: string) {
        super(updateCondition);
    }
}

export class SaveConditionAlwaysStored extends SaveCondition implements RawSaveConditionAlwaysStored {
    public type = SaveConditionType.ALWAYS_STORED as const;
    public wantsGivenCompetitors(): boolean {
        return true;
    }
}

export class SaveConditionPreferOther extends SaveCondition implements RawSaveConditionPreferOther {
    public type = SaveConditionType.PREFER_OTHER as const;
    public constructor(updateCondition: UpdateCondition, public preferredCollections: RDF.NamedNode[]) {
        super(updateCondition);
    }
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
export class SaveConditionPreferMostSpecific extends SaveCondition implements RawSaveConditionPreferMostSpecific {
    public type = SaveConditionType.PREFER_MOST_SPECIFIC as const;
}

export class SaveConditionOnlyStoredWhenNotRedundant extends SaveCondition implements RawSaveConditionOnlyStoredWhenNotRedundant {
    public type = SaveConditionType.ONLY_STORED_WHEN_NOT_REDUNDANT as const;
    public wantsGivenCompetitors(competitors: RootedCanonicalCollection[], resourceStore: RdfStore, baseResource: RDF.NamedNode): boolean {
        let othersSeenThatWantToStore = false;
        for (const competitor of competitors.flatMap(x => x.saveConditions)) {
            if (competitor.type === SaveConditionType.ALWAYS_STORED ||
                competitor.type === SaveConditionType.PREFER_OTHER ||
                competitor.type === SaveConditionType.PREFER_MOST_SPECIFIC) {
                othersSeenThatWantToStore = competitor.updateCondition.resourceDescription
                    .resourceMatchesDescription(resourceStore, baseResource);
            }
        }
        return othersSeenThatWantToStore;
    }
}

export class SaveConditionNeverStored extends SaveCondition implements RawSaveConditionNeverStored {
    public type = SaveConditionType.NEVER_STORED as const;
    public wantsGivenCompetitors(): boolean {
        return false;
    }
}
