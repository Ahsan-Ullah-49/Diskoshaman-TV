# Diskoshaman TV technical plan

Build a fresh Next.js App Router application with strict TypeScript and structured content in the repository. Develop and review the interface in code. Use GitHub and Vercel for the release workflow. Vimeo is the first managed-video option to validate for both the hero and project films. See the [decision record](README.md#developer-decisions).

## Application structure

The starter uses Next.js 16, React, npm, CSS Modules, CSS custom properties, ESLint and Prettier. See the [local setup](README.md#run-locally). Build page layouts and content as Server Components. Use small Client Components for the menu, video controls, motion and any approved form. Load the full-film player when it is requested. [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Next.js CSS](https://nextjs.org/docs/app/getting-started/css)

| Location | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, shared layout, metadata, errors and any approved route handler |
| `src/components/` | Shared controls and layout primitives with real callers, including `PillLink` for every call-to-action button |
| `src/features/work/` | Featured film selection, project archive, Watch dialog and film playback |
| `src/features/services/` | Service previews, media controls and editorial service page layouts |
| `src/components/cinema/` | Shared cinematic type and media treatments, pointer-controlled frames and the lazy Three.js production lens |
| `src/components/home/` | Hero reel, headline, view counters, studio story, brand reel, featured work and Home service index |
| `src/features/contact/` | Enquiry form, booking link and server-only provider code |
| `src/content/` | Typed site settings, projects, services and page copy |
| `src/app/globals.css` | Global styles and typography, colour and spacing tokens |

Create each area as it gains a responsibility. Read records directly on the server and prerender public content where it is deterministic. Keep per-request services in server modules. Co-locate feature-specific styles and tests with their owners.

## Content model

| Record | Proposed fields and rules |
| --- | --- |
| Site settings | Studio name, navigation, booking action with 20-minute duration and verified Calendly URL, enquiry action, contact details, metadata defaults and the existing hero asset reference |
| Project | Stable slug, display title, category, short summary, role, poster and optional managed film reference and credits. Include case-study content and metadata where the page is approved. |
| Service | Stable slug, heading, summary, body, selected motion treatment, relevant media, static fallback and related project slugs. Render the first release on the existing Services page. |
| Asset | Reference, media type, aspect ratio, alternate text or decorative status, and captions reference where needed. Keep approval evidence in the content workflow. |
| Release selection | Ordered featured projects, published services and approved page or feature flags. Validate uniqueness, required metadata and cross-references at build time. |

Support short video and animated service media with a text or poster fallback. Use the existing site copy and assets as the baseline. Keep draft copy for new sections clearly labelled in preview and feed reviewed copy into release content. Keep raw film masters with the media owner and serve public assets through the selected delivery path. An update to an approved record goes through Git review and preview before production.

## Motion implementation

Lenis eases desktop wheel input with lerp smoothing (0.12) on the GSAP ticker alongside ScrollTrigger, with GSAP lag smoothing off so the two stay in step after a slow frame. SiteScroll coalesces ScrollTrigger refreshes into one after navigation, fonts, load and any page height change of more than 24px, because each refresh is costly. `src/lib/render-quality.ts` detects software WebGL (no usable GPU, such as Microsoft Basic Render Driver or SwiftShader); there the same scenes draw at a pixel ratio of 1, without antialiasing and at 30 fps, and physical materials fall back to the standard model so shader compiles do not freeze the page. 3D scenes mount once and then only pause off screen; the brand reel no longer rebuilds on each visit. The particle field batches its dots by colour into one fill per group. The phone menu stops pending inertia. Preserve native touch scrolling, keyboard navigation, hash links and browser history. A shared motion preference disables automatic movement for reduced motion or data saving and lets the visitor pause from the hero or footer. [Lenis](https://github.com/darkroomengineering/lenis), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

The studio emblem (`public/brand/studio-emblem.glb`) carries a 2048 px WebP face texture made from the client's high-resolution logo (`public/brand/Diskoshaman TV/logo3D slogan.png`) in the exact framing of the earlier 384 px texture, so the header, footer, camera, brand reel and About emblem all render it sharply; `sharpenEmblemTextures` turns on anisotropic filtering. The header and footer mark always draw at twice their CSS size with antialiasing, because the canvas is small. `studio-logo.png` (1200 px) and the favicon were regenerated from the same file. Library and related films use `AutoplayFilm`: each Vimeo player mounts near the viewport with at most two loading at once, waits for Vimeo's ready message before replacing the poster, plays muted while on screen, pauses just off it and is removed well out of view. Services heroes draw their hairline scenes from `service-scene-drawings.ts` through one `ServiceScene` canvas runner.

The header loads Three.js and `public/brand/studio-emblem.glb` on demand. The model reconstructs the photographed lettering, globe and motto as layered, lit geometry from the studio's logo. The GLB contains Monogram, Globe and Motto pivots. Pointer capture and keyboard input control the monogram independently of the globe. The original image covers loading, WebGL failure and context loss. Dispose of the scene, textures and renderer when the component unmounts. [Studio logo](https://diskoshaman.tv/wp-content/uploads/2024/10/logo3D-slogan-600x600-1.png)

CSS tokens drive both themes. `next-themes` applies the dark default or the stored light preference before paint. The header uses a native modal dialog for the phone menu.

Edit the homepage copy and Vimeo reference in [home.ts](../src/content/home.ts) and the layout in [studio-story.tsx](../src/components/home/studio-story.tsx). The original cover is `public/media/story-poster.webp`. StudioStory renders the complete static section on the server. StoryMotion adds the 3D sequence with GSAP: the title flip, the film dolly into its sticky desktop column, the lead word reveal and a pointer lean on fine pointers. Each tween runs from an offset state to the stylesheet layout, so reverting the context when motion pauses restores the finished set. StoryFilm mounts the Vimeo embed in view, uses the provider's playback and caption controls and releases it when the portrait leaves view. Keep the published copy available in server-rendered HTML. [Original film](https://vimeo.com/1057763335/729712b3c6), [Vimeo player](https://github.com/vimeo/player.js)

Interior scenes use a 320 ms CSS entrance on direct loads and Next.js route changes. The shared motion preference suppresses it. Home Selected work places the 3D scene to the left of the project list on desktop. GSAP scrubs the entrance of four cover planes in CSS perspective. The Three.js transport imports only while the scene is visible with motion on. Its render loop reads the current selection and approach progress. The still deck and the original showreel photograph fill the same area before the renderer starts and if WebGL is unavailable. The four landscape films and their project and category labels live in `homeScreeningFilms` in projects.ts. The player mounts in a shared 16:9 gate separate from the travelling covers. Rapid selection changes clear the pending mount and start the new film after its cover seats. Leaving the aperture's viewport releases the player. Wait for Vimeo's ready response before revealing it over the cover. Reduced motion uses manual playback. The Work archive keeps all titles in the rendered HTML and uses a native disclosure for the overflow.

The Home brand reel imports its Three.js renderer when the stage enters the viewport with motion enabled. A CSS sticky room holds the reel in view while ScrollTrigger maps native document travel to one revolution with a hold on Apple before release. After roughly 1.5 seconds without input, the visible reel rotates at its idle pace. One canvas draws the reel, moving projector light, floor shadow and depth particles. A camera view offset extends the scene to the room's edges and preserves the reel's layout position. The drawing buffer is capped at 1.5 million pixels. The same render loop handles gesture controls, the logo readout and the globe from the header's `studio-emblem.glb`. It draws at a lower cadence at rest. The local pause control stops idle reel rotation. Leaving the viewport or disabling site motion releases the scene and GPU resources. The still stage and all brand names are in the rendered HTML.

The Home service lens lazy-loads an existing Three.js dependency after its panel enters a fine-pointer viewport with motion enabled. It uses instanced grip geometry and the local `public/media/studio/on-set.webp` still as an optical texture. It draws during pointer easing and resize, then stops. On exit or pause it disposes of the geometry, scene resources and renderer. The rendered HTML holds a still aperture for the fallback.

## Search and indexing

- Preserve the ten live page paths and trailing slashes, including the five individual service pages confirmed in the [site audit](current-site-audit.md#known-legacy-paths). Link the service pages from Services. Each route has its own title, description and canonical URL under `https://diskoshaman.tv`, plus social metadata. Keep these records with the page copy in `src/content/site.ts` and `src/content/services.ts`.
- The homepage emits Organization and WebSite structured data based on the studio's published identity. The visible introduction, heading, image description and internal links are available in the initial HTML.
- Previews emit `noindex, follow`. `robots.txt` permits crawlers to see the directive. Enable `SITE_INDEXING=enabled` on the approved production deployment and build again after the launch review. Vercel previews stay excluded even when the flag is present. The enabled build lists the canonical routes in `sitemap.xml`. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [Next.js metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- Before launch, compare the full old sitemap with the release routes, write any required redirects, and verify the approved page copy. At cutover, verify the sitemap and key URLs in Google Search Console when access is available. [Google site migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Managed video and Vimeo verification

The coded preview serves two silent H.264 versions of the studio's full 40.8-second opening reel from `public/media/`. At playback, portrait phones load the 540 × 960 centre crop and other viewports load the 1280 × 720 version. Only the selected video is requested. Update the two URLs in `src/content/home.ts` when managed delivery has been verified. [Studio's original reel](https://diskoshaman.tv/wp-content/uploads/2024/10/Video-Production-Services-vid.mp4)

Use one managed provider for both roles. The developer verifies the existing Vimeo account with its owner and tests an approved asset. If Vimeo cannot meet the embed, rights or performance criteria, the developer selects one provider for both roles using the same criteria. Record the result in the [decision record](README.md#developer-decisions). The [design specification](design-and-motion.md#mobile-and-media) governs poster, pause, reduced motion and mobile behaviour.

1. **Test the opening.** Identify the current hero reel asset or embed and keep that reel for this release. Verify playback and a lighter mobile variant using the same reel. Load its poster first. Use a Vimeo-backed muted inline preview if the account, public-use approval and measured speed support it. Give a background embed a site-level play and pause control if its own controls are hidden. [Vimeo background and Chromeless playback](https://help.vimeo.com/hc/en-us/articles/12426285089681-About-embedding-background-and-Chromeless-videos), [Vimeo direct playback links](https://help.vimeo.com/hc/en-us/articles/12426150952593-How-to-access-my-video-s-direct-links)
2. **Test full films.** Render server-side poster and project context. Mount one player when a visitor opens the Watch overlay. Attempt playback and expose Play if the browser requires an additional gesture. Verify captions and playback controls. Keep the loading state until the player is ready, handle failure with the poster and a recovery action, and stop and remove the player when the dialog closes or its route changes. [Vimeo Player SDK](https://github.com/vimeo/player.js)
3. **Check domains and access.** Confirm embeds for the approved preview and production hostnames and check real phones. Verify the hosting account's plan, privacy options and rights for any direct playback URLs before committing to a delivery path. Use a stable preview hostname or approved test media for domain-restricted films. Keep the poster and an on-site retry available when the provider is blocked. Do not link viewers to the provider site; the embed sets `vimeo_logo=0`, and the account’s embed settings should also hide the Vimeo logo, share and watch-later buttons where the plan allows. [Vimeo embed settings](https://help.vimeo.com/hc/en-us/articles/12426259908881-How-to-embed-my-video), [embedding features by plan](https://help.vimeo.com/hc/en-us/articles/12426275096337-Embedding-features-by-plan-type)

## Enquiry and tracking

Provide direct booking and project enquiry. Use the first-design hierarchy in the [PRD](PRD.md#first-release-scope). The booking action opens the verified 20-minute Calendly event. Its exact URL is a launch dependency and needs confirmation from the client or the existing integration. The enquiry destination is hammadchaudhry@diskoshaman.tv.

- The project enquiry posts from the browser straight to Web3Forms (`src/features/contact/web3forms.ts`); there is no form backend, by client decision on 28 November 2026. The public access key `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` only lets the form send to the inbox it was created for. Create it for a test inbox on previews and for hammadchaudhry@diskoshaman.tv in production. Fields are validated with the shared rules before sending; the optional service is sent only when chosen, and the honeypot is passed as Web3Forms' `botcheck`. [Web3Forms](https://docs.web3forms.com/)
- Show field errors, a submitting state and a retryable failure state. Reuse the same submission ID for retries of an unchanged request. Use provider-supported idempotency or equivalent server-side handling to avoid duplicate emails. Show success after the provider accepts the request. Verify actual inbox delivery using an authorised test before launch.
- Track outbound booking clicks through `/api/booking/`. Accepted enquiries are confirmed by Web3Forms in the browser and are no longer counted by the server collector. Keep enquiry contents and contact details out of analytics and general logs.
- Select the mail and analytics providers once the team confirms the available accounts. Lead qualification is a follow-up item in the PRD.

## Survey and newsletter

Carry both features over from the current site. Before connecting them, inventory their current fields, validation, confirmation text, data destinations and provider settings. Preserve the existing response and subscription workflows using verified settings. Use test destinations in preview and verify the live integrations during cutover.

## Integration configuration

`CALENDLY_EVENT_URL` takes the verified 20-minute Calendly event URL. The Contact section offers an email booking action while the event is pending. A click on the configured Calendly event emits `booking_clicked`. Record a completed booking after the calendar integration confirms it.

Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` to enable the enquiry form. Without it, previews show a preview confirmation without sending and production asks visitors to email the studio. The survey and newsletter keep their server adapters at `POST /api/survey/` and `POST /api/newsletter/`; `/api/enquiry/` now returns 404.

The retained forms use `POST /api/survey/` and `POST /api/newsletter/`. Set `SURVEY_ENDPOINT` and `NEWSLETTER_ENDPOINT` to approved HTTPS adapters for the existing workflows. An adapter receives `{ id, form, values }` and an `Idempotency-Key` header. Set the matching `*_ENDPOINT_TOKEN` to add bearer authentication. An adapter returns a successful status after accepting the response or subscription. Unconfigured preview forms display a labelled demo acknowledgement. Confirm the source destinations, consent settings and confirmation text with the site owner before connecting production.

`CONVERSION_ENDPOINT` is an optional HTTPS collector for `booking_clicked`. The collector receives only the event name and a stable event ID. Deduplicate on that ID or its matching `Idempotency-Key` header. Use `CONVERSION_ENDPOINT_TOKEN` for bearer authentication.

## Preview and production

Connect the GitHub project to Vercel and use protected preview deployments for design and QA. Give preview an approved test destination and media settings. Configure separate preview and production environment values for integrations. Record required key names in `.env.example` and keep actual credentials server-side. Verify access for reviewers using the selected Vercel account and test integrations on their intended hostnames. [GitHub integration](https://vercel.com/docs/git/vercel-for-github), [Vercel deployment protection](https://vercel.com/docs/deployment-protection), [environment variables](https://vercel.com/docs/environment-variables)

Use the [QA and launch plan](qa-and-launch.md) to preserve legacy routes, prepare the transfer and verify the release. Record local scripts and package versions in the project README when scaffolding.
