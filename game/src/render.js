// Every pixel of Ember & Thyme is drawn here on one canvas, from the kitchen state alone:
// the order rail, the ingredient bins, the three stations, the plate mid-assembly, the pass,
// the recipe book, the chef and the HUD. Nothing is an image file, so the game loads nothing.
import {
  FONT,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  LAYOUT,
  PALETTE,
  RECIPES,
  STATIONS,
} from './config.js';
import { PHASE_DAY_END, PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './kitchen.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_DAY_END = 'day-end';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/** Draw one ingredient as a flat vector icon: no image files, every icon is code. */
export function drawIngredient(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const def = INGREDIENT_BY_ID[id];
  if (id === 'bun') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(0, 2, s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.fillRect(-s, 2, s * 2, s * 0.28);
    ctx.fillStyle = '#fff3d6';
    for (const dx of [-s * 0.5, 0, s * 0.5]) {
      ctx.beginPath();
      ctx.arc(dx, -s * 0.45, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = def.color;
    roundRect(ctx, -s, -s * 0.45, s * 2, s * 0.9, s * 0.4);
    ctx.fill();
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 2;
    for (const dx of [-s * 0.55, 0, s * 0.55]) {
      ctx.beginPath();
      ctx.moveTo(dx, -s * 0.3);
      ctx.lineTo(dx, s * 0.3);
      ctx.stroke();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(s, s * 0.6);
    ctx.lineTo(s, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = def.dark;
    for (const [dx, dy] of [[-s * 0.4, s * 0.25], [s * 0.3, s * 0.3], [s * 0.45, -s * 0.05]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      const r = s * (i % 2 === 0 ? 1 : 0.72);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(0, s * 0.5);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(-s * 0.35, -s * 1.05);
    ctx.lineTo(0, -s * 0.85);
    ctx.lineTo(s * 0.35, -s * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-s * 0.35, -s * 0.25, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'noodle') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = s * 0.28;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      const y = -s * 0.5 + i * s * 0.5;
      ctx.moveTo(-s * 0.8, y);
      ctx.bezierCurveTo(-s * 0.3, y - s * 0.35, s * 0.3, y + s * 0.35, s * 0.8, y);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.95, s * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.arc(s * 0.15, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(s * 0.05, -s * 0.12, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'chili') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = s * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.2, s * 0.4, s * 0.85, s * 0.75);
    ctx.stroke();
    ctx.strokeStyle = '#4d7c4f';
    ctx.lineWidth = s * 0.22;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.9, -s * 0.95, -s * 0.5, -s * 0.95);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBin(ctx, index, def, t) {
  const cols = LAYOUT.bins.cols;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = LAYOUT.bins.x + col * (LAYOUT.bins.w + LAYOUT.bins.gap);
  const y = LAYOUT.bins.y + row * (LAYOUT.bins.h + LAYOUT.bins.gap);
  roundRect(ctx, x, y, LAYOUT.bins.w, LAYOUT.bins.h, 12);
  ctx.fillStyle = '#fff3d6';
  ctx.fill();
  ctx.strokeStyle = '#d9b96a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const bob = Math.sin(t * 2 + index) * 2;
  drawIngredient(ctx, def.id, x + LAYOUT.bins.w / 2, y + 44 + bob, 30);
  text(ctx, def.name, x + LAYOUT.bins.w / 2, y + 88, 16, PALETTE.ink, '700', 'center');
  pill(ctx, x + 8, y + 8, 22, 22, PALETTE.ink, null);
  text(ctx, def.key, x + 19, y + 19, 13, '#fff3d6', '800', 'center');
  if (def.prep !== 'none') {
    text(ctx, def.prep.toUpperCase(), x + LAYOUT.bins.w - 10, y + 19, 10, PALETTE.muted, '800', 'right');
  }
}

function drawStation(ctx, kind, station, t) {
  const rect = kind === 'board' ? LAYOUT.board : kind === 'grill' ? LAYOUT.grill : LAYOUT.pot;
  const meta = STATIONS.find((s) => s.kind === kind);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = kind === 'grill' ? '#3a3230' : kind === 'pot' ? '#c7ccd6' : '#d9a05b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(46,38,32,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, meta.label, rect.x + rect.w / 2, rect.y + 18, 13, kind === 'grill' ? '#f6e3bd' : PALETTE.ink, '800', 'center');
  text(ctx, `[${meta.key}]`, rect.x + rect.w / 2, rect.y + rect.h - 14, 11, kind === 'grill' ? '#c9a86a' : PALETTE.muted, '700', 'center');
  if (kind === 'grill' && station.busy) {
    for (let i = 0; i < 3; i += 1) {
      const flick = Math.sin(t * 9 + i * 2.1) * 3;
      ctx.fillStyle = i === 1 ? '#f2c230' : '#d94f30';
      ctx.beginPath();
      ctx.ellipse(rect.x + 34 + i * 34, rect.y + 96 + flick, 10, 14 + flick, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (kind === 'pot' && station.busy) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const rise = ((t * 0.7 + i * 0.33) % 1) * 26;
      ctx.beginPath();
      ctx.arc(rect.x + 40 + i * 28, rect.y + 92 - rise, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (station.item) {
    const label = station.waiting ? 'READY — click to take' : INGREDIENT_BY_ID[station.item].name;
    drawIngredient(ctx, station.item, rect.x + rect.w / 2, rect.y + 62, 26);
    if (station.total > 0) {
      const w = rect.w - 32;
      roundRect(ctx, rect.x + 16, rect.y + rect.h - 34, w, 10, 5);
      ctx.fillStyle = 'rgba(46,38,32,0.3)';
      ctx.fill();
      roundRect(ctx, rect.x + 16, rect.y + rect.h - 34, w * station.fraction, 10, 5);
      ctx.fillStyle = PALETTE.gold;
      ctx.fill();
    }
    text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 44, 11, kind === 'grill' ? '#f6e3bd' : PALETTE.ink, '700', 'center');
  } else {
    text(ctx, 'empty', rect.x + rect.w / 2, rect.y + 62, 13, kind === 'grill' ? '#8b93a3' : PALETTE.muted, '600', 'center');
  }
}

function drawTicket(ctx, order, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = PALETTE.ticket;
  ctx.fill();
  ctx.strokeStyle = order.urgent ? PALETTE.danger : PALETTE.ticketEdge;
  ctx.lineWidth = order.urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, order.recipe.name, x + 12, y + 18, 15, PALETTE.ink, '800');
  text(ctx, `#${order.id}`, x + w - 10, y + 18, 12, PALETTE.muted, '700', 'right');
  const needed = order.recipe.needs;
  const slot = Math.min(34, (w - 24) / needed.length);
  needed.forEach((id, i) => {
    drawIngredient(ctx, id, x + 20 + i * slot + slot / 2, y + 48, 13);
  });
  const barW = w - 24;
  roundRect(ctx, x + 12, y + h - 16, barW, 8, 4);
  ctx.fillStyle = '#e5d9b8';
  ctx.fill();
  roundRect(ctx, x + 12, y + h - 16, barW * order.fraction, 8, 4);
  ctx.fillStyle = order.urgent ? PALETTE.danger : order.fraction < 0.6 ? PALETTE.gold : PALETTE.ok;
  ctx.fill();
  text(ctx, `${Math.ceil(order.left)}s`, x + w - 12, y + h - 26, 11, order.urgent ? PALETTE.danger : PALETTE.muted, '800', 'right');
}

function drawChef(ctx, kitchen, t) {
  const bob = Math.sin(kitchen.chefBob) * 3;
  const cx = kitchen.chefX;
  const baseY = LAYOUT.chef.y + LAYOUT.chef.h;
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 4, 46, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: white coat.
  ctx.fillStyle = '#f4f6f8';
  roundRect(ctx, cx - 26, baseY - 78 + bob, 52, 62, 14);
  ctx.fill();
  ctx.strokeStyle = '#c7ccd6';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Apron stripe.
  ctx.fillStyle = '#4d7c4f';
  ctx.fillRect(cx - 26, baseY - 52 + bob, 52, 8);
  // Head.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(cx, baseY - 92 + bob, 20, 0, Math.PI * 2);
  ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 12, baseY - 106 + bob, 11, 0, Math.PI * 2);
  ctx.arc(cx, baseY - 112 + bob, 13, 0, Math.PI * 2);
  ctx.arc(cx + 12, baseY - 106 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 20, baseY - 108 + bob, 40, 8);
  // Eyes + smile.
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(cx - 7, baseY - 94 + bob, 2.4, 0, Math.PI * 2);
  ctx.arc(cx + 7, baseY - 94 + bob, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, baseY - 88 + bob, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Arms toward the work.
  ctx.strokeStyle = '#f4f6f8';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 24, baseY - 64 + bob);
  ctx.lineTo(cx - 38, baseY - 44 + bob);
  ctx.moveTo(cx + 24, baseY - 64 + bob);
  ctx.lineTo(cx + 38, baseY - 44 + bob);
  ctx.stroke();
  text(ctx, 'Pip', cx, baseY + 12, 12, PALETTE.muted, '700', 'center');
}

function drawTray(ctx, kitchen) {
  const rect = LAYOUT.tray;
  text(ctx, 'TRAY', rect.x, rect.y - 10, 12, PALETTE.cream, '800');
  for (let i = 0; i < 3; i += 1) {
    const x = rect.x + i * 74;
    roundRect(ctx, x, rect.y, 64, 64, 10);
    ctx.fillStyle = 'rgba(255,243,214,0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,243,214,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const item = kitchen.tray[i];
    if (item) {
      drawIngredient(ctx, item.id, x + 32, rect.y + 30, 20);
      if (!item.prepped) {
        text(ctx, 'RAW', x + 32, rect.y + 54, 9, '#f2c230', '800', 'center');
      }
    }
  }
  text(ctx, 'click a station to prep · click the plate to add', rect.x + 240, rect.y + 32, 12, PALETTE.cream, '600');
}

function drawPlate(ctx, kitchen, t) {
  const rect = LAYOUT.plateCounter;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fill();
  ctx.strokeStyle = PALETTE.counterFace;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PLATING COUNTER', rect.x + 16, rect.y + 18, 13, '#f6e3bd', '800');
  const plate = LAYOUT.plate;
  if (kitchen.plateReady) {
    const glow = 0.5 + 0.3 * Math.sin(t * 5);
    ctx.save();
    ctx.shadowColor = '#e8a93d';
    ctx.shadowBlur = 24 * glow;
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath();
    ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h / 2, plate.w / 2, plate.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    text(ctx, 'READY TO SERVE!', plate.x + plate.w / 2, plate.y - 16, 14, '#e8a93d', '800', 'center');
  } else {
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath();
    ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h / 2, plate.w / 2, plate.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c7ccd6';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  kitchen.plate.forEach((id, i) => {
    const n = kitchen.plate.length;
    const cx = plate.x + plate.w / 2 + (i - (n - 1) / 2) * 34;
    drawIngredient(ctx, id, cx, plate.y + plate.h / 2, 17);
  });
  if (kitchen.plate.length === 0) {
    text(ctx, 'plate empty', plate.x + plate.w / 2, plate.y + plate.h / 2, 13, PALETTE.muted, '600', 'center');
  }
  const trash = LAYOUT.trash;
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 8);
  ctx.fillStyle = '#5d3413';
  ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'TRASH', trash.x + trash.w / 2, trash.y + 18, 11, '#f6e3bd', '800', 'center');
  text(ctx, 'dump', trash.x + trash.w / 2, trash.y + 38, 11, '#c9a86a', '600', 'center');
}

function drawServeWindow(ctx, kitchen, t) {
  const rect = LAYOUT.serveWindow;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = kitchen.plateReady ? '#3f8f4f' : '#2e2620';
  ctx.fill();
  ctx.strokeStyle = kitchen.plateReady ? '#e8a93d' : '#5d3413';
  ctx.lineWidth = kitchen.plateReady ? 4 : 2;
  ctx.stroke();
  text(ctx, 'THE PASS — SERVE HERE', rect.x + 20, rect.y + 26, 16, '#f6e3bd', '800');
  text(
    ctx,
    kitchen.plateReady ? 'Dish complete — ring the bell!' : 'Finish a plate to match an order ticket',
    rect.x + 20,
    rect.y + 52, 13, kitchen.plateReady ? '#e8f5d0' : '#c9a86a', '600',
  );
  const bell = LAYOUT.serveBell;
  ctx.fillStyle = '#e8a93d';
  ctx.beginPath();
  ctx.arc(bell.x + bell.w / 2, bell.y + 34, 26, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(bell.x + bell.w / 2 - 30, bell.y + 34, 60, 8);
  ctx.fillStyle = '#c99a17';
  ctx.beginPath();
  ctx.arc(bell.x + bell.w / 2 + 30, bell.y + 48, 5, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'RING [Space]', bell.x + bell.w / 2, bell.y + 66, 11, '#f6e3bd', '700', 'center');
  if (kitchen.plateReady) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 6);
    ctx.save();
    ctx.globalAlpha = pulse;
    text(ctx, '★ SERVE ★', rect.x + 300, rect.y + 100, 26, '#e8a93d', '800', 'center');
    ctx.restore();
  }
}

function drawRecipeBook(ctx, kitchen) {
  const rect = LAYOUT.recipeBook;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = '#fff8e2';
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'RECIPE BOOK — The Copper Kettle menu', rect.x + 16, rect.y + 20, 14, PALETTE.ink, '800');
  const colW = (rect.w - 32) / 2;
  RECIPES.forEach((recipe, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = rect.x + 16 + col * colW;
    const y = rect.y + 34 + row * 38;
    const locked = recipe.day > kitchen.day;
    text(ctx, locked ? `Day ${recipe.day} · ${recipe.name}` : recipe.name, x, y + 8, 13, locked ? '#b0a58f' : PALETTE.ink, '700');
    recipe.needs.forEach((id, j) => {
      drawIngredient(ctx, id, x + 8 + j * 24, y + 26, 9);
    });
    text(ctx, `$${recipe.price}`, x + colW - 12, y + 8, 13, locked ? '#b0a58f' : PALETTE.tomato, '800', 'right');
  });
}

function drawOrderRail(ctx, kitchen) {
  const rail = LAYOUT.orderRail;
  text(ctx, 'ORDER BOARD', rail.x, rail.y - 6, 12, PALETTE.cream, '800');
  if (kitchen.deck.orders.length === 0) {
    text(ctx, 'No orders yet — the dining room is quiet…', rail.x + 8, rail.y + 40, 14, PALETTE.cream, '600');
    return;
  }
  const w = 296;
  kitchen.deck.orders.forEach((order, i) => {
    drawTicket(ctx, order, rail.x + i * (w + 12), rail.y, w, rail.h);
  });
}

function drawTopBar(ctx, kitchen) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = '#2e2620';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  text(ctx, 'EMBER & THYME', 20, bar.y + 28, 22, '#f6e3bd', '800');
  text(ctx, 'The Copper Kettle', 210, bar.y + 30, 13, '#c9a86a', '600');
  text(ctx, `DAY ${kitchen.day}/3`, 400, bar.y + 28, 16, '#fff3d6', '800');
  const mins = Math.floor(kitchen.timeLeft / 60);
  const secs = Math.floor(kitchen.timeLeft % 60);
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  const urgent = kitchen.timeLeft <= 15;
  pill(ctx, 500, bar.y + 10, 110, 36, urgent ? PALETTE.danger : '#f6e3bd', null);
  text(ctx, 'TIME', 508, bar.y + 28, 11, '#c9a86a', '800');
  text(ctx, clock, 555, bar.y + 29, 18, urgent ? '#fff3d6' : PALETTE.ink, '800', 'center');
  text(ctx, `COINS ${kitchen.coins}`, 660, bar.y + 28, 17, '#e8a93d', '800');
  text(ctx, `SCORE ${kitchen.score}`, 780, bar.y + 28, 17, '#fff3d6', '800');
  if (kitchen.combo >= 2) {
    text(ctx, `COMBO x${kitchen.combo}`, 920, bar.y + 28, 17, '#d94f30', '800');
  }
  let hearts = '';
  for (let i = 0; i < 3; i += 1) hearts += i < kitchen.hearts ? '♥' : '♡';
  text(ctx, hearts, 1000, bar.y + 28, 20, '#d94f30', '800');
  text(ctx, 'P pause · M mute', 1190, bar.y + 28, 12, '#8b93a3', '600', 'right');
}

function drawBackground(ctx, t) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = PALETTE.wallStripe;
  for (let x = 0; x < 1280; x += 96) ctx.fillRect(x, 56, 48, 96);
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 152, 1280, 568);
  ctx.fillStyle = PALETTE.floorDark;
  for (let y = 200; y < 720; y += 64) ctx.fillRect(0, y, 1280, 4);
  // Hanging lamps over the pass.
  for (const lx of [820, 1000, 1180]) {
    ctx.strokeStyle = '#5d3413';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 56);
    ctx.lineTo(lx, 96);
    ctx.stroke();
    const glow = 0.85 + 0.15 * Math.sin(t * 2 + lx);
    ctx.fillStyle = `rgba(242,194,48,${glow})`;
    ctx.beginPath();
    ctx.arc(lx, 104, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloaters(ctx, kitchen) {
  for (const f of kitchen.floaters) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y - (1.2 - f.life) * 30, 20, f.color, '800', 'center');
    ctx.restore();
  }
}

function overlay(ctx, title, lines, hint, accent) {
  ctx.fillStyle = 'rgba(46,38,32,0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  const rect = LAYOUT.dayBanner;
  const y0 = 150;
  roundRect(ctx, rect.x, y0, rect.w, 300, 16);
  ctx.fillStyle = '#fff8e2';
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, 640, y0 + 48, 34, accent, '800', 'center');
  lines.forEach((line, i) => {
    text(ctx, line, 640, y0 + 104 + i * 34, 18, PALETTE.ink, '600', 'center');
  });
  text(ctx, hint, 640, y0 + 262, 15, PALETTE.muted, '700', 'center');
}

export function drawGame(ctx, kitchen, screen) {
  const t = kitchen.elapsed;
  drawBackground(ctx, t);
  if (screen === SCREEN_TITLE) {
    drawTopBar(ctx, kitchen);
    drawOrderRail(ctx, kitchen);
    INGREDIENTS.forEach((def, i) => drawBin(ctx, i, def, t));
    drawStation(ctx, 'board', kitchen.stations.board, t);
    drawStation(ctx, 'grill', kitchen.stations.grill, t);
    drawStation(ctx, 'pot', kitchen.stations.pot, t);
    drawPlate(ctx, kitchen, t);
    drawServeWindow(ctx, kitchen, t);
    drawRecipeBook(ctx, kitchen);
    drawTray(ctx, kitchen);
    drawChef(ctx, kitchen, t);
    overlay(
      ctx,
      'EMBER & THYME',
      [
        'Rush hour at The Copper Kettle — grab, chop, grill, boil, plate, serve.',
        'Match every order ticket before its patience runs out.',
        'Three shifts, eight recipes, one very hungry dining room.',
        '1-8 grab  ·  C chop  ·  G grill  ·  B boil  ·  Space serve',
      ],
      'Click or press Enter to start your shift',
      PALETTE.tomato,
    );
    return;
  }
  drawTopBar(ctx, kitchen);
  drawOrderRail(ctx, kitchen);
  if (kitchen.flash && kitchen.phase === PHASE_PLAY) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, kitchen.flash.life);
    pill(ctx, 440, 66, 400, 40, PALETTE.danger, '#fff3d6');
    text(ctx, kitchen.flash.text, 640, 87, 18, '#fff3d6', '800', 'center');
    ctx.restore();
  }
  INGREDIENTS.forEach((def, i) => drawBin(ctx, i, def, t));
  drawStation(ctx, 'board', kitchen.stations.board, t);
  drawStation(ctx, 'grill', kitchen.stations.grill, t);
  drawStation(ctx, 'pot', kitchen.stations.pot, t);
  drawPlate(ctx, kitchen, t);
  drawServeWindow(ctx, kitchen, t);
  drawRecipeBook(ctx, kitchen);
  drawTray(ctx, kitchen);
  drawChef(ctx, kitchen, t);
  drawFloaters(ctx, kitchen);
  if (screen === SCREEN_DAY_END) {
    const last = kitchen.dayStats[kitchen.dayStats.length - 1];
    overlay(
      ctx,
      `DAY ${kitchen.day} DONE!`,
      [
        `Dishes served: ${last ? last.served : 0}   ·   Coins earned: ${last ? last.earned : 0}`,
        `Total score: ${kitchen.score}   ·   Best combo: x${kitchen.bestCombo}`,
        kitchen.day === 2 ? 'Final day next — the whole menu, faster tickets.' : 'Day 2 next — new recipes join the menu.',
      ],
      'Click or press Enter for the next shift',
      PALETTE.herb,
    );
  } else if (screen === SCREEN_OVER) {
    const stars = '★'.repeat(kitchen.stars()) + '☆'.repeat(3 - kitchen.stars());
    overlay(
      ctx,
      kitchen.hearts <= 0 ? 'SERVICE FAILED' : 'SHIFT COMPLETE!',
      [
        stars,
        `Dishes served: ${kitchen.served}   ·   Coins earned: ${kitchen.coins}`,
        `Final score: ${kitchen.score}   ·   Best combo: x${kitchen.bestCombo}`,
        kitchen.hearts <= 0
          ? 'Too many orders walked out. The Kettle believes in you — try again.'
          : 'The dining room is full and happy. Pip hangs up the apron.',
      ],
      'Click or press Enter to cook again',
      kitchen.hearts <= 0 ? PALETTE.danger : PALETTE.gold,
    );
  }
}
