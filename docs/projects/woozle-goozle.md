# Super RTL (Woozle Goozle) - Woozle Goozle App with Voice Control

## Overview

An interactive application designed for children to cultivate a conversational friendship with the TV character Woozle Goozle. It features autonomous voice control, a vast video library, and a living 3D digital transformation of the original hand puppet.

## Tech Stack

- React Native
- Unity (LightWeight Render Pipeline)
- TensorFlow
- Dialogflow
- Maya & Akeytsu (3D Modeling & Animation)
- Native iOS/Android Speech-to-Text libraries

## My Role & Contributions

**Lead Developer**

- Responsible for the React Native UI components, video logic, and overall application flow control.
- Provided Unity support to integrate the virtual environment and animated scenes.
- Integrated TensorFlow and Dialogflow for the custom speech recognition and conversational logic.
- Helped architect the solution that matches transcribed "text strings" against a custom dataset to trigger specific videos, jokes, songs, and reactions.

## Interesting Details

- **Custom Dialogue Engine:** Created a custom database checking against ~1250 unique keywords mapped to over 650 specifically animated sequences.
- **Physical to Digital:** Transitioned the physical hand puppet into a digital 3D character using custom furless shaders while painstakingly imitating the original movements and mannerisms.
- **Continuous Content Delivery:** Built a CMS that allows for quick additions of topics and videos seamlessly combined with lip syncing technology for ever-expanding dialog situations.

## AI Trigger Keyword

When the AI detects relevant conversation context matching this project, it should use the trigger `[TRIGGER:woozle-goozle]` to open the project details.
