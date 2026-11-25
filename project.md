# Jellyfin Web — mbligh patch

## Requirements

Use a pinned Jellyfin Web **v12.4** frontend, with predictable image shapes
across its media library while retaining the existing episode-image option:

- **Next Up:** portrait series Primary poster by default; opt-in episode
  thumbnails retain the original landscape presentation.
- **Continue Watching (video):** portrait series Primary poster for episodes,
  and the movie's own Primary poster for movies. The existing **Use episode
  images in 'Next Up' and 'Continue Watching'** option switches back to
  landscape thumbnails. Audio and books keep their previous rendering.
- **Episodes within a season:** display video thumbnails in 16:9 instead of
  the legacy 3:2 container, requesting 500x281-sized images rather than
  500x500 square crops. If an episode has no image, retain the existing
  fallback to the series/parent Primary image.
- **Season episode metadata:** show the original air date when available,
  omit the estimated playback end time, and cap descriptions at six lines
  on desktop and narrow layouts. Preserve full descriptions on episode pages.
- Keep the rest of Jellyfin Web unchanged and preserve existing settings.

## Implementation

- Base this patch branch (`mbligh-v12.4`) on upstream Jellyfin Web tag
  `v12.4`. Keep upstream `master` untouched.
- `nextUp.ts` and `resume.ts` select portrait cards unless the episode
  image preference is enabled; `resume.ts` applies it only to videos.
- The `preferSeriesPoster` card option picks an episode's `SeriesId`
  and `SeriesPrimaryImageTag` ahead of a season/episode Primary image.
  If it has none, existing fallback behavior is preserved.
- `itemDetails/index.js` opts season rows into `widescreenEpisodeImages`.
  `listview.js` requests 16:9 scaled images for those rows, and
  `listview.scss` sets a responsive 16:9 container (including TV layout).
  Other large list thumbnails remain unchanged.
- Reuse that season-only option to enable `originalAirDate`, disable `endsAt`,
  and mark episode rows for a scoped six-line CSS clamp on both overview variants.
- Node.js 24, npm 11+, `npm ci`, `npm run build:check`, and
  `npm run build:production` are only required to build the frontend.
  There are no Node/npm runtime dependencies.

## Delivery

`mbligh/apt` contains `packages/jellyfin-web/build.sh` and
`.github/workflows/package-jellyfin-web.yml`. The build fetches a **pinned**
commit from this branch, compiles the static frontend in GitHub Actions,
and packages `dist/` as an architecture-independent `jellyfin-web` .deb.
The existing APT workflow stages the package to Cloudflare R2 and signs
the repository index at https://apt.mbligh.org.

When updating the patch, commit here, update the pinned SHA in
`mbligh/apt/packages/jellyfin-web/build.sh`, and trigger the APT package
workflow. Source changes in the fork do not themselves trigger publication.
