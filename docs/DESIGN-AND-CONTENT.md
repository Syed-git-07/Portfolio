## Blank folding sheet and project details

The active portrait cover uses Bencho FoldingBill with Plain material and no texture or lettering. Its original spring simulation is retained, with portrait proportions and a soft resting drape. Dragging at least 85px and releasing removes the sheet. Small movements return it to rest. The separate reveal control supports keyboard use and reduced motion. Mouse and touch drags were exercised locally.

The portrait is rectangular. Project details now open in a centred responsive card with project identity, concise details, technology, external links and next-project navigation. Reference review used the local reference map, Bencho source, Motion Primitives interaction notes, Viewport interaction notes and public reference pages. Earlier sections below describe superseded iterations.

## Current homepage

The homepage is now implemented in HomePage.jsx and homepage.css. It uses a name-led editorial composition, centred portrait, off-white and forest-green palette, and right-aligned navigation. The image cover is plain translucent material over the photo. It lifts after a short mouse hover or explicit click; keyboard and touch use the same reveal button. Reduced motion disables the tilt and entrance transitions. This replaces the previous ticket and printed folding-bill composition.

Rendered reference review included dqnamo.com and fancycomponents.dev. The resulting layout is an original composition; it does not claim pixel-identical reproduction of either site.

## Project stack and portrait revision

The project stack uses the pinned React Bits CardSwap source with local project content. Demo images and icon dependencies were removed. Added indexed selection for the project navigation and range scrubber. Only the front card opens a story on click; a back card moves forward. The original fling physics, hover spread and depth are retained. Source license remains in docs/licenses.

Bencho FoldingBill is now over the hero portrait. A successful drag beyond 42px reveals the portrait on release. Open to reveal provides keyboard and reduced-motion access. Search opens in an animated right panel. The project story uses matching card colours, working links and next-project navigation.

# Current portfolio interactions

Projects use a horizontal file carousel with optional owner-supplied screenshots. Certificate cards open the document on click or upward flick, informed by [Playing Cards](https://www.dqnamo.com/experiments/playing-cards). The archive folder fans certificates on hover or tap. The spiral displays certificate scans without depth blur. The hero retains the portrait and pointer-following eyes.

The contact section follows the [Viewport UI contact study](https://viewportui.com/posts/598-probably-the-best-contact-form-i-ve-ever-made). The writing position follows the active field on lined paper. A successful server response starts the envelope animation. Earlier design notes below describe previous iterations.

# Current direction — customized motion portfolio

The first olive/ivory design was rejected by the user. It is superseded by `Experience.jsx` and `experience.css`: black, white, electric blue; large mask-revealed typography; light animated background; dark spatial project/archive sections; blue letter scene. This is the current implementation. The older study notes below are provenance only, not the current design specification.

## Current reference implementations

- React Bits **Infinite Spiral**: actual `content` JSX/CSS source from pinned snapshot `d01aa914dcbe76da8b2923ebf872b5c8b1066e4c`, under `src/portfolio/reference`. Adapted anchor pointer capture so a click opens the item and a drag suppresses activation; focus pauses autoplay; hidden cards leave the tab sequence. App values: speed .35, radius 185, card 170×115, spacing 63, six cards/turn, center scale 1.15, edge blur 2. Global pause changes it to drag mode. Source license retained under `docs/licenses` (MIT + Commons Clause); this is use inside an end product, not redistribution as a component library.
- Bencho **Folding Bill**: actual MIT TSX/CSS simulation, dynamically loaded in the material-study dialog. Uses Three.js/Verlet cloth constraints, source lighting and spring behavior. Application changes: original Syed pass texture, stiffness slider, settle 60, WebGL failure fallback, lazy opening and unmount cleanup. No Bencho photographs or Pro material. The Three.js chunk loads only when the study is opened. Mouse/touch dragging is the material interaction; keyboard can open/close and adjust stiffness but does not simulate arbitrary cloth grabbing.
- Bencho **Card Stack**: source mechanics read in full relevant geometry sections. Certificate fan is an adaptation of the single-rotation, below-card-pivot geometry: pivot 380px, open angular spacing 14 degrees, closed 3 degrees, selected card lift 35px. Uses real NPTEL page previews, separate selected title and original PDF links, with numbered controls for keyboard/touch. Motion springs stiffness 150/damping 18 are application choices. Does not claim to copy the full original fly-out implementation.
- Bencho **Context Meter**: source dot ownership and selected-band counting adapted to real skill lists. Each lit dot is one listed tool, not a proficiency percentage. Field/bar toggle, hover/focus category selection and rolling numeric reels.
- Viewport **Skeuomorphic Contact Form**: larger blue scene, editable fields with their own clear containers, synchronized letter, pen, fold/insert/flap/seal/depart sequence. Success depends on the Gmail endpoint's accepted result; errors preserve text. Original creator/source links retained below.
- Additional direct interactions: project deck cycles automatically with pointer/focus pause, swipe and previous/next controls; local-only favourite hearts (no fabricated public count); portrait flip; draggable portrait pass; draggable navigation ball with ordinary keyboard/click alternative; journey selector; command search; folder archive; slide-to-open material study with button alternative; global pause and reduced-motion preference.

The user's named components are examples, not a requirement to place every library component on one page. No model of a real user project was supplied; the implemented material viewer is explicitly an interaction study. No generic image comparison is presented as project evidence. Real project before/after screenshots can be added when supplied. Project covers are authored SVG illustrations with distinct compositions, not production screenshots or analytics.

## Current checks

Browser smoke tests cover live interactions at 360, 390, 768 and 1440 pixels, context meter, certificate selection/PDF, modal keyboard behavior, local favourites, journey, search, actual WebGL material drag and stiffness, owner preview, contact draft preservation, reduced motion and overflow. Separate provider tests intercept Supabase and the Gmail HTTP endpoint, verifying owner/non-owner states, updates, upload validation, version conflicts, new pages, failure and successful letter/reset. These are not live provider proof.

Gmail server tests cover origin/method/input rejection, missing settings, limits and provider errors, fixed recipient and awaited SMTP acceptance. Local PostgreSQL tests execute owner/storage RLS, optimistic publishing, 3-per-IP/15-minute and 40-global/day mail limits. Live accounts remain unconfigured.

---

# Earlier design record (superseded)

# Design and content record

## Direction

Muted ivory (#f7f7f2), charcoal (#232720), olive and pale green. Self-hosted Manrope and DM Sans. The portfolio is an editorial site, not an operating-system simulation. Distinct compositions connect each section: a portrait collage, project explorations, interactive toolkit, personal profile and education, certificate folder, and a letter to the owner. There are no invented skill percentages, live production numbers, testimonials or fabricated project screenshots.

## Reference use

Shared library: `D:/Syed/GITHUB_WORK/UI_TEMPLATE/UI_REFERENCES`. Consulted the reuse prompt, project instructions, Viewport interaction ledger, Motion Primitives coverage and source, and React Bits Folder API guide. These guide original project implementations; no restricted code or gallery media was copied.

- [Viewport contact form, @alimdesigner_](https://viewportui.com/posts/598-probably-the-best-contact-form-i-ve-ever-made): synchronized name/email/message, ruled paper, layered envelope, pending state, paper insertion, flap closure, seal and departure. Original source was unavailable; the implementation uses independently chosen CSS timings (1s insert, .5s flap, .3s seal, .7s departure), not claimed recovered source timings. Failure preserves the draft. Accepted service response drives completion.
- [Motion Primitives animated background](https://motion-primitives.com/docs/animated-background): read `components/core/animated-background.tsx` from pinned snapshot `120f64f6ca60348e251f929e9c81f11ccbe45eda`. The project uses the shared-layout moving-highlight pattern with Motion; own filter markup, keyboard semantics and project state. Spring stiffness 380, damping 34 are application choices.
- [React Bits Folder](https://reactbits.dev/components/folder): fold/tab/paper geometry and open/close exploration informed a purpose-built certificate disclosure. This is not a full reproduction of the source's draggable/zoomable folder and does not claim those behaviors. The file list remains native keyboard-operable links.
- [Bencho](https://bencho.dev/): direct pointer-response inspiration for the eye detail. This implementation clamps pupil offsets to ±5px with pointer tracking disabled for reduced motion and touch. No Pro source used.
- [shadcn/ui](https://ui.shadcn.com/): baseline for restrained form fields, focus states, concise labels and disclosure actions. A native HTML dialog provides focus trapping, Escape dismissal and focus restoration; no claim of importing the shadcn component package.

Purposeful motion: viewport reveals, spring filter highlight, layout transitions between filtered project lists, independent hover responses in project art, animated skill panels, folder disclosure, pointer eyes and async contact sequence. No scroll hijacking. Keyboard and touch remain complete without hover. Reduced-motion preference disables extended transforms and CSS sequences.

## Content sources and decisions

1. Existing source apps and public assets, plus the old public portfolio at https://syed-sufyan-portfolio.vercel.app/ (retrieved successfully through HTTP, 17 Nov 2026). Content-only reference.
2. User-provided `24104048_SYED_SUFYAN (1).pdf`: education, CGPA 8.67 through semester 4, skills, achievements and project links. Public derived resume omits the home street address. Phone remains in the user-provided resume; contact on the site uses the requested email.
3. User-provided `SYED SUFYAN- Tutor ward - 2028 -BSP (1).pptx`: updated industry/academic projects and intelligence interests. Salary expectations, competency gaps, student identifier, academic-credit accounting and placement plans were not published. Time-sensitive “ongoing” competition/intership claims were not promoted as current verified facts.

Six initial project records: KR Exports, NEC Fee Portal, RiskGuard AI, Timetable Scheduler, Institute Management System and YouTube UI. Other presentation projects can be added after exact scope, contribution and public links are confirmed. Project cards use illustrative compositions, not fictional data dashboards. Public case studies use only the supplied descriptions and links; deployment effectiveness is not independently certified.

## Editable boundary

Content and assets are editable; layout and theme remain application code as requested. Additional pages use plain text (no injected HTML), optional image and a generated stable hash route. Public URL fields are restricted to local paths or HTTPS, plus mailto for links. Database ownership uses an administrator-enrolled UUID. A hidden route is navigation convenience, not the security boundary.

## Checks performed

- Build and package audit.
- Browser desktop and mobile interactions, dialog focus and Escape, filters, project expansion, keyboard tabs, certificate HTTP responses, contact draft retention, and editor preview.
- Local PostgreSQL execution of actual schema against simulated Supabase identity/storage tables.
- Intercepted provider browser scenarios are recorded separately; do not label them live service proof.

No service credentials, owner account or actual form destination have been provisioned. No public deployment, commit or push was performed.
