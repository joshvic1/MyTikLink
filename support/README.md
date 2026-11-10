# MyTikLink AI support maintenance

Updated 10 November 2026.

The public and dashboard assistants share `components/MyTikLinkAI/AIChat.js` and the existing `pages/api/ai.js` endpoint/provider. `SmartAssistant` is the dashboard launcher and explicit-open listener. No second provider integration, conversation database or knowledge collection was added.

## Knowledge updates

1. Inspect the actual UI, route and backend entitlement check before editing an article. A menu item alone is not evidence that a feature is available.
2. Update `support/knowledge.mjs`. Each record has an ID, dashboard version, title, route, steps, source paths, availability, plan requirements, related features and review date. Add precise plan requirements; refer users to billing for current checkout prices.
3. Keep previous-dashboard articles. Mark unavailable functionality `coming-soon` or `limited`; do not publish speculative instructions.
4. Add or adjust tests in `tests/ai-support.test.mjs`. Source-reference tests catch renamed/deleted files. Add a representative question for the changed feature and review its real answer.
5. Run `node --test tests/ai-support.test.mjs tests/ai-api.test.mjs V1.1/tests/*.test.mjs`, then `npm run build`. There is no configured lint script in this repository.
6. Deploy the normal frontend build. There is no embedding service, vector database, reindex job or database migration. Retrieval ranks a small set of relevant reviewed articles per request. The existing `utils/aiKnowledge.js` and `config/smartAssistantConfig.js` are retained; relevant legacy explanatory paragraphs are retrieved for legacy questions, subordinate to reviewed articles. Old pricing/route/entitlement paragraphs are excluded to avoid conflicting advice.

## Version and trust boundaries

The server validates a supplied bearer token with the existing `/auth/me` endpoint. It reads `/auth/dashboard-preference` where available, falling back to the saved field returned by the trusted account API. Explicit questions about the previous dashboard or V1.1 override the saved default. A guest or unavailable preference remains unknown and the assistant should clarify or label both versions.

Client-provided names, email, claimed plan and quick actions are not trusted or forwarded. Only the verified plan and version are sent with the conversation and retrieved help. The client route is advisory and allowlisted. Conversation messages may contain only user/assistant roles and have size limits. API keys stay server-side. Raw HTML/images in responses are not rendered; action and Markdown links use an explicit route/contact allowlist. Automatic navigation is restricted to supported internal routes and explicit navigation questions.

The existing public guest-help capability remains available. Signed-in requests must validate successfully rather than silently falling back to guest. The endpoint adds a bounded 20-request/minute process-local limiter, timeouts and safe provider errors. For multiple application instances, use a shared edge rate limit; this local limiter is not a distributed usage counter. Guest socket addresses may be shared behind a reverse proxy, so configure the deployment's trusted edge policy rather than trusting arbitrary forwarded headers.

## Conversations

The previous implementation stored messages only in browser localStorage; there were no server conversation records. New history is stored under `mytiklink_support_v2:<verified-user-id>` or `:guest`. New chat archives the current conversation in that account's device history. No legacy storage keys are deleted. History offers an explicit recovery action for old unscoped `ai_chat` and `mytiklink_smart_assistant_messages` data, because their original ownership cannot be proven on a shared browser. Only import them if they belong to the current user.

Browser storage is not encrypted private storage and does not sync across devices. Account separation prevents accidental cross-account display in the app; someone with access to the browser's developer tools/storage can still inspect local data. Do not store passwords, codes or secrets in support messages. If cross-device/private server history is later required, implement authenticated owner-scoped persistence rather than trusting client-supplied IDs.

## Explicit opening and inactivity

`support/assistantBridge.js` queues explicit Help requests until the lazy assistant subscribes. Shell closes the channel modal before requesting chat. The chat portals to `document.body` at z-index 10100, above the V1.1 modal layer (10050+), avoiding inherited stacking contexts. Legacy explicit actions and the old event remain supported.

The homepage automatic 30-second chat-opening effect, floating 30-second hint and old per-route assistant nudge were removed. The only new idle behavior is `IdleHelp`: one 90-second timer reset by pointer, touch, keyboard, input, scroll, focus, route and visibility changes. It checks actual Help-button visibility, hidden-tab status, focused form controls and visible dialogs. It never opens AI or Help. Once shown, it is remembered in sessionStorage with an in-memory fallback. Activity or Help dismisses it. Hidden desktop Help buttons do not trigger it; the persistent desktop support panel is unchanged. Reduced motion is respected.

## Verification and deployment

Use the existing `OPENAI_API_KEY`, optional `OPENAI_MODEL` (default remains gpt-4o-mini), `NEXT_PUBLIC_API_URL`, and existing V1.1 API-base configuration. Deploy the dashboard preference endpoint from the previous adoption work for authoritative inferred prior-user selection; without it and without a saved preference the assistant intentionally treats version as unknown.

An optional `TIKLINK_BUILD_DIR=.next-ai-support` allows an isolated verification build without competing with the current `.next` lock. Default dev/production builds still use `.next`.

Before release, visually check mobile keyboard placement, scroll retention, Help-to-AI transition, desktop positioning, history recovery and focus restoration on actual devices. No production deployment or account mutation is part of this change.
