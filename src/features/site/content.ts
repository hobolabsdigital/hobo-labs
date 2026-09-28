/**
 * Every word on the page lives here. Figures come from the CVs and are
 * measured from work that can be opened and walked through — keep it that way.
 */

export const CONTACT = {
  name: 'Emile Harmel',
  email: 'hello@hobolabs.digital',
  phone: '+43 680 154 2697',
  phoneHref: 'tel:+436801542697',
  linkedin: 'https://www.linkedin.com/in/emile-harmel-5bb238b4',
  linkedinLabel: 'linkedin.com/in/emile-harmel',
  base: 'Graz, Austria',
  zone: 'CET — an hour ahead of London',
  languages: 'English (mother tongue) · German (Grundkenntnisse, improving)',
  cvs: [
    { label: 'CV — Senior Engineer', href: '/cv/Emile_Harmel_CV_Engineering.pdf' },
    { label: 'CV — Creative Technologist', href: '/cv/Emile_Harmel_CV_Creative_Technologist.pdf' },
  ],
} as const;

export const SECTIONS = [
  { id: 'top', sheet: '01', label: 'General arrangement' },
  { id: 'receipts', sheet: '02', label: 'Receipts' },
  { id: 'nutrons', sheet: '03', label: 'Nutrons' },
  { id: 'monstoryx', sheet: '04', label: 'MonstoryX' },
  { id: 'method', sheet: '05', label: 'Method' },
  { id: 'orchestration', sheet: '06', label: 'Orchestration' },
  { id: 'work', sheet: '07', label: 'Section view' },
  { id: 'contact', sheet: '08', label: 'Contact' },
] as const;

export const SHEET_COUNT = String(SECTIONS.length).padStart(2, '0');

export const HERO = {
  kicker: 'Portfolio — Rev. 2026.09',
  lines: ['A thousand frames.', 'Ten on brand.', 'I build the filter.'],
  intro:
    'Emile Harmel — creative technologist and senior TypeScript engineer. Twenty years of judging a page, now compiled into agent pipelines: image, voice and video that stay on brand because code checks them, not because somebody hoped.',
  introShort:
    'Emile Harmel — creative technologist and senior TypeScript engineer. Agent pipelines where code, not hope, decides what ships.',
  roles: ['Creative Technologist', 'Senior Engineer', 'Agentic AI systems'],
};

export type Receipt = { value: number; prefix?: string; suffix?: string; display?: string; label: string; src: string };

export const RECEIPTS: Receipt[] = [
  { value: 264000, label: 'lines of TypeScript', src: 'MonstoryX platform' },
  { value: 14, label: 'weeks, blank repo to pre-alpha', src: 'MonstoryX platform' },
  { value: 2006, label: 'commits on main', src: 'MonstoryX platform' },
  { value: 62, label: 'architecture decision records', src: 'MonstoryX platform' },
  { value: 6600, prefix: '~', label: 'tests', src: 'MonstoryX platform' },
  { value: 3, display: '3/3', label: 'defects caught by the vision judge, 0 false fails', src: 'Keyframe QA' },
  { value: 18, prefix: '+', suffix: '%', label: 'conversion, Find My Mazda', src: 'Mazda Germany' },
  { value: 20000, label: 'unique QR codes, generated and validated', src: 'Nutrons' },
];

export const FIGMA = {
  decisions:
    'https://www.figma.com/board/nJLrT33v68kzDTdGbu20Sv/Nutrons-Web-App-%E2%80%94-Phase-1-Decisions--amp--Milestones?node-id=0-1',
  shortlist: 'https://www.figma.com/board/yvFzLRlCkRHPAIsRn9WtvQ/Nutrons-%E2%80%94-Style-Shortlist?node-id=0-1',
  styleDeck:
    'https://www.figma.com/deck/vlbJMIk2GBLwjr83GP3aRi/Nutrons-%E2%80%94-Style-Direction-Deck?node-id=2-2&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1',
  designSystem: 'https://www.figma.com/design/7nwOnCzIJWg5Ae7jLUGYaF/Nutrons-%E2%80%94-Design-System-v0.1?node-id=0-1',
  webApp: 'https://www.figma.com/design/dH1M7TqXMZEpNCDav9jIsf/Nutrons-Web-App?node-id=123-851',
  installDeck:
    'https://www.figma.com/deck/ofZbNgePEmRvKItisR5shT/Nutrons-Bible-%E2%80%94-How-to-Use---Install?node-id=3-2&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1',
  workshopDeck:
    'https://www.figma.com/deck/DNLVSq27ydu3noZWl2cZX1/Nutrons-%E2%80%94-Image-Pipeline-Workshop?node-id=2-2&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1',
  stressTest:
    'https://www.figma.com/board/o8oi4HpeGF01EFuWoajwTI/Nutrons-Bible-%E2%80%94-YOLO-Stress-Test--20-generations-?node-id=0-1',
};

export const NUTRONS = {
  client: 'Awesome Nuts GmbH',
  year: '2026',
  title: ['Blank canvas → on‑brand generation.', 'The whole trail, in public.'],
  intro:
    'Nutrons is a comic-book snack brand with a world behind every pack. I designed and built the hub: scan the QR code on a pack, collect Seeds, fly Canopy Run, grow the World Tree. Fixed fee, hard launch — AI in every phase, a human owning every decision.',
  live: [
    { label: 'Hub · portal.getnutrons.com', href: 'https://portal.getnutrons.com/' },
    { label: 'Base Camp · portal.getnutrons.com/camp', href: 'https://portal.getnutrons.com/camp' },
  ],
  facts: [
    { k: 'Stack', v: 'Next.js · TypeScript · Postgres with RLS' },
    { k: 'Economy', v: 'QR-scan rewards, levels and a leaderboard' },
    { k: 'Codes', v: '20,000 unique, generated and validated' },
    { k: 'Play', v: 'Canopy Run — one input, three worlds, 15 levels' },
    { k: 'Camp', v: 'XP, streaks, factions and a community World Tree' },
  ],
  trail: [
    {
      n: '01',
      title: 'Discover & decide',
      body: 'Discovery in FigJam: decisions and milestones logged as we went, style directions generated broad, then cut to a shortlist.',
      links: [
        { label: 'FigJam → Decisions & milestones', href: FIGMA.decisions },
        { label: 'FigJam → Style shortlist', href: FIGMA.shortlist },
      ],
    },
    {
      n: '02',
      title: 'Explore style',
      body: 'Generative exploration, curated into a direction deck — the taste decisions everything downstream inherits.',
      links: [{ label: 'Deck → Style direction', href: FIGMA.styleDeck }],
    },
    {
      n: '03',
      title: 'Systematise',
      body: 'Tokens, components and responsive variants assembled agentically through the Figma MCP, then refined by hand.',
      links: [
        { label: 'Figma → Design system v0.1', href: FIGMA.designSystem },
        { label: 'Figma → Web app, 3 breakpoints', href: FIGMA.webApp },
      ],
    },
    {
      n: '04',
      title: 'Build',
      body: 'The design system driven straight into a working app — agent-coded, human-reviewed, deployed.',
      links: [
        { label: 'Live → portal.getnutrons.com', href: 'https://portal.getnutrons.com/', live: true },
        { label: 'Live → Base Camp', href: 'https://portal.getnutrons.com/camp', live: true },
      ],
    },
    {
      n: '05',
      title: 'Codify the canon',
      body: 'The character and world bible shipped as an installable Claude Code plugin: canon rules, reference sheets, camera grammar, 7 skills and an image-gen server.',
      links: [
        { label: 'Deck → How to use & install', href: FIGMA.installDeck },
        { label: 'Deck → Image pipeline workshop', href: FIGMA.workshopDeck },
      ],
    },
    {
      n: '06',
      title: 'Stress-test',
      body: '20 unsupervised generations, QA’d against each character’s canon at full zoom. The misses taught the bible new rules.',
      links: [{ label: 'FigJam → YOLO stress test', href: FIGMA.stressTest }],
    },
  ],
  coaching:
    'Also: three sessions coaching the client’s in-house AI designer, from watching the workflow to running it herself.',
};

export const REEL = {
  heading: 'In motion — Nutrons films',
  label: 'Reel 01 · Nutrons',
  // The edited cut: title card, the seven films with crossfades, end card.
  fullCut: {
    href: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Eqykldhtmuqrb56bPCwGP0px9L/7c87ffda-fc42-4cfe-a258-c823fa6b0c99.mp4',
    label: 'Watch the full cut · 1:02 · 1080p',
  },
  intro:
    'Generated in Higgsfield and directed through the Nutrons bible, my canon plugin: character sheets, style clause and camera grammar travel with every prompt, so the crew stays on-model from shot to shot.',
};

export const MONSTORYX = {
  role: 'Co-founder & chief technologist',
  years: '2024 — present',
  title: ['Children speak.', 'Monsters listen.', 'A teacher approved every word.'],
  intro:
    'A language-learning game for primary-school children, about four to ten, with a teacher platform behind it. Teachers author short spoken quests with an AI co-author and approve every step; children play them in a world of clay monsters and answer by speaking, in English or Austrian German. The AI never reaches the child: every line was written or approved by a teacher, and every answer is judged by code against the answers the teacher accepted.',
  summit: {
    href: 'https://websummit.com/appearances/lis26/3925c4e5-b878-419d-8fe9-194ec7cf3bda/monstoryx/',
    impactHref: 'https://websummit.com/startups/impact-startups/',
    event: 'Web Summit Lisbon 2026',
    dates: '9–12 Nov',
    tracks: ['ALPHA startup', 'Impact startup'],
    note: 'Impact startups are picked for work towards the UN Sustainable Development Goals.',
  },
  links: [
    { label: 'Web Summit — MonstoryX', note: 'ALPHA · Impact startup · Lisbon, 9–12 Nov 2026', href: 'https://websummit.com/appearances/lis26/3925c4e5-b878-419d-8fe9-194ec7cf3bda/monstoryx/' },
    { label: 'youtube.com/@monstoryx/shorts', note: 'the studio’s films, public', href: 'https://www.youtube.com/@monstoryx/shorts' },
    { label: 'teach.monstoryx.app', note: 'the teacher platform, pre-alpha with teachers', href: 'https://teach.monstoryx.app' },
  ],
  pipeline: [
    { stage: 'Brief', gate: 'Co-author won’t plan until the level is settled — a rule in code' },
    { stage: 'Script', gate: '~28 violation types linted, retried once with the violations quoted' },
    { stage: 'Storyboard', gate: 'Camera grammar compiled from the canon package' },
    { stage: 'Keyframes ×4', gate: 'Four in parallel, ~17 s each, streaming into their slots' },
    { stage: 'Vision QA', gate: 'Trait by trait on crops, colour as a hue band' },
    { stage: 'Render', gate: 'x-corr ≥ 0.95 with its voice line, lag ≤ 100 ms — or re-render' },
    { stage: 'Assembly', gate: 'ffmpeg; HMAC-signed callbacks, deduped under a row lock' },
  ],
  /** Fig. 3.2 — a real output of the Finale pipeline. Shot starts are the film's cuts. */
  finale: {
    caption:
      'Fig. 3.2 — What the pipeline made: “Learning Shapes”, six pictures to a 40-second film. In the game it plays as “Our story” when the mission ends.',
    src: '/work/monstoryx/finale/learning-shapes.mp4',
    poster: '/work/monstoryx/finale/poster.jpg',
    duration: 40.2,
    shots: [
      { at: 0, who: 'Blorp', kind: 'Title', line: 'Learning Shapes', src: '/work/monstoryx/finale/shot-1.jpg' },
      { at: 2.97, who: 'Blorp', line: 'Blorp will roll this block like a ball!', src: '/work/monstoryx/finale/shot-2.jpg' },
      { at: 6.9, who: 'Lopsy', line: 'Flat edges stop, Blorp. Blocks do not roll.', src: '/work/monstoryx/finale/shot-3.jpg' },
      { at: 12.1, who: 'Lopsy', line: 'Round shapes roll. A circle has no sharp corners.', src: '/work/monstoryx/finale/shot-4.jpg' },
      { at: 18.13, who: 'Blorp', line: 'A circle rolls! Blorp pushes the block. Thud.', src: '/work/monstoryx/finale/shot-5.jpg' },
      { at: 23.2, who: 'Trio', line: 'A circle rolls. Flat edges stop every time.', src: '/work/monstoryx/finale/shot-6.jpg' },
    ] as { at: number; who: string; kind?: string; line: string; src: string }[],
  },
  systems: [
    {
      id: 'SYS-01',
      title: 'A multi-agent video pipeline',
      body: 'Four agents turn a quest into a narrated film. Failure, retry and refund are per slot, not per film; timeouts are sized from the measured worst case (~225 s a clip), not guessed.',
      stack: 'Flue · Hono · Gemini · fal.ai · Resemble · ffmpeg · Cloud Run',
    },
    {
      id: 'SYS-02',
      title: 'Character bibles as executable canon',
      body: 'Four characters’ sheets, camera grammar and style register compiled into agent prompts at build. Trait schemas hash-locked to the reference plates by tests; the judge calibrated from 5 false fails on 6 good frames to 3/3 defects, 0 false.',
      stack: 'Canon as a package · derived schemas · calibrated vision judge',
    },
    {
      id: 'SYS-03',
      title: 'A co-author, quest images and voice',
      body: '9 agent workflows and 16 skills co-author quests in English and German. Invented words are dropped by code. The model writes emotion tags; a deterministic compiler writes the SSML.',
      stack: 'Gemini · Ideogram v4 · Resemble · promptfoo · OpenTelemetry',
    },
    {
      id: 'SYS-04',
      title: 'The platform under it',
      body: '~190 API handlers, 43 Prisma models, RLS forced on 28 tables. A credit ledger where reserve, commit and refund share one transaction and one row lock. ~6,600 tests.',
      stack: 'Fastify · Prisma · Postgres · Next.js 16 · React 19 · Stripe · Turborepo',
    },
  ],
};

export type QuestStep = { n: string; label: string; title: string; body: string; src?: string; alt?: string };

/** Fig. 3.0 — one real quest ("Learning Shapes"), from the teacher's sentence to the child's world. */
export const QUEST = {
  caption: 'Fig. 3.0 — One quest, start to finish: a teacher’s sentence becomes a world a child can talk to.',
  video: {
    src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Eqykldhtmuqrb56bPCwGP0px9L/d11faea3-6c02-47a4-8758-1b6b78d0bb72.mp4',
    poster: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Eqykldhtmuqrb56bPCwGP0px9L/b97dfb42-f961-44d5-9305-faa012905fd6.jpg',
    width: 1280,
    height: 736,
    label: 'The student game · 1:48',
  },
  steps: [
    {
      n: '01',
      label: 'Describe',
      title: 'The teacher says what it’s for',
      body: 'One sentence: “I want to teach shapes to 2nd year primary class.” Reading level and subject are checked before anything is sent.',
      src: '/work/monstoryx/01-describe.jpg',
      alt: 'MonstoryX teacher platform: the Describe your lesson step, with reading level, subject and a one-sentence lesson.',
    },
    {
      n: '02',
      label: 'Co-author',
      title: 'The co-author asks before it writes',
      body: 'Pictures or not? What should the children be able to do by the end? Nothing reaches a child until the teacher approves it.',
      src: '/work/monstoryx/02-co-author.jpg',
      alt: 'The AI co-author interviewing the teacher about the shapes lesson.',
    },
    {
      n: '03',
      label: 'Brief',
      title: 'A brief to approve, not a surprise',
      body: 'Outcome, keywords from the school’s catalogue, one activity, the cast. A new word, “triangle”, is coined and queued for review rather than slipped in.',
      src: '/work/monstoryx/03-brief.jpg',
      alt: 'The proposed brief: learning outcome, keywords with one new word, activity and characters, ready for Approve & build.',
    },
    {
      n: '04',
      label: 'Build & check',
      title: 'Built beat by beat, then checked',
      body: 'Every beat has a setup, a spoken prompt and three recorded outcomes: correct, try again, reveal. Checks read the text for safety, reading level, structure and mood arc. Pass or flag, never a score.',
      src: '/work/monstoryx/04-build.jpg',
      alt: 'The built quest: beats in Blorp’s voice with correct, try-again and reveal lines, and checks that all pass.',
    },
    {
      n: '05',
      label: 'Finale',
      title: 'Agree the story, then film it',
      body: 'The mission’s closing film starts as a story the teacher signs off: where it happens, the fact children take home, the word they hear. Only then is it scripted, pictured and rendered.',
      src: '/work/monstoryx/05-finale.jpg',
      alt: 'The Finale step: shaping the story of the closing film before the script is written.',
    },
    {
      n: '06',
      label: 'Play',
      title: 'And a child plays it',
      body: 'In the browser, in a world of clay monsters. The child answers by speaking, judged against the teacher’s accepted answers, deterministically. The platform never stores the audio.',
    },
  ] as QuestStep[],
};

export const METHOD = [
  {
    title: 'Code decides what ships',
    body: 'Every model output is followed by something deterministic — a linter, a compiler, a judge with a calibrated threshold. A failure goes back to the model once, with the exact violations.',
  },
  {
    title: 'Canon as a package',
    body: 'A brand compiled into the machine rather than briefed at it. Sheets, style register, camera grammar and colour, hash-locked to reference plates by tests. When the brand changes, the tests fail — which is the point.',
  },
  {
    title: 'No agent grades its own work',
    body: 'Owners write, critics prove. The agent that builds never grades it: a critic with fresh context does, blind, against the bar the spec set. I set the architecture, review the diffs and merge what ships. The whole rig is on the next sheet.',
  },
  {
    title: 'Prototypes that are already code',
    body: 'FigJam discovery → generative exploration → a Figma design system via MCP → a deployed prototype. The client reviews the thing, not a picture of it.',
  },
  {
    title: 'Make it the team’s',
    body: 'A capability that lives in one person’s head is a bottleneck with good taste. Mine ships as rules, eval suites and installable plugins — plus coaching until a colleague no longer needs me.',
  },
];

export type RigCard = { id: string; title: string; body: string; stack: string };
export type RigStat = { value: string; label: string };

/** Figures measured from the MonstoryX platform repo and its Jira board, 2026-09-28. */
export const ORCHESTRATION = {
  title: ['Jira holds the ask.', 'The ADR holds the why.', 'A blind critic holds the line.'],
  intro:
    'I don’t prompt a chatbot and hope. I run a team of coding agents on the rails a good engineering org already trusts. A lead session dispatches, eleven owner agents each hold one seam of the codebase, and nobody grades their own work. Every change is a Jira ticket, every creative brief a spec with a bar to beat, every decision future code must obey an ADR. I merge. Nothing reaches main any other way.',
  rig: [
    { k: 'Tickets', v: 'Jira — the unit of delegation' },
    { k: 'Specs', v: 'Intent, constraints, acceptance test, the bar' },
    { k: 'Decisions', v: '62 ADRs, each titled as the decision' },
    { k: 'Owners', v: '11 charters, hired by the paths a change touches' },
    { k: 'Loop', v: 'Gauntlet — builder, blind critic, browser tester' },
    { k: 'Memory', v: 'Ruflo — memory bus, hooks, router', href: 'https://github.com/ruvnet/ruflo' },
    { k: 'Design', v: 'impeccable — fires on every UI write', href: 'https://github.com/pbakaus/impeccable' },
    { k: 'UX', v: 'intent agents — frame, design, audit, hand off' },
    { k: 'Harness', v: 'Claude Code — subagents, skills, hooks, MCP' },
  ] as { k: string; v: string; href?: string }[],
  flow: [
    { stage: 'Ticket', gate: 'Jira. Out of scope still gets a ticket, or it’s lost' },
    { stage: 'Spec', gate: 'Intent, constraints, acceptance test, the bar to beat' },
    { stage: 'Owner', gate: 'Hired by name from the paths the change touches' },
    { stage: 'Build', gate: 'One worktree, one branch, gates reported as totals' },
    { stage: 'Critic', gate: 'Fresh context, labels stripped, graded against the bar' },
    { stage: 'Re-check', gate: 'The lead re-runs every “not found” itself' },
    { stage: 'Merge', gate: 'The PR maps each change to its ADR. I merge' },
  ],
  flowLoops: { Critic: '↺ 1–3 rounds' } as Record<string, string>,
  stats: [
    { value: '62', label: 'ADRs, each titled as the decision it records' },
    { value: '51', label: 'PRs merged, not one of them by an agent' },
    { value: '110', label: 'tickets done, of ~511 filed. The board stays honest' },
    { value: '807', label: 'test files across 24 packages' },
    { value: '1–3', label: 'rounds for a typical change: one builder, one critic' },
    { value: '36 h', label: 'documents → quests: 7 build rounds, 4 browser passes' },
  ] as RigStat[],
  cards: [
    {
      id: 'RIG-01',
      title: 'A ticket for everything',
      body: 'A ticket is the unit of delegation. The lead session searches, then files it with the finding in the description, and anything a session calls “out of scope” or “pre-existing” must become one: a finding that lives only in a chat report is lost. Each ticket gets its own worktree and branch; its PR maps the change to the ADRs it obeys, rule by rule, and verdicts land as comments on the ticket. I merge and close. The lead never merges.',
      stack: 'Jira · git worktrees · one PR per ticket',
    },
    {
      id: 'RIG-02',
      title: 'Decisions written as sentences',
      body: 'An ADR’s title is the decision, as a sentence. Each one records who decided: my calls kept apart from the lead’s, and the lead’s marked as dials I can overturn. Code that obeys a decision cites its ADR at that line, and a reversal is written down as a reversal, the same day. Anything creative or ambiguous gets a spec first: intent in my words, the constraints, the acceptance test and the real reference it has to beat.',
      stack: '62 ADRs · design specs in the repo and an Obsidian vault',
    },
    {
      id: 'RIG-03',
      title: 'Owners write, critics prove',
      body: 'Eleven owner charters each name a seam by its paths and its invariants. The lead reads a ticket’s changed paths against them and hires an owner by name, to analyse or to build; the database owner reviews and never builds features. The builder reports its gates as totals, a critic with fresh context grades the work blind, and for UI a tester drives my browser in its own tab. Then the lead re-runs every “not found” itself. An agent’s grep scope is part of its claim.',
      stack: 'Gauntlet loop · 11 owner charters · browser tester',
    },
    {
      id: 'RIG-04',
      title: 'Memory, hooks and a design tripwire',
      body: 'Ruflo is the memory bus and hook layer, not the executor. Every non-trivial task starts with a memory search and ends by storing the lesson, written as the sentence a future session would type into the search box. Its router suggests the agent a prompt needs. impeccable fires on every write to a UI file (layout, tokens, accessibility basics) and a finish reviewer reads the build against its design contract. Intent’s UX agents frame, design, audit and hand off flows on demand.',
      stack: 'Ruflo · impeccable · intent · Claude Code hooks',
    },
  ] as RigCard[],
};

export type WorkItem = {
  years: string;
  title: string;
  client: string;
  role: string;
  body: string;
  image?: string;
  href?: string;
};

export const WORK: WorkItem[] = [
  {
    years: '2024—26',
    title: 'Moxis',
    client: 'XiTrust',
    role: 'Lead Product Architect',
    body: 'Frontend re-architecture of an enterprise e-signature platform: Nx monorepo on Next.js 16, an atomic design system with a Figma-to-code loop, and local LLMs turning static forms into conversations.',
    image: '/portfolio/moxis-01.png',
  },
  {
    years: '2021—24',
    title: 'ePA — national patient record',
    client: 'Rise World · gematik',
    role: 'iOS Developer',
    body: 'Key developer on an app in Germany’s national e-health programme. SwiftUI; secure, accessible, compliance-audited, used by millions.',
    image: '/portfolio/epa.png',
  },
  {
    years: '2021',
    title: 'Global Innovation Summit',
    client: 'SFG · FFG',
    role: 'Developer & UI/UX',
    body: 'A pandemic-proof exhibition as a Three.js world, built in two months: 16 innovations, a guided tour, 3,500+ visitors, smooth on mobile.',
    image: '/portfolio/innovation-summit-01.png',
  },
  {
    years: '2016—21',
    title: 'Find My Mazda',
    client: 'Mazda Germany · Demodern',
    role: 'Lead Creative Developer & TD',
    body: 'Led design and build of Mazda Germany’s online sales platform. Conversion +18%, qualified dealer inquiries +30%. Then architected My Mazda across every EU market.',
    image: '/portfolio/find-my-mazda-02.png',
  },
  {
    years: '2020',
    title: 'Wagner BIG CITY Pizza',
    client: 'Nestlé Wagner · Demodern',
    role: 'AR Developer',
    body: 'Nine Instagram and TikTok AR experiences: games played by winking and nodding, packaging that unlocks easter eggs in the supermarket aisle. 1M+ impressions.',
    image: '/portfolio/nestle-wagner-01.png',
  },
  {
    years: '2019',
    title: '#StopOverfishing',
    client: 'Oceana',
    role: 'Creative Technologist',
    body: 'Every shared post adds a hand-made fish to one live WebGL ocean, synced across every visitor.',
    image: '/portfolio/oceana-01.png',
  },
  {
    years: '2018',
    title: 'Woozle Goozle',
    client: 'Super RTL',
    role: 'Lead Developer',
    body: 'A TV hand puppet turned conversational 3D companion for children, at broadcast scale: ~1,250 keywords mapped to 650 animated, lip-synced sequences.',
    image: '/portfolio/woozle-goozle-01.png',
  },
  {
    years: '2026',
    title: 'Editorial Canvas',
    client: 'Hobo Labs',
    role: 'The previous version of this site',
    body: 'An AI canvas where a digital twin builds the page as you talk to it. Retired from the front door, still running in the lab.',
    image: '/portfolio/editorial-canvas.png',
    href: '/lab',
  },
];

export const ALSO = 'Also: Bauhaus100 face filters · Spark AR social games · Médecins Sans Frontières campaigns.';

export const PARTS: { k: string; v: string }[] = [
  { k: 'Core', v: 'TypeScript (strict), Node.js 22, SQL · Next.js 16, React 19, TanStack Query, Tailwind, Radix' },
  { k: 'Backend & data', v: 'Fastify 5, Hono, Prisma 6, Postgres 16 (RLS, row locks, idempotency), Stripe, pnpm + Turborepo' },
  { k: 'Agents & AI', v: 'Flue, Gemini (text & vision), fal.ai (Ideogram v4, Nano Banana 2, Wan 3.0), Higgsfield, ComfyUI (SDXL + LoRA), Resemble TTS, ffmpeg' },
  { k: 'Evals & ops', v: 'promptfoo, LLM & vision judges, Vitest, Playwright, MSW, OpenTelemetry, GitHub Actions' },
  { k: 'Infra', v: 'Cloud Run, Cloud SQL, Cloud Build, Docker, Vercel' },
  { k: 'Design', v: 'Figma (libraries, variables, Figma MCP), FigJam, design tokens & atomic systems, Adobe CC' },
  { k: 'Interactive', v: 'WebGL & GLSL, Three.js / React Three Fiber, Spark AR, Unreal Engine 5, Swift / iOS, React Native' },
  { k: 'Agentic dev', v: 'Claude Code (subagents, skills, hooks, MCP), Ruflo memory & hooks, gauntlet loop (owner agents, blind critics, browser tester), impeccable & intent, Jira → spec → ADR' },
  { k: 'Clients', v: 'Mazda · Nestlé Wagner · Super RTL · Bauhaus100 · Médecins Sans Frontières · XiTrust · Awesome Nuts' },
];

export const EDUCATION =
  'City College Manchester — HND Multimedia Design · ND Art Foundation with Mathematics · City & Guilds Project Management';
