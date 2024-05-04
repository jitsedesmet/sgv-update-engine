import {QueryEngine} from '@comunica/query-sparql-file';
import {ParsedSGV} from '../src/sgv/treeStructure/ParsedSGV';
import {OperationParser} from '../src/Operations/OperationParser';

export type Fn = () => void | Promise<void>;
export interface FnOptions {
    /**
     * An optional function that is run before iterations of this task begin
     */
    beforeAll?: () => void | Promise<void>;
    /**
     * An optional function that is run before each iteration of this task
     */
    beforeEach?: () => void | Promise<void>;
    /**
     * An optional function that is run after each iteration of this task
     */
    afterEach?: () => void | Promise<void>;
    /**
     * An optional function that is run after all iterations of this task end
     */
    afterAll?: () => void | Promise<void>;
}

export enum PodFragmentation {
    BY_CREATION_DATE = 'by creation date',
    ALL_IN_ONE_FILE = 'all in one file',
    OWN_FILE = 'own file',
    BY_CREATION_LOCATION = 'by creation location',
}

export interface Pod {
    host: string;
    sgv: ParsedSGV;
    updatedResource: (id: string) => string;
}

export interface Benchmarker {
    add: (title: string, fn: Fn, opts?: FnOptions) => void;
}

export function randomId(): number {
    return Math.floor(Math.random() * 1000000000000000);
}

export function data(id: string, url?: string): string {
    return `
        <${url ?? ''}> a <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/Post> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/browserUsed> "Chrome" ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/content> "I want to eat an apple while scavenging for mushrooms in the forest. The sun will be such a blessing." ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/creationDate> "2024-05-08T23:23:56.830000+00:00"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/id> "${id}"^^<http://www.w3.org/2001/XMLSchema#long> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/hasCreator> <http://localhost:3000/pods/00000000000000000096/profile/card#me> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/hasTag> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Alanis_Morissette>,
                <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/Austria> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/isLocatedIn> <http://localhost:3000/dbpedia.org/resource/China> ;
            <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/locationIP> "1.83.28.23" .
    `;
}

export async function insertResource(engine: QueryEngine, id: string, pod: string, parsedSgv: ParsedSGV) {
    const query = `
        INSERT DATA {
            ${data(id)}
        }
    `;

    await (await new OperationParser(engine, query).parse(parsedSgv)).handleOperation(pod);
}

export async function deleteResource(engine: QueryEngine, pod: string, resource: string, parsedSgv: ParsedSGV) {
    await engine.queryVoid(`
        DELETE WHERE {
            <${resource}> ?p ?o
        }
    `, {
        sources: [resource],
    });
}
