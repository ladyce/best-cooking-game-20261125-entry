// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays the real rules
// forward from a fresh kitchen for a fixed number of steps, steered by a scripted cook: it
// reads the open tickets, fetches and preps exactly what the first ticket needs, and plates
// it — so every frame is what a short game really looks like, and the same seed always gives
// the same frame.
import { STEP } from './config.js';
import { SCREEN_DAY_END, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const SAMPLE = STEP;

/** One scripted cook action: run `fn(kitchen)` once the clock passes `at` seconds. */
function at(seconds, fn) {
  return { at: seconds, fn, done: false };
}

/** Build the action list that cooks the first open order, step by step. The tray holds three
 * items and each station one, so a four-ingredient ticket is cooked in two passes: fetch and
 * prep what fits, plate it, then fetch and prep the rest. */
function cookFirstOrder(kitchen) {
  const actions = [];
  const order = () => kitchen.deck.orders[0];
  const grabMissing = () => {
    const o = order();
    if (!o) return;
    for (const id of o.recipe.needs) {
      if (kitchen.plate.includes(id)) continue;
      if (kitchen.tray.some((t) => t.id === id)) continue;
      kitchen.grab(id);
    }
  };
  const sendAll = () => {
    kitchen.sendToStation('board');
    kitchen.sendToStation('grill');
    kitchen.sendToStation('pot');
  };
  const plateAll = () => {
    while (kitchen.addToPlate()) { /* plate until the tray holds nothing prepped */ }
  };
  actions.push(at(0.5, grabMissing));
  actions.push(at(0.9, sendAll));
  actions.push(at(3.0, sendAll));
  actions.push(at(5.4, () => { plateAll(); grabMissing(); }));
  actions.push(at(5.8, sendAll));
  actions.push(at(6.6, sendAll));
  actions.push(at(7.6, () => { plateAll(); grabMissing(); }));
  actions.push(at(8.0, sendAll));
  return actions;
}

/** Run the kitchen forward `seconds`, firing scripted actions as their time comes. */
function runFor(kitchen, seconds, actions) {
  const steps = Math.round(seconds / SAMPLE);
  for (let i = 0; i < steps; i += 1) {
    const now = i * SAMPLE;
    for (const action of actions) {
      if (!action.done && now >= action.at) {
        action.done = true;
        action.fn(kitchen);
      }
    }
    kitchen.step(SAMPLE);
  }
}

/**
 * Set `kitchen` to the named scene (start, play, serve or end; any other name is start) and
 * return the screen to draw over it.
 */
export function stageShot(name, kitchen) {
  kitchen.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    kitchen.phase = 'title';
    runFor(kitchen, 4, []);
    return { screen: SCREEN_TITLE };
  }
  kitchen.startGame();
  kitchen.deck.spawnIn = 0.2;
  if (name === 'end') {
    // Play three full shifts with the scripted cook serving when it can, then let the clock
    // run the last day out: the frame shows the final summary screen.
    for (let day = 1; day <= 3; day += 1) {
      for (let cycle = 0; cycle < 8; cycle += 1) {
        runFor(kitchen, 6, cookFirstOrder(kitchen));
        if (kitchen.plateReady) {
          kitchen.serve();
        } else {
          // A four-ingredient ticket needs its second pass to finish.
          runFor(kitchen, 2, []);
          while (kitchen.addToPlate()) { /* plate what the second pass finished */ }
          if (kitchen.plateReady) kitchen.serve();
        }
        if (kitchen.phase !== 'play') break;
      }
      if (kitchen.phase !== 'play') break;
      kitchen.timeLeft = 0.5;
      runFor(kitchen, 1, []);
      if (kitchen.phase === 'day-end') kitchen.startDay(day + 1);
      else break;
    }
    return { screen: kitchen.phase === 'over' ? SCREEN_OVER : SCREEN_DAY_END };
  }
  if (name === 'serve') {
    // Cook the first ticket fully, then stop one beat before serving: the plate glows READY.
    runFor(kitchen, 8, cookFirstOrder(kitchen));
    return { screen: SCREEN_PLAY };
  }
  // play: mid-rush on day 1 — tickets on the rail, a dish half-plated, a second dish's
  // ingredients already in the tray, the timer counting down.
  const actions = cookFirstOrder(kitchen);
  runFor(kitchen, 6, actions);
  if (kitchen.plateReady) {
    kitchen.serve();
    const second = kitchen.deck.orders[0];
    if (second) {
      for (const id of second.recipe.needs.slice(0, 2)) kitchen.grab(id);
      kitchen.sendToStation('board');
      kitchen.sendToStation('grill');
      kitchen.sendToStation('pot');
      runFor(kitchen, 2.5, []);
      kitchen.addToPlate();
    }
  }
  // If the first plate was not ready yet, it already sits mid-assembly (3 of 4); either
  // way the clock runs on so more tickets join the rail.
  runFor(kitchen, 17.5, []);
  return { screen: SCREEN_PLAY };
}
