export { frameOpenDoor, enterHall, passAlbum } from './entry-motion-v3.js?v=1';

export async function approachDesk(opening, stage, arrive) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    arrive();
    return;
  }

  const hall = stage.querySelector('.hall');
  const desk = stage.querySelector('.desk-composition');

  // Move the viewpoint in the direction of the invitation. Keep the
  // standing scholar, the seat and the table in the wide shot until the cut.
  const approachDuration = 540;
  opening.classList.add('is-approaching-desk');
  const approach = hall.animate([
    {transform: 'translateX(0%) scale(1)'},
    {transform: 'translateX(-2.4%) scale(1.14)'}
  ], {duration: approachDuration, easing: 'cubic-bezier(.38,.04,.76,.87)', fill: 'forwards'});

  // Cut to the seated scholar and carry the small rightward motion through.
  const settle = desk.animate([
    {opacity: 0, transform: 'translateX(1.25%) scale(1.025)', offset: 0, easing: 'step-end'},
    {opacity: 1, transform: 'translateX(1.25%) scale(1.025)', offset: .005, easing: 'cubic-bezier(.18,.62,.36,1)'},
    {opacity: 1, transform: 'translateX(0%) scale(1)', offset: 1}
  ], {delay: approachDuration, duration: 230, fill: 'both'});
  desk.style.transformOrigin = '75% 50%';

  try {
    await settle.finished;
    arrive();
  } finally {
    opening.classList.remove('is-approaching-desk');
    approach.cancel();
    settle.cancel();
    desk.style.removeProperty('transform-origin');
  }
}
