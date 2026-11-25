// The kitchen world: one chef, three stations, a tray, a plate, the pass, and the shift clock.
// Every rule lives here; rendering only reads this state, and input only calls these methods,
// so the screenshot autopilot can drive the exact same game a player plays.
import {
  DAY_TUNING,
  INGREDIENT_BY_ID,
  LAYOUT,
  MAX_HEARTS,
  MAX_ORDERS,
  RUSH_LAST_SECONDS,
  SHIFT_SECONDS,
  STATIONS,
  TRAY_SLOTS,
} from './config.js';
import { createRandom } from './random.js';
import { OrderDeck } from './orders.js';
import { SoundBoard } from './audio.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_DAY_END = 'day-end';
export const PHASE_OVER = 'over';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_DAY_END = 4;
export const EVENT_OVER = 8;

/** One cooking station: holds one item, counts down, then hands it back prepped. */
export class Station {
  constructor(kind, prep) {
    this.kind = kind;
    this.prep = prep;
    this.item = null;
    this.left = 0;
    this.total = 0;
    this.waiting = false;
  }

  get busy() {
    return this.item !== null;
  }

  get fraction() {
    return this.total > 0 ? 1 - this.left / this.total : 0;
  }

  start(itemId, seconds) {
    this.item = itemId;
    this.left = seconds;
    this.total = seconds;
  }

  step(dt) {
    if (!this.item || this.waiting) return null;
    this.left -= dt;
    if (this.left > 0) return null;
    const done = this.item;
    this.item = null;
    this.left = 0;
    this.total = 0;
    return done;
  }
}

export class Kitchen {
  constructor(seed = 1) {
    this.seed = seed;
    this.random = createRandom(seed);
    this.sounds = new SoundBoard();
    this.deck = new OrderDeck(this.random);
    this.stations = Object.fromEntries(STATIONS.map((s) => [s.kind, new Station(s.kind, s.prep)]));
    this.reset();
  }

  reset() {
    this.random = createRandom(this.seed);
    this.deck = new OrderDeck(this.random);
    for (const station of Object.values(this.stations)) {
      station.item = null;
      station.left = 0;
      station.total = 0;
    }
    this.phase = PHASE_TITLE;
    this.day = 1;
    this.timeLeft = SHIFT_SECONDS;
    this.coins = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hearts = MAX_HEARTS;
    this.tray = [];
    this.plate = [];
    this.plateReady = false;
    this.served = 0;
    this.expiredCount = 0;
    this.earnedToday = 0;
    this.servedToday = 0;
    this.chefX = LAYOUT.chef.x + LAYOUT.chef.w / 2;
    this.chefTargetX = this.chefX;
    this.chefBob = 0;
    this.floaters = [];
    this.rushAnnounced = false;
    this.dayStats = [];
    this.flash = null;
    this.elapsed = 0;
  }

  get inRush() {
    return this.phase === PHASE_PLAY && this.timeLeft <= RUSH_LAST_SECONDS;
  }

  get dayTuning() {
    return DAY_TUNING[this.day];
  }

  startDay(day) {
    this.day = day;
    this.timeLeft = SHIFT_SECONDS;
    this.tray = [];
    this.plate = [];
    this.plateReady = false;
    this.deck.reset();
    this.earnedToday = 0;
    this.servedToday = 0;
    this.rushAnnounced = false;
    this.phase = PHASE_PLAY;
  }

  startGame() {
    this.reset();
    this.startDay(1);
  }

  /** Move the chef toward a station column; called whenever the player works somewhere. */
  walkTo(x) {
    this.chefTargetX = x;
  }

  addFloater(text, x, y, color) {
    this.floaters.push({ text, x, y, color, life: 1.2 });
  }

  /** Take a raw ingredient from its bin into the tray. Returns false when the tray is full. */
  grab(ingredientId) {
    if (this.phase !== PHASE_PLAY) return false;
    if (this.tray.length >= TRAY_SLOTS) return false;
    this.tray.push({ id: ingredientId, prepped: INGREDIENT_BY_ID[ingredientId].prep === 'none' });
    this.sounds.grab();
    this.walkTo(this.chefX);
    return true;
  }

  /** Send a tray item to the station that prepares it. Returns false when nothing fits. */
  sendToStation(kind) {
    if (this.phase !== PHASE_PLAY) return false;
    const station = this.stations[kind];
    if (!station || station.busy) return false;
    const index = this.tray.findIndex(
      (t) => !t.prepped && INGREDIENT_BY_ID[t.id].prep === station.prep,
    );
    if (index < 0) return false;
    const item = this.tray.splice(index, 1)[0];
    station.start(item.id, INGREDIENT_BY_ID[item.id].prepTime);
    if (station.prep === 'chop') this.sounds.chop();
    else this.sounds.startSizzle();
    this.walkTo(stationRect(kind).x + stationRect(kind).w / 2);
    return true;
  }

  /** Move one tray item onto the plate. Returns false when the tray holds nothing plated. */
  addToPlate() {
    if (this.phase !== PHASE_PLAY) return false;
    const index = this.tray.findIndex((t) => t.prepped);
    if (index < 0) return false;
    const item = this.tray.splice(index, 1)[0];
    this.plate.push(item.id);
    this.plateReady = this.deck.findMatch(this.plate) !== null;
    this.sounds.grab();
    this.walkTo(LAYOUT.plate.x + LAYOUT.plate.w / 2);
    if (this.plateReady) this.sounds.bell();
    return true;
  }

  /** Dump the plate into the trash. The combo survives; only the time is lost. */
  dumpPlate() {
    if (this.phase !== PHASE_PLAY || this.plate.length === 0) return false;
    this.plate = [];
    this.plateReady = false;
    this.sounds.buzz();
    return true;
  }

  /** Serve the plated dish to its matching order. Returns the payout or null. */
  serve() {
    if (this.phase !== PHASE_PLAY || !this.plateReady) return null;
    const order = this.deck.findMatch(this.plate);
    if (!order) return null;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const payout = this.deck.payout(order, this.combo, this.inRush);
    this.coins += payout.coins;
    this.score += payout.coins * 10 + this.combo * 5;
    this.earnedToday += payout.coins;
    this.servedToday += 1;
    this.served += 1;
    this.deck.remove(order);
    this.plate = [];
    this.plateReady = false;
    this.sounds.coins();
    this.addFloater(`+${payout.coins} coins`, LAYOUT.serveWindow.x + 220, LAYOUT.serveWindow.y + 30, '#e8a93d');
    if (this.combo >= 3) {
      this.addFloater(`COMBO x${this.combo}!`, LAYOUT.serveWindow.x + 220, LAYOUT.serveWindow.y + 62, '#d94f30');
    }
    this.walkTo(LAYOUT.serveWindow.x + LAYOUT.serveWindow.w / 2);
    return payout;
  }

  /** One fixed step of the shift. Returns an event bitmask. */
  step(dt) {
    this.elapsed += dt;
    if (this.phase !== PHASE_PLAY) {
      this.stepFloaters(dt);
      return EVENT_NONE;
    }
    let events = EVENT_NONE;
    this.timeLeft -= dt;
    if (this.inRush && !this.rushAnnounced) {
      this.rushAnnounced = true;
      this.flash = { text: 'RUSH HOUR — tips x2!', life: 2.0 };
    }
    const expired = this.deck.step(dt, this.day, this.timeLeft, MAX_ORDERS);
    for (const order of expired) {
      this.hearts -= 1;
      this.combo = 0;
      this.expiredCount += 1;
      this.sounds.buzz();
      events |= EVENT_EXPIRED;
    }
    for (const station of Object.values(this.stations)) {
      const done = station.step(dt);
      if (done) {
        if (this.tray.length < TRAY_SLOTS) {
          this.tray.push({ id: done, prepped: true });
        } else {
          // Tray full: the finished item waits on the station as a prepped item.
          station.item = done;
          station.left = 0;
          station.total = 0;
          station.waiting = true;
        }
        this.sounds.ding();
        if (station.prep !== 'chop') this.sounds.stopSizzle();
      }
    }
    const speed = 420;
    const dx = this.chefTargetX - this.chefX;
    if (Math.abs(dx) > 2) {
      this.chefX += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
      this.chefBob += dt * 14;
    }
    this.stepFloaters(dt);
    if (this.flash) {
      this.flash.life -= dt;
      if (this.flash.life <= 0) this.flash = null;
    }
    if (this.hearts <= 0) {
      this.phase = PHASE_OVER;
      return events | EVENT_OVER;
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.dayStats.push({ day: this.day, served: this.servedToday, earned: this.earnedToday });
      this.phase = this.day >= 3 ? PHASE_OVER : PHASE_DAY_END;
      this.sounds.stopSizzle();
      return events | EVENT_DAY_END;
    }
    return events;
  }

  stepFloaters(dt) {
    for (const floater of this.floaters) floater.life -= dt;
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  /** Collect a finished item that waited on a station because the tray was full. */
  collectWaiting(kind) {
    const station = this.stations[kind];
    if (!station || !station.waiting || this.tray.length >= TRAY_SLOTS) return false;
    this.tray.push({ id: station.item, prepped: true });
    station.item = null;
    station.waiting = false;
    this.sounds.grab();
    return true;
  }

  /** Stars for the finished shift: served dishes, hearts kept, and tips earned. */
  stars() {
    let stars = 1;
    if (this.served >= 6) stars = 2;
    if (this.served >= 12 && this.hearts >= 2) stars = 3;
    return stars;
  }
}

export function stationRect(kind) {
  if (kind === 'board') return LAYOUT.board;
  if (kind === 'grill') return LAYOUT.grill;
  return LAYOUT.pot;
}
