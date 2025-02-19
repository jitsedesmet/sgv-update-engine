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
    ns1:content
      "I want to eat an apple." ;
    ns1:creationDate
    "2024-05-08T23:23:56.83Z"^^xsd:dateTime ;
    ns1:id "416608218494388"^^xsd:long ;
    ns1:hasCreator card:me ;
    ns1:hasTag tag:Alanis_Morissette, tag:Austria ;
    ns1:isLocatedIn resource:China ;
    ns1:locationIP "1.83.28.23" .
}`
}, {
  name: 'Change CreationDate',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#>

DELETE {
    ?id ns1:creationDate   "2024-05-08T23:23:56.83Z"^^xsd:dateTime .
} INSERT {
    ?id ns1:creationDate "2024-06-20T23:23:56.83Z"^^xsd:dateTime .
} where {
    BIND(res:416608218494388 as ?id)
}
` }, {
  name: 'append tag',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

INSERT DATA {
    res:416608218494388  ns1:hasTag tag:Mountain .
}` }, {
  name: 'illegal Append Id',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#>

INSERT DATA {
    res:416608218494388 ns1:id "416608218494389"^^xsd:long ; .
}` }, {
  name: 'Delete Data Tag',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

DELETE DATA {
    res:416608218494388 ns1:hasTag tag:Mountain .
}` }, {
  name: 'Remove Id (Illegal)',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

DELETE DATA {
    res:416608218494388 ns1:id "416608218494388"^^xsd:long ; .
}` }, {
  name: 'Delete tags',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

DELETE {
    res:416608218494388 ns1:hasTag ?x
} where {
    res:416608218494388 ns1:hasTag ?x
}` }, {
  name: 'Append Tag',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

INSERT DATA {
    res:416608218494388  ns1:hasTag tag:Mountain .
}` }, {
  name: 'Insert where Tag',
  query: `prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

INSERT {
    res:416608218494388 ?p tag:High
} where {
    res:416608218494388 ?p tag:Mountain
}` }, {
  name: 'Delete Where Complete',
  query: `prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-06-20#>

DELETE WHERE {
  res:416608218494388 ?p ?o
}` }, {
  name: 'Delete Data Complete',
  query: `prefix ns1: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix card: <http://localhost:3000/pods/00000000000000000096/profile/card#>
prefix tag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
prefix resource: <http://localhost:3000/dbpedia.org/resource/>
prefix res: <http://localhost:3000/pods/00000000000000000096/posts/2024-05-08#>

DELETE DATA {
    res:416608218494388
        a ns1:Post ;
        ns1:browserUsed "Chrome" ;
        ns1:content
            "I want to eat an apple." ;
        ns1:creationDate
            "2024-05-08T23:23:56.83Z"^^xsd:dateTime ;
        ns1:id "416608218494388"^^xsd:long ;
        ns1:hasCreator card:me ;
        ns1:hasTag tag:Alanis_Morissette, tag:Austria ;
        ns1:isLocatedIn resource:China ;
        ns1:locationIP "1.83.28.23" .
}`}
];