import {POD_MAP} from "$lib/ui/pods";

export type UiTriple = [{ str: string; href?: string }, { str: string; href?: string }, { str: string; href?: string }];

export async function dereferenceTriples(source: string | undefined): Promise<UiTriple[]> {
  if (!source) {
    return [];
  }
  const result = await fetch(new URL(source!), {headers: {'Accept': 'application/n-triples'}, cache: "no-cache"});
  const text = await result.text();
  const triples: [string, string, string][] = text
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => <[string, string, string]> (line.match(/^([^ ]+) ([^ ]+) (.*) \./)?.slice(1, 4) ?? ['fail', 'fail', 'fail']));

  return triples
    .map(triple => <UiTriple>triple.map(part => {
      if (part[0] === '<' && part[part.length - 1] === '>') {
        const href = '?source=' + encodeURIComponent(part.slice(1, -1));
        let str = part;
        for (const [key, value] of Object.entries(POD_MAP)) {
          str = str.replace(key, value);
        }
        return {str, href};
      }
      return {str: part};
    }));
}