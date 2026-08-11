/**
 * Drag-to-reorder for the exercise cards in an active workout.
 *
 * Built on pointer events rather than HTML5 drag-and-drop, which iOS
 * Safari does not fire for touch at all — the whole feature would be
 * invisible on the one device this app is for.
 *
 * How it works: pressing the grip lifts its card out of flow visually
 * (transform only — the DOM is not touched during the drag), and the
 * cards it passes slide up or down by the lifted card's height to open a
 * gap. On release the new order is handed back through `onDrop`, the app
 * re-renders from state, and every transform is discarded.
 *
 * Nothing is mutated until the drop, so an aborted drag — a cancelled
 * pointer, a phone call, a stray palm — leaves the workout untouched.
 */

/** Pixels of movement before a press becomes a drag rather than a tap. */
const THRESHOLD = 6;
/** Distance from the scroller's edge at which dragging starts scrolling. */
const EDGE = 64;
const EDGE_SPEED = 10;

export function installReorder({ onDrop }) {
  let drag = null;

  function cardsIn(container) {
    return [...container.querySelectorAll('[data-card-ex]')];
  }

  function start(event) {
    const handle = event.target.closest('[data-drag-handle]');
    if (!handle) return;

    const card = handle.closest('[data-card-ex]');
    const container = card?.parentElement;
    if (!card || !container) return;

    drag = {
      handle,
      card,
      container,
      scroller: document.getElementById('content'),
      cards: [],
      from: -1,
      to: -1,
      startY: event.clientY,
      rects: [],
      height: 0,
      moved: false,
      raf: null,
      edge: 0,
    };
    handle.setPointerCapture?.(event.pointerId);
  }

  /**
   * Commit to a drag: collapse the list, then measure.
   *
   * Expanded cards are tall — five exercises with their sets showing run
   * well past a phone screen — so moving one a few places meant a long
   * drag against the auto-scroll, which is tedious and imprecise. For the
   * duration of the drag every card shrinks to its header, so the whole
   * session usually fits on screen and a reorder is a short flick.
   *
   * Geometry is captured here rather than at pointerdown because it has
   * to be measured *after* the collapse, and only once: reading it during
   * the drag would measure the transformed positions and feed back on
   * itself.
   */
  function beginDrag(event) {
    const before = drag.card.getBoundingClientRect().top;
    drag.container.classList.add('is-reordering');

    // Collapsing removes height above the grabbed card, which would yank
    // it out from under the finger. Scrolling by the same amount holds it
    // still; at the top of the list there may be nothing left to give, and
    // the residual jump is unavoidable.
    const shift = drag.card.getBoundingClientRect().top - before;
    if (shift && drag.scroller) drag.scroller.scrollTop += shift;

    drag.cards = cardsIn(drag.container);
    // Plain objects, not DOMRects: auto-scroll shifts these as the list
    // moves, and a DOMRect's derived `bottom` would not follow.
    drag.rects = drag.cards.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    });
    drag.from = drag.cards.indexOf(drag.card);
    drag.to = drag.from;
    drag.height = drag.rects[drag.from].height;
    drag.startY = event.clientY;
    drag.moved = true;
    drag.card.classList.add('is-dragging');
  }

  function move(event) {
    if (!drag) return;

    if (!drag.moved) {
      if (Math.abs(event.clientY - drag.startY) < THRESHOLD) return;
      beginDrag(event);
    }

    const dy = event.clientY - drag.startY;

    // The drag owns the gesture from here; without this the page scrolls
    // under the finger instead of the card following it.
    event.preventDefault();

    drag.card.style.transform = `translateY(${dy}px)`;

    const target = slotUnder(event.clientY);
    if (target !== drag.to) {
      drag.to = target;
      shiftOthers();
    }

    // Auto-scroll near the edges so a card can travel further than one
    // screenful — a six-exercise session does not fit in the viewport.
    const box = drag.scroller?.getBoundingClientRect();
    drag.edge = 0;
    if (box) {
      if (event.clientY < box.top + EDGE) drag.edge = -EDGE_SPEED;
      else if (event.clientY > box.bottom - EDGE) drag.edge = EDGE_SPEED;
    }
    if (drag.edge && drag.raf === null) autoScroll();
  }

  function autoScroll() {
    if (!drag) return;
    if (!drag.edge) { drag.raf = null; return; }

    /**
     * Compensate by what actually scrolled, not by what was requested.
     *
     * At either end of the list `scrollTop` refuses to move, and assuming
     * it did shifted the captured geometry every frame against a finger
     * that had not moved. Holding a card near the top — exactly what you
     * do when dragging an exercise to the front — cancelled out the whole
     * drag distance and the drop became a no-op.
     */
    const before = drag.scroller.scrollTop;
    drag.scroller.scrollTop += drag.edge;
    const scrolled = drag.scroller.scrollTop - before;

    if (scrolled) {
      drag.rects = drag.rects.map((r) => ({
        ...r,
        top: r.top - scrolled,
        bottom: r.bottom - scrolled,
      }));
      drag.startY -= scrolled;
    }
    drag.raf = requestAnimationFrame(autoScroll);
  }

  /**
   * The slot the finger is over.
   *
   * This replaces working out where the *lifted card's midpoint* had got
   * to, which needed the card to travel more than half its own height
   * past a neighbour's centre before anything happened — so a long drag
   * could still register no change and the card sprang back. Reading the
   * finger against the original slot grid means wherever you point is
   * where it goes, and it clamps at both ends so overshooting the top or
   * bottom of the list still lands.
   */
  function slotUnder(clientY) {
    const { rects } = drag;
    const last = rects.length - 1;

    if (clientY <= rects[0].top) return 0;
    if (clientY >= rects[last].bottom) return last;

    for (let i = 0; i <= last; i += 1) {
      if (clientY >= rects[i].top && clientY < rects[i].bottom) return i;
    }
    // Between two rows: hold the slot rather than flickering back.
    return drag.to;
  }

  function shiftOthers() {
    drag.cards.forEach((el, i) => {
      if (i === drag.from) return;
      let offset = 0;
      if (drag.to > drag.from && i > drag.from && i <= drag.to) offset = -drag.height;
      if (drag.to < drag.from && i >= drag.to && i < drag.from) offset = drag.height;
      el.style.transform = offset ? `translateY(${offset}px)` : '';
    });
  }

  function end() {
    if (!drag) return;
    const { from, to, moved, cards, container, raf } = drag;
    if (raf !== null) cancelAnimationFrame(raf);

    cards.forEach((el) => {
      el.style.transform = '';
      el.classList.remove('is-dragging');
    });
    drag = null;

    // A click fires after pointerup; let it pass before re-enabling taps.
    setTimeout(() => container.classList.remove('is-reordering'), 0);

    if (moved && from !== to) onDrop(from, to);
  }

  document.addEventListener('pointerdown', start);
  // Non-passive: move() calls preventDefault to keep the page from
  // scrolling while a card is being dragged.
  document.addEventListener('pointermove', move, { passive: false });
  document.addEventListener('pointerup', end);
  /**
   * A cancelled pointer commits rather than reverts.
   *
   * iOS fires pointercancel when it decides the gesture belongs to
   * something else — the browser reclaiming a scroll, a palm landing, an
   * interruption. Treating that as "never happened" is why a long drag
   * could end with the card back where it started: the move was
   * understood, then thrown away. Keeping the last slot is closer to what
   * the hand meant, and a wrong order is one drag to fix.
   */
  document.addEventListener('pointercancel', end);
}
