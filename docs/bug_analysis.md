# Bug Analysis: Missing ProjectNode Fields

## The Issue
When the AI generates a `ProjectNode` (e.g., for "MonstoryX"), the frontend component successfully renders the top half of the card (Title, Year, Role, Summary, and Gallery images). However, the bottom half of the card—which should display `content`, `techStack`, `problem`, `solution`, and `quote`—is completely missing from the UI. 

Prior to removing the hardcoded fallback text in `ProjectNode.tsx`, the UI displayed the default placeholder text for `problem`, `solution`, and `quote`.

## Symptoms & Observations
1. **Partial Rendering:** The React Flow UI successfully mounts the node and renders the fields at the "top" of the UI hierarchy, but abruptly stops rendering before the article text and tech stack.
2. **Validation Errors:** We previously observed a terminal error indicating the AI failed Zod schema validation (e.g., passing the `year` as a number instead of a string). 
3. **Empty Data Passing:** Because the hardcoded fallbacks in `ProjectNode.tsx` were triggering, we know the frontend was explicitly receiving `undefined` or `""` (empty strings) for the missing fields.
4. **Persistent Failure:** Despite relaxing Zod validations (removing `.min()` constraints) and explicitly commanding the AI to copy-paste the missing fields, the issue persists exactly as before.

## Why I Was Guessing (The Blind Spots)
My previous attempts to fix this were based on hypotheses rather than empirical proof. I assumed that fixing the API route's tool schema would magically fix the frontend behavior, but I was making two major assumptions without verifying them:
1. I assumed the local LLM (`gemma4`) was actually capable of adhering to a complex 12-field JSON schema.
2. I assumed the Vercel AI SDK was silently aborting the stream due to backend validation failures, causing the frontend to render "partial" JSON.

## Hypotheses to Investigate
Moving forward, we must prove what is failing before changing any more code. The issue stems from one of three areas:

### 1. The Local LLM Limitation Hypothesis
Small local models (like Gemma) notoriously struggle with Tool Calling / Function Calling when the required JSON schema is large and complex. It is highly likely that the model starts generating the JSON, gets confused halfway through, and simply closes the JSON object early, completely omitting the `content`, `techStack`, `problem`, `solution`, and `quote` keys.

### 2. The Streaming / Partial Parsing Hypothesis
Because Vercel AI SDK streams partial tool calls to the client, the React frontend begins rendering the node before the LLM finishes thinking. If the LLM produces a syntax error (e.g., missing a comma or unescaped quote in the `content` field), the stream breaks. The frontend is left holding a half-finished JSON object, which is why the top half renders and the bottom half doesn't.

### 3. The RAG Context Truncation Hypothesis
Even with the hybrid keyword search implemented, if the total context window size exceeds the local model's limits, it might be truncating the prompt and losing the exact definitions for the `problem` and `solution` fields, forcing it to skip them.

## Next Steps for Verification (No Guessing)
To find the definitive root cause, we must implement empirical logging in our next coding session:
1. **Frontend Logging:** Add a `console.log("PROJECT NODE DATA:", data)` to the top of `ProjectNode.tsx`. We need to see exactly what shape of data the component is actually receiving.
2. **Backend Payload Logging:** Log the exact raw JSON output the LLM is generating before it hits the Zod validation layer, to see if the LLM is literally failing to output the missing keys.
3. **Test with a Simpler Schema:** If the LLM is breaking under the weight of 12 fields, test by temporarily combining fields (e.g., merging `problem`, `solution`, and `content` into one single `markdown` field) to see if the model successfully completes the task.
