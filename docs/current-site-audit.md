# Current Diskoshaman TV website audit

Reviewed the public page content for the redesign on 20 November 2026. The home page and some secondary pages came from crawls taken at different times. Direct browser attempts returned a verification screen, so the evidence below covers public content and link structure. Capture rendered layouts, interaction recordings and performance measurements when a browser baseline is available.

## Migration inventory, 26 November 2026

- The live sitemap and public HTML confirmed all ten page routes. The Home library and Our Work page contained 31 unique Vimeo films after deduplication. Vimeo oEmbed returned metadata for all 31. The preview uses local optimised covers and the original watch URLs. [Home library](https://diskoshaman.tv/), [Work](https://diskoshaman.tv/our-work/), [page sitemap](https://diskoshaman.tv/page-sitemap.xml)
- Both booking embeds on Contact point to the same 30-minute Calendly event. Contact uses an email booking action until the verified 20-minute event URL is supplied. [Contact](https://diskoshaman.tv/contact-us/)
- The Home survey uses four multiple-choice questions, a business and audience description, website URL, name, email and phone number. Newsletter uses an email field. Both are Elementor forms. Their destinations and confirmation settings require access to the live form configuration. [Home survey and newsletter](https://diskoshaman.tv/)
- The preview uses the original About portrait and published producer biography. [About](https://diskoshaman.tv/about-us/)

## Findings and redesign opportunities

| Page or reference | Public evidence | Proposed improvement to verify in the redesign |
| --- | --- | --- |
| Home | The page positions the studio around Perth video production. A multi-question survey precedes the portfolio in the extracted content. The portfolio includes corporate, brand, creator and long-form work. [Current homepage](https://diskoshaman.tv/) | Keep the existing showreel and survey. Make the broader media production offer, both contact paths and selected work easy to find. |
| Work | The Work page snapshot exposes a heading and little project detail. The homepage contains a larger collection with project names and categories. [Work page](https://diskoshaman.tv/our-work/), [homepage portfolio](https://diskoshaman.tv/) | Make approved films discoverable through readable titles, context and posters. Verify the intended project and playback paths on mobile and desktop. |
| Services | The page lists corporate, commercial, promotional, brand, social and other production services, with limited individual descriptions in the public extract. [Services page](https://diskoshaman.tv/video-production-services/) | Keep the existing service content and present a short video and an animated treatment for review. Apply the selected treatment with relevant media for each service. |
| About | The public page includes a long studio introduction and producer information. [About page](https://diskoshaman.tv/about-us/) | Lead with a concise studio story, an understandable production process and approved people or behind-the-scenes imagery when available. |
| Contact | The contact page shows both 20-minute and 30-minute consultation labels along with an enquiry form. [Contact page](https://diskoshaman.tv/contact-us/) | The client confirmed a 20-minute Calendly call and an enquiry form. Verify the exact booking event URL and test enquiry delivery. |
| Proof | The homepage includes audience figures, counters, 16 brand logos and testimonials. Some counters appear as zero in the public text. [Current homepage](https://diskoshaman.tv/) | The Home brand reel and its full logo list retain all 16 published marks. Publish verified figures and approved testimonials with clear context. |
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
