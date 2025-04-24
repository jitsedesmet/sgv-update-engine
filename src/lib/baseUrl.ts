export const podBaseUrl = 'http://localhost:3000/';

export const prefixes: Record<string, string> = {
  ['http://www.w3.org/1999/02/22-rdf-syntax-ns#']: 'rdf:',
  ['http://www.w3.org/ns/ldp#']: 'ldp:',
  ['http://www.w3.org/2001/XMLSchema#']: 'xsd:',
  ['http://www.w3.org/2000/01/rdf-schema#']: 'rdfs:',
  ['http://www.w3.org/ns/posix/stat#']: 'stat:',
  ['http://purl.org/dc/terms/']: 'dc:',
  [`${podBaseUrl}www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/`]: 'ldbc-voc:',
  [`${podBaseUrl}www.ldbc.eu/ldbc_socialnet/1.0/tag/`]: 'ldbc-tag:',
  [`${podBaseUrl}pods/00000000000000000065/`]: 'pod-by-creation:',
  [`${podBaseUrl}pods/00000000000000000150/`]: 'pod-by-location:',
  [`${podBaseUrl}pods/00000000000000000143/`]: 'pod-separate:',
  [`${podBaseUrl}pods/00000000000000000094/`]: 'pod-together:',
}