export { passAlbum } from './camera-v6-no-column.js?v=1';

const ease = value => value * value * (3 - 2 * value);
const mix = (start, end, progress) => start + (end - start) * progress;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const between = (time, start, end) => ease(clamp((time - start) / (end - start), 0, 1));
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function animate(duration, draw) {
  draw(0);
  return new Promise(resolve => {
    let start;
    function frame(now) {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      draw(progress);
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function doorwayCamera(stage) {
  const shell = stage.querySelector('.threshold-camera');
  const aperture = stage.querySelector('.doorway');
  const view = stage.querySelector('.door-view');
  const leftLeaf = aperture.querySelector('.door-leaf.left');
  const rightLeaf = aperture.querySelector('.door-leaf.right');

  return (progress, joinEdges = false) => {
    const {width, height, left, top} = stage.getBoundingClientRect();
    if (!(width && height)) return;
    const scale = mix(1, 4.6, progress);
    const shift = -.1075 * width * (scale - 1 + progress);
    shell.style.transform = `translateX(${shift}px) scale(${scale})`;
    const rect = aperture.getBoundingClientRect();
    const openingX = rect.left - left;
    const openingY = rect.top - top;
    const hallLeft = (width - 2 * height) / 2;
    const visibleLeft = Math.max(hallLeft, openingX);
    const visibleRight = Math.min(width - hallLeft, openingX + rect.width);
    const visibleTop = Math.max(0, openingY);
    const visibleBottom = Math.min(height, openingY + rect.height);

    // The door reveals the settled room. The interior has a small push
    // towards the lamp, independent of the stronger motion of the doorframe.
    const hallHeight = Math.min(height, Math.max(
      mix(.94, 1, progress) * height,
      visibleBottom - visibleTop,
      (visibleRight - visibleLeft) / 2
    ));
    const hallWidth = 2 * hallHeight;
    const heightChange = height - hallHeight;
    const roomX = clamp(hallLeft + 1.23 * heightChange, visibleRight - hallWidth, visibleLeft);
    const roomY = clamp(.47 * heightChange, visibleBottom - hallHeight, visibleTop);
    view.style.backgroundSize = `${hallWidth / scale}px ${hallHeight / scale}px`;
    view.style.backgroundPosition = `${(roomX - openingX) / scale}px ${(roomY - openingY) / scale}px`;

    if (joinEdges) {
      // The indoor painting includes open door edges. Exchange the foreground
      // and painted edges while each pair is still adjacent at the sides.
      const leftEdge = roomX + .108 * hallWidth;
      const rightEdge = roomX + .902 * hallWidth;
      const outside = Math.min(
        leftEdge - (leftLeaf.getBoundingClientRect().right - left),
        rightLeaf.getBoundingClientRect().left - left - rightEdge
      );
      shell.style.opacity = String(1 - between(outside / width, -.033, .013));
    }
  };
}

export function frameOpenDoor(stage) {
  doorwayCamera(stage)(0);
}

export async function enterHall(opening, stage, arrive) {
  if (reduce()) { arrive(); return; }
  const draw = doorwayCamera(stage);
  opening.classList.add('entering-hall');
  await animate(1100, time => draw(ease(time), true));
  // On this frame the live aperture and the hall use identical artwork
  // and coordinates. Commit the hall before dropping the entry styling.
  arrive();
  opening.classList.remove('entering-hall');
  stage.querySelector('.threshold-camera').style.removeProperty('opacity');
}

// Book spine and width in the 2:1 coordinate plane of each painting.
const hallBook = {x: .512, y: .536, width: .085};
const deskBook = {x: .469, y: .771, width: .400};
const closeScale = 1.23;

function alignBook(element, book, target, plane, scale) {
  const x = (target.x - book.x) * plane.width;
  const y = (target.y - book.y) * plane.height;
  element.style.transformOrigin = `${book.x * 100}% ${book.y * 100}%`;
  element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

export async function approachDesk(opening, stage, arrive) {
  if (reduce()) { arrive(); return; }

  const hall = stage.querySelector('.hall');
  const desk = stage.querySelector('.desk-composition');
  const focusPoint = {x: .5, y: .731};
  const hallScale = closeScale * deskBook.width / hallBook.width;
  opening.classList.add('is-approaching-desk');
  await animate(1560, time => {
    const {width, height} = stage.getBoundingClientRect();
    // These paintings share the same native 2:1 artboard.
    const plane = {width: 2 * height || width, height};
    const approach = between(time, 0, .65);
    const dissolve = between(time, .63, .79);
    const settle = between(time, .77, 1);

    alignBook(hall, hallBook, {
      x: mix(hallBook.x, focusPoint.x, approach),
      y: mix(hallBook.y, focusPoint.y, approach)
    }, plane, 1 + (hallScale - 1) * approach);

    alignBook(desk, deskBook, {
      x: mix(focusPoint.x, deskBook.x, settle),
      y: mix(focusPoint.y, deskBook.y, settle)
    }, plane, mix(closeScale, 1, settle));
    desk.style.opacity = String(dissolve);

    // Soften the different room perspectives at the edges as the book
    // stays sharp and registered across both views.
    const focus = between(time, .47, .66) * (1 - between(time, .75, .95));
    stage.style.setProperty('--desk-defocus', `${focus * 13}px`);
    stage.style.setProperty('--desk-focus-opacity', String(focus));
  });

  arrive();
  opening.classList.remove('is-approaching-desk');
  for (const shot of [hall, desk]) {
    shot.style.removeProperty('transform');
    shot.style.removeProperty('transform-origin');
  }
  desk.style.removeProperty('opacity');
  stage.style.removeProperty('--desk-defocus');
  stage.style.removeProperty('--desk-focus-opacity');
}
