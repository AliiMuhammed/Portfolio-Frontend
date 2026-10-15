# Writing configuration and release gates

No live content or hosting change was made for Chunk 12.

Set **REACT_APP_CANONICAL_ORIGIN** to the owner's approved HTTPS root origin, with
no credentials, path, query or fragment. It is public configuration, not a secret.
Use the identical value in CRA's build environment and the Vercel function runtime.
The normal `npm run build` postbuild step also applies this validated origin to
the base HTML's Open Graph URL and bundled `og-image.png` social image. Without a
valid origin those URL/image tags are omitted; no former host or placeholder is
published. Main routes share the base page metadata; Writing and case-study
permalinks retain their dedicated server-generated metadata.
Never derive it from request Host, a preview domain or the visitor's current URL.
Changing this origin requires a frontend rebuild; routine article publication does not.
When absent, the React archive/reader still works but sharing is unavailable, and
server permalinks return 503 rather than inventing a permanent public domain.

Optional **REACT_APP_WRITING_SOCIAL_IMAGE** is an owner-approved absolute HTTPS
image URL on the canonical site or this portfolio's Sanity image CDN. It is only a
fallback when the record lacks a valid social image and cover. With no image, the
handler omits image tags; rich-image preview acceptance remains pending.

Published Writing articles and field notes identify Ali Muhammed as their author
through `author`, `article:author` (the verified LinkedIn profile), and safely
serialized `BlogPosting` JSON-LD. The browser preserves this metadata while the
reader is open and removes it on return to the archive. Work case studies retain
their separate website metadata. Author markup helps identify the writer but does
not guarantee an author label in any social network's preview.

Local tests use https://portfolio.example explicitly; that reserved test address
is not a live domain and is not default production configuration. Do not create an
environment file with an invented production value.

The Node function api/writing-article.js uses public published-only metadata from
project yv2hgb0y / production; no token or write client. vercel.json explicitly
includes build/index.html in the function. CRA must build first, and Vercel must
package the generated file alongside the traced source contract. The handler
preserves the actual hashed /static assets and root-relative public PDF paths.

Rewrites target only the article route and existing known SPA paths. Static/API
files are not caught by a blanket SPA rewrite. Unknown routes retain host 404
behavior. The server does not discriminate between browsers and crawlers.

Successful metadata responses have a 60-second shared-cache lifetime and require
browser revalidation. Errors/404s are not cached. Sanity API reads avoid its CDN for
metadata; the existing frontend CDN and social networks can add propagation delay.
Do not promise immediate social preview refresh.

Before release: independent review; approved backend merge/schema deployment;
authenticated Studio checks; owner-authored real content; canonical origin and
fallback image confirmation; consistent build/runtime configuration; authorized
Vercel Preview and direct-refresh/raw-HTML/static-asset checks; then social preview
inspection and separately authorized production release. No schema deploy,
production write, project linking or deployment is part of local implementation.
