import {page} from "$app/state";

export const POD = {
  BY_CREATION: 'http://localhost:3000/pods/00000000000000000065/',
  BY_LOCATION: 'http://localhost:3000/pods/00000000000000000150/',
  SEPARATE: 'http://localhost:3000/pods/00000000000000000143/',
  TOGETHER: 'http://localhost:3000/pods/00000000000000000094/'
}

export const POD_MAP = {
  ['http://localhost:3000/pods/00000000000000000065/']: 'pods/by-creation/',
  ['http://localhost:3000/pods/00000000000000000150/']: 'pods/by-location/',
  ['http://localhost:3000/pods/00000000000000000143/']: 'pods/separate/',
  ['http://localhost:3000/pods/00000000000000000094/']: 'pods/together/',
}

export const demoQueries = [{
  name: 'Insert Post',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix card: <http://localhost:3000/pods/00000000000000000096/profile/card#>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
PREFIX resource: <http://localhost:3000/dbpedia.org/resource/>

INSERT DATA {
  <> a ns1:Post ;
    ns1:browserUsed "Chrome" ;
    ns1:content "Let's go ESWC!" ;
    ns1:creationDate "2024-05-26T07:23:56.83Z"^^xsd:dateTime ;
    ns1:id "416608218494388"^^xsd:long ;
    ns1:hasCreator card:me ;
    ns1:hasTag tag:Semantic_Web, tag:Portorož ;
    ns1:isLocatedIn resource:Slovenia ;
    ns1:locationIP "1.83.28.23" .
}`
}, {
  name: 'Change CreationDate',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

DELETE {
    ?id ns1:creationDate "2024-05-26T07:23:56.83Z"^^xsd:dateTime .
} INSERT {
    ?id ns1:creationDate "2025-06-01T07:23:56.83Z"^^xsd:dateTime .
} WHERE {
    ?id ns1:creationDate "2024-05-26T07:23:56.83Z"^^xsd:dateTime .
}
` }, {
  name: 'Insert Data Tag',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
# prefix res: <http://localhost:3000/pods/00000000000000000065/posts/2025-06-01#>
# prefix res: <http://localhost:3000/pods/00000000000000000150/posts/Slovenia#>
# prefix res: <http://localhost:3000/pods/00000000000000000143/posts/>
# prefix res: <http://localhost:3000/pods/00000000000000000094/posts#>

INSERT DATA {
    res:416608218494388  ns1:hasTag tag:Mountain .
}` }, {
  name: 'Illegal Append Id',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

INSERT {
    ?resource ns1:id "416608218494389"^^xsd:long ; .
} WHERE {
    ?resource ns1:id "416608218494388"^^xsd:long
}` }, {
  name: 'Delete Data Tag',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
# prefix res: <http://localhost:3000/pods/00000000000000000065/posts/2025-06-01#>
# prefix res: <http://localhost:3000/pods/00000000000000000150/posts/Slovenia#>
# prefix res: <http://localhost:3000/pods/00000000000000000143/posts/>
# prefix res: <http://localhost:3000/pods/00000000000000000094/posts#>

DELETE DATA {
    res:416608218494388 ns1:hasTag tag:Mountain .
}` }, {
  name: 'Remove Id (Illegal)',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

DELETE WHERE {
    ?resource ns1:id "416608218494388"^^xsd:long
}` }, {
  name: 'Delete tags',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

DELETE {
    ?resource ns1:hasTag ?tag ;
} WHERE {
    ?resource ns1:id "416608218494388"^^xsd:long ;
              ns1:hasTag ?tag ;
}` }, {
  name: 'Insert where Tag',
  query: `prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>

INSERT {
    ?resource ?p tag:High
} where {
    ?resource ?p tag:Mountain
}` }, {
  name: 'Delete Where Complete',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

DELETE WHERE {
    ?id ns1:creationDate "2025-06-01T07:23:56.83Z"^^xsd:dateTime ;
        ?p ?o ;
}` }, {
  name: 'Delete Data Complete',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix card: <http://localhost:3000/pods/00000000000000000096/profile/card#>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
PREFIX resource: <http://localhost:3000/dbpedia.org/resource/>
# prefix res: <http://localhost:3000/pods/00000000000000000065/posts/2024-05-26#>
# prefix res: <http://localhost:3000/pods/00000000000000000150/posts/Slovenia#>
# prefix res: <http://localhost:3000/pods/00000000000000000143/posts/>
# prefix res: <http://localhost:3000/pods/00000000000000000094/posts#>

DELETE DATA {
  res:416608218494388 a ns1:Post ;
    ns1:browserUsed "Chrome" ;
    ns1:content "Let's go ESWC!" ;
    ns1:creationDate "2024-05-26T07:23:56.83Z"^^xsd:dateTime ;
    ns1:id "416608218494388"^^xsd:long ;
    ns1:hasCreator card:me ;
    ns1:hasTag tag:Semantic_Web, tag:Portorož ;
    ns1:isLocatedIn resource:Slovenia ;
    ns1:locationIP "1.83.28.23" .
}`}
];