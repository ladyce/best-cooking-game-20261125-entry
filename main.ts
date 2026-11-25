// Ember & Thyme — the entry program (Node 22, standard library only). It hands the game in:
// it copies this repository's game/ and screenshots/ into the output directory and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Count the files under a directory, so the run can refuse to hand in a broken tree. */
function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function handIn(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) throw new Error(`missing ${sourceDir}`);
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
handIn(join(repoRoot, 'game'), join(outputDir, 'game'));
handIn(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const gameFiles = countFiles(join(outputDir, 'game'));
const shotFiles = readdirSync(join(outputDir, 'screenshots')).filter((n) => !n.startsWith('.'));
if (gameFiles === 0) throw new Error('game/ handed in empty');
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotFiles.length}`);
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in
// game/ or 48 MiB of game files, in all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(
  `Ember & Thyme handed in: ${gameFiles} game files, ${shotFiles.length} screenshots, dossier ${dossierBytes} bytes.`,
);
