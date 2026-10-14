# Engineering log

## Initial architecture and delegation
The empty workspace had no existing project or Git repository. The coordinator initialized a main-branch repository and wrote shared TypeScript contracts before implementation. Three real subagents were delegated nonoverlapping files: `domain` owns pure services and domain tests; `ui` owns Lab.tsx and global styling; `qa_docs` owns browser tests, Pages workflow and user documentation. The coordinator owns setup, persistence, state mutations and integration. Shared checkout ownership avoids simultaneous edits to the same files.

The browser simulation is intentional: GitHub Pages cannot execute backend APIs. Quotes use basis points, amounts use integer cents, and money calculations stay outside rendering. Deterministic fixtures illustrate model errors without implying a live LLM.

The state hook guards mutations independently of disabled UI controls. localStorage is versioned and malformed/incompatible content falls back to seed data. No stored credentials are needed. Real timestamps apply to user actions, while reset seeds are deterministic.

## Deployment access
The local GitHub CLI reported an invalid saved token. The connected GitHub service successfully identified the user as lalithu. Publication capabilities are being inspected; no public deployment is claimed without verification.

## Integration findings
The initial Vitest run included Playwright's `.spec.ts` file and failed because Playwright cannot execute within Vitest. A dedicated Vitest include pattern now runs only `.test.ts` unit suites; the rerun passed all 19 tests. Dependencies were pinned to actual registry-resolved stable versions after installation (Next.js 16.4.0, React 19). The first production build was started before the UI agent had delivered global CSS; it correctly failed on that missing import. Subsequent verification waits for the completed UI contribution.

The CLI authentication failure was a restricted-network artifact: the same authentication check succeeded with approved network access. The public repository was created and Pages configured for workflow deployment. Publication still requires a successful build, push and deployment verification.

## Final integration and verification
Persistence schema checks were expanded after review revealed that structurally plausible corrupt records could reach rendering. The resulting domain/persistence suite passed 58 tests. Playwright discovery was also restricted to browser suites after it attempted to load Vitest unit tests. Four Chromium tests now pass: complete golden workflow/AI bid correction/sale persistence/reset, mobile overflow, CRM notes/new application, and corrupt storage/arithmetic/invalid JSON.

The mobile sidebar originally stayed in the accessibility tree while offscreen, creating duplicate Reset buttons. Hidden sidebar visibility and browser assertions corrected this. Notes now save on blur instead of generating an audit event per keystroke. The production export succeeded with /mortgage-ops-lab asset paths; its compiler required approved local subprocess networking in this environment. Real screenshots were captured and visually inspected.

At the user's request the presentation name became Baby Swish AI Demo; Dan Swantek is the fictional operations manager shown in the UI. Git authorship remains Lalith Uriti, with LU in the shipping commit. A visible independent-demo disclaimer explains synthetic data, no real financial platform, no live AI call and no Swish affiliation.

Production bundle inspection at the real /mortgage-ops-lab/ base path returned the final Baby Swish AI Demo title, loaded all assets without HTTP or runtime errors, and showed no horizontal overflow at 390px. Screenshots were recaptured from that export with the final branding and Dan Swantek profile. All 58 unit tests and four browser tests passed after final text and control changes.

The user requested a permanent author footer. It attributes Lalith Uriti, Codex and OpenAI and states the demonstration thesis. A specific model name was omitted because its involvement could not be verified. The footer is fixed with reserved content space, so it remains visible without obscuring the final content.

## Publication result
The final source release e50909b passed type checking, all 58 unit tests, four Chromium browser tests and static export on GitHub's Linux runner. Pages deployment run 38595814898 stayed in `updating_pages` until the official deploy action's 600000ms timeout and cancelled publication. The public endpoint returned 404; no live deployment is claimed. The remaining step is to rerun the failed deploy job, and escalate to GitHub Pages support if provisioning remains stuck. No application error or missing authentication was reported by the deployment action.

The final footer uses the user's requested wording: “Built by Lalith Uriti using Codex and OpenAI models.” followed by the bold thesis “I understand the problems you're solving. Here's proof I can solve problems like them.”

At the user’s request for faster publication, the coordinator built the latest source and pushed only the static export to a new gh-pages branch. Pages was switched to branch-based deployment at the root. The main workflow now verifies/builds without custom deployment to avoid conflicting publication modes.
