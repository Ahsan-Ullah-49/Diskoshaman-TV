# Diskoshaman TV redesign documentation

The client confirmed the requirements in `Audience and priorities.docx`, supplied on 24 November 2026. Design now evolves in the working Next.js site. The PRD records the launch dependencies and the 1 December 2026 target.

| File | Use |
| --- | --- |
| [Product requirements](PRD.md) | Audience, confirmed first-pass scope, delivery target and launch dependencies |
| [Current website audit](current-site-audit.md) | Public content baseline, known URLs and proposed improvements |
| [Design and motion](design-and-motion.md) | Page composition, media hierarchy, interaction states and responsive behaviour |
| [Technical plan](technical-plan.md) | Application structure, content, media, enquiries and deployment decisions |
| [QA and launch](qa-and-launch.md) | Browser verification, migration, launch and developer handover |
| [AI coding instructions](../AGENTS.md) | Repository-wide implementation and review rules |

## Run locally

From the project root, use Node.js 22.13 or newer. The starter was verified with Node.js 24.

```powershell
npm ci
npm run dev
```

The preview includes all ten existing page URLs, with featured screenings above the 31-film archive. Home introduces the same films through a scroll-led reveal and pairs its service index with a 3D production lens. The Services preview opens the existing five landing pages. The survey is on Home and the newsletter is in the footer. Edit the hero headline, reel sources and published social totals in [home.ts](../src/content/home.ts). SiteScroll and StudioCursor control scroll feel and the fine-pointer enhancement. The studio's interactive three-part emblem and original artwork live in `public/brand/`.

| To edit | File |
| --- | --- |
| A film title, credit, Vimeo ID or Home featured selection | [projects.ts](../src/content/projects.ts) |
| Work opening film selection | [work-page.tsx](../src/features/work/work-page.tsx) |
| Film poster | Place an optimised WebP at `public/media/work/<project-slug>.webp` |
| Homepage brand logos | [brand-logos.ts](../src/content/brand-logos.ts) and `public/media/brand-logos/` |
| Service copy, media and related films | [services.ts](../src/content/services.ts) and [service-details.ts](../src/content/service-details.ts) |
| Producer profile and social links | [studio.ts](../src/content/studio.ts) |
| Page titles, descriptions and site settings | [site.ts](../src/content/site.ts) |
| Form fields and feedback | [form-fields.ts](../src/features/contact/form-fields.ts) |

Copy [.env.example](../.env.example) to `.env.local` for provider testing. Use the verified 20-minute Calendly URL, an approved test inbox for preview enquiries and approved survey and newsletter test endpoints. Without these settings, the local preview shows the email booking action and labels the forms as demos. See the [integration configuration](technical-plan.md#integration-configuration).

Run `npm run format:check`, `npm run lint`, `npm run typecheck` and `npm run build` before review. Use `npm run format` to apply the repository formatter.

## Developer decisions

Started in the developer discussion on 20 November 2026. The 24 November update confirms design review in code, a dark default with a light option, and mobile-first and SEO requirements.

| Decision | Current answer | Where it is used |
| --- | --- | --- |
| Codebase and framework | Fresh Next.js and TypeScript application | [Technical plan](technical-plan.md) |
| Prototype and review format | Design and motion evolve in the coded preview | [Design and motion](design-and-motion.md) |
| Theme | Charcoal default with a persistent light option | [Design and motion](design-and-motion.md) |
| Discovery | Preserve live URLs and prepare mobile-first pages, metadata, structured data and production indexing | [Technical plan](technical-plan.md#search-and-indexing) |
| Launch motion interactions | Hero entrance, cinematic scroll sequence with featured-project reveal, page transitions, menu motion and hover details | [Design and motion](design-and-motion.md) |
| Mobile version of main motion sequence | Same sequence and story beats with lighter mobile assets | [Design and motion](design-and-motion.md) |
| Work browsing and film playback | Curated grid with quick-play overlay | [Product requirements](PRD.md) and [design and motion](design-and-motion.md) |
| Content source and editing workflow | Structured records in the repository | [Technical plan](technical-plan.md) |
| Hero clip and full-film delivery | One managed video platform. Verify the existing Vimeo account and playback before committing to Vimeo. | [Technical plan](technical-plan.md#managed-video-and-vimeo-verification) |
| Enquiries and bookings | 20-minute Calendly call and project enquiry with email delivery and basic conversion events | [Technical plan](technical-plan.md#enquiry-and-tracking) |
| Repository, preview and hosting | GitHub with Vercel previews and production | [Technical plan](technical-plan.md#preview-and-production) and [QA and launch](qa-and-launch.md) |
| AI implementation and creative work | Implement the task as assigned. Use live UI and UX research and original compositions when creative decisions are delegated. | [AI coding instructions](../AGENTS.md) |

Use the [client decisions](PRD.md#client-decisions) for brand and content and the [launch dependencies](PRD.md#launch-dependencies) for handover checks. When reviewing a build, record the exact commit or preview URL so the findings can be reproduced.
