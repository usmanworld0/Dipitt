# DIPITT — Sauce collection

An Agrumea-inspired DIPITT website in Next.js. The cream and burgundy design features a curved, inertial carousel with real 3D bottles and wrapped DIPITT labels, editorial pages, a filterable shop and a persistent local bag.

## Run

Use `npm.cmd run dev` on Windows, then open http://localhost:3000.

- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
- `npm.cmd run test:fallback`

Browser checks use installed Microsoft Edge through Playwright. Set `DIPITT_TEST_URL` to test a different running server. Screenshots and results are in `docs/qa/`.

## Catalogue and images

The collection contains 22 sauce families and 27 packs, sourced from https://www.dipitt.com/collections/sauces on 16 November 2026. Official logos and front/back pack images are optimized and served locally from `public/assets/dipitt/`. Source URLs are recorded in `docs/dipitt-image-sources.json`. Reimport with `node scripts/import-dipitt.mjs`.

`data/dipitt-catalogue.json` stores listed pack sizes, PKR prices, availability and source links. `data/products.ts` adds display copy and suggested pairings. Prices are a snapshot; live availability and purchasing are on the linked DIPITT product pages. The 3D packaging is reconstructed from the photos, with the original front/back artwork reprojected onto curved label meshes. Standard glass bottles, 60ml bottles, the Sriracha squeeze bottle and 400g pouches have their own shapes.

The homepage retains wheel, drag, touch and keyboard navigation in a WebGL carousel, with hover spin and 3D render fallbacks. Product pages offer full 360-degree drag, arrow-button and keyboard rotation, readable original back labels and actual pack options. The bag calculates each selected pack's listed price and persists under `dipitt-bag`.

Use `npm.cmd run assets:render` to regenerate all 27 matching model thumbnails from `/studio`. Use `npm.cmd run test:3d` to check side-on volume, front/back artwork, model shapes, rotation, pack selection and the shopping bag.

## Scope

The bag and contact preview are local demonstrations; no orders, payments or messages are transmitted. Each product links to the official DIPITT store. Original generated food photography remains on editorial pages; the product photos and wordmarks are official DIPITT assets. See `docs/ASSETS.md` for provenance. Agrumea reference research is retained under `docs/reference/` and `reference.html` and is not served as site content.
