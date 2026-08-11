# SpeakFlow

Voice-first adaptive spoken English trainer.

Core loop: Expose → Speak → Diagnose → Retry → Vary → Retrieve → Progress.

This v1 runs without an AI API key using browser speech recognition, text-to-speech, local adaptive scoring, active vocabulary, levels, role-play/debate prompts, and local progress storage.

Run locally: `npm install` then `npm run dev`.

For production, connect a real AI provider for semantic evaluation, dynamic follow-ups, pronunciation analysis, and richer adaptive progression.
