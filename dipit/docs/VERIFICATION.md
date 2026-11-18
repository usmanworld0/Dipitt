# Startup performance update — 19 November 2026

The carousel now mounts while the intro is still covering it. All five packs, including offscreen packs, have their shaders compiled and textures/buffers uploaded before reveal. GPU completion and three rendered frames gate the handoff; unsupported or stalled graphics use the existing model-render fallback.

A fresh Edge session with 4x CPU throttling reproduced a 1,917 ms maximum frame gap after reveal before this change. With warmup, the maximum visible gap was 33 ms, with zero visible main-thread long tasks in the first 2.5 seconds. The fully prepared scene was ready before reveal. These are local controlled measurements, not a guarantee of frame rate on every device.

Production build and TypeScript pass. Cold startup and immediate carousel navigation pass. All three WebGL-disabled fallback/404 checks pass. Reports: `docs/qa/startup-before.json` and `docs/qa/startup-after.json`. Reproduce with `npm.cmd run test:startup` and a running server; override its address with `DIPITT_TEST_URL`.

---

# DIPITT 3D verification

Verified locally on 16 November 2026 with Microsoft Edge through Playwright against the production build at port 3001.

- Production build and TypeScript checks pass, including prerendering all product routes.
- All 27 pack options have matching transparent model renders generated from the same meshes and label textures as the interactive website.
- The focused 3D browser suite passes 16 checks: physical width from the side; different front/back label artwork; standard, small, squeeze and pouch shapes; all thumbnail files; carousel readiness and navigation; visible arrow, keyboard and mobile drag rotation; pack selection and prices; bag contents and totals; and mobile layout.
- No production browser runtime or shader errors were recorded. See `docs/qa/3d-results.json`.
- WebGL-disabled fallback and branded 404 checks are covered by `scripts/verify-fallback.mjs` and `docs/qa/fallback-results.json`.

The earlier catalogue baseline passed 80 interaction/responsive checks and all 22 product pages with 27 pack options. Current 3D checks specifically verify the restored model presentation and its connection to pack selection and the bag.

Screenshots include desktop and mobile carousels, mobile product detail, front/side/back model views, all distinct pack shapes and a contact sheet in `docs/qa/`. The official front and back photos remain the source artwork; 3D shapes are reconstructed for presentation. Original readable label links and listed PKR prices are retained. No payment or order service is connected.

Run `npm.cmd run test:3d` with a running local server. Set `DIPITT_TEST_URL` to test another address. Recreate model thumbnails with `npm.cmd run assets:render`.
