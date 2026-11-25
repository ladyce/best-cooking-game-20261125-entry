// Mouse and keyboard input, translated into kitchen actions. Clicking is the primary way to
// play (bins, stations, plate, pass), and every click has a keyboard twin so the game plays
// just as well without a mouse: 1-8 grab, C/G/B work the stations, Space plates and serves.
import { INGREDIENTS, LAYOUT, STATIONS } from './config.js';
import { PHASE_DAY_END, PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './kitchen.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function binRect(index) {
  const cols = LAYOUT.bins.cols;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: LAYOUT.bins.x + col * (LAYOUT.bins.w + LAYOUT.bins.gap),
    y: LAYOUT.bins.y + row * (LAYOUT.bins.h + LAYOUT.bins.gap),
    w: LAYOUT.bins.w,
    h: LAYOUT.bins.h,
  };
}

export class Input {
  constructor(canvas, kitchen, onFirstGesture) {
    this.canvas = canvas;
    this.kitchen = kitchen;
    this.onFirstGesture = onFirstGesture;
    this.paused = false;
    canvas.addEventListener('pointerdown', (event) => this.click(event));
    window.addEventListener('keydown', (event) => this.key(event));
  }

  toLogical(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  click(event) {
    const kitchen = this.kitchen;
    kitchen.sounds.ensure();
    this.onFirstGesture();
    const { x, y } = this.toLogical(event);
    if (kitchen.phase === PHASE_TITLE) {
      kitchen.startGame();
      return;
    }
    if (kitchen.phase === PHASE_DAY_END) {
      kitchen.startDay(kitchen.day + 1);
      return;
    }
    if (kitchen.phase === PHASE_OVER) {
      kitchen.startGame();
      return;
    }
    if (this.paused) return;
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (inside(x, y, binRect(i))) {
        kitchen.grab(INGREDIENTS[i].id);
        return;
      }
    }
    for (const station of STATIONS) {
      const rect = station.kind === 'board' ? LAYOUT.board : station.kind === 'grill' ? LAYOUT.grill : LAYOUT.pot;
      if (inside(x, y, rect)) {
        if (!kitchen.sendToStation(station.kind)) kitchen.collectWaiting(station.kind);
        return;
      }
    }
    if (inside(x, y, LAYOUT.plate)) {
      kitchen.addToPlate();
      return;
    }
    if (inside(x, y, LAYOUT.trash)) {
      kitchen.dumpPlate();
      return;
    }
    if (inside(x, y, LAYOUT.serveWindow) || inside(x, y, LAYOUT.serveBell)) {
      kitchen.serve();
    }
  }

  key(event) {
    const kitchen = this.kitchen;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      kitchen.sounds.ensure();
      kitchen.sounds.toggleMute();
      return;
    }
    if (key === 'p') {
      this.paused = !this.paused;
      return;
    }
    if (kitchen.phase === PHASE_TITLE && (key === 'enter' || key === ' ')) {
      kitchen.sounds.ensure();
      kitchen.startGame();
      return;
    }
    if (kitchen.phase === PHASE_DAY_END && key === 'enter') {
      kitchen.startDay(kitchen.day + 1);
      return;
    }
    if (kitchen.phase === PHASE_OVER && key === 'enter') {
      kitchen.startGame();
      return;
    }
    if (kitchen.phase !== PHASE_PLAY || this.paused) return;
    kitchen.sounds.ensure();
    const ingredient = INGREDIENTS.find((i) => i.key === key);
    if (ingredient) {
      kitchen.grab(ingredient.id);
      return;
    }
    const station = STATIONS.find((s) => s.key.toLowerCase() === key);
    if (station) {
      if (!kitchen.sendToStation(station.kind)) kitchen.collectWaiting(station.kind);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      if (kitchen.plateReady) kitchen.serve();
      else kitchen.addToPlate();
    }
  }
}
