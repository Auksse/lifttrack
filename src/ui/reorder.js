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

    const cards = cardsIn(container);
    drag = {
      handle,
      card,
      container,
      scroller: document.getElementById('content'),
      cards,
      from: cards.indexOf(card),
      to: cards.indexOf(card),
      startY: event.clientY,
      // Geometry is captured once: reading it during the drag would
      // measure the transformed positions and feed back on itself.
      rects: cards.map((el) => el.getBoundingClientRect()),
      height: card.getBoundingClientRect().height,
      moved: false,
      raf: null,
      edge: 0,
    };
    handle.setPointerCapture?.(event.pointerId);
  }

  function move(event) {
    if (!drag) return;

    const dy = event.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.abs(dy) < THRESHOLD) return;
      drag.moved = true;
      drag.card.classList.add('is-dragging');
      // Suppress the click that would otherwise land on release.
      drag.container.classList.add('is-reordering');
    }

    // The drag owns the gesture from here; without this the page scrolls
    // under the finger instead of the card following it.
    event.preventDefault();

    drag.card.style.transform = `translateY(${dy}px)`;

    // Where the lifted card's midpoint now sits decides its index.
    const midpoint = drag.rects[drag.from].top + drag.rects[drag.from].height / 2 + dy;
    let target = drag.from;
    drag.rects.forEach((rect, i) => {
      if (i === drag.from) return;
      const centre = rect.top + rect.height / 2;
      if (dy > 0 && centre < midpoint) target = Math.max(target, i);
      if (dy < 0 && centre > midpoint) target = Math.min(target, i);
    });

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
      drag.rects = drag.rects.map((r) => ({ ...r, top: r.top - scrolled }));
      drag.startY -= scrolled;
    }
    drag.raf = requestAnimationFrame(autoScroll);
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
  document.addEventListener('pointercancel', end);
}
