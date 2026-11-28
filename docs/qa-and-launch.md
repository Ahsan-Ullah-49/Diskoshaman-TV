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
| Homepage opening | Check the large emblem in its curve above the transparent opening and themed, pinned bar. Test the globe, DS drag and tilt, fixed motto and the five Services links. On a phone, open the half-width menu from the left, switch themes, follow a link, dismiss by tapping outside and restore focus with Escape. Test the primary and secondary pill buttons: the orbiting rim, the gold fill and turning arrow on Book a call and Our Work, and the rising champagne fill on Contact Us, with hover and keyboard focus. Move the mouse quickly and check that the dot and ring stay on the native hotspot as the gold trail follows. Check the rotating arc over controls. Observe all five words flip up from below on a steady baseline with the line staying centred, the compact dividers and the 2.7-second counter on a substantial return. Verify paused motion, keyboard, touch and media fallbacks. |
| Accessibility | Keyboard access, focus order and visible focus work throughout. The mobile menu and Work overlay close and restore focus. Verify dialog focus around the embedded player, visible controls, video captions where needed, form labels and contrast against media. Run automated checks plus manual keyboard and screen-reader spot checks. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| Studio story | Verify the title and film in both themes. On desktop, the title letters flip in, the story reads under the heading on the left and the portrait dollies forward on the right, then stays in view below the header while the story is read. On a phone, the heading, film and story stack without horizontal scrolling. Check the Meet the studio hover and keyboard focus states. Scroll in reverse and resize to check that the player stays aligned and reachable. Verify the published copy and About link below the film. Check the finished frames and manual watch action with motion paused, muted autoplay in view, Vimeo playback and captions, and the Try again action if the embed fails. No control on the site leads to vimeo.com. |
| Home services and footer | Scroll into Production Services slowly and in reverse: the camera assembles from its parts and opens again, and the emblem turns inside the lens only once it is whole. Check the gold particle sheet and gravity well behind it, the service row hovers and each row link. Return to Home from another page and check that the story and services titles are complete. In the footer, check the full-width glass, the living emblem, link hovers, the inline newsletter capsule and its errors, the social icons, the wordmark spotlight and idle sweep, the All rights reserved line and Back to top with focus. Pause motion and confirm everything stays readable. |
| Portfolio and media | On Home, check one widescreen film in each original library category. Verify the projection set on approach and reverse scroll. Select each film by keyboard or touch and check that the frame settles in front, plays muted in view and releases its player offscreen. Check the side arrows, reduced motion and sound and playback controls. In Work, the first full-film request happens on Watch. If autoplay is blocked, use the player's Play control. Verify the poster and retry state for unavailable films on the intended preview and production hosts. |
| Services motion | Check the selected service treatment on desktop and phone. The media is relevant, the existing copy is readable and the service remains usable if playback fails or reduced motion is on. |
| Services pages | On the overview and each service page, check the titles flip in complete, the hero camera assembles on load, each service chapter and its media, the deliverable and step cards, the related films and More services links, at 390 px and desktop without horizontal scrolling. With motion paused, titles and cards show complete and the camera shows whole. |
| Work page | Check the projector beam and dust, the one-line Our Work title, the poster ring turning, dragging with momentum, and that selecting a poster opens the right film on the site. Check Featured films, the archive filters and counts, card hover, Show more, and the film dialog closing back to its card, at 390 px and desktop without horizontal scrolling. |
| About page | Check the orbit background, the Infinity lies within title, the on-set still and producer portrait frames, the story statement and cards, the producer quote and biography, the studio belief band, the timeline and the How we work anchor, at 390 px and desktop without horizontal scrolling. |
| Contact page | Check the signal lines stay behind the opening screen and clear of the form, the email, social icons, the 20-minute dial, the booking action and the #booking and #enquiry anchors from the header. Submit the empty enquiry and confirm each field shows its error and focus moves to the first one. Check 390 px and desktop without horizontal scrolling. |
| Enquiry and booking | Exercise both contact paths. Open the verified Calendly event and confirm 20-minute duration. For enquiries, test invalid input, pending state, success, repeat click, timeout and retry. A retry of an already accepted request yields one email and one accepted-submission event. Test preview delivery and verify the approved live recipient. |
| Survey and newsletter | Verify both are available. Compare fields, destinations and confirmation behaviour with the current workflows. Test each with its approved test route before checking the live integration. |
| Routing and search | Existing retained URLs resolve. Moved legacy URLs reach their relevant targets in one permanent redirect. Verify unique titles and descriptions, canonicals, mobile links, structured data, social metadata, sitemap, robots and genuine 404 responses. Check preview noindex and approved production indexing. [Google Search guidance for URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) |
| Code and handover | Formatting, lint, type checking, production build and relevant browser smoke checks pass. A second developer can find and edit one service, replace a project poster and run verification from the instructions. |

## Local working preview, 26 November 2026

- Verified the production build in Chromium 153 at 320, 390, 768 and 1440 px. The ten routes returned HTTP 200 with unique titles, matching canonicals and preview indexing directives. An unknown path returned HTTP 404.
- Tested Work filtering, deferred player mounting, keyboard dismissal, restored focus and retry with simulated Vimeo responses. The published Rio Tinto film advanced in the local overlay in a controlled Chromium playback test. The 31 portfolio entries have local, optimised covers and published Vimeo references.
- Tested both corporate motion treatments, the pause control, reduced motion, the mobile menu and light theme persistence. Verified the featured crop with normal scroll, the static poster under reduced motion and the CSS masthead entrance with browser history.
- Exercised preview validation, error and retry for enquiries and completion for the survey and newsletter. Mocked provider acceptance and interruption yielded one email and one accepted-enquiry event for an unchanged retried request. The mock collector recorded booking clicks as a separate event.
- The generic visual gate timed out. Screenshots and interactions were reviewed directly in Chromium. Axe reported zero violations in the scanned main and footer areas of Work, Services, About and Contact in light mode.
- Production-host video and caption checks, physical iOS and Android checks, the verified Calendly event and live mail, survey and newsletter delivery remain release checks.

## Cinematic redesign review, 27 November 2026

- Checked the ten original routes at 320, 390, 768 and 1440 px in Chromium, including canonicals, preview indexing and the real 404. Reviewed the opening compositions at desktop and phone widths and matched the protected header, hero and studio-story source hashes to the pre-redesign snapshot.
- Verified the scroll crop, pointer movement, live lens and still fallback on Home. Checked the featured-film controls, expandable archive, filters and Watch dialog focus and retry with a simulated Vimeo response.
- Tested the service selector, portrait media, video and still treatments, motion pause, and navigation to a service page. Checked the booking anchor, enquiry validation and radio choices in the survey.
- Axe reported zero violations in the scanned main and footer areas of Home, Work, Services, About, Contact and the social reels page at 390 px in light mode.
- Mobile lab medians using the profile below were 1.45 s LCP and 0.091 CLS on Home, and 1.26 s LCP and 0.004 CLS on Work. The three Work runs were 1.09, 1.40 and 1.26 s. The three Home runs were 1.45, 1.29 and 1.58 s.
- Verified the scroll-driven brand reel in Chromium at 1440 × 900 and 390 × 820 px. All 16 marks passed through the foreground in one pinned turn, followed by Selected work. Checked reverse scrolling, arrow controls and native wheel and touch input. Sampled the turn and release at 1339 × 559 and 320 × 568 px and checked that the framed scene fits below the header. Reached all 16 marks with the controls in reduced motion.
- Reviewed the studio emblem on the reel's centre spindle in Chromium at 1440 and 390 px. Verified that the globe turns at rest, Next still selects the next brand and reduced motion shows the original emblem artwork.

## Brand reel follow-up, 28 November 2026

- Checked the enlarged reel at 1440 × 900, 1339 × 559, 390 × 820 and 320 × 568 px. Verified Apple at the start and finish, slow idle rotation without page movement, the pause control and continued browsing with reduced motion. Confirmed that the Home survey now follows Production services.
- Reviewed the live projection backdrop in Chromium at 1339 × 559 and 390 × 820 px. Compared frames with the reel paused to verify that the background still moves. Checked camera response, readable marks and controls, Apple at the end of the scroll path and canvas teardown after release. Verified the still stage and manual browsing with reduced motion.

## Selected work inline playback, 28 November 2026

- Checked desktop and touch layouts at 1440 × 960, 390 × 820 and 320 × 620 px in Chromium. Verified the title and runtime selectors, the stable 16:9 frame, the Selected work anchor and reduced motion. Simulated Vimeo responses to check the inline autoplay request, retry and player teardown.
- The original Gaming Legends player reached ready and confirmed muted state. The Vimeo CDN stream stalled and returned a playback error in both the preview and a standalone Vimeo embed. Confirm video progress and the native sound controls for all four films on the protected preview and production hosts.

## Selected work projection review, 28 November 2026

- Reviewed the projection set at 1440 × 960 and 390 × 844 px. Checked forward and reverse camera movement, all four category controls, arrow wraparound, keyboard and touch selection, the 16:9 player and legible titles. Checked reduced motion at 320 × 660 px. Used simulated Vimeo ready and error responses to verify the recovery action and release of the offscreen player.
- In local Chrome, verified muted autoplay by observing each published Vimeo film advance inside its frame. Patrick Bet-David: Facility Tour played on a separate recheck after its first stream stalled. Check real devices, captions, sound controls and the approved production hostname at release.

## Performance evidence

The local production previews used Chromium 153 and a 390 × 844 phone viewport at 2× device scale. Each run used a fresh browser context, disabled cache, 4× CPU throttling, 150 ms latency, 1.6 Mbps download and 0.75 Mbps upload. The table records the first-pass baseline from 26 November 2026.

| Route | LCP runs | Median LCP | Median CLS |
| --- | --- | --- | --- |
| Home | 1.16, 1.38, 1.31 s | 1.31 s | 0.091 |
| Work | 2.09, 2.11, 2.60 s | 2.11 s | 0.002 |

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
