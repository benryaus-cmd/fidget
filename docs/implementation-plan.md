# Premium arcade integrated upgrade

User handover and final-goal.md authorize implementation and parallel execution.

Goal: eight distinctive tactile toys, meaningful rounds, visible purchases and responsive portrait UI.
Architecture: one React root; isolated gameplay, pure economy, shared sound and radio modules. No live Node runtime.

- Gameplay: review all 26 original toys, retain eight distinct interaction families, custom rendering and bounded physics/scoring. Verify pure mechanics and real browser gestures.
- Economy: versioned migrated save, atomic purchases, validated unlock/equip, idempotent awards/rounds, bounded daily freeplay rewards. Test malformed saves and duplicate actions.
- Audio: one gesture-unlocked AudioContext, per-toy synthesis, independent levels, optional five-station radio and truthful stream/licensing status.
- Shell: coherent toy previews, immersive play, mastery/daily progress, previews and category shop, results and settings.
- Integration: baseline build and TypeScript, test eight toys at 320/390/430px plus landscape, persistence, economy and failure paths; fix findings.
- Delivery: GitHub commit, exact gameplay-only import manifest and development report. Preserve functioning Aippy host config. Aippy integration and physical Android require actual environment evidence.
