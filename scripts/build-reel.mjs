#!/usr/bin/env node
/**
 * Encodes a folder of videos into web-ready showreel clips + a manifest.
 *
 *   npm run reel -- "/Users/emile/Downloads/nutrons video"
 *   npm run reel -- "<folder>" --max=1920 --force
 *
 * Clips play in file-name order, so prefix files 01_, 02_ … to set the order.
 * Output: public/work/reel/<slug>.mp4 + <slug>.jpg poster, and
 * src/features/site/reel.json. Titles and notes you edit in reel.json survive
 * re-runs. Unchanged clips aren't re-encoded unless you pass --force.
 *
 * Needs ffmpeg + ffprobe on PATH (brew install ffmpeg), or FFMPEG_PATH /
 * FFPROBE_PATH pointing at them.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const OUT_DIR = 'public/work/reel';
const MANIFEST = 'src/features/site/reel.json';
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi']);

const args = process.argv.slice(2);
const srcDir = args.find((a) => !a.startsWith('--'));
const force = args.includes('--force');
const maxEdge = Number((args.find((a) => a.startsWith('--max=')) || '--max=1280').slice(6));

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!srcDir) fail('Pass the folder of videos: npm run reel -- "/path/to/folder"');
if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) fail(`Not a folder: ${srcDir}`);
for (const [bin, name] of [
  [FFMPEG, 'ffmpeg'],
  [FFPROBE, 'ffprobe'],
]) {
  try {
    execFileSync(bin, ['-version'], { stdio: 'ignore' });
  } catch {
    fail(`${name} not found. Install it (brew install ffmpeg) or set ${name.toUpperCase()}_PATH.`);
  }
}

const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// "03_cashew-commander intro" → "Cashew commander intro"
const prettify = (s) => {
  const t = s.replace(/^\d+[\s._-]*/, '').replace(/[._-]+/g, ' ').trim() || s;
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function probe(file) {
  const out = execFileSync(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]);
  const info = JSON.parse(out.toString());
  const v = info.streams.find((s) => s.codec_type === 'video');
  if (!v) return null;
  const rotation = Math.abs(
    Number(v.tags?.rotate ?? v.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0),
  );
  const swap = rotation === 90 || rotation === 270;
  return {
    width: swap ? v.height : v.width,
    height: swap ? v.width : v.height,
    duration: Number(info.format.duration ?? v.duration ?? 0),
    audio: info.streams.some((s) => s.codec_type === 'audio'),
  };
}

const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
const bySlug = new Map(previous.map((c) => [c.slug, c]));

const files = readdirSync(srcDir)
  .filter((f) => VIDEO_EXT.has(extname(f).toLowerCase()) && !f.startsWith('.'))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!files.length) fail(`No videos (${[...VIDEO_EXT].join(' ')}) in ${srcDir}`);

mkdirSync(OUT_DIR, { recursive: true });
const clips = [];

for (const file of files) {
  const input = resolve(join(srcDir, file));
  const name = basename(file, extname(file));
  const slug = slugify(name) || `clip-${clips.length + 1}`;
  const mp4 = join(OUT_DIR, `${slug}.mp4`);
  const jpg = join(OUT_DIR, `${slug}.jpg`);
  const src = probe(input);
  if (!src) {
    console.warn(`  skip ${file} — no video stream`);
    continue;
  }

  const stale = !existsSync(mp4) || statSync(mp4).mtimeMs < statSync(input).mtimeMs;
  if (force || stale) {
    process.stdout.write(`  encode ${file} … `);
    // Long edge capped at --max, even dimensions, ≤30fps, H.264 + faststart so it streams.
    const scale = `scale='if(gte(iw,ih),min(${maxEdge},iw),-2)':'if(gte(iw,ih),-2,min(${maxEdge},ih))',format=yuv420p`;
    execFileSync(
      FFMPEG,
      [
        '-y', '-v', 'error', '-i', input,
        '-map', '0:v:0', ...(src.audio ? ['-map', '0:a:0'] : []),
        '-vf', scale, '-fpsmax', '30',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high',
        ...(src.audio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']),
        '-movflags', '+faststart', mp4,
      ],
      { stdio: 'inherit' },
    );
    const at = Math.min(1.5, src.duration * 0.25).toFixed(2);
    execFileSync(
      FFMPEG,
      ['-y', '-v', 'error', '-ss', at, '-i', mp4, '-frames:v', '1', '-vf', "scale='min(960,iw)':-2", '-q:v', '4', jpg],
      { stdio: 'inherit' },
    );
    console.log('done');
  } else {
    console.log(`  keep   ${file} (unchanged — --force to re-encode)`);
  }

  const out = probe(mp4);
  const prev = bySlug.get(slug);
  clips.push({
    slug,
    title: prev?.title ?? prettify(name),
    note: prev?.note ?? '',
    src: `/work/reel/${slug}.mp4`,
    poster: `/work/reel/${slug}.jpg`,
    width: out.width,
    height: out.height,
    duration: Math.round(out.duration * 100) / 100,
    audio: out.audio,
  });
}

writeFileSync(MANIFEST, `${JSON.stringify(clips, null, 2)}\n`);
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const total = clips.reduce((s, c) => s + statSync(join('public', c.src)).size, 0);
console.log(`\n✔ ${clips.length} clips · ${Math.round(clips.reduce((s, c) => s + c.duration, 0))} s · ${mb(total)} → ${OUT_DIR}`);
console.log(`  Titles/notes: edit ${MANIFEST}, then re-run (or not — it's just JSON).\n`);
