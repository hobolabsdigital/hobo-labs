import reel from '../reel.json';
import { REEL } from '../content';
import { ReelPlayer, type ReelClip } from './ReelPlayer';

/** Renders nothing until `npm run reel -- <folder>` has written clips into reel.json. */
export function Showreel() {
  const clips = reel as ReelClip[];
  if (!clips.length) return null;
  const total = Math.round(clips.reduce((s, c) => s + c.duration, 0));
  return (
    <div className="showreel">
      <h3 className="caption-head" data-reveal>
        {REEL.heading} · {String(clips.length).padStart(2, '0')} films · {Math.floor(total / 60)}:
        {String(total % 60).padStart(2, '0')}
      </h3>
      {REEL.intro && (
        <p className="lede showreel__intro" data-reveal>
          {REEL.intro}
        </p>
      )}
      <ReelPlayer clips={clips} label={REEL.label} />
      <p className="showreel__cut" data-reveal>
        <a className="tag tag--live" href={REEL.fullCut.href} target="_blank" rel="noopener noreferrer">
          {REEL.fullCut.label} ↗
        </a>
      </p>
    </div>
  );
}
