import { enterHall, approachDesk, passAlbum } from './camera-v6-no-column.js?v=1';
import { chapterJourney } from './journey-maid-motion-v2.js?v=1';
import { leaveChapterFullscreen } from './chapter-return-v1.js?v=1';

import { renderArchiveSeal } from './archive-seal.js?v=2';

import { mountPaintingAlbum } from './painting-album-stickers-v5.js?v=1';


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
const silk = document.querySelector('.silk');
const archiveControls = opening.querySelector('.archive-controls');
const archiveStore = opening.querySelector('.archive-store');
const archiveStamp = opening.querySelector('.archive-stamp');
const archiveBook = opening.querySelector('.archive-book');
const archiveShelf = opening.querySelector('.archive-shelf');
const archiveQuestion = opening.querySelector('.archive-question');
const archiveConfirm = opening.querySelector('.archive-confirm');
const archiveReplies = opening.querySelector('.archive-replies');
const reviewKey = 'chinese-wally:atelier:zanhua-review:v2';
let review = {answer: null, read: false};
try {
  const saved = JSON.parse(localStorage.getItem(reviewKey));
  if (saved && [0,1,2].includes(saved.answer)) review = {answer: saved.answer, read: saved.read === true};
} catch {}
function saveReview() {
  try { localStorage.setItem(reviewKey, JSON.stringify(review)); } catch {}
}
const journey = chapterJourney(gallery, document.querySelector('.chapter-complete'), {
  hideChapterNavigation: true,
  keepNextChapter: true,
  chapterPromptStylesheet: new URL('./chapter-sticker-album-v4.css?v=1', import.meta.url).href,
  mountAlbum: mountPaintingAlbum,
  onReturnToRoom: returnFromGallery,
  onChapterCollected: offerChapterMemento,
  onRiverEntered: revealRiverChapter
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const dialogue = [
  '你頭一晚來學畫吧？先生留了《簪花仕女圖》，這是你今晚的第一卷。',
  '我頭一回看，只顧着數花。後來順着其中一位的目光看，才發現旁邊也有動靜。你看看，會先留意到誰？',
  '畫卷沿着長河，一處接着一處。每讀完一卷，下一處畫境就會開啟；喜歡的見聞，也能選一件貼進你的觀畫帖。',
  '這本帖是給你的。蓋個印，我們就展卷。'
];
let dialogueIndex = 0;
let state = 'loading';
let entryChapter = null;
let openEntryChapter;
let roomChapter;
let roomTurn = 0;
let roomReply = null;
const pendingArchiveKey = 'chinese-wally:atelier:zanhua-pending-archive:v1';

function hasPendingArchive() {
  try { return localStorage.getItem(pendingArchiveKey) === '1'; }
  catch { return false; }
}

function setPendingArchive(pending) {
  try {
    if (pending) localStorage.setItem(pendingArchiveKey, '1');
    else localStorage.removeItem(pendingArchiveKey);
  } catch { /* The current room can still be resumed in this tab. */ }
}

function revisitRoomChapter(chapter) {
  if (document.body.classList.contains('gallery-visible')) {
    journey.openCollected(chapter.id);
    gallery.focus({preventScroll: true});
    return;
  }
  enterSavedChapter(chapter, () => journey.openCollected(chapter.id));
}
const refreshRoomAlbum = mountPaintingAlbum(opening, journey.collectedChapters, revisitRoomChapter, archiveBook);
let mementoInvitation = 0;
async function offerChapterMemento(chapter) {
  // The first卷 has its own fixed room step; never interrupt its next action.
  if (chapter.id === 'zanhua') return;
  const invitation = ++mementoInvitation;
  await delay(chapter.id === 'luoshen' ? 1200 : 600, 300);
  // An optional invitation never follows the player into a newer chapter.
  if (invitation !== mementoInvitation || journey.activeChapter().id !== chapter.id) return;
  const deadline = Date.now() + 8000;
  while ((silk.classList.contains('is-returning') || silk.classList.contains('is-revealing')) && Date.now() < deadline) {
    await delay(100, 100);
    if (invitation !== mementoInvitation || journey.activeChapter().id !== chapter.id) return;
  }
  if (silk.classList.contains('is-returning') || silk.classList.contains('is-revealing')) return;
  refreshRoomAlbum.offer(chapter);
}
// Chapter selection now belongs to the river; the shelves remain scenery.
archiveShelf.hidden = true;
archiveShelf.remove();
function revealRiverChapter(chapter) {
  if (state !== 'return-room') return;
  entryChapter = chapter;
  conversation.hidden = true;
  archiveControls.hidden = true;
  document.body.classList.add('gallery-visible');
  gallery.removeAttribute('inert');
  gallery.removeAttribute('aria-hidden');
  opening.hidden = true;
  show('gallery');
  const {atelierRoom, ...rest} = history.state ?? {};
  history.replaceState(rest, '');
  document.title = chapter.title + ' · 畫中尋人';
}

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
  await delay(1280);
  await enterHall(opening, stage);
  show('hall');
  await delay(180);
  line.textContent = '廊燈一亮，我就知道你到了。進來，燈下給你留了個位子。';
  next.textContent = '走到案前 →';
  conversation.hidden = false;
  if (event.detail === 0) next.focus({preventScroll: true});
});

function renderRoomDialogue() {
  history.replaceState({...history.state, atelierRoom: {chapter: roomChapter.id, turn: roomTurn, reply: roomReply}}, '');
  archiveStore.hidden = roomTurn !== -1;
  archiveStamp.hidden = journey.collectedChapters().length === 0;
  archiveReplies.hidden = roomTurn !== -5;
  archiveQuestion.hidden = roomTurn !== -3;

  next.hidden = ![-4,-2,0,1,2].includes(roomTurn);
  switch (roomTurn) {
    case -5:
      line.textContent = '回來啦。剛才那一卷，你最想再看哪一處？';
      break;
    case -4:
      line.textContent = roomReply === 'flowers'
        ? '我第一眼也只顧看那朵花。再看久一點，才留意到她們一身的打扮，還有她們各自在做的事。'
        : '我也多看了那件薄紗衣一眼。後來才發現，幾位女子的打扮和手上的動作，放在一起看更有意思。';
      next.textContent = '說說這一卷 →';
      break;
    case -3:
      line.textContent = '要是有人看完這卷，就說「原來唐代女子平日都這樣穿」，你會怎麼回他？';
      break;
    case -2: {
      const replies = [
        '衣飾確實華麗。不過，看看她們在做甚麼：有人拈花，有人逗犬，畫裏是遊賞的一刻。',
        '對。把她們的打扮和正在做的事放在一起看，就能讀出這是貴族女子遊賞時的一種盛裝。',
        '可以再比比拈花女子和執扇侍女。她們的髮飾、衣着和手上的動作，都有不同。'
      ];
      line.textContent = replies[review.answer] + ' 要知道唐代其他女子平日怎麼穿，還得看看別的畫和文物。';
      next.textContent = journey.collectedChapters().length ? '回到案前 →' : '讀完了，收下這一卷 →';
      break;
    }
    case -1:
      line.textContent = '下次看畫，也可以把衣着和人物在做的事一起看。來，把這一卷蓋在你的帖上。';
      break;
    case 0:
      line.textContent = '你看，帖上多了一方紅印。今晚讀過的第一卷，收好了。';
      next.textContent = '選件紀念，繼續旅程 →';
      break;
    case 2:
      line.textContent = '《洛水之間》收好了。四卷的印記都留在帖裏。展開畫卷，便能再走進你喜歡的畫境。';
      next.textContent = '展開畫卷 →';
      break;
    case 1:
      line.textContent = roomChapter.id === 'lantern-festival'
        ? '剛才是庭園裏的盛裝，接下來，去看看宮裏如何過上元夜。展開畫卷，沿河亮起的那一處，就是我們下一站。'
        : '展開畫卷，下一處畫境已經亮起。走過的地方也還在，想再看，隨時可以回去。';
      next.textContent = '展開畫卷 →';
      break;
  }
}

async function revealReturnRoom() {
  silk.classList.replace('is-returning', 'is-revealing');
  await delay(440, 100);
  silk.classList.remove('is-revealing');
}

let returningFromGallery = false;
async function returnFromGallery(chapter, finishedJourney = false) {
  if (returningFromGallery) return;
  returningFromGallery = true;
  try {
    try { await leaveChapterFullscreen(gallery); }
    catch (error) {
      gallery.contentWindow?.postMessage({type:'study-fullscreen-return-error'},location.origin);
      console.warn('Could not leave chapter fullscreen',error);
      return;
    }

  const turn = finishedJourney ? 2 : -5;
  if (!document.body.classList.contains('gallery-visible')) {
    showReturnRoom(chapter, turn);
    return;
  }
  if (silk.classList.contains('is-returning')) return;
  if (!journey.collectedChapters().length) setPendingArchive(true);
  gallery.inert = true;
  silk.classList.add('is-returning');
  await delay(440, 100);
  showReturnRoom(chapter, turn);
  await delay(120, 0);
  await revealReturnRoom();

  } finally { returningFromGallery = false; }
}

function showReturnRoom(chapter, turn = journey.collectedChapters().length ? 0 : -1) {
  if (!chapter) return;
  void journey.prepareNext();
  roomChapter = chapter;
  if (turn === -5) {
    review = {answer: null, read: false};
    saveReview();
    for (const option of archiveQuestion.querySelectorAll('input')) option.checked = false;
    archiveConfirm.disabled = true;
  }
  roomReply = turn === -4 ? history.state?.atelierRoom?.reply : null;
  if (turn === 2) {
    roomTurn = 2;
  } else if (!review.read) {
    roomTurn = review.answer !== null ? -2 : turn === -3 ? -3 : roomReply ? -4 : -5;
  } else {
    roomTurn = journey.collectedChapters().length ? Math.max(0, turn) : -1;
  }
  if (!journey.collectedChapters().length) setPendingArchive(true);
  opening.hidden = false;
  opening.classList.remove('approach-paper', 'seal-pressed', 'stamp-complete');
  gallery.setAttribute('inert', '');
  gallery.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('gallery-visible', 'handing-off');
  lamp.hidden = door.hidden = seal.hidden = resume.hidden = retry.hidden = true;
  archiveControls.hidden = false;
  void renderArchiveSeal(archiveStamp);
  renderRoomDialogue();
  refreshRoomAlbum();
  show('return-room', '已到收卷案。');
  conversation.hidden = false;
  document.title = '畫中尋人 · 夜訪畫坊';
  const focusTarget = roomTurn === -5 ? archiveReplies.querySelector('button')
    : roomTurn === -3 ? archiveQuestion.querySelector('input')
    : roomTurn === -1 ? archiveStore
    : next;
  focusTarget.focus({preventScroll: true});
}

archiveStore.addEventListener('click', () => {
  if (state !== 'return-room' || roomTurn !== -1) return;
  journey.archiveFirst();
  setPendingArchive(false);
  roomChapter = journey.roomChapter() ?? roomChapter;
  roomTurn = 0;
  renderRoomDialogue();
  refreshRoomAlbum();
  archiveStamp.animate([{opacity:0,transform:'translateY(-4px) rotate(-3deg)'},{opacity:1,transform:'translateY(0) rotate(-3deg)'}],
    {duration:reducedMotion.matches?0:430,easing:'ease-out'});
  guide.textContent = '《簪花仕女圖》已收入觀畫帖。';
  next.focus({preventScroll: true});
});

archiveQuestion.addEventListener('change', () => {
  archiveConfirm.disabled = !archiveQuestion.querySelector('input:checked');
});
archiveConfirm.addEventListener('click', () => {
  const answer = archiveQuestion.querySelector('input:checked');
  if (state !== 'return-room' || roomTurn !== -3 || !answer) return;
  review = {answer: Number(answer.value), read: false};
  saveReview();
  roomTurn = -2;
  renderRoomDialogue();
  next.focus({preventScroll: true});
});

archiveReplies.addEventListener('click', event => {
  const reply = event.target.closest('button[data-reply]');
  if (!reply || state !== 'return-room' || roomTurn !== -5) return;
  roomReply = reply.dataset.reply;
  roomTurn = -4;
  renderRoomDialogue();
  next.focus({preventScroll: true});
});

next.addEventListener('click', async event => {
  if (state === 'return-room') {
    if (roomTurn === -4) {
      roomTurn = -3;
      renderRoomDialogue();
      archiveQuestion.querySelector('input').focus({preventScroll: true});
    } else if (roomTurn === -2) {
      review.read = true;
      saveReview();
      roomTurn = journey.collectedChapters().length ? (journey.savedChapter() ? 0 : 2) : -1;
      renderRoomDialogue();
      (roomTurn === 0 ? next : roomTurn === 2 ? next : archiveStore).focus({preventScroll: true});
    } else if (roomTurn === 0) {
      if (next.disabled) return;
      next.disabled = true;
      try { await refreshRoomAlbum.offer(journey.collectedChapters().find(chapter => chapter.id === 'zanhua')); }
      finally { next.disabled = false; }
      // Choosing to revisit from the booklet has already left this room.
      if (state !== 'return-room' || roomTurn !== 0) return;
      roomTurn = 1;
      renderRoomDialogue();
      next.focus({preventScroll: true});
    } else if (roomTurn === 1 || roomTurn === 2) {
      journey.openRiver(next);
    }
    return;
  }
  if (state === 'hall') {
    conversation.hidden = true;
    show('walking');
    await approachDesk(opening, stage);
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
  await passAlbum(stage);
  line.textContent = dialogue[dialogueIndex];
  show('cue');
  conversation.hidden = false;
  showButton(seal, event);
});

async function revealGallery(event, fromRoom = false) {
  const handoff = fromRoom ? 'room-handoff' : 'handoff';
  const title = entryChapter?.title ?? '簪花仕女圖';
  show(handoff, '正在展開《' + title + '》。');
  if (!await waitForGallery()) {
    show(handoff, '《' + title + '》暫未載入。');
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
  if (fromRoom && entryChapter?.id === roomChapter?.id) {
    const {atelierRoom, ...rest} = history.state ?? {};
    history.replaceState(rest, '');
  }
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
  const fromRoom = state === 'return-room' || state === 'shelf-view';
  if ((!fromRoom && state !== 'unlit') || !chapter) return;
  if (fromRoom) {conversation.hidden = true;archiveControls.hidden = true;}
  entryChapter = chapter;
  openEntryChapter = openChapter;
  lamp.hidden = true;
  resume.hidden = true;
  openEntryChapter();
  void revealGallery(event, fromRoom);
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
  void revealGallery(event, state === 'room-handoff');
});

const savedChapter = journey.savedChapter();
const explicitReturn = new URLSearchParams(location.search).get('return') === 'zanhua';
if (explicitReturn) silk.classList.add('is-returning');
const roomCheckpoint = history.state?.atelierRoom;
const pendingChapter = journey.roomChapter();
const canResumeRoom = roomCheckpoint?.chapter === pendingChapter.id && [-5,-4,-3,-2,-1,0,1,2].includes(roomCheckpoint.turn);
const waitingForArchive = !savedChapter && hasPendingArchive();
const journeyFinished = !savedChapter && journey.collectedChapters().length > 0;
const returningChapter = explicitReturn || canResumeRoom || waitingForArchive || journeyFinished ? pendingChapter : null;
if (!returningChapter) journey.openFirst();
Promise.all([...stage.querySelectorAll('img')].map(image => image.decode()))
  .then(() => {
    if (returningChapter) {
      if (explicitReturn) {
        const url = new URL(location.href);
        url.searchParams.delete('return');
        history.replaceState(history.state, '', url);
      }
      showReturnRoom(returningChapter, explicitReturn ? -5 : canResumeRoom ? roomCheckpoint.turn : journeyFinished ? 2 : undefined);
      if (explicitReturn) void delay(120, 0).then(revealReturnRoom);
      return;
    }
    show('unlit', '點亮廊燈。');
    showButton(lamp);
    if (journey.savedChapter()) {
      resume.setAttribute('aria-label', '繼續旅程，前往《' + journey.savedChapter().title + '》');
      showButton(resume);
    }
  })
  .catch(() => {
    silk.classList.remove('is-returning');
    show('asset-error', '畫坊場景暫未載入。');
    showButton(retry);
  });
