import type * as RDF from '@rdfjs/types';
import {RootedCanonicalCollection} from "./StructuredCollection";

/**
 * @deprecated
 */
export interface RawSaveConditionStateRequired {
    type: "state required";
    sparqlQuery: string;
}

export interface RawSaveConditionAlwaysStored {
    type: "always stored";
}

export interface RawSaveConditionPreferOther {
    type: "prefer other";
    preferredCollections: (RDF.NamedNode | RDF.BlankNode)[];
}

/**
 * @deprecated
 */
export interface RawSaveConditionPreferMostSpecific {
    type: "prefer most specific";
}

export interface RawSaveConditionOnlyStoredWhenNotRedundant {
    type: "only stored when not redundant";
}

export interface RawSaveConditionNeverStored {
    type: "never stored";
}

/**
 * @deprecated
 */
export class SaveConditionStateRequired implements RawSaveConditionStateRequired {
    public type: "state required" = "state required";
    public constructor(public sparqlQuery: string) { }
    public wantsGivenCompetitors(competitors: SaveCondition[]): boolean {
        throw new Error();
    }
}

export class SaveConditionAlwaysStored implements RawSaveConditionAlwaysStored {
    public type: "always stored" = "always stored";
    public constructor() { }
    public wantsGivenCompetitors(competitors: SaveCondition[]): boolean {
        return true;
    }
}

export class SaveConditionPreferOther implements RawSaveConditionPreferOther {
    public type: "prefer other" = "prefer other";
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
    public type: "prefer most specific" = "prefer most specific";
    public constructor() {}
    public wantsGivenCompetitors(competitors: SaveCondition[]): boolean {
        throw new Error();
    }
}

export class SaveConditionOnlyStoredWhenNotRedundant implements RawSaveConditionOnlyStoredWhenNotRedundant {
    public type: "only stored when not redundant" = "only stored when not redundant";
    public constructor() { }
    public wantsGivenCompetitors(competitors: SaveCondition[]): boolean {
        let othersSeenThatWantToStore = false;

        for (const competitor of competitors) {
            if (competitor.type === "always stored" || competitor.type === "prefer other" || competitor.type === "prefer most specific") {
                othersSeenThatWantToStore = true;
            }

        }

        return othersSeenThatWantToStore;
    }
}

export class SaveConditionNeverStored implements RawSaveConditionNeverStored {
    public type: "never stored" = "never stored";
    public constructor() { }
    public wantsGivenCompetitors(competitors: SaveCondition[]): boolean {
        return false;
    }
}


export type SaveCondition = SaveConditionStateRequired
    | SaveConditionAlwaysStored
    | SaveConditionNeverStored
    | SaveConditionOnlyStoredWhenNotRedundant
    | SaveConditionPreferMostSpecific
    | SaveConditionPreferOther;
