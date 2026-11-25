// The order deck: which dishes the dining room asks for, how long each ticket stays patient,
// and what a served dish pays. Orders are drawn from the recipes unlocked by the current day,
// so day 1 teaches burgers and ramen and day 3 asks for the whole menu at once.
import { DAY_TUNING, RECIPES, RECIPE_BY_ID, RUSH_LAST_SECONDS, RUSH_SPAWN_FACTOR, RUSH_TIP_FACTOR } from './config.js';
import { pickRandom } from './random.js';

let nextOrderId = 1;

/** A single ticket on the order rail. */
export class Order {
  constructor(recipe, patience) {
    this.id = nextOrderId;
    nextOrderId += 1;
    this.recipe = recipe;
    this.patience = patience;
    this.left = patience;
    this.served = false;
  }

  get fraction() {
    return Math.max(0, this.left / this.patience);
  }

  get urgent() {
    return this.fraction < 0.3;
  }
}

export class OrderDeck {
  constructor(random) {
    this.random = random;
    this.orders = [];
    this.spawnIn = 2.0;
  }

  reset() {
    this.orders = [];
    this.spawnIn = 2.0;
  }

  get rush() {
    return false;
  }

  /** Spawn timers and patience drain, given the shift clock. Returns expired orders. */
  step(dt, day, timeLeft, maxOrders) {
    const tuning = DAY_TUNING[day];
    const inRush = timeLeft <= RUSH_LAST_SECONDS;
    const gap = tuning.spawnGap * (inRush ? RUSH_SPAWN_FACTOR : 1);
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.orders.length < maxOrders) {
      this.spawn(tuning, day);
      this.spawnIn = gap * (0.85 + this.random() * 0.3);
    }
    const expired = [];
    for (const order of this.orders) {
      order.left -= dt;
      if (order.left <= 0) expired.push(order);
    }
    if (expired.length > 0) {
      this.orders = this.orders.filter((o) => o.left > 0);
    }
    return expired;
  }

  spawn(tuning, day) {
    const pool = RECIPES.filter((r) => r.day <= day).slice(0, tuning.recipes);
    const recipe = pickRandom(this.random, pool);
    this.orders.push(new Order(recipe, tuning.patience));
  }

  /** Find the open order whose recipe matches `plateIds` exactly (order-insensitive). */
  findMatch(plateIds) {
    const wanted = plateIds.slice().sort().join(',');
    for (const order of this.orders) {
      if (order.recipe.needs.slice().sort().join(',') === wanted) return order;
    }
    return null;
  }

  /** Coins for serving `order` now: base price plus a patience tip, doubled in rush hour. */
  payout(order, combo, inRush) {
    const tip = Math.round(order.recipe.price * 0.5 * order.fraction * (inRush ? RUSH_TIP_FACTOR : 1));
    const comboBonus = Math.min(combo - 1, 10) * 1;
    return { coins: order.recipe.price + tip + comboBonus, tip, comboBonus };
  }

  remove(order) {
    this.orders = this.orders.filter((o) => o !== order);
  }
}

export function recipeName(recipeId) {
  return RECIPE_BY_ID[recipeId].name;
}
