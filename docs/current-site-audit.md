# Current Diskoshaman TV website audit

Reviewed the public page content for the redesign on 20 November 2026. The home page and some secondary pages came from crawls taken at different times. Direct browser attempts returned a verification screen, so the evidence below covers public content and link structure. Capture rendered layouts, interaction recordings and performance measurements when a browser baseline is available.

## Findings and redesign opportunities

| Page or reference | Public evidence | Proposed improvement to verify in the redesign |
| --- | --- | --- |
| Home | The page positions the studio around Perth video production. A multi-question survey precedes the portfolio in the extracted content. The portfolio includes corporate, brand, creator and long-form work. [Current homepage](https://diskoshaman.tv/) | Keep the existing showreel and survey. Make the broader media production offer, both contact paths and selected work easy to find. |
| Work | The Work page snapshot exposes a heading and little project detail. The homepage contains a larger collection with project names and categories. [Work page](https://diskoshaman.tv/our-work/), [homepage portfolio](https://diskoshaman.tv/) | Make approved films discoverable through readable titles, context and posters. Verify the intended project and playback paths on mobile and desktop. |
| Services | The page lists corporate, commercial, promotional, brand, social and other production services, with limited individual descriptions in the public extract. [Services page](https://diskoshaman.tv/video-production-services/) | Keep the existing service content and present a short video and an animated treatment for review. Apply the selected treatment with relevant media for each service. |
| About | The public page includes a long studio introduction and producer information. [About page](https://diskoshaman.tv/about-us/) | Lead with a concise studio story, an understandable production process and approved people or behind-the-scenes imagery when available. |
| Contact | The contact page shows both 20-minute and 30-minute consultation labels along with an enquiry form. [Contact page](https://diskoshaman.tv/contact-us/) | The client confirmed a 20-minute Calendly call and an enquiry form. Verify the exact booking event URL and test enquiry delivery. |
| Proof | The homepage includes audience figures, counters, client logos and testimonials. Some counters appear as zero in the public text. [Current homepage](https://diskoshaman.tv/) | Publish approved figures and testimonials with clear context. Present the final figures in readable HTML so they also work with reduced motion. |
| Focus TV reference | The site gives named film projects their own editorial sections with posters, story context and film links. [Focus TV](https://focustv.tv/) | Use project-by-project storytelling as a reference and build an original visual system around Diskoshaman's work and visitor goals. |

## Known legacy paths

The live WordPress sitemap lists ten pages. The five individual service pages returned HTTP 200 on 24 November 2026. Preserve their current paths and review the original content during migration. Compare the final release with Search Console data and any additional routes from the site export before cutover. [Live sitemap index](https://diskoshaman.tv/sitemap_index.xml), [page sitemap](https://diskoshaman.tv/page-sitemap.xml)

| Existing path | Relevant content |
| --- | --- |
| `/` | Main introduction, portfolio, survey and contact |
| `/our-work/` | Portfolio entry |
| `/video-production-services/` | Production services |
| `/business-video-production-perth/` | Training, safety, onboarding and explainers |
| `/photography-perth/` | Commercial photos, products and headshots |
| `/social-media-reels-perth/` | Short-form social video |
| `/brand-film-production-perth/` | Documentary-style brand films |
| `/corporate-video-production-perth/` | Company profiles, recruitment and corporate communications |
| `/about-us/` | Studio and producer |
| `/contact-us/` | Consultation and contact form |

The post sitemap lists `/hello-world/`, verified as the WordPress sample post. The starter omits it from the sitemap and returns 404. [Live post sitemap](https://diskoshaman.tv/post-sitemap.xml)

## Before-and-after review

Use the same viewport and network settings where a live comparison is possible. Capture the home opening, the route to a selected film, a service section and the final contact action. Show the project path and key motion moment in the prototype on desktop and a phone. Record where the live baseline is unavailable and demonstrate those journeys directly on the preview. The [QA and launch plan](qa-and-launch.md) defines the browser and performance checks.
