---
name: hermes-tweet
description: Route Hermes Agent X/Twitter research, monitoring, and controlled account actions through the Hermes Tweet plugin.
metadata:
  name: Hermes Tweet
  description: Route X/Twitter research, monitoring, and controlled actions through the Hermes Tweet plugin.
  author: Burak Bayir
  created: 2026-06-22T01:53:44Z
---

# Hermes Tweet

Use this skill when an agent workflow needs X/Twitter search, account reads,
trend checks, monitoring, extraction, media, draw evidence, or controlled
publishing through Hermes Agent.

Hermes Tweet is the native Hermes Agent plugin for X/Twitter workflows:
https://github.com/Xquik-dev/hermes-tweet

## Operating Mode

Act as a Hermes Tweet operator, not as a generic social media API client.

Prioritize:

- `tweet_explore` before any live call
- read-only routes before action routes
- explicit user approval before posting, replying, following, DMing, or changing
  monitors and webhooks
- runtime environment secrets over prompt-provided credentials
- clear endpoint paths from the plugin catalog instead of guessed URLs

If Hermes Tweet is not installed or enabled, explain that the plugin must be
installed in the Hermes runtime before live X/Twitter work can run. Do not
simulate tool results.

## Setup

Install and enable the plugin on the Hermes runtime host:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

The runtime needs its configured API key available through the environment or
Hermes env file. Never ask the user to paste API keys, session material, or
account credentials into chat.

For remote gateway or desktop profiles, install and configure Hermes Tweet where
the Hermes runtime executes plugin code. The chat surface should not receive
secrets unless it is also the runtime host.

## Tool Routing

Use the smallest tool path that satisfies the task.

### 1. Explore

Use `tweet_explore` first when the exact route is unknown.

Good exploration tasks:

- find search, user, trend, monitor, draw, media, or extraction endpoints
- inspect whether a route is read-only or action-like
- recover required path and parameter names before calling live routes

`tweet_explore` should not make network calls.

### 2. Read

Use `tweet_read` for catalog-listed read-only routes.

Good read tasks:

- search public posts
- read public profiles and timelines
- inspect tweet replies, quote posts, likes, and engagement context
- check trends, radar, monitors, media, draw evidence, and exports

Summarize evidence and cite route-level context when returning results. Keep
private account details out of public notes, PR comments, and issue bodies.

### 3. Act

Use `tweet_action` only when action routes are enabled and the user explicitly
approved the operation.

Action-like tasks include:

- post, reply, repost, like, follow, unfollow, block, mute, or DM
- create, update, or delete monitors and webhooks
- upload media or change account-scoped resources

Before an action call, state the target, payload, expected effect, and rollback
limits. If the action gate is disabled, stop and explain how to enable the
plugin action mode in the runtime environment.

## Workflow Patterns

### Social Listening

1. Use `tweet_explore` to find search, trend, or monitor routes.
2. Use `tweet_read` for public signal.
3. Summarize themes, source links, and uncertainty.
4. Avoid account-changing calls unless the user asks for them.

### Support Triage

1. Read mentions, replies, and user context.
2. Group issues by severity and affected workflow.
3. Draft responses separately from publishing.
4. Use `tweet_action` only after explicit approval for the final text.

### Launch Monitoring

1. Discover trend, search, monitor, and radar routes.
2. Prefer scheduled read-only checks.
3. Report deltas, spikes, and representative posts.
4. Escalate action recommendations without taking action automatically.

### Controlled Publishing

1. Draft the post or reply first.
2. Confirm target account, text, media, and timing.
3. Require explicit approval for the final publish call.
4. Read back the created item when the route returns enough detail.

## Safety Rules

- Do not accept credentials through tool arguments or chat.
- Do not invent endpoint paths. Discover them with `tweet_explore`.
- Do not bypass the action gate.
- Do not use generic browser automation for X/Twitter when Hermes Tweet tools
  can handle the workflow.
- Do not publish or mutate account state without explicit approval.
- Do not expose private account data in public artifacts.

## References

- Hermes Tweet: https://github.com/Xquik-dev/hermes-tweet
- Hermes Agent: https://github.com/NousResearch/hermes-agent
