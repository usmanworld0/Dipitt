# Agrumea → DIPT reference analysis

Inspected 16 November 2026, before implementation. Reference: https://www.agrumeafarm.it/en. Rendered desktop and mobile inspection used Playwright with installed Microsoft Edge. Screenshots and the reproducible capture script are in `docs/reference/` and `scripts/reference.mjs`. Reference files are research material only; none are served as DIPT assets.

## Observed visual system

- Exact CSS palette: ivory `#fdf3eb`, burgundy `#762530`, orange `#e94e1b`, secondary yellow `#f39200`.
- Typography: licensed IvyMode display serif and IvyStyle Sans. DIPT substitutes independently downloaded, open-license Bodoni Moda and DM Sans.
- Header: 30px desktop inset, two small circular language controls, centered stacked logo, 90×37px outlined menu pill and 37px orange disc with a cream diamond. Mobile hides the separate disc and reduces the brand.
- Homepage: one 100svh composition, no conventional page scroll. Playwright wheel verification returned `scrollY: 0`, body 900px and viewport 900px. Wheel input changes jar positions. Large products float through an angled, curved band; peripheral objects scale down, soften and crop at screen edges.
- Background: large burgundy polygonal rounded mound starts around the vertical midpoint, bleeds below the viewport, and carries oversized rotating orange circular lettering. Ivory negative space remains above the products. Only a small discover prompt sits at bottom center. No conventional marketing hero heading or ecommerce cards.
- Product presentation: photographed jar bases with separately canvas-rendered wrap labels; selected jar is front and largest. DIPT will use original lathed 3D bottle geometry, cylindrical label textures, sauce materials, ribbed caps, glass highlights and studio lighting.

## Motion and navigation

- Intro: cream screen, orange brand mark, large falling organic shapes and percentage; orange sweep reveals page. Source timing specifies 1.8s page transition, .9s cover, 975ms lift; `.645,.045,.355,1` and `.16,1,.3,1` easing.
- Full-screen menu: orange sheet descends; four huge uppercase serif primary rows align progressively from left to right, separated by thin burgundy rules. Active item is cream with a diamond; About, Contacts, Shop appear as smaller secondary links at the bottom. Glyphs reveal individually and roll on hover.
- Cursor: small white discovery pill follows pointer near products, orange text and diamond. Drag cursor changes from grab to grabbing.
- Internal navigation uses full-screen burgundy cover, then lift. Product image continuity is a defining part of the transition.
- Reduced-motion support exists in the source and must remain in DIPT.

## Page-by-page inspection

- Pantry `/en/dispensa`: oversized title, expansive space, rounded wide food image; scrolling expands photograph to immersive full-width scene with white headline. Followed by category sections (jams, creams, savoury, mono packs), editorial copy, sizes and product rows. Sticky category controls and large burgundy footer.
- Production `/en/produzione`: title and image opening, then oversized statement, copy, ingredient group sections, image galleries and tabular product detail. Adapt to peppers, garlic, smoke and slow cooking.
- About `/en/chi-siamo`: large editorial title, full-width farm imagery with centered white statement, long-form story and vision, photography and burgundy footer. DIPT copy expresses a brand concept; do not invent founding dates or certifications.
- Experience `/en/experience`: image-led statement, discover heading, category labels, stacked numbered experience sections with durations, descriptions and inclusions. Adapt to tasting, pairings and sauce workshops without claiming a real booking service.
- Contact `/en/contatti`: oversized title; asymmetrical message, office/social details, large email link and animated organic elements. DIPT contact interaction must explain its local/demo delivery state.
- Product `/en/dispensa/smeraldo`: oversized product title, central large product, category/origin, editorial description and ingredients, usage tips, available weights, shelf life and adjacent-product navigation. Original shop navigation leads externally to Riblo; DIPT will provide an integrated local shopping bag, quantity/size controls and explicit demo checkout state.
- Footer: near-full-screen burgundy field, oversized brand, several narrow information/navigation columns, orange labels and email, fine divider and legal row.

## DIPT implementation and verification targets

1. Prioritize the fixed homepage and continuously inertial wheel/drag/touch carousel, with keyboard and visible arrow alternatives.
2. Preserve color, negative space, angled product flow, circular typography, orange menu and long image-led page rhythm.
3. Five original bottle variants: Original Hot, Garlic Mayo, Smoky BBQ, Chipotle, Signature Chilli. Label fronts, side ingredient text, back typography and barcode wrap around geometry.
4. Use one WebGL canvas for the homepage, adaptive DPR, reusable geometries, locally generated textures and no remote HDR/environment dependency. Provide product imagery fallback if WebGL is unavailable.
5. Real Next.js routes for all editorial pages and each product; persistent browser-local bag. No payment processor or message delivery was supplied, so those outcomes must be clearly identified in their UI.
6. Capture and inspect DIPT at 1440×900, 1920×1080, 768×1024 and 390×844; test wheel, drag, touch, menu, routes, product controls and bag persistence.

## Assets

Reference logos, jars, photography, artwork and licensed fonts are not copied into the runtime. DIPT photographs are original built-in imagegen outputs; geometry and label designs are original code-native assets. Prompts and asset provenance are recorded separately in `ASSETS.md`.
