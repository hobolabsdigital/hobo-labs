# MonstoryX

## Overview

MonstoryX is an immersive 3D open-world educational game built in Unreal Engine 5. It transforms children from passive consumers into active digital directors through a "Voice-First Generative Loop." By leveraging a real-time Speech-to-Intent pipeline, the game allows children to direct AI-animated 'Monster Movies,' turning their speech into interactive stories and promoting literacy, empathy, and expressive language. It builds upon a proven pedagogical foundation already integrated into hundreds of schools, designed to directly combat the developmental delays caused by passive digital consumption.

## Tech Stack

- **Engine:** Unreal Engine 5 (World Partition, Water, Landmass plugins, Control Rig, ActorCore)
- **AI & ML:** Generative AI (Hunyuan 3D AI for assets), Local On-device Transcription (Qwen), Native Voice Assistants
- **Backend/Systems:** C++, Blueprints, Node.js
- **Plugins:** Custom standalone `LootLockerIAP` plugin, proprietary `MonstoryReplaySystem` (Movie Maker)
- **Asset Pipeline:** Physical Plasticine Sculpting → Photography → Hunyuan 3D AI → Blender Rigging → UE5

## My Role & Contributions

- **Chief Creative Technologist | Systems Architect | Founder:** Equal co-founder responsible for architecting the systems that make the educational vision technically possible, working precisely alongside pedagogical experts.
- **Voice-To-Intent Pipeline Engineer:** Developed the multilingual real-time speech-processing system that directly manipulates NPC Behavior Trees based on verbal communication, featuring seamless fallbacks to local on-device transcription models (Qwen) and touch interactions.
- **Engine Tech & Plugin Development:** Engineered modular UE5 tools, including the proprietary `MonstoryReplaySystem` to handle the heavy lifting for the 'Movie Maker' recording mode, and a custom `LootLockerIAP` integration.
- **Image-to-3D Pipeline Architect:** Designed an innovative hybrid physical-to-digital workflow. Characters are hand-sculpted in physical Plasticine, photographed, and processed through Hunyuan 3D AI before being fine-tuned, rigged in Blender, and animated using ActorCore in UE5.

## Deep Dive: Features & Mechanics

### Voice-First Generative Loop & Movie Maker

Children solve quests primarily through verbal communication. A custom 'Movie Maker' mode utilizing UE replay mechanics transforms players into directors. When a player records their script, the system transcribes it and plays it back entirely in the monster's unique cloned voice, allowing kids to playfully record, edit, and safely share their own cinematic 'Monster Flicks.' An autonomous narrative pipeline seamlessly transforms raw gameplay transcripts into cinematic animations.

### Companion Swap & Emotional Empathy

Players play alongside (or directly control) four unique monster companions that serve as a narrative mirror for children to learn empathy, emotional regulation, and personal growth:

- **Blorp (Blue):** Highly energetic and erratic, providing fast-paced interactions but needing help focusing constructively.
- **Trio (Yellow):** The "educator" who is cool and collected but occasionally prone to sudden bursts of panic, teaching children how to manage anxiety.
- **Lopsy (Orange):** The forever-optimistic caregiver who always has a little dancing step to model positivity and emotional support.
- **Mossie (Green):** Relatably struggles with learning difficulties and focus, trying his best to "get himself together" and overcome challenges.
  We've also introduced multi-touch gesture support for co-operative play, enabling two characters to be controlled simultaneously on the same screen to foster deep, shared problem-solving.

### Diverse Quest Ecosystem

Quests are structurally diverse to build 21st-century literacy and cognitive skills:

- **Core Language:** Evaluating "Fake News" (e.g., correcting "elephants have wings") and continuing open-ended narratives.
- **Mini-Games:** Mental arithmetic in "The Number Cave," teaching precise spatial language in "The Lost Monster Treasure Map," or interviewing NPCs using "Monster Mic Mode."
- **Environmental Problem-Solving:** Multi-stage quests like "Save the River Pipeline" that involve collecting trash, cleaning oil spills, and reviving plants.

### Computational Thinking & The Monster Loot Economy

Gameplay subtly introduces children to computational thinking via Movie Timers (duration limits), Movie Bins (asset storage), and Resource Management in a strict "no pay-to-win" closed-loop economy. Children earn "Monster Loot" (Wiggle Worms, Jiggly Jellies) naturally by completing voice-quests, enabling them to customize monsters or permanently upgrade abilities. Players can also craft treats like "Glowing Goo" at Cooking Stations to unlock dark caves or access new areas.

### AI Teacher Admin (B2B)

A dedicated "Teacher Architect" Dashboard bridges the gap between home and classroom environments. Teachers act as the "human-in-the-loop," interacting with LLM-powered personas to instantly generate curriculum-aligned quests. They audit and approve the AI's output before it dynamically populates the game logic, while monitoring student progress and audio recordings.

## AI Trigger Keyword

When the AI detects relevant conversation context matching this project, it should use the trigger `[TRIGGER:monstory]` which maps to this project.
