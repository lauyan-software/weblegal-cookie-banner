# WebLegal.ai cookie consent banner

Free GDPR / ePrivacy cookie consent banner, by [WebLegal.ai](https://weblegal.ai/en/cookie-banner/) (Lauyan Software). MIT licensed.

- **Blocks before consent**: third-party trackers (36 services: Google Analytics, Meta Pixel, TikTok, Hotjar/Contentsquare, Clarity…) are intercepted before they load, and their cookies are purged on refusal.
- **Refusing is as easy as accepting**: "Accept all", "Reject all" and "Customize" on the first layer.
- **Google Consent Mode v2** (basic mode: denied by default) and the **Global Privacy Control** signal.
- **30 languages**, detected from the page.
- **Accessibility**: audited against WCAG 2.2 AA (keyboard, focus, contrast, screen readers, RTL, 320 px).
- **Fails closed**: if the interface file never loads, blocking still holds.

## Install

Hosted (recommended, always up to date, served from the EU):

```html
<script src="https://weblegal.ai/js/wl-cookie-consent.js"
        data-privacy-url="/privacy-policy"></script>
```

Put it first in `<head>`, before any tracking tag. Generate a configured snippet at <https://weblegal.ai/en/cookie-banner/>.

Tags written directly in your HTML download before any script can act. Neutralise them and the banner restores them on consent:

```html
<script type="javascript/blocked" data-wl-src="https://www.googletagmanager.com/gtag/js?id=G-XXX"
        data-wl-category="analytics"></script>
```

## Files

| File | Role |
|---|---|
| `wl-cookie-consent.js` | Synchronous core: interception, blocking, Consent Mode, consent cookie, public API. Kept small: it blocks first render. |
| `wl-cc-ui.js` | Interface, loaded asynchronously by the core: banner, preferences panel, reopen button. |
| `wl-cc-translations.json` | Texts in 30 languages. |

Self-hosting is allowed by the licence: serve the three files from the same directory. You then lose automatic updates (new trackers, browser changes).

Optional attributes on the tag: `data-lang`, `data-position`, `data-theme`, `data-color`, `data-services`, `data-expire`, `data-reopen-position`, `data-gpc-notice`, `data-no-branding`.

## JavaScript API

```js
WebLegalConsent.reopen();            // reopen the preferences (also: <a href="#cookie-settings">, class="weblegal-cookie-settings")
WebLegalConsent.getConsent();        // {necessary, analytics, marketing, ts, v} or null
WebLegalConsent.loadFrame(iframe, url); // load ONE embed after a click on your own button
window.addEventListener('wl-cc-consent', e => console.log(e.detail));
```

Blocked embeds (YouTube, Vimeo, Google Maps…) are replaced by a placeholder. Its button loads that embed only: it does not grant the whole category, so ad pixels stay blocked. If your site shows its own "load the video" button, call `loadFrame` from that click, never on page load.

Accepting a placeholder accepts that service (YouTube, Vimeo, Google Maps…) for the whole site: every embed of the same service loads, now and on later pages, while other services and the marketing category stay blocked. Choosing "Reject all" (or saving with marketing off) forgets these services.

## Cookies set by the banner

| Cookie | Lifetime | Purpose |
|---|---|---|
| `wl_cc_consent` | 180 days (`data-expire`) | Stores the visitor's banner choices. |
| `wl_cc_svc` | same as above | Set only when the visitor loads a blocked embed from its placeholder; lists the embed services they accepted. |

Both are strictly necessary (they record a consent choice) and are first-party. List them in your cookie policy.

## About this repository

This is a read-only mirror of the files served at `https://weblegal.ai/js/`, updated on each release. Bug reports are welcome in Issues.

The banner manages consent; it does not make a site compliant on its own. You still need a privacy policy and cookie policy that match the tools you use.

© Lauyan Software. "WebLegal" and its logo are not covered by the MIT licence.
