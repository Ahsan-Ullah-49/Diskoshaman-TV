# Diskoshaman TV technical plan

Build a fresh Next.js App Router application with strict TypeScript and structured content in the repository. Develop and review the interface in code. Use GitHub and Vercel for the release workflow. Vimeo is the first managed-video option to validate for both the hero and project films. See the [decision record](README.md#developer-decisions).

## Application structure

The starter uses Next.js 16, React, npm, CSS Modules, CSS custom properties, ESLint and Prettier. See the [local setup](README.md#run-locally). Build page layouts and content as Server Components. Use small Client Components for the menu, video controls, motion and any approved form. Load the full-film player when it is requested. [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Next.js CSS](https://nextjs.org/docs/app/getting-started/css)

| Location | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, shared layout, metadata, errors and any approved route handler |
| `src/components/` | Shared controls and layout primitives with real callers |
| `src/features/work/` | Project grid, Watch dialog and film playback |
| `src/components/home/` | Hero reel, headline and view counters |
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

Lenis eases desktop wheel input on the document and uses the GSAP ticker alongside ScrollTrigger. The phone menu stops pending inertia. Preserve native touch scrolling, keyboard navigation, hash links and browser history. A shared motion preference disables automatic movement for reduced motion or data saving and lets the visitor pause from the hero or footer. [Lenis](https://github.com/darkroomengineering/lenis), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

The header loads Three.js and `public/brand/studio-emblem.glb` on demand. The model reconstructs the photographed lettering, globe and motto as layered, lit geometry from the studio's logo. The GLB contains Monogram, Globe and Motto pivots. Pointer capture and keyboard input control the monogram independently of the globe. The original image covers loading, WebGL failure and context loss. Dispose of the scene, textures and renderer when the component unmounts. [Studio logo](https://diskoshaman.tv/wp-content/uploads/2024/10/logo3D-slogan-600x600-1.png)

CSS tokens drive both themes. `next-themes` applies the dark default or the stored light preference before paint. The header uses a native modal dialog for the phone menu.

For route transitions, use Next.js navigation links with React View Transition boundaries where the installed release and target browsers support the desired effect. Keep the nav outside animated page content. First prove one main route transition in a production-mode demo, including direct loads and back navigation. Use CSS entry or native navigation as fallback. Use the current framework guide for the chosen version and keep the design functional without a transition. [Next.js view transitions](https://nextjs.org/docs/app/guides/view-transitions), [React ViewTransition](https://react.dev/reference/react/ViewTransition)

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
3. **Check domains and access.** Confirm embeds for the approved preview and production hostnames and check real phones. Verify the hosting account's plan, privacy options and rights for any direct playback URLs before committing to a delivery path. Use a stable preview hostname or approved test media for domain-restricted films. Keep an approved poster and watch link or retry path available when the provider is blocked. [Vimeo embed settings](https://help.vimeo.com/hc/en-us/articles/12426259908881-How-to-embed-my-video), [embedding features by plan](https://help.vimeo.com/hc/en-us/articles/12426275096337-Embedding-features-by-plan-type)

## Enquiry and tracking

Provide direct booking and project enquiry. Use the first-design hierarchy in the [PRD](PRD.md#first-release-scope). The booking action opens the verified 20-minute Calendly event. Its exact URL is a launch dependency and needs confirmation from the client or the existing integration. The enquiry destination is hammadchaudhry@diskoshaman.tv.

- Use a `POST /api/enquiry` Route Handler to validate input and call the email provider from the server. Configure the supplied recipient in production, use a test destination in preview and bound the size of submitted text. Start with the existing enquiry fields and review validation and copy during implementation. [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- Show field errors, a submitting state and a retryable failure state. Reuse the same submission ID for retries of an unchanged request. Use provider-supported idempotency or equivalent server-side handling to avoid duplicate emails. Show success after the provider accepts the request. Verify actual inbox delivery using an authorised test before launch.
- Track outbound booking clicks and accepted enquiries as distinct events. Deduplicate accepted-submission events by submission ID so an accepted request retried after a timeout counts once. Count completed bookings only when the provider confirms them. Keep enquiry contents and contact details out of analytics and general logs.
- Select the mail and analytics providers once the team confirms the available accounts. Lead qualification is a follow-up item in the PRD.

## Survey and newsletter

Carry both features over from the current site. Before connecting them, inventory their current fields, validation, confirmation text, data destinations and provider settings. Preserve the existing response and subscription workflows using verified settings. Use test destinations in preview and verify the live integrations during cutover.

## Preview and production

Connect the GitHub project to Vercel and use protected preview deployments for design and QA. Give preview an approved test destination and media settings. Configure separate preview and production environment values for integrations. Record required key names in `.env.example` and keep actual credentials server-side. Verify access for reviewers using the selected Vercel account and test integrations on their intended hostnames. [GitHub integration](https://vercel.com/docs/git/vercel-for-github), [Vercel deployment protection](https://vercel.com/docs/deployment-protection), [environment variables](https://vercel.com/docs/environment-variables)

Use the [QA and launch plan](qa-and-launch.md) to preserve legacy routes, prepare the transfer and verify the release. Record local scripts and package versions in the project README when scaffolding.
