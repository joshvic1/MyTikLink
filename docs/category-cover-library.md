# Category cover storage

The canonical destination is the existing backend R2 bucket (`R2_BUCKET`), currently `mytiklink-images`. Credentials stay in the backend environment. Do not copy secrets into frontend code, manifests, progress records, or chat.

Operational scripts and audit records are in `C:/Users/pc/Documents/mytilink/category-image-work`. Run `node migrate-r2.cjs` from that directory to upload pending generated category sources. It decodes each source, creates four 2:1 widths (400, 800, 1200, 1600) in AVIF and WebP in memory, and verifies object length and SHA-256 metadata. Existing matching uploads are reused. The script does not create new local derivative images or backup copies. Keys are `category-covers/<category-key>/<content-revision>/<width>.<format>` with one-year immutable cache headers.

Run `node finalize-r2.cjs` after a successful upload pass. It preserves legacy revisions, verifies bucket objects and representative public downloads, writes a cloud inventory, and changes the application manifest to Cloudflare URLs. Only journals marked reviewed become default covers. Uploading is separate from visual approval.

Run `node cleanup-cloud-copies.cjs` only after finalization and application verification. It verifies the cloud copies again before deleting tracked local sources, duplicate category archives, local delivery variants, and generated review sheets. It keeps small manifests, scripts, and audit records. It deliberately does not delete untracked generated images or other application media.

The image generator initially produces a local file; treat that file as temporary staging. Upload, verify, then remove it promptly instead of accumulating hundreds of raw images. Future generation should work in small batches with this lifecycle. Never send raw PNG originals to browsers.

Compression preserves a quality floor (AVIF 43, WebP 68), rather than forcing visually damaging byte caps. Targets are 18/45/90/140 KB AVIF and 25/70/140/220 KB WebP. Original sources are not retained locally after verified migration; the largest cloud derivative is 1600 x 800.

The frontend resolves new and saved legacy category cover URLs against the cloud base. A Next.js redirect preserves old `/category-covers/...` links after a server restart/redeployment. Owner-uploaded images retain precedence. No live page records or database content are modified by migration.
