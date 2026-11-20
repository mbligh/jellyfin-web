# Jellyfin Web — mbligh patch

## Goal

For Jellyfin Web 12.4, make the home page **Next Up** section behave like a series
selector. Since Next Up normally contains one next episode per series, display
the **series Primary poster in a portrait card**, not an episode screenshot in
a landscape card. Keep the existing **Use episode images in 'Next Up' and
'Continue Watching'** preference: enabling it restores landscape episode
artwork in Next Up. Continue Watching and all other screens remain unchanged.

## Implementation

- Base this patch branch (`mbligh-v12.4`) on upstream Jellyfin Web tag `v12.4`.
  Keep the upstream `master` branch untouched.
- `nextUp.ts` selects a portrait card when episode images are disabled and a
  landscape card when enabled.
- New `preferSeriesPoster` card option selects an episode's `SeriesId` and
  `SeriesPrimaryImageTag` ahead of its season or episode Primary artwork.
  If the series has no Primary image, fall back to the existing parent/episode
  image-selection behavior.
- No server patches or JavaScript runtime dependencies are required on hosts.
  The web client is built with Node.js 24, npm 11+, `npm ci`, and
  `npm run build:production`.

## Delivery

The `mbligh/apt` repository contains `packages/jellyfin-web/build.sh` and
`.github/workflows/package-jellyfin-web.yml`. The build fetches a **pinned**
commit of this branch, compiles the frontend in a GitHub Actions runner, and
packages `dist/` as an architecture-independent `jellyfin-web` .deb.
The existing APT workflow stages the immutable package to Cloudflare R2 and
requests a signed repository index update at https://apt.mbligh.org.

When updating the patch: commit it here, update the pinned commit in
`mbligh/apt/packages/jellyfin-web/build.sh`, then trigger the APT package
workflow. Do not use the upstream `master` branch for Jellyfin 12.4 builds.
