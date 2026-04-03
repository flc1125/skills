# Google Analytics Event Reference

This document describes the Google Analytics events currently implemented in the marketplace app under `web/`.

## Document Type

Reference

## Audience

Repository maintainers who need to verify event reporting in the GA dashboard or adjust analytics instrumentation in code.

## Goal

Use this document as the source of truth for:

- which GA events exist
- when each event fires
- which parameters are attached
- where each event is implemented

## Scope

Included in scope:

- the measurement ID currently configured in the app
- the event names and parameter payloads implemented in code
- the file locations responsible for sending each event
- practical checks for validating event delivery

Excluded from scope:

- GA dashboard setup outside this repository
- custom dimensions or audience configuration in GA
- historical analytics interpretation

## Measurement ID

The app currently sends events to `G-GYPECK2498`.

The GA bootstrap is defined in [layout.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/app/layout.tsx).

## Event Summary

| Event name | Trigger | Key parameters |
| --- | --- | --- |
| `page_view` | Initial page load and subsequent route or query-string changes | `page_path`, `page_location`, `page_title` |
| `nav_github_click` | Click on the GitHub link in the site header | `target`, `location` |
| `skill_list_impression` | A skill card first becomes visible in the viewport | `skill_slug`, `skill_name`, `position`, `list_type` |
| `skill_card_click` | Click on a skill card in the marketplace grid | `skill_slug`, `skill_name`, `position`, `source` |
| `skill_detail_view` | A skill detail modal opens with a loaded skill | `skill_slug`, `skill_name`, `install_name` |
| `skill_install_copy` | Click on the copy button for the install command | `skill_slug`, `skill_name`, `install_name` |
| `skill_source_click` | Click on the GitHub source link inside the skill modal | `skill_slug`, `skill_name`, `target` |
| `skill_search` | A search query remains unchanged for 500ms | `query`, `result_count` |

## Common Parameters

These parameters appear across multiple skill-related events:

| Parameter | Meaning |
| --- | --- |
| `skill_slug` | The route slug used by the marketplace and detail API |
| `skill_name` | The displayed skill name in the UI |
| `install_name` | The install identifier used in the `npx skills add ... --skill` command |
| `position` | The 1-based card position in the current ordered marketplace grid |
| `target` | The outbound target name for a clicked link |

## Event Reference

### `page_view`

Purpose:
Track page views for the initial render and client-side navigation.

Trigger:
Sent by a dedicated client component whenever the pathname or query string changes.

Parameters:

| Parameter | Value |
| --- | --- |
| `page_path` | Current pathname plus query string |
| `page_location` | Full browser URL |
| `page_title` | Current document title |

Implementation:

- [GaPageViewTracker.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/GaPageViewTracker.tsx)
- [gtag.ts](/Users/flc/data/www/open-source/flc1125/skills/web/src/lib/gtag.ts)
- [layout.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/app/layout.tsx)

Notes:

- Automatic GA page views are disabled with `send_page_view: false`.
- This avoids duplicate reporting when manual route tracking is enabled.

### `nav_github_click`

Purpose:
Track clicks on the global GitHub repository link in the header.

Trigger:
Sent when the header GitHub link is clicked.

Parameters:

| Parameter | Value |
| --- | --- |
| `target` | `github_repo` |
| `location` | `header` |

Implementation:

- [GithubNavLink.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/GithubNavLink.tsx)

### `skill_list_impression`

Purpose:
Track which skill cards were actually seen by the user.

Trigger:
Sent once per card when the card first intersects the viewport.

Parameters:

| Parameter | Value |
| --- | --- |
| `skill_slug` | Current skill slug |
| `skill_name` | Current skill display name |
| `position` | 1-based position in the current grid |
| `list_type` | `marketplace_grid` |

Implementation:

- [SkillCard.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillCard.tsx)

Notes:

- The event is deduplicated per mounted card.
- Visibility is based on `IntersectionObserver` with a `0.5` threshold.

### `skill_card_click`

Purpose:
Track clicks from the marketplace grid into skill details.

Trigger:
Sent when a user clicks a skill card.

Parameters:

| Parameter | Value |
| --- | --- |
| `skill_slug` | Current skill slug |
| `skill_name` | Current skill display name |
| `position` | 1-based position in the current grid |
| `source` | `marketplace_grid` |

Implementation:

- [SkillCard.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillCard.tsx)

### `skill_detail_view`

Purpose:
Track successful skill detail views.

Trigger:
Sent when the detail modal is open and a concrete skill has been loaded.

Parameters:

| Parameter | Value |
| --- | --- |
| `skill_slug` | Current skill slug |
| `skill_name` | Current skill display name |
| `install_name` | Install identifier used by the copy command |

Implementation:

- [SkillModal.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillModal.tsx)

Notes:

- The event is not sent during loading or error states.
- Repeated renders of the same open skill are deduplicated.

### `skill_install_copy`

Purpose:
Track install intent from the marketplace UI.

Trigger:
Sent when the user clicks the copy button for the generated install command.

Parameters:

| Parameter | Value |
| --- | --- |
| `skill_slug` | Current skill slug |
| `skill_name` | Current skill display name |
| `install_name` | Install identifier used by the copy command |

Implementation:

- [SkillModal.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillModal.tsx)

### `skill_source_click`

Purpose:
Track outbound clicks from the skill modal to the GitHub source page.

Trigger:
Sent when the user clicks the source link in the modal header.

Parameters:

| Parameter | Value |
| --- | --- |
| `skill_slug` | Current skill slug |
| `skill_name` | Current skill display name |
| `target` | `github_skill_source` |

Implementation:

- [SkillModal.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillModal.tsx)

### `skill_search`

Purpose:
Track explicit user search behavior in the marketplace.

Trigger:
Sent when a non-empty search query remains unchanged for 500ms.

Parameters:

| Parameter | Value |
| --- | --- |
| `query` | Trimmed search text |
| `result_count` | Number of results in the filtered skill list |

Implementation:

- [Marketplace.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/Marketplace.tsx)

Notes:

- Empty searches are not reported.
- Identical query and result-count combinations are deduplicated.

## Validation Checklist

Use the following checks when validating events in the GA dashboard:

1. Load the homepage and confirm a `page_view` event appears.
2. Scroll through the marketplace and confirm `skill_list_impression` events appear for visible cards.
3. Click a card and confirm `skill_card_click` followed by `skill_detail_view`.
4. Click the copy button in the modal and confirm `skill_install_copy`.
5. Click the modal GitHub source link and confirm `skill_source_click`.
6. Type a non-empty query into the search box, pause for at least 500ms, and confirm `skill_search`.
7. Click the header GitHub link and confirm `nav_github_click`.

## Code Map

Analytics behavior is currently split across these files:

- [layout.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/app/layout.tsx)
- [gtag.ts](/Users/flc/data/www/open-source/flc1125/skills/web/src/lib/gtag.ts)
- [GaPageViewTracker.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/GaPageViewTracker.tsx)
- [GithubNavLink.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/GithubNavLink.tsx)
- [Marketplace.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/Marketplace.tsx)
- [SkillCard.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillCard.tsx)
- [SkillModal.tsx](/Users/flc/data/www/open-source/flc1125/skills/web/src/components/SkillModal.tsx)
