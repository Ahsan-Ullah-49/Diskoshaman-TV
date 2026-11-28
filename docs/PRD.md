# Diskoshaman TV product requirements

The client confirmed the audience, first-pass scope, visual direction and contact paths in `Audience and priorities.docx`, supplied on 24 November 2026. Review the design in the working site. The remaining handover items appear under [launch dependencies](#launch-dependencies).

## Product goal

Present Diskoshaman TV as an end-to-end media production studio for Australian audiences, with Western Australia as the main market and services available across Australia. Serve individuals and small, mid-sized and large businesses. Show the full offer from videography and photography through editing and final delivery for short-form and long-form projects.

The redesign should feel fast, smooth, focused, elegant and easy to navigate. Give visitors a clear way to view the work and start a conversation about their project.

## Main visitor journeys

- **Understand the offer.** A prospective client can tell what Diskoshaman produces, whom it serves and how to continue from the home opening.
- **Evaluate the work.** A visitor can find a relevant approved film or case study, understand Diskoshaman's role and play the film when available.
- **Evaluate a service.** A visitor can understand the offer and see it in action through a short video or another animated treatment, with the description available in every state.
- **Make contact.** A visitor can book a 20-minute discovery call or submit a project enquiry from the appropriate site entry points.

## First-release scope

Keep the existing pages and features in the first design. Review additions and removals after the client sees the redesigned experience.

| Area | Requirements |
| --- | --- |
| Home | Keep the existing showreel, rotating headline and introduction. Place Our Work and Contact Us under the introduction and booking in the header. Show the published YouTube, TikTok and Instagram totals at the lower left of the hero. Follow the opening with the published studio story and its original portrait-format film. Place the 16 published brand logos in an interactive scene immediately after the story, followed by Selected work and Production services. Selected work presents one published widescreen film from each original homepage library category, with playback in the section. |
| Work | Preserve the existing portfolio. Use a curated grid with readable project titles and posters and open films in the quick-play overlay. Keep the current page as the portfolio entry point. |
| Services | Retain the current service content and the five live service landing pages. Give each service a motion-led example using relevant video or an animated treatment. Show treatment options in the working preview and link to relevant existing work where useful. |
| About | Retain the existing studio and producer copy. Use existing photos or behind-the-scenes imagery where it helps explain the studio. |
| Contact | Provide a 20-minute Calendly discovery call and a project enquiry form. Route enquiries to hammadchaudhry@diskoshaman.tv. Show accessible field feedback, submission confirmation and a recovery path for failed submissions. |
| Survey and newsletter | Retain both features. Verify the existing survey questions, signup or submission destinations and confirmation behaviour for migration. |

Keep **Book a call** within reach in the header. On Contact, lead with the 20-minute booking and offer **Send a project enquiry**. Record warm or cold lead qualification as follow-up work after the first release.

## Experience and quality requirements

- Build mobile-first and verify narrow phone widths, tablets and desktop with native scrolling, keyboard access and a reduced-motion experience.
- Default to charcoal, remember theme choice and use studio gold (#CC9828). Centre the large emblem in a camera-shaped glass curve and keep the DS facing forward until the visitor turns it. The mobile header has a left menu trigger and a right booking link. Its half-width drawer contains the studio logo, navigation, theme switch and booking. Provide smooth wheel scrolling and keep the native pointer visible with a centred dot, a short gold trail and a rotating colour ring over controls.
- Preserve existing page URLs and provide page-specific titles, descriptions and visible content. Verify canonical links, a production sitemap and indexing controls before launch.
- Primary copy, navigation and enquiry links remain available while video or animation loads or if playback fails.
- The concept includes a hero entrance, a cinematic scroll sequence for featured work, page transitions, and menu and hover details. See the [design and motion specification](design-and-motion.md) for the storyboard, mobile version and reduced-motion states.
- Content and layout use a consistent component system that a new developer can understand and extend. Apply the [AI coding instructions](../AGENTS.md) to implementation.
- Use the [QA and launch plan](qa-and-launch.md) to verify the critical journeys, copy, migration paths and performance on the release candidate.

## Client decisions

The visual direction combines a clean, easy-to-navigate layout with bold, cinematic motion and an elegant Hollywood-inspired feel. Use the existing brand colours as the base. The client allows additional accent colours and delegates readable font selection. Use current brand assets in the concept and check exact palette and usage against the brand kit when supplied.

Reuse the text, showreel, photos, projects, logos and other media already published on the old site. AI-drafted copy can fill new sections in labelled previews. Have Hammad review or replace it before it goes live. The client contact will assist with design, asset delivery and feedback.

## Delivery and approval

The client stated a base redesign budget of **AUD 150** plus a discretionary bonus. They requested delivery in about one week, with **1 December 2026** as the target launch if feasible. Hammad gives final launch approval.

The brief also proposes **AUD 50 per month** for ongoing oversight across company websites. Record that as a commercial proposal for agreement between the client and developer.

## Launch dependencies

| Item | Owner or check |
| --- | --- |
| Brand kit | Client to supply brand assets and colour values. Use visible brand cues as a provisional basis for the working preview. |
| Services motion | Present a short video treatment and an animated treatment in the working preview. Record the selected approach before applying it across the Services page. |
| Booking | Supply the exact 20-minute Calendly event URL. The old Contact page's embeds point to a 30-minute event. The preview offers email booking while this is pending. |
| Content and media | The preview uses the existing hero reel. Verify playback on the chosen managed platform and finish the wider asset inventory. Hammad reviews new copy and any new assets before they go live. |
| Retained forms | The original Elementor survey and newsletter fields are inventoried. Confirm the destinations and completion settings, connect the approved adapters and test enquiry delivery to the supplied address. |
| Launch | Review the production candidate and secure Hammad's final approval against the [QA and launch plan](qa-and-launch.md). |

## Launch acceptance

The release candidate includes the existing pages, survey, newsletter and showreel with reviewed copy, brand assets and the chosen service motion. A visitor can browse films, read service information, submit an enquiry and reach the correct 20-minute booking event on mobile or desktop. Record QA results and use separate events for accepted enquiries and outbound booking clicks. Count a completed booking when the calendar integration confirms it.
