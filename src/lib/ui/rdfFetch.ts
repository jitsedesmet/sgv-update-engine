import {POD_MAP} from "$lib/ui/pods";

export type UiTriple = [{ str: string; href?: string }, { str: string; href?: string }, { str: string; href?: string }, boolean];

function compareTriples(a: [string, string, string], b: [string, string, string]): number {
  return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2].localeCompare(b[2]);
}

export async function dereferenceTriples(source: string | undefined, original?: Promise<UiTriple[]>): Promise<UiTriple[]> {
  // Let's fail the original first before actually doing a fetch again.
  const prev = original === undefined ? undefined : await original;
  if (!source) {
    return [];
  }
  const result = await fetch(new URL(source!), {headers: {'Accept': 'application/n-triples'}, cache: "no-cache"});
  const text = await result.text();
  // Split n-triples into triples of string
  const triples: [string, string, string][] = text
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => <[string, string, string]> (line.match(/^([^ ]+) ([^ ]+) (.*) \./)?.slice(1, 4) ?? ['fail', 'fail', 'fail']));

  // Sort triples
  const sorted = triples.sort(compareTriples);

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

  const hrefSeparated = pruneRepeats
    .map(triple => <UiTriple>[...triple.map(part => {
      if (part[0] === '<' && part[part.length - 1] === '>') {
        const href = part.slice(1, -1);
        let str = part;
        for (const [key, value] of Object.entries(POD_MAP)) {
          str = str.replace(key, value);
        }
        return {str, href};
      }
      return {str: part};
    }), false]);
  const diffMarked: UiTriple[] = [];
  if (prev === undefined) {
    return hrefSeparated;
  }
  // TODO: Support subject/ prefix omission!!!
  const precContained = new Set(prev.map(t => [t[0], t[1], t[2]].map(part => part.str).join(' ')));
  for (const [subj, pred, obj] of hrefSeparated) {
    const exists = precContained.has([subj.str, pred.str, obj.str].join(' '));
    diffMarked.push([subj, pred, obj, !exists]);
  }
  return diffMarked;
}