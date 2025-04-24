import {prefixes} from "$lib/baseUrl";

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
        for (const [long, short] of Object.entries(prefixes)) {
          const replaced = str.replace(long, short);
          if (str !== replaced) {
            str = replaced.slice(1, -1);
            break;
          }
        }
        return {str, href};
      } else if (part.match(/^".*"\^\^<.*>$/)) {
        const match = part.match(/^"(.*)"\^\^<(.*)>$/);
        if (match) {
          const [val, type] = match.slice(1, 3);
          for (const [long, short] of Object.entries(prefixes)) {
            const replaced = type.replace(long, short);
            if (type !== replaced) {
              return { str: `"${val}"^^${replaced}` };
            }
          }
        }
      }
      return {str: part};
    }), false]);
  const diffMarked: UiTriple[] = [];
  if (prev === undefined) {
    return hrefSeparated;
  }
  const prevContained = new Set();
  for (const [subj, pred, obj] of prev) {
    if (subj.str !== '') {
      focusSubj = subj.str;
    }
    if (pred.str !== '') {
      focusPred = pred.str;
    }
    prevContained.add([focusSubj, focusPred, obj.str].join(' '));
  }
  for (const [subj, pred, obj] of hrefSeparated) {
    if (subj.str !== '') {
      focusSubj = subj.str;
    }
    if (pred.str !== '') {
      focusPred = pred.str;
    }
    const exists = prevContained.has([focusSubj, focusPred, obj.str].join(' '));
    diffMarked.push([subj, pred, obj, !exists]);
  }
  return diffMarked;
}