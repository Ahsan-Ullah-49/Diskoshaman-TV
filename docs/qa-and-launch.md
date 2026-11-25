# Diskoshaman TV QA and launch plan

Target 1 December 2026 if the build, content and integrations are ready and Hammad gives final approval. Record the build commit, preview URL, device, browser and result with each review.

## Delivery sequence

1. **Prepare the existing material.** Inventory routes, copy, the hero reel, project media and form integrations against the confirmed [PRD](PRD.md). Capture the visual baseline when available. Use existing media and current brand cues for the initial concept.
2. **Review the design in code.** Review phone, tablet and desktop layouts in both themes, existing page coverage, the two contact paths, and the survey and newsletter entry points. Present and record the selected service motion treatment and check the brand kit when delivered.
3. **Prove motion and video.** Run the homepage and Work demo on desktop and a phone. Check the hero, featured scroll sequence, one page transition, menu and hover interactions, overlay and reduced motion. Assess Vimeo first. Verify the selected provider's playback on the protected preview and check the intended production hostname in its settings. Retest playback over the live domain after cutover.
4. **Build and integrate.** Implement the retained pages and features. Test booking, enquiry delivery, survey, newsletter and conversion tracking. Replace or approve draft copy for new sections with Hammad.
5. **Review and release.** Run the test matrix, verify URL migration and obtain Hammad's final sign-off. Launch the verified build and record production checks and handover information.

## Verification matrix

| Area | Pass condition |
| --- | --- |
| Composition | Home communicates end-to-end media production for the Australian market and gives booking priority with enquiry available. Work is easy to find. Compare desktop and phone previews against the live baseline. Check readable type, media crops and both themes. |
| Viewports and browsers | Review 320–1440 px including 390 and tablet widths. Run a current iOS Safari and Android Chrome check for motion, autoplay and touch. Run desktop Chrome, Safari and Firefox checks where supported. Record physical devices, emulators and unverified coverage separately. |
| Motion | Normal scrolling remains responsive. At phone widths, the feature has the same story beats with lighter assets. Transitions tolerate rapid navigation, resize, orientation and back or forward actions. Reduced motion shows a complete static experience. |
| Homepage opening | Check the large emblem in its curve above the transparent opening and themed, pinned bar. Test the globe, DS drag and tilt, fixed motto and the five Services links. On a phone, open the half-width menu from the left, switch themes, follow a link, dismiss by tapping outside and restore focus with Escape. Test the gold-glass booking link and its bright diagonal hover. Move the mouse quickly and check that the dot and ring stay on the native hotspot as the gold trail follows. Check the rotating arc over controls. Observe all five words for a steady baseline, the compact dividers and the 2.7-second counter on a substantial return. Verify paused motion, keyboard, touch and media fallbacks. |
| Accessibility | Keyboard access, focus order and visible focus work throughout. The mobile menu and Work overlay close and restore focus. Verify dialog focus around the embedded player, visible controls, video captions where needed, form labels and contrast against media. Run automated checks plus manual keyboard and screen-reader spot checks. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| Portfolio and media | The first full-film player request happens on Watch. Opening and closing different projects leaves only the intended player active. If the browser blocks the initial play, Play remains available. A refused embed or unavailable film leaves a useful poster and recovery state. Check the intended preview and production hosts. |
| Services motion | Check the selected service treatment on desktop and phone. The media is relevant, the existing copy is readable and the service remains usable if playback fails or reduced motion is on. |
| Enquiry and booking | Exercise both contact paths. Open the verified Calendly event and confirm 20-minute duration. For enquiries, test invalid input, pending state, success, repeat click, timeout and retry. A retry of an already accepted request yields one email and one accepted-submission event. Test preview delivery and verify the approved live recipient. |
| Survey and newsletter | Verify both are available. Compare fields, destinations and confirmation behaviour with the current workflows. Test each with its approved test route before checking the live integration. |
| Routing and search | Existing retained URLs resolve. Moved legacy URLs reach their relevant targets in one permanent redirect. Verify unique titles and descriptions, canonicals, mobile links, structured data, social metadata, sitemap, robots and genuine 404 responses. Check preview noindex and approved production indexing. [Google Search guidance for URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) |
| Code and handover | Formatting, lint, type checking, production build and relevant browser smoke checks pass. A second developer can find and edit one service, replace a project poster and run verification from the instructions. |

## Performance evidence

Run a production-mode lab trace of Home and Work on a named mobile profile with a cold cache. Record browser, viewport, network, CPU settings, three comparable runs and median results. Check when the main poster renders, whether media causes layout movement and whether play or scroll remains responsive. If an old-site baseline becomes available, compare like with like and show what changed. Treat the lab run as a release check and monitor field results once the site has representative traffic.

Aim for field Core Web Vitals of LCP at or below 2.5 seconds, INP at or below 200 ms and CLS at or below 0.1 at the 75th percentile, segmented by mobile and desktop. Set practical payload budgets in the motion demo once the approved media is available, then record the measured baseline with the release. [Web Vitals](https://web.dev/articles/vitals)

## Migration and cutover

- Inventory the [known legacy URLs](current-site-audit.md#known-legacy-paths). Reconcile the list with available exports, sitemaps or indexed routes. Preserve matching paths and prepare target-specific permanent redirects for moved content.
- Record the current deployment, domain routing, certificates and backup location before changing production. Prepare the next release and its protected preview. Keep business email routing intact during the domain switch.
- Verify release environment values, the existing showreel and managed video embeds, the 20-minute Calendly link, enquiry delivery, survey, newsletter and tracking. Verify that preview pages remain protected and production pages permit intended indexing.
- Record Hammad's sign-off, the release commit, the known working deployment and the owner of the rollback. After cutover, check the home page, a project, a service, both contact actions, the retained forms and legacy redirects over the public domain.
- Roll back if the public site is broadly unavailable, the main contact route fails or migrated paths have a systemic problem. Restore the known working deployment or prior domain routing as appropriate, then rerun the public checks before announcing that service is restored.

## Developer handover

Document installation, local scripts, dependency versions, environment variable names and preview access. Include practical steps to add a service or project, replace media and captions, update the contact action and publish through GitHub and Vercel. Record the production owner, test evidence, asset locations, deployment and rollback instructions. Keep the [AI coding instructions](../AGENTS.md) in the repository so future edits follow the same conventions.
