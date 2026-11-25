// Ember & Thyme — every tuning number, colour, recipe and screen rectangle in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window, so no
// rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 90;
export const DAYS = 3;
export const MAX_HEARTS = 3;
export const TRAY_SLOTS = 3;
export const MAX_ORDERS = 4;

export const PALETTE = {
  wall: '#f6e3bd',
  wallStripe: '#eed3a0',
  floor: '#a9713d',
  floorDark: '#96602f',
  counterTop: '#7c4a21',
  counterFace: '#5d3413',
  steel: '#c7ccd6',
  steelDark: '#9aa1ad',
  ticket: '#fff8e2',
  ticketEdge: '#d9b96a',
  ink: '#2e2620',
  muted: '#7a6a58',
  cream: '#fff3d6',
  tomato: '#d94f30',
  herb: '#4d7c4f',
  gold: '#e8a93d',
  chili: '#c22e2e',
  danger: '#c22e2e',
  ok: '#3f8f4f',
  plate: '#f4f6f8',
  shadow: 'rgba(46,38,32,0.25)',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
export const BEST_KEY = 'ember-and-thyme.best';

/** Ingredients. prep: none = ready as picked; chop/grill/boil = station + seconds. */
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', prep: 'none', color: '#e0a458', dark: '#b97f36' },
  { id: 'patty', name: 'Patty', key: '2', prep: 'grill', prepTime: 3.0, color: '#8a5a33', dark: '#5f3a1d' },
  { id: 'cheese', name: 'Cheese', key: '3', prep: 'none', color: '#f2c230', dark: '#c99a17' },
  { id: 'lettuce', name: 'Lettuce', key: '4', prep: 'chop', prepTime: 1.2, color: '#69a84f', dark: '#437733' },
  { id: 'tomato', name: 'Tomato', key: '5', prep: 'chop', prepTime: 1.2, color: '#d94f30', dark: '#a83220' },
  { id: 'noodle', name: 'Noodle', key: '6', prep: 'boil', prepTime: 4.0, color: '#f2d06b', dark: '#c9a13a' },
  { id: 'egg', name: 'Egg', key: '7', prep: 'none', color: '#fdf6e3', dark: '#d9c48f' },
  { id: 'chili', name: 'Chili', key: '8', prep: 'none', color: '#c22e2e', dark: '#8f1d1d' },
];
export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

/** Recipes. `needs` lists ingredient ids; a plate serves when its contents match exactly. */
export const RECIPES = [
  { id: 'ember-burger', name: 'Ember Burger', needs: ['bun', 'patty', 'lettuce'], price: 8, day: 1 },
  { id: 'golden-melt', name: 'Golden Melt', needs: ['bun', 'patty', 'cheese'], price: 9, day: 1 },
  { id: 'garden-stack', name: 'Garden Stack', needs: ['bun', 'lettuce', 'tomato', 'cheese'], price: 11, day: 1 },
  { id: 'sunrise-ramen', name: 'Sunrise Ramen', needs: ['noodle', 'egg', 'chili'], price: 10, day: 1 },
  { id: 'crimson-ramen', name: 'Crimson Ramen', needs: ['noodle', 'tomato', 'egg'], price: 10, day: 2 },
  { id: 'cheesy-ramen', name: 'Cheesy Ramen', needs: ['noodle', 'cheese', 'chili'], price: 11, day: 2 },
  { id: 'patty-melt', name: 'Patty Melt', needs: ['bun', 'patty', 'cheese', 'tomato'], price: 12, day: 3 },
  { id: 'veggie-ramen', name: 'Veggie Ramen', needs: ['noodle', 'lettuce', 'tomato', 'chili'], price: 11, day: 3 },
];
export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

/** Per-day pressure: order spawn gap, order patience, and the rush-hour window. */
export const DAY_TUNING = {
  1: { spawnGap: 8.0, patience: 50, recipes: 4 },
  2: { spawnGap: 7.0, patience: 48, recipes: 6 },
  3: { spawnGap: 6.5, patience: 46, recipes: 8 },
};
export const RUSH_LAST_SECONDS = 25;
export const RUSH_SPAWN_FACTOR = 0.65;
export const RUSH_TIP_FACTOR = 2;

/** Screen rectangles for the kitchen stations, bins, plate and serve window. */
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  orderRail: { x: 16, y: 72, w: 1248, h: 84 },
  bins: { x: 16, y: 160, w: 138, h: 112, cols: 2, gap: 8 },
  board: { x: 316, y: 160, w: 136, h: 140 },
  grill: { x: 460, y: 160, w: 136, h: 140 },
  pot: { x: 604, y: 160, w: 136, h: 140 },
  plateCounter: { x: 316, y: 316, w: 424, h: 184 },
  plate: { x: 452, y: 356, w: 152, h: 104 },
  trash: { x: 676, y: 420, w: 56, h: 60 },
  serveWindow: { x: 756, y: 160, w: 508, h: 140 },
  serveBell: { x: 1130, y: 190, w: 110, h: 80 },
  recipeBook: { x: 756, y: 312, w: 508, h: 188 },
  tray: { x: 316, y: 516, w: 424, h: 64 },
  chef: { x: 470, y: 588, w: 120, h: 120 },
  dayBanner: { x: 340, y: 240, w: 600, h: 200 },
};

/** Station kinds, in the order the keyboard cycles them. */
export const STATIONS = [
  { kind: 'board', prep: 'chop', label: 'CHOP BOARD', key: 'C' },
  { kind: 'grill', prep: 'grill', label: 'GRILL', key: 'G' },
  { kind: 'pot', prep: 'boil', label: 'STOCK POT', key: 'B' },
];
