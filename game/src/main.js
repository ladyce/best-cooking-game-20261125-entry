// Boot: size the canvas to the window, run the kitchen on a fixed 60 Hz step, and draw every
// frame. With ?shot=<name> in the URL the game stages one scripted scene instead and draws a
// single frame, which is how the entry's screenshots are taken.
import { FIELD, STEP } from './config.js';
import { Kitchen, PHASE_DAY_END, PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './kitchen.js';
import { drawGame, SCREEN_DAY_END, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { Input } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const seed = Number.parseInt(params.get('seed') || '1', 10) || 1;
const shot = params.get('shot');
const kitchen = new Kitchen(seed);
const status = document.getElementById('status');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.width = Math.round(FIELD.width * scale * window.devicePixelRatio);
  canvas.height = Math.round(FIELD.height * scale * window.devicePixelRatio);
  canvas.style.width = `${Math.round(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.round(FIELD.height * scale)}px`;
  ctx.setTransform(canvas.width / FIELD.width, 0, 0, canvas.height / FIELD.height, 0, 0);
}

function screenFor(kitchenState) {
  if (kitchenState.phase === PHASE_TITLE) return SCREEN_TITLE;
  if (kitchenState.phase === PHASE_DAY_END) return SCREEN_DAY_END;
  if (kitchenState.phase === PHASE_OVER) return SCREEN_OVER;
  return SCREEN_PLAY;
}

function announce() {
  if (!status) return;
  if (kitchen.phase === PHASE_TITLE) status.textContent = 'Ember and Thyme. Press Enter to start your shift.';
  else if (kitchen.phase === PHASE_PLAY) {
    status.textContent = `Day ${kitchen.day}. ${kitchen.deck.orders.length} orders open. Score ${kitchen.score}.`;
  } else if (kitchen.phase === PHASE_DAY_END) status.textContent = `Day ${kitchen.day} done. Press Enter for the next shift.`;
  else status.textContent = `Shift complete. Final score ${kitchen.score}.`;
}

if (shot) {
  // One deterministic frame for a screenshot: stage, draw once, stop.
  fitCanvas();
  const staged = stageShot(shot, kitchen);
  drawGame(ctx, kitchen, staged.screen);
  announce();
  document.title = `Ember & Thyme — ${shot}`;
} else {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  const input = new Input(canvas, kitchen, () => {});
  let last = performance.now();
  let accumulator = 0;
  let announcedAt = 0;
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (!input.paused) {
      accumulator += dt;
      while (accumulator >= STEP) {
        kitchen.step(STEP);
        accumulator -= STEP;
      }
    }
    drawGame(ctx, kitchen, screenFor(kitchen));
    if (now - announcedAt > 2000) {
      announcedAt = now;
      announce();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
