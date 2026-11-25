# Ember & Thyme — Rush Hour at The Copper Kettle

[![make.fun](https://img.shields.io/badge/make.fun-best--cooking--game--20261125--0137-orange)](https://make.fun/c/best-cooking-game-20261125-0137)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

A complete, original cooking game built for the [make.fun](https://make.fun)
**best-cooking-game-20261125-0137** bounty. You are Pip, the chef of The Copper
Kettle, a small bistro with a very hungry dining room and a clock that never
stops. Grab ingredients, chop, grill and boil them, plate exactly what each
order ticket asks for, and ring the bell at the pass before the ticket's
patience runs out.

## How to play

- **Grab** — click an ingredient bin, or press `1`–`8`.
- **Prep** — click the chop board (`C`), the grill (`G`) or the stock pot (`B`)
  to send a raw ingredient there. Patties grill, noodles boil, lettuce and
  tomatoes chop; buns, cheese, eggs and chilies are ready as picked.
- **Plate** — click the plate (or press `Space`) to add a prepped ingredient.
  The plate glows gold when it matches an open order.
- **Serve** — click the pass or ring the bell (`Space` when the plate is ready).
  Fast serves pay a patience tip; serving in a row builds a combo.
- **Trash** — click the trash bin to dump a wrong plate and start over.
- `P` pauses, `M` mutes.

Three 90-second shifts. Each day adds recipes (8 in all) and faster tickets;
the last 25 seconds of every shift are **Rush Hour** — tickets arrive faster
and tips double. Lose a ticket and you lose a heart; lose all three hearts
and the service fails.

## The menu

| Dish | Needs | Price |
| --- | --- | --- |
| Ember Burger | bun, patty, lettuce | $8 |
| Golden Melt | bun, patty, cheese | $9 |
| Garden Stack | bun, lettuce, tomato, cheese | $11 |
| Sunrise Ramen | noodle, egg, chili | $10 |
| Crimson Ramen | noodle, tomato, egg | $10 |
| Cheesy Ramen | noodle, cheese, chili | $11 |
| Patty Melt | bun, patty, cheese, tomato | $12 |
| Veggie Ramen | noodle, lettuce, tomato, chili | $11 |

## Play it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network: `game/` is plain static files, every sound is
synthesized with WebAudio, and every ingredient icon is drawn in code.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts` library.

## Screenshots

Staged from the real game with `?shot=` (`shots.json`):

- `1-start.jpg` — the title screen over the kitchen
- `2-play.jpg` — mid-rush on day 1, a dish half-plated
- `3-serve.jpg` — a finished plate, ready at the pass
- `4-end.jpg` — the final shift summary

## License

MIT — see [LICENSE](./LICENSE).
