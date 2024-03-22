/**
 * @deprecated
 */
export interface GroupStrategySPARQLMap {
    type: "SPARQL map";
    map: string;
}

export interface GroupStrategyURITemplate {
    type: "URI template";
    template: string;
}

/**
 * @deprecated
 */
export interface GroupStrategyURITemplateWithRegex {
    type: "URI template with REGEX";
    template: string;
    regex: string;
}

export type GroupStrategy = GroupStrategySPARQLMap | GroupStrategyURITemplate | GroupStrategyURITemplateWithRegex;
