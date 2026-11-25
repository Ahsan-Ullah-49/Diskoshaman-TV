# Diskoshaman TV design and motion specification

Design in the working site around the client's confirmed mix of clean navigation, bold cinematic motion and an elegant studio feel. Use the existing showreel and brand cues, with a hero entrance, a featured-project scroll sequence, page transitions and menu and hover interactions. See the [client decisions](PRD.md#client-decisions).

## Working preview review

1. Review Home, Work, Services, About and Contact at 390 px and 1440 px. Check 320 px and intermediate widths. Show the survey and newsletter entry points and how visitors reach the 20-minute call and project enquiry.
2. Show the open mobile menu and the Work overlay with loading, playing and error states. Present two treatments for an existing service. Try a short muted clip that shows the service in use and an animated sequence of project frames or graphics. Show how each treatment keeps the title and summary readable.
3. Specify typography, colours, spacing, media ratios and movement with named tokens and component variants. Use the current brand cues for the first layouts and check the palette once the client supplies the kit. Label draft copy and provisional asset choices.
4. Demonstrate the opening, featured scroll story, one page transition, mobile menu, card feedback and the static reduced-motion path in the preview. For one Work card, demonstrate opening the player, playback, a load failure and recovery, then closing and returning focus. Use approved test media if production media is pending.

## Art direction

Apple's navigation informs the compact header and simple type hierarchy. The requested Bugatti reference informs the room between the outer controls and centre mark. [Apple](https://www.apple.com/), [Bugatti](https://www.bugatti.com/)

The header booking link uses the hero's gold glass at rest. Its bright champagne highlight opens diagonally from the centre on hover and keyboard focus, following the motion of the university site's Show More button. [University of Sahiwal](https://uniofsahiwal.netlify.app/)

The homepage uses a short introduction and a clear first action. Focus TV's portfolio informs the use of distinct imagery for each project. Give the Diskoshaman layout its own composition using the studio's imagery. [Apple](https://www.apple.com/), [Focus TV production portfolio](https://focustv.tv/)

Use the current brand colours as the base and add an accent where it supports hierarchy or contrast. Choose readable fonts with a consistent hierarchy. Use distinct stills for different projects and test contrast against the lightest and darkest frames behind text. Make the booking action prominent and keep enquiry available.

The primary colour is the studio's original gold (`#CC9828`). Use a brighter gold for fine print over film and a darker ochre on white. A smoked-glass curve frames the emblem over the opening film. On scroll, the surrounding glass follows the visitor's theme and dips around the emblem. Body and footer surfaces follow the same theme. [Studio brand and original reel](https://diskoshaman.tv/)

## Page compositions

| Surface | Proposed composition |
| --- | --- |
| Home | Place the existing showreel behind the original headline and introduction. Centre Our Work and Contact Us below the copy. Anchor the studio's published view counts at the lower left and playback at the lower right. Keep booking in the header and retain access to the survey further down the page. |
| Work | Preserve the existing portfolio, highlight selected work in a curated still-led grid and open films through the quick-play overlay. |
| Services | Keep the current services on the existing page and pair each with a motion-led example. Use the treatment selected in the working preview. Link to relevant existing work or to contact. |
| About | Give the existing studio and producer story room to read. Use available portraits or behind-the-scenes images. |
| Contact | Present the 20-minute booking action and the enquiry form. Design the form's fields, errors and confirmation. Use a clearly labelled booking placeholder in review material until the event URL is verified. |
| Survey and newsletter | Show where visitors reach the retained features, along with their input, error and confirmation states. |

## Motion scenes and interactions

The proposed homepage sequence uses a film cut as its visual idea. The opening presents the showreel frame and studio message. As the visitor reaches Work, the crop narrows into the first featured film, its title and context enter, and the frame settles beside a Watch or View Work action. Pick frames with related composition so the handoff feels like an edit. Use the same story beats on mobile with lighter crops and media.

| Interaction | Behaviour | Fallback and acceptance |
| --- | --- | --- |
| Header | Keep the 64 px phone and 72 px tablet and desktop bar transparent over the opening film. Centre the 88–100 px emblem in a smoked-glass curve. On scroll, the pinned bar gains themed glass around the curve. On mobile, place the hamburger at left and Book a call at right. | The half-width drawer slides in from the left, with a gold layer leading the navigation panel. Include the studio logo, four links, five Services destinations, theme switch and booking. Support touch, keyboard, Escape, backdrop dismissal and reduced motion. |
| Hero and actions | Keep the headline prefix stationary. Fade the final word in a slot sized by the five endings, using the same font and baseline as the prefix. At phone widths the slot takes a centred second row. Set the desktop introduction in two lines above the typing signature. | Text, links and the studio signature stay readable with motion paused. Switching words keeps the heading, introduction and controls in place. |
| Social views | Pair a compact gold platform icon with an upright number and a “Million views” caption. Place a fine vertical divider between adjacent groups. Count to YouTube 1.5+, TikTok 50+ and Instagram 45+ over 2.7 seconds on entry or a substantial return. | Keep clear dividers and readable totals on narrow screens. Small scrolls, hover and theme changes leave the numbers in place. Assistive technology receives each final value once. |
| Featured project scroll sequence | Tie a short crop and reveal sequence to normal scroll inside the featured Work section. Show the featured title, role and action at the point they are relevant. | Reduced motion shows the beats as still content in reading order. Rapid scrolling, rotation and resize leave the page in a complete state. |
| Service media | Use a relevant short clip or animated treatment chosen in the working preview. Keep movement inside the service media frame and load it near the viewport. Keep the service summary and action available throughout. | Reduced motion and media failure use a readable still or text state. Provide pause and play for automatically moving media where needed. |
| Page transitions | Use a brief content transition for the approved main route changes. Preserve stable navigation, route links, native history and focus. Use a shared poster transition only where the same approved image appears at both ends. | Supported environments show the transition without a blocking overlay. Use a short local page entrance or native navigation when shared transitions are unavailable. |
| Menus and cards | Give menu open and close, project cards and buttons clear state changes. Use pointer motion for hover and provide an equivalent focus or touch affordance. | Keyboard, touch and pointer users can reach and activate the same actions. Links and buttons stay responsive during motion. |
| Work overlay | Open a labelled dialog from Watch and attempt playback. Present the poster while the player loads and offer Play when the browser needs a second gesture. Keep a visible Close action. On close, stop playback, restore focus to the triggering card and retain the grid's scroll position. | The dialog supports Tab navigation and Escape. Verify accessible player controls and focus movement around the embed. Show a retry action or an approved watch link when the player cannot load. [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |

Start motion tuning around 150–220 ms for control feedback, 180–320 ms for route transitions and 450–750 ms for the entrance. Use the coded demo to tune the easing and durations. Give large movements a clear purpose and keep text and controls usable while animation runs.

The globe turns once every 19 seconds. The DS initially faces forward, tilts back on hover and holds the angle the visitor sets by drag or arrow key. Clicking or activating the emblem restores its front view. The motto remains fixed. The desktop dot and ring share the native pointer hotspot. Eight smaller gold dots follow movement and settle at rest. Hovering an active link or control reveals a broken amber, rose and indigo arc with a 1.5-second revolution, informed by the local Ikram Raza Portfolio cursor. Wheel input eases over 1.65 seconds. Touch, keyboard and browser history retain native navigation. [Focus TV interaction reference](https://focustv.tv/)

## Mobile and media

- Keep the desktop story order and interaction intent at phone widths. Use smaller video variants, art-directed stills and a shorter scroll travel to fit the viewport.
- Reserve space for all media with a set aspect ratio. Keep the poster visible until the hero video renders a frame. Play any automatic preview muted and inline, with a visible pause control. Provide Play when autoplay is unavailable.
- Maintain legible text when mobile browser chrome changes height. Check orientation change, swipes, back navigation, layout reflow and long titles.
- Use static hero, Work and service media states when reduced motion is enabled. Provide a still-first path if media is unavailable or expensive to load.
- Aim for WCAG 2.2 AA across the delivered interface. Use semantic controls, visible focus, labelled fields and appropriate text alternatives and captions. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

See [implementation boundaries](technical-plan.md) for the motion and media technologies and the [QA matrix](qa-and-launch.md#verification-matrix) for acceptance checks.
