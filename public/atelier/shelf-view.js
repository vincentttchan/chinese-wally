// The coordinates follow the timber bays in the original desk illustration.
const slots = [
  [858, 274, 101, 22],
  [1002, 197, 141, 23],
  [1226, 143, 108, 24],
  [995, 327, 153, 24]
];
const portraitSlots = [slots[0], slots[1], [837, 148, 111, 23], slots[3]];
const artwork = {width: 1672, height: 941};
const camera = {x: .646, y: .219, scale: 3};
const portraitCamera = {x: .600, y: .282, scale: 3.8};
const artAspect = artwork.height / artwork.width;

function placeVolume(slot, [x, y, width, height], framing, portrait = false) {
  const prefix = portrait ? '--portrait-' : '--';
  const left = .5 + (x / artwork.width - framing.x) * framing.scale;
  const verticalOffset = (y / artwork.height - framing.y) * framing.scale * 100;
  const rollWidth = width / artwork.width * framing.scale * 100;
  const rollHeight = height / artwork.height * framing.scale * 100;
  const top = portrait
    ? 'calc(50% + ' + verticalOffset * artAspect + 'cqw)'
    : 50 + verticalOffset + '%';
  const pullY = portrait
    ? 'calc(-3cqh - (' + verticalOffset * artAspect + 'cqw))'
    : -3 - verticalOffset + 'cqh';

  slot.style.setProperty(prefix + 'slot-left', left * 100 + '%');
  slot.style.setProperty(prefix + 'slot-top', top);
  slot.style.setProperty(prefix + 'slot-width', rollWidth + '%');
  slot.style.setProperty(prefix + 'slot-height', portrait ? rollHeight * artAspect + 'cqw' : rollHeight + 'cqh');
  slot.style.setProperty(prefix + 'pull-x', (50 - left * 100 - rollWidth / 2) + 'cqw');
  slot.style.setProperty(prefix + 'pull-y', pullY);
}

export function mountShelfView(opening, trigger, {canOpen, openView, closeView, volumes, reducedMotion}) {
  const view = opening.querySelector('.shelf-view');
  const back = view.querySelector('.shelf-back');
  const rack = view.querySelector('.shelf-volumes');
  let phase = 'closed';
  let timer;
  const delay = (callback, ms) => {
    clearTimeout(timer);
    timer = setTimeout(callback, reducedMotion.matches ? 0 : ms);
  };

  function reset() {
    clearTimeout(timer);
    phase = 'closed';
    view.hidden = true;
    view.inert = false;
    trigger.setAttribute('aria-expanded', 'false');
    opening.classList.remove('shelf-camera', 'shelf-arrived', 'shelf-extracting');
    rack.replaceChildren();
  }

  function drawVolumes() {
    rack.replaceChildren();
    volumes().forEach(({chapter, open, isNew}, index) => {
      const slot = document.createElement('div');
      slot.className = 'shelf-slot';
      placeVolume(slot, slots[index], camera);
      placeVolume(slot, portraitSlots[index], portraitCamera, true);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shelf-volume';
      button.classList.toggle('is-new', Boolean(isNew));
      button.setAttribute('aria-label', (isNew ? '抽取新卷' : '重訪') + '《' + chapter.title + '》');

      const roll = document.createElement('span');
      roll.className = 'shelf-roll';
      roll.setAttribute('aria-hidden', 'true');
      const tag = document.createElement('span');
      tag.className = 'shelf-tag';
      const title = document.createElement('span');
      title.textContent = chapter.title;
      const mark = document.createElement('span');
      mark.className = 'shelf-mark';
      mark.textContent = isNew ? '新卷' : '已藏';
      tag.append(title, mark);
      button.append(roll, tag);
      slot.append(button);
      rack.append(slot);
      button.addEventListener('click', () => {
        if (phase !== 'open') return;
        phase = 'extracting';
        slot.classList.add('is-picked');
        view.inert = true;
        opening.classList.add('shelf-extracting');
        delay(open, 660);
      });
    });
  }

  trigger.addEventListener('click', event => {
    if (phase !== 'closed' || !canOpen()) return;
    phase = 'approaching';
    drawVolumes();
    view.hidden = false;
    view.inert = true;
    trigger.setAttribute('aria-expanded', 'true');
    opening.classList.add('shelf-camera');
    openView();
    delay(() => {
      phase = 'open';
      opening.classList.add('shelf-arrived');
      view.inert = false;
      if (event.detail === 0) (rack.querySelector('.is-new') ?? back).focus({preventScroll: true});
    }, 680);
  });

  function returnToDesk() {
    if (phase !== 'open') return;
    phase = 'returning';
    view.inert = true;
    opening.classList.remove('shelf-arrived', 'shelf-camera');
    delay(() => {
      reset();
      closeView();
      trigger.focus({preventScroll: true});
    }, 680);
  }

  back.addEventListener('click', returnToDesk);
  opening.addEventListener('keydown', event => {
    if (event.key === 'Escape' && phase === 'open') {
      event.preventDefault();
      returnToDesk();
    }
  });
  return {
    reset,
    refresh: () => { trigger.hidden = volumes().every(volume => volume.isNew); }
  };
}
