# Diskoshaman TV development instructions

Read the [project index](docs/README.md) before implementation. Use the [PRD](docs/PRD.md) for scope, the [design and motion specification](docs/design-and-motion.md) for interface behaviour, and the [technical plan](docs/technical-plan.md) for architecture. Use the [QA and launch plan](docs/qa-and-launch.md) to verify changed behaviour.

## Build against the project decisions

- Implement the task the user requested and follow the approved design. Make creative choices within the parts the user delegates.
- Check whether the requirement is approved, a developer decision is pending, or the work is a reversible prototype. Use clearly identifiable demo content in previews while client copy or assets are pending.
- Update the relevant document when a confirmed decision changes. Keep the implementation and its acceptance criteria aligned.
- Use the current site's copy, media and brand assets as the first-pass baseline described in the PRD. Label draft copy for new sections in previews and use Hammad's reviewed copy for release. Preserve existing URLs and retained feature workflows according to the migration plan.

## Research delegated design work

- Search the live web for relevant UI and UX examples when the user delegates creative direction. Inspect how strong sites handle composition, navigation, motion, media and hover or touch feedback. Record the source links and the design ideas they inform.
- Build an original interaction and visual composition around Diskoshaman's approved work and each page's purpose. Use reference sites to learn techniques and make choices that fit the studio's own material.
- Iterate the design in the working site and review the coded preview. Verify the important interactions in a real browser on desktop and mobile.

## Write code a developer can maintain

- Follow the chosen stack and existing project conventions. Use meaningful names such as `featuredProjects`, `heroPoster` and `submitProjectEnquiry` so a reader can follow the data and intent.
- Keep page composition, content, media playback and provider calls in clearly named modules. Keep state near its owner. Share components and helpers when their callers have the same behaviour.
- Format consistently with the repository formatter. Use ordinary control flow and readable expressions. Prefer small functions with clear inputs and outputs. Keep render logic easy to skim and server-side effects easy to locate.
- Use strict TypeScript and validate external inputs at their boundary. Keep secrets in server configuration and list required environment variable names in a safe example file.
- Change the modules required for the task. Keep dependencies purposeful and describe an added dependency when it introduces a material maintenance or bundle cost.

## Explain intent in comments

- Write short English comments where a developer needs the reason for a decision, such as media load timing, focus restoration, motion cleanup, third-party behaviour or form retry handling.
- Use a short doc comment for an exported function when its inputs, return states or side effects would otherwise be unclear. Let names and straightforward code explain ordinary assignments and conditions.
- Update comments along with behaviour so a new developer can trust them. Keep temporary decisions visible in the project notes if they need follow-up.

Example of a useful comment where player mounting is deferred.

```ts
// Mount the film player when Watch opens the dialog so the grid stays responsive on mobile.
```

## Implement motion and media as enhancements

- Use semantic HTML, visible focus states and control labels. Preserve the same content and contact path with reduced motion and when media fails.
- Reuse the project's typography, colour, spacing and timing tokens. Keep touch interactions understandable without hover.
- Pair each motion sequence with lifecycle cleanup and a static state. Give automatically moving media a usable pause control where required by the design specification.
- Use an appropriate poster and declared dimensions for each media slot. Keep full films and their players off the initial critical path according to the selected media plan.

## Verify the change

- Keep verification screenshots, HTML captures, one-off scripts and caches out of the project. Use system temporary storage when a check needs files, then remove them after verification.
- Run the configured formatter, lint, type check and build commands that apply. Follow the project test setup and add targeted coverage when a real behaviour can regress.
- For interface changes, check the affected desktop and phone states. Test keyboard, reduced motion, media fallbacks or form errors when they relate to the change.
- Report the files changed, the verification performed and any results still pending. Document any new setup, editing or launch step the next developer needs.
