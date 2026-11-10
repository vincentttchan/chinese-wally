const compositions = {
  wide: {
    size: [2172, 724],
    lamp: [.454, .235, .035, .155],
    door: [.495, .146, .180, .690],
    title: [.30, .37],
    book: [.35, .60, .23, .23],
    seal: [.568, .652, .032, .154],
    archive: [.367, .690, .198, .14],
    impression: [.401, .727, .027, .081],
    cabinet: [.754, .10, .084, .48],
    rolls: [.169, .264, .358, .518].map(y => [.774, y, .057, .057]),
    shelfCenter: [.80, .32]
  },
  portrait: {
    size: [852, 1847],
    lamp: [.364, .431, .077, .058],
    door: [.445, .380, .437, .335],
    title: [.24, .17],
    book: [.14, .525, .58, .089],
    seal: [.70, .550, .075, .067],
    archive: [.177, .580, .51, .064],
    impression: [.28, .601, .086, .040],
    cabinet: [.66, .164, .18, .17],
    rolls: [.186, .227, .268, .307].map(y => [.672, y, .15, .035]),
    shelfCenter: [.75, .25]
  }
};

function asset(mode, scene) {
  return new URL('assets/' + scene + '-' + mode + '-v2.jpg', import.meta.url).href;
}

function position(element, [x, y, width, height], [artWidth, artHeight]) {
  Object.assign(element.style, {
    left: x * artWidth + 'px',
    top: y * artHeight + 'px',
    width: width * artWidth + 'px',
    height: height * artHeight + 'px'
  });
}

function camera(width, height, size, scale, center) {
  const w = size[0] * scale;
  const h = size[1] * scale;
  return {
    scale,
    x: Math.min(0, Math.max(width - w, width / 2 - center[0] * w)),
    y: Math.min(0, Math.max(height - h, height / 2 - center[1] * h))
  };
}

export function mountSceneArt(stage, opening) {
  const corridor = stage.querySelector('.corridor-plane');
  const room = stage.querySelector('.room-plane');
  const corridorArt = corridor.querySelector('img');
  const roomArt = room.querySelector('img');
  const conversation = opening.querySelector('.conversation');
  const doorView = stage.querySelector('.door-view');
  const doorLeaves = stage.querySelector('.door-leaves');
  const title = stage.querySelector('.scene-wordmark');
  let state = 'loading';
  let mode;
  let roomCamera;
  let config;
  let width;
  let height;
  let portalAlignment = [.5, .5];
  let closedDoorWidth = 0;

  function layoutPortal() {
    if (!config) return;
    const portal = doorView.querySelector('.door-room');
    portal.style.setProperty('--roll-angle', mode === 'portrait' ? '0deg' : '-8deg');
    const [artWidth, artHeight] = config.size;
    const scale = Math.max(doorView.clientWidth / artWidth, doorView.clientHeight / artHeight);
    portal.style.width = artWidth + 'px';
    portal.style.height = artHeight + 'px';
    const progress = Math.max(0, Math.min(1, (doorView.clientWidth - closedDoorWidth) / Math.max(1, width - closedDoorWidth)));
    const horizontalAlignment = .40 + (portalAlignment[0] - .40) * progress;
    const x = (doorView.clientWidth - artWidth * scale) * horizontalAlignment;
    const y = (doorView.clientHeight - artHeight * scale) * portalAlignment[1];
    portal.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
    position(portal.querySelector('.door-book'), config.book, config.size);
    position(portal.querySelector('.door-seal'), config.seal, config.size);
    portal.querySelectorAll('.door-roll').forEach((roll,index) => position(roll,config.rolls[index],config.size));
  }

  function placeConversation() {
    if (!config || conversation.hidden) return;
    const portrait = mode === 'portrait';
    const panelWidth = portrait ? width - 36 : Math.min(350, width * .32);
    const actorRight = roomCamera.x + config.size[0] * roomCamera.scale * .535;
    const left = portrait ? 18 : Math.min(width - panelWidth - 20, actorRight + 18);
    const preferredTop = portrait ? height - conversation.offsetHeight - 18 : height * .28;
    const top = Math.max(18, Math.min(preferredTop, height - conversation.offsetHeight - 18));
    Object.assign(conversation.style, {
      width: panelWidth + 'px', left: left + 'px', top: top + 'px', bottom: 'auto'
    });
  }

  function layout() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    if (!width || !height) return;
    const orientation = width < height ? 'portrait' : 'wide';
    if (orientation !== mode) {
      room.style.transition = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => room.style.removeProperty('transition')));
      mode = orientation;
      config = compositions[mode];
      corridorArt.src = asset(mode, 'corridor');
      roomArt.src = asset(mode, 'room');
      doorView.querySelector('img').src = roomArt.src;
      for (const leaf of doorLeaves.children) leaf.style.backgroundImage = 'url("' + corridorArt.src + '")';
      stage.dataset.orientation = mode;
    }
    const [artWidth, artHeight] = config.size;
    const fit = Math.max(width / artWidth, height / artHeight);
    const outside = camera(width, height, config.size, fit, [.54, .5]);
    let scale = fit;
    let center = mode === 'portrait' ? [.5, .5] : [.58, .5];
    if (['walking', 'desk', 'passing', 'cue', 'stamping', 'handoff', 'return-room', 'shelf-view', 'room-handoff'].includes(state)) {
      scale = fit * 1.08;
      center = mode === 'portrait' ? [.50, .55] : [.58, .48];
    }
    if (opening.classList.contains('shelf-camera')) {
      scale = mode === 'portrait'
        ? Math.max(height / (artHeight * .30), width / (artWidth * .35))
        : Math.max(height / (artHeight * .54), width / (artWidth * .38));
      center = config.shelfCenter;
    }
    roomCamera = camera(width, height, config.size, scale, center);
    for (const [plane, view] of [[corridor, outside], [room, roomCamera]]) {
      plane.style.width = artWidth + 'px';
      plane.style.height = artHeight + 'px';
      plane.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
    }
    room.style.setProperty('--camera-scale', scale);
    room.style.setProperty('--roll-angle', mode === 'portrait' ? '0deg' : '-8deg');
    position(corridor.querySelector('.lamp'), config.lamp, config.size);
    position(corridor.querySelector('.door'), config.door, config.size);
    for (const selector of ['.lamp', '.door']) {
      corridor.querySelector(selector).style.minWidth = 44 / fit + 'px';
      corridor.querySelector(selector).style.minHeight = 44 / fit + 'px';
    }
    room.querySelector('.seal').style.minWidth = 44 / scale + 'px';
    room.querySelector('.seal').style.minHeight = 44 / scale + 'px';
    position(corridor.querySelector('.lantern-glow'), config.lamp, config.size);
    const objects = {
      '.book-prop': config.book,
      '.seal-prop': config.seal,
      '.seal': config.seal,
      '.archive-book': config.archive,
      '.archive-store': [config.archive[0], config.archive[1], config.archive[2] * .48, config.archive[3]],
      '.entry-impression': config.impression,
      '.archive-shelf': config.cabinet
    };
    for (const [selector, rect] of Object.entries(objects)) position(room.querySelector(selector), rect, config.size);
    // All coordinates belong to the same painting, including the shelf close-up.
    stage.querySelectorAll('.shelf-slot').forEach((slot, index) => {
      const rect = config.rolls[index];
      position(slot, rect, config.size);
      slot.style.setProperty('--pull-x', (width / 2 - roomCamera.x) / scale - (rect[0] + rect[2] / 2) * artWidth + 'px');
      slot.style.setProperty('--pull-y', (height * .48 - roomCamera.y) / scale - rect[1] * artHeight + 'px');
    });
    const bookAdvance = (mode === 'portrait' ? .04 : .05) * artHeight;
    room.style.setProperty('--book-advance', bookAdvance + 'px');
    room.style.setProperty('--stamp-dx', (config.impression[0] - config.seal[0]) * artWidth + 'px');
    room.style.setProperty('--stamp-dy', (config.impression[1] - config.seal[1] - config.seal[3] * .8) * artHeight + 'px');
    room.style.setProperty('--stamp-lift', -artHeight * .10 + 'px');

    const hallView = camera(width, height, config.size, fit, mode === 'portrait' ? [.5, .5] : [.58, .5]);
    const excessWidth = width - artWidth * fit;
    const excessHeight = height - artHeight * fit;
    portalAlignment = [
      excessWidth ? hallView.x / excessWidth : .5,
      excessHeight ? hallView.y / excessHeight : .5
    ];
    const [dx, dy, dw, dh] = config.door;
    const doorRect = [outside.x + dx * artWidth * fit, outside.y + dy * artHeight * fit, dw * artWidth * fit, dh * artHeight * fit];
    closedDoorWidth = doorRect[2];
    for (const el of [doorView, doorLeaves]) position(el, doorRect, [1, 1]);
    for (let i = 0; i < 2; i++) {
      const leaf = doorLeaves.children[i];
      leaf.style.backgroundSize = artWidth * fit + 'px ' + artHeight * fit + 'px';
      leaf.style.backgroundPosition = -(dx + i * dw / 2) * artWidth * fit + 'px ' + -dy * artHeight * fit + 'px';
    }
    const lampCenter = [(config.lamp[0] + config.lamp[2] / 2) * artWidth, (config.lamp[1] + config.lamp[3] / 2) * artHeight];
    stage.style.setProperty('--lamp-x', outside.x + lampCenter[0] * fit + 'px');
    stage.style.setProperty('--lamp-y', outside.y + lampCenter[1] * fit + 'px');
    title.style.left = Math.max(24, outside.x + config.title[0] * artWidth * fit) + 'px';
    title.style.top = Math.max(height * .12, outside.y + config.title[1] * artHeight * fit) + 'px';
    const shelfTop = roomCamera.y + config.cabinet[1] * artHeight * scale;
    room.style.setProperty('--shelf-label-top', Math.max(0, (18 - shelfTop) / scale) + 'px');
    placeConversation();
    layoutPortal();
  }

  new ResizeObserver(layoutPortal).observe(doorView);
  new ResizeObserver(layout).observe(stage);
  new ResizeObserver(placeConversation).observe(conversation);
  new MutationObserver(placeConversation).observe(conversation, {subtree: true, childList: true, attributes: true, attributeFilter: ['hidden']});
  layout();
  return {
    setState(value) {
      state = value;
      opening.classList.toggle('camera-moving', state === 'walking' || state === 'shelf-view');
      const roomVisible = !['loading', 'unlit', 'lighting', 'lit', 'opening', 'asset-error'].includes(state);
      stage.classList.toggle('is-room', roomVisible);
      opening.classList.toggle('book-received', ['passing', 'cue', 'stamping', 'handoff', 'return-room', 'shelf-view', 'room-handoff'].includes(state));
      layout();
    },
    layout,
    async ready() {
      await Promise.all([corridorArt, roomArt, ...stage.querySelectorAll('.book-prop, .seal-prop')].map(image => image.decode()));
    }
  };
}
