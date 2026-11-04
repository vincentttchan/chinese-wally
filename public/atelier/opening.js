import { chapterJourney } from './journey.js?v=2';

import { mountPaintingAlbum } from './painting-album.js';

const opening = document.querySelector('.opening');
const stage = opening.querySelector('.stage');
const lamp = opening.querySelector('.lamp');
const door = opening.querySelector('.door');
const seal = opening.querySelector('.seal');
const conversation = opening.querySelector('.conversation');
const line = opening.querySelector('#line');
const next = opening.querySelector('.next');
const guide = opening.querySelector('.guide');
const retry = opening.querySelector('.retry');
const resume = opening.querySelector('.resume-journey');
const gallery = document.querySelector('.gallery');
const journey = chapterJourney(gallery, document.querySelector('.chapter-complete'), {
  hideChapterNavigation: true,
  keepNextChapter: true,
  chapterPromptStylesheet: new URL('./chapter.css', import.meta.url).href,
  mountAlbum: mountPaintingAlbum
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const dialogue = [
  '你頭一晚來學畫吧？先生留了《簪花仕女圖》，這是你今晚的第一卷。',
  '我頭一回看，只顧着數花。後來順着其中一位的目光看，才發現旁邊也有動靜。你看看，會先留意到誰？',
  '畫架上還有好幾卷。每看完一卷，就會收進你的觀畫帖。我再替你取下一卷。',
  '這本帖是給你的。蓋個印，我們就展卷。'
];
let dialogueIndex = 0;
let state = 'loading';
let entryChapter = null;
let openEntryChapter;

mountPaintingAlbum(opening, journey.collectedChapters, chapter => {
  enterSavedChapter(chapter, () => journey.openCollected(chapter.id));
});

function show(nextState, announcement = '') {
  state = nextState;
  opening.dataset.state = nextState;
  guide.textContent = announcement;
}

function showButton(button, event) {
  button.hidden = false;
  if (event?.detail === 0) button.focus({preventScroll: true});
}

function delay(ms, reduced = 120) {
  return new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? reduced : ms));
}

function frameReady() {
  if (entryChapter) return journey.isReady();
  const cover = journey.firstCover();
  const art = gallery.contentDocument?.querySelector('img[alt*="完整畫面"]');
  return Boolean(cover && art?.complete && art.naturalWidth > 0);
}

function knock() {
  if (!window.AudioContext) return;
  const audio = new AudioContext();
  const strike = audio.createOscillator();
  const volume = audio.createGain();
  const time = audio.currentTime;
  strike.frequency.setValueAtTime(230, time);
  strike.frequency.exponentialRampToValueAtTime(105, time + .12);
  volume.gain.setValueAtTime(.11, time);
  volume.gain.exponentialRampToValueAtTime(.001, time + .14);
  strike.connect(volume).connect(audio.destination);
  strike.start();
  strike.stop(time + .15);
  strike.addEventListener('ended', () => { void audio.close(); }, {once: true});
}

async function waitForGallery() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (frameReady()) return true;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return false;
}

stage.addEventListener('pointermove', event => {
  if (state !== 'unlit' && state !== 'lit') return;
  const rect = stage.getBoundingClientRect();
  stage.style.setProperty('--x', `${100 * (event.clientX - rect.left) / rect.width}%`);
  stage.style.setProperty('--y', `${100 * (event.clientY - rect.top) / rect.height}%`);
});

function aimAtDoor() {
  stage.style.setProperty('--x', '70%');
  stage.style.setProperty('--y', '50%');
}

door.addEventListener('focus', aimAtDoor);

lamp.addEventListener('click', async event => {
  if (state !== 'unlit') return;
  lamp.hidden = true;
  resume.hidden = true;
  show('lighting', '廊燈亮起。');
  await delay(650);
  show('lit', '輕叩畫坊門。');
  aimAtDoor();
  showButton(door, event);
});

door.addEventListener('click', async event => {
  if (state !== 'lit') return;
  door.hidden = true;
  show('opening', '門後有人來迎。');
  try { knock(); } catch { /* The door still opens when audio is unavailable. */ }
  await delay(210);
  opening.classList.add('doors-open');
  await delay(1200);
  show('hall');
  await delay(520);
  line.textContent = '廊燈一亮，我就知道你到了。進來，燈下給你留了個位子。';
  next.textContent = '走到案前 →';
  conversation.hidden = false;
  if (event.detail === 0) next.focus({preventScroll: true});
});

next.addEventListener('click', async event => {
  if (state === 'hall') {
    conversation.hidden = true;
    show('walking');
    await delay(1080);
    show('desk');
    await delay(180);
    line.textContent = dialogue[0];
    next.textContent = '聽他說下去 →';
    conversation.hidden = false;
    if (event.detail === 0) next.focus({preventScroll: true});
    return;
  }
  if (state !== 'desk') return;
  dialogueIndex += 1;
  if (dialogueIndex < dialogue.length - 1) {
    line.textContent = dialogue[dialogueIndex];
    next.textContent = dialogueIndex === dialogue.length - 2 ? '接過觀畫帖 →' : '繼續 →';
    return;
  }

  conversation.hidden = true;
  next.hidden = true;
  show('passing', '同窗把觀畫帖推到你面前。');
  await delay(620);
  line.textContent = dialogue[dialogueIndex];
  show('cue');
  conversation.hidden = false;
  showButton(seal, event);
});

async function revealGallery(event) {
  const title = entryChapter?.title ?? '簪花仕女圖';
  show('handoff', '正在展開《' + title + '》。');
  if (!await waitForGallery()) {
    show('handoff', '《' + title + '》暫未載入。');
    showButton(retry, event);
    return;
  }

  if (!entryChapter) opening.classList.add('approach-paper');
  document.body.classList.add('handing-off');
  await delay(440);
  document.body.classList.add('gallery-visible');
  await delay(560);
  gallery.removeAttribute('inert');
  gallery.removeAttribute('aria-hidden');
  opening.hidden = true;
  document.body.classList.remove('handing-off');
  document.title = title + ' · 畫中尋人';
  if (event.detail === 0) {
    if (entryChapter) gallery.focus({preventScroll: true});
    else journey.firstCover()?.querySelector('button')?.focus({preventScroll: true});
  }
}

seal.addEventListener('click', async event => {
  if (state !== 'cue') return;
  seal.hidden = true;
  conversation.hidden = true;
  show('stamping', '在觀畫帖上蓋下入畫印。');
  opening.classList.add('seal-pressed');
  await delay(1150, 480);
  opening.classList.add('stamp-complete');
  await revealGallery(event);
});

function enterSavedChapter(chapter, openChapter, event = {detail: 0}) {
  if (state !== 'unlit' || !chapter) return;
  entryChapter = chapter;
  openEntryChapter = openChapter;
  lamp.hidden = true;
  resume.hidden = true;
  openEntryChapter();
  void revealGallery(event);
}

resume.addEventListener('click', event => {
  enterSavedChapter(journey.savedChapter(), journey.openSaved, event);
});

retry.addEventListener('click', event => {
  retry.hidden = true;
  if (state === 'asset-error') {
    location.reload();
    return;
  }
  if (openEntryChapter) openEntryChapter();
  else journey.openFirst();
  void revealGallery(event);
});

journey.openFirst();
Promise.all([...stage.querySelectorAll('img')].map(image => image.decode()))
  .then(() => {
    show('unlit', '點亮廊燈。');
    showButton(lamp);
    if (journey.savedChapter()) {
      resume.setAttribute('aria-label', '繼續旅程，前往《' + journey.savedChapter().title + '》');
      showButton(resume);
    }
  })
  .catch(() => {
    show('asset-error', '畫坊場景暫未載入。');
    showButton(retry);
  });
