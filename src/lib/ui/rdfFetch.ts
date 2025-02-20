import {POD_MAP} from "$lib/ui/pods";

export type UiTriple = [{ str: string; href?: string }, { str: string; href?: string }, { str: string; href?: string }];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const sorted = triples
    .sort((a, b) =>
      a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2].localeCompare(b[2]));

  const pruneRepeats: [string, string, string][] = [];
  let focusSubj = undefined;
  let focusPred = undefined;
  for (const [subj, pred, obj] of sorted) {
    if (subj === focusSubj && pred === focusPred) {
      pruneRepeats.push(['', '', obj]);
    } else if (subj === focusSubj) {
      pruneRepeats.push(['', pred, obj]);
      focusPred = pred;
    } else {
      pruneRepeats.push([subj, pred, obj]);
      focusSubj = subj;
      focusPred = pred;
    }
  }

  return pruneRepeats
    .map(triple => <UiTriple>triple.map(part => {
      if (part[0] === '<' && part[part.length - 1] === '>') {
        const href = part.slice(1, -1);
        let str = part;
        for (const [key, value] of Object.entries(POD_MAP)) {
          str = str.replace(key, value);
        }
        return {str, href};
      }
      return {str: part};
    }));
}