/**
 * Supersets — two or more exercises performed back to back, without rest
 * in between.
 *
 * A superset is stored as a shared id on the exercises themselves (`ss`),
 * not as a container that holds them. That matters: the exercise list stays
 * a flat array, so reordering, removing, swapping and every index-based
 * `data-ex` handler keep working untouched. A nested structure would have
 * meant rewriting all of them.
 *
 * Membership is *a shared id plus adjacency*. Two exercises belong to the
 * same superset only if they carry the same id AND sit next to each other
 * in the list. Drag a third exercise between them and the pair splits on
 * its own — there is no stale grouping left behind to clean up, and
 * dragging the intruder back out restores the pair.
 *
 * A run of one is not a superset, so it renders as an ordinary exercise.
 */

/** A, B, C… identify groups within a session; the id itself is internal. */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let counter = 0;

/** Unique enough: ids only ever need to be distinct within one session. */
export function newGroupId() {
  counter += 1;
  return `ss${Date.now().toString(36)}${counter.toString(36)}`;
}

/** Every maximal run of adjacent exercises sharing an id, singles included. */
function rawRuns(exercises = []) {
  const runs = [];
  let current = null;

  exercises.forEach((ex, i) => {
    if (!ex?.ss) {
      current = null;
      return;
    }
    if (current && current.id === ex.ss) {
      current.end = i;
      current.size += 1;
      return;
    }
    current = { id: ex.ss, start: i, end: i, size: 1 };
    runs.push(current);
  });

  return runs;
}

/** The runs that are actually supersets — two or more exercises. */
export function supersetRuns(exercises = []) {
  return rawRuns(exercises).filter((run) => run.size > 1);
}

/**
 * Per-exercise superset annotation, indexed alongside the exercise list so
 * a renderer can look up position `i` without re-deriving the grouping.
 *
 * @returns {(null|{label:string,group:string,size:number,first:boolean,last:boolean,start:number,end:number})[]}
 */
export function supersetInfo(exercises = []) {
  const info = exercises.map(() => null);

  supersetRuns(exercises).forEach((run, groupIndex) => {
    const group = LETTERS[groupIndex % LETTERS.length];
    for (let i = run.start; i <= run.end; i += 1) {
      info[i] = {
        label: `${group}${i - run.start + 1}`,
        group,
        size: run.size,
        first: i === run.start,
        last: i === run.end,
        start: run.start,
        end: run.end,
      };
    }
  });

  return info;
}

/** An exercise on its own carrying an id is not in a superset — drop it. */
function pruneSingletons(exercises) {
  rawRuns(exercises).forEach((run) => {
    if (run.size === 1) delete exercises[run.start].ss;
  });
}

/** Can exercise `index` be joined to the one below it? */
export function canLinkDown(exercises = [], index) {
  const next = exercises[index + 1];
  if (!next) return false;
  return !(exercises[index]?.ss && exercises[index].ss === next.ss);
}

/**
 * Join an exercise to the one below it.
 *
 * Extending an existing group is preferred to starting a new one, so
 * linking down a chain of three ends with one superset of three rather
 * than a pair plus an orphan.
 */
export function linkDown(exercises, index) {
  const here = exercises[index];
  const next = exercises[index + 1];
  if (!here || !next) return;

  const info = supersetInfo(exercises);
  const id =
    (info[index + 1]?.first && next.ss) || // next already leads a group — join it
    (info[index]?.last && here.ss) || // this one ends a group — extend it
    newGroupId();

  here.ss = id;
  next.ss = id;
}

/**
 * Take one exercise out of its superset.
 *
 * Whatever followed it is re-issued a fresh id, so the two halves cannot
 * silently re-merge if the exercise between them is later moved away.
 */
export function unlinkAt(exercises, index) {
  const at = supersetInfo(exercises)[index];
  if (!at) return;

  const tailId = newGroupId();
  for (let i = index + 1; i <= at.end; i += 1) exercises[i].ss = tailId;
  delete exercises[index].ss;

  pruneSingletons(exercises);
}

/** Drop any grouping left dangling after a removal. */
export function tidy(exercises) {
  pruneSingletons(exercises);
}
