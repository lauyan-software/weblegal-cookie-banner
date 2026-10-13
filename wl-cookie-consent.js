/**
 * WebLegal Cookie Consent — Free GDPR cookie banner
 * https://weblegal.ai
 *
 * Usage — SANS defer ni async, et AVANT toute balise de tracking dans le <head> :
 *   <script src="https://weblegal.ai/js/wl-cookie-consent.js"></script>
 *
 *   Le Consent Mode par defaut (plus bas) doit s'executer avant que gtag.js ne
 *   parte. Un `defer` ici, ou un chargement par document.createElement, le fait
 *   arriver apres le `gtag('config')` du site et laisse passer les traceurs.
 *
 * Configuration via data attributes:
 *   data-position="popup|bottom|modal"  (default: popup)
 *   data-theme="light|dark|auto"        (default: auto)
 *   data-color="#10b981"                 (accent color, default: WebLegal green)
 *   data-lang="fr"                      (force language, default: auto-detect from <html lang>)
 *   data-privacy-url="/privacy"          (link for "Learn more")
 *   data-expire="180"                    (consent cookie expiry in days, default: 180)
 *   data-no-branding="false"             (hide "Powered by WebLegal.ai", default: false)
 *   data-reopen-position="bottom-left"   (reopen button position: bottom-left|bottom-right|hidden, default: bottom-left)
 *   data-reopen-scroll="hide"            (reopen button fades out while scrolling down, back on scroll up / top / keyboard focus;
 *                                         "keep" = always visible; default: hide)
 *   data-gpc-notice="off"                (hide the "GPC signal processed" notice shown to GPC users; default: shown, CCPA §7025)
 *
 * Auto-handling: 35 third-party services (Google Analytics, GTM, Meta Pixel,
 * Hotjar, Clarity, TikTok, LinkedIn, YouTube, Vimeo, Maps, Intercom, Crisp,
 * etc.) are managed automatically — blocked until consent, allowed after.
 * No configuration needed.
 *
 * Reopen the banner after consent:
 *   • Floating cookie button (bottom-left by default)
 *   • Any element with class="weblegal-cookie-settings" or href="#cookie-settings"
 *   • JS API: window.WebLegalConsent.reopen()
 *
 * Events:
 *   window.addEventListener('wl-cc-consent', (e) => { console.log(e.detail); })
 *
 * Google Consent Mode v2:
 *   Automatically sends gtag('consent', 'update', {...}) if gtag is available.
 *
 * Documentation, configurateur et code d'integration :
 *   https://weblegal.ai/en/cookie-banner/
 *
 * Servi NON MINIFIE deliberement : un integrateur, un DPO ou une autorite doit
 * pouvoir lire ce que le bandeau fait.
 */
(function() {
  'use strict';

  // Prevent double init
  if (window.__wlCookieConsent) return;
  window.__wlCookieConsent = true;

  // #388 — RELEVE A L'ANALYSE, PAS A L'INIT. `document.readyState` et
  // `document.currentScript` ne disent la verite qu'au moment ou ce fichier est
  // execute. Lus depuis init(), qui tourne au plus tot sur DOMContentLoaded,
  // readyState n'est JAMAIS 'loading' et currentScript est nul : le diagnostic
  // accusait alors toutes les integrations, y compris les bonnes. Constate sur
  // la page temoin test-ccb-integration.html, qui existe pour ça.
  var __wlEtatAuChargement = document.readyState;
  var __wlBalise = document.currentScript || null;
  var __wlTraceursAvant = (function () {
    try {
      var n = 0, l = document.querySelectorAll('script[src]');
      for (var i = 0; i < l.length; i++) {
        if (l[i] === __wlBalise) break;
        n++;
      }
      return { total: n, liste: Array.prototype.slice.call(l, 0, n).map(function (e) { return e.src; }) };
    } catch (e) { return { total: 0, liste: [] }; }
  })();

  // Bot bypass (#174): silent full-accept for crawlers → SEO preservation.
  // Liste explicite, jamais la sous-chaine `bot` (elle attrape aussi la marque de
  // telephones CUBOT). Un robot inconnu voit le bandeau : on echoue en DEMANDANT,
  // pas en supposant.
  var __wlUA = navigator.userAgent || '';
  // Les navigateurs integres de certaines applis portent la marque dans l'UA d'un
  // humain (`… Mobile Safari/537.36 Pinterest/11.32`, `YandexSearch/…`), alors que
  // les robots l'ouvrent (`Pinterest/0.2 (+…/bot.html)`, `WhatsApp/2.19.81 A`).
  // D'ou l'ancre `^` : elle garde le robot et rend l'humain a son bandeau.
  var __wlBot = /^(whatsapp|pinterest)\//i.test(__wlUA)
    || /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex(bot|images|mobile|news|market)|sogou (web|news|inst) spider|exabot|petalbot|applebot|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|skypeuripreview|redditbot|pinterestbot|embedly|quora link preview|showyoubot|outbrain|vkshare|w3c_validator|ahrefsbot|semrushbot|mj12bot|dotbot|screaming frog|rogerbot|sitebulb|googleweblight|google-inspectiontool|chrome-lighthouse|lighthouse|pagespeed|gtmetrix|pingdom|headlesschrome|phantomjs|adsbot-google|mediapartners-google|storebot-google/i.test(__wlUA);
  var __wlDef = __wlBot ? 'granted' : 'denied';

  // ── Google Consent Mode v2 — MUST run before any gtag/GA script loads ──
  // We create dataLayer + gtag ourselves if absent so that subsequent
  // gtag('config', ...) calls (from the host site) inherit the denied default.
  // This is why the CCB script MUST be loaded synchronously (no defer) and
  // placed BEFORE any tracking script in the <head>.
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() { window.dataLayer.push(arguments); };
  }
  window.gtag('consent', 'default', {
    ad_storage: __wlDef,
    ad_user_data: __wlDef,
    ad_personalization: __wlDef,
    analytics_storage: __wlDef,
    functionality_storage: __wlDef,
    personalization_storage: __wlDef,
    security_storage: 'granted',
    wait_for_update: __wlBot ? 0 : 500
    // Pas de `region` : le champ prend des codes ISO 3166-2 ('FR', 'US-CA') et
    // « EEA » n'en est pas un. Le defaut denied s'applique partout, deliberement,
    // comme le blocage des scripts.
    // https://developers.google.com/tag-platform/security/guides/consent
  });

  if (__wlBot) return;

  // ── Config from script tag ──
  // Note: any legacy data-services attribute is safely ignored (no-op).
  var script = document.currentScript || document.querySelector('script[src*="wl-cookie-consent"]');
  // data-color hardening: integrators sometimes inject "[object Object]" or
  // a hex without '#'. Fall back to default if invalid. (#263)
  function sanitizeHex(c) {
    c = (typeof c === 'string' ? c.trim() : '').replace(/^([0-9a-fA-F])/, '#$1');
    return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(c) ? c : '#10b981';
  }
  // data-position hardening: PageXL etc. send intuitive synonyms like "banner".
  // Map them to the 3 supported layouts; fall back to popup. (#263)
  function sanitizePosition(p) {
    p = (typeof p === 'string' ? p.trim().toLowerCase() : '');
    if (p === 'banner' || p === 'bar' || p === 'inline') return 'bottom';
    return (p === 'popup' || p === 'bottom' || p === 'modal') ? p : 'popup';
  }
  var cfg = {
    position: sanitizePosition(script && script.dataset.position),
    theme: (script && script.dataset.theme) || 'auto',
    color: sanitizeHex(script && script.dataset.color),
    lang: (script && script.dataset.lang) || '',
    privacyUrl: (script && script.dataset.privacyUrl) || '',
    expire: parseInt((script && script.dataset.expire) || '180', 10),
    noBranding: (script && script.dataset.noBranding) === 'true',
    reopenPosition: (script && script.dataset.reopenPosition) || 'bottom-left',
    reopenScroll: ((script && script.dataset.reopenScroll) || 'hide').toLowerCase() === 'keep' ? 'keep' : 'hide',
    gpcNotice: ['off', 'false'].indexOf(((script && script.dataset.gpcNotice) || '').toLowerCase()) === -1, // #331: GPC-processed notice on unless data-gpc-notice="off"|"false" (case-insensitive)
  };

  // ── Auto-blocking engine — intercept tracker scripts before they load ──
  // Categories per CNIL/EDPB: Necessary / Analytics / Marketing. Embeds +
  // chat widgets classed Marketing (profilage + transfert tiers US).
  // Mirrors src/config/cookie-services.json — verified by test-ccb-sot-sync.mjs (#147).
  // Motifs ancres (#386) — grammaire et regles d'ecriture dans la cle `doc` de
  // cookie-services.json. ORDRE PORTEUR DE SENS : analytics est itere AVANT
  // marketing, donc gtag/js?id=G- (GA4 direct) prime sur googletagmanager ;
  // /gtm.js et les gtag AW-/DC- tombent en marketing. Ne pas reordonner.
  var TRACKER_DOMAINS = {
    analytics: [
      /[.\/]google-analytics\.com(?![\w-])/i, /[.\/]analytics\.google\.com(?![\w-])/i, /[\/]gtag\/js\?id=G-/i,
      /[.\/]hotjar\.com(?![\w-])/i, /[.\/]static\.hotjar\./i,
      // Hotjar est devenu Contentsquare (2024) : les nouveaux comptes chargent
      // t.contentsquare.net/uxa/… et collectent sur *.contentsquare.net (#429).
      /[.\/]contentsquare\.net(?![\w-])/i,
      /[.\/]clarity\.ms(?![\w-])/i,
      /[.\/]matomo\./i, /[.\/]piwik\./i,
      /[.\/]plausible\.io(?![\w-])/i,
      /[.\/]mixpanel\.com(?![\w-])/i, /[.\/]mxpnl\.com(?![\w-])/i,
      /[.\/]segment\.com(?![\w-])/i, /[.\/]cdn\.segment\./i,
      /[.\/]amplitude\.com(?![\w-])/i, /[.\/]api\.amplitude\./i,
      /[.\/]heap\.io(?![\w-])/i, /[.\/]heapanalytics\.com(?![\w-])/i,
      /[.\/]fullstory\.com(?![\w-])/i, /[.\/]edge\.fullstory\.com(?![\w-])/i, /[\/]s\/fs\.js(?![\w-])/i,
      /[.\/]logrocket\.(com|io)(?![\w-])/i, /[.\/](lr|logr|lrkt|lgrckt)-(in|ingest|intake|in-prod)\.(com|io)(?![\w-])/i, /[.\/](ingest|intake)-lr\.com(?![\w-])/i,
      /[.\/]pendo\.io(?![\w-])/i, /[.\/]data\.pendo\.io(?![\w-])/i, /[.\/]cdn\.pendo\.io(?![\w-])/i,
      /[.\/]smartlook\.com(?![\w-])/i, /[.\/]rec\.smartlook\.com(?![\w-])/i,
    ],
    marketing: [
      /[.\/]googletagmanager\.com(?![\w-])/i,
      /[.\/]connect\.facebook\.net(?![\w-])/i, /[.\/]facebook\.com\/tr(?![\w-])/i, /[\/]fbevents\.js(?![\w-])/i,
      /[.\/]analytics([.-][a-z0-9]{1,10})?\.tiktok\.com(?![\w-])/i,
      /[.\/]doubleclick\.net(?![\w-])/i, /[.\/]googlesyndication\.com(?![\w-])/i, /[.\/]googleadservices\.com(?![\w-])/i,
      /[.\/]adservice\.google\./i, /[\/]pagead(?![\w-])/i,
      /[.\/]snap\.licdn\.com(?![\w-])/i, /[.\/]ads\.linkedin\.com(?![\w-])/i,
      /[.\/]s\.pinimg\.com\/ct(?![\w-])/i, /[.\/]ct\.pinterest\.com(?![\w-])/i,
      /[.\/]ads\.twitter\.com(?![\w-])/i, /[.\/]static\.ads-twitter\.com(?![\w-])/i, /[.\/]analytics\.twitter\.com(?![\w-])/i,
      /[.\/]youtube\.com(?![\w-])/i, /[.\/]youtube-nocookie\.com(?![\w-])/i, /[.\/]ytimg\.com(?![\w-])/i,
      /[.\/]player\.vimeo\.com(?![\w-])/i, /[.\/]vimeo\.com\/video(?![\w-])/i,
      /[.\/]maps\.google\./i, /[.\/]google\.com\/maps(?![\w-])/i, /[.\/]maps\.googleapis\.com(?![\w-])/i,
      /[.\/]intercom\.io(?![\w-])/i, /[.\/]widget\.intercom\./i, /[.\/]intercomcdn\.com(?![\w-])/i,
      /[.\/]crisp\.chat(?![\w-])/i, /[.\/]client\.crisp\./i,
      /[.\/]tawk\.to(?![\w-])/i, /[.\/]embed\.tawk\./i,
      /[.\/]assets\.zendesk\.com(?![\w-])/i, /[.\/]zdassets\.com(?![\w-])/i, /[.\/]zopim\.com(?![\w-])/i,
      /[.\/]sc-static\.net(?![\w-])/i, /[.\/]tr\.snapchat\.com(?![\w-])/i,
      /[.\/]redditstatic\.com\/ads(?![\w-])/i, /[.\/]alb\.reddit\.com(?![\w-])/i, /[.\/]events\.redditmedia\.com(?![\w-])/i,
      /[.\/]a\.quora\.com(?![\w-])/i, /[.\/]q\.quora\.com(?![\w-])/i,
      /[.\/]outbrain\.com(?![\w-])/i, /[.\/]widgets\.outbrain\.com(?![\w-])/i,
      /[.\/]taboola\.com(?![\w-])/i, /[.\/]cdn\.taboola\.com(?![\w-])/i, /[.\/]trc\.taboola\.com(?![\w-])/i,
      /[.\/]drift\.com(?![\w-])/i, /[.\/]driftt\.com(?![\w-])/i, /[.\/]js\.driftt\.com(?![\w-])/i,
      /[.\/]olark\.com(?![\w-])/i, /[.\/]static\.olark\.com(?![\w-])/i,
      /[.\/]munchkin\.marketo\.net(?![\w-])/i, /[.\/]marketo\.com\/mt(?![\w-])/i,
    ],
  };

  var blockedResources = []; // scripts + iframes waiting for consent

  function getCategory(url) {
    if (!url) return null;
    for (var cat in TRACKER_DOMAINS) {
      for (var i = 0; i < TRACKER_DOMAINS[cat].length; i++) {
        if (TRACKER_DOMAINS[cat][i].test(url)) return cat;
      }
    }
    return null;
  }

  function unblockCategory(category) {
    blockedResources = blockedResources.filter(function(item) {
      if (item.category !== category) return true;
      if (item.type === 'iframe' && item.placeholder) {
        // Replace consent wall with the real iframe
        var iframe = _createElement('iframe');
        iframe.src = item.src;
        iframe.__wlAllowed = true;
        // Copy dimensions + class from placeholder so wrappers keep working (#169)
        iframe.width = item.placeholder.dataset.origWidth || '';
        iframe.height = item.placeholder.dataset.origHeight || '';
        iframe.style.cssText = item.placeholder.dataset.origStyle || '';
        if (item.placeholder.dataset.origClass) iframe.className = item.placeholder.dataset.origClass;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        item.placeholder.replaceWith(iframe);
      } else {
        // Re-create and inject the script
        var s = _createElement('script');
        s.src = item.src;
        if (item.async) s.async = true;
        s.__wlAllowed = true;
        // #398 — une balise ADOPTEE (pre-neutralisee par l'integrateur) reprend
        // SA place dans le document. Ses attributs sont recopies : certains
        // traceurs lisent leur propre balise pour se configurer, et un
        // appendChild en fin de <head> leur ferait perdre a la fois ces
        // attributs et leur position dans l'ordre d'execution.
        if (item.element && item.element.parentNode) {
          for (var a = 0; a < item.element.attributes.length; a++) {
            var at = item.element.attributes[a];
            if (at.name === 'type' || at.name === 'src'
                || at.name === 'data-wl-src' || at.name === 'data-wl-category') continue;
            try { s.setAttribute(at.name, at.value); } catch (e) {}
          }
          item.element.replaceWith(s);
        } else {
          document.head.appendChild(s);
        }
      }
      return false;
    });
  }

  // Embed service identification (#155) — iframe-embeddable services only.
  var EMBED_SERVICES = {
    youtube:    [/youtube\.com/i, /youtube-nocookie\.com/i, /ytimg\.com/i],
    vimeo:      [/player\.vimeo\.com/i, /vimeo\.com\/video/i],
    gmaps:      [/maps\.google\./i, /google\.com\/maps/i, /maps\.googleapis\.com/i],
    twitter:    [/platform\.twitter\.com/i, /twitter\.com\/i\/embed/i, /x\.com\/.*\/status/i],
    instagram:  [/instagram\.com\/(p|reel)\//i, /embed\.instagram\.com/i],
    facebook:   [/facebook\.com\/plugins/i, /facebook\.com\/.*\/posts/i],
    spotify:    [/open\.spotify\.com\/embed/i],
    soundcloud: [/w\.soundcloud\.com\/player/i],
    tiktok:     [/tiktok\.com\/embed/i, /tiktok\.com\/.*\/video/i]
  };
  function detectEmbedServiceFromUrl(url) {
    if (!url) return null;
    for (var id in EMBED_SERVICES) {
      var patterns = EMBED_SERVICES[id];
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].test(url)) return id;
      }
    }
    return null;
  }

  // ── Video/iframe consent wall ──
  function createConsentWall(src, category, origWidth, origHeight, origStyle, origClass) {
    var wall = _createElement('div');
    // #169 — inherit original iframe's class so CSS-positioning wrappers (TOWeb
    // `element-to-stretch`, Bootstrap `.ratio-item`, Tailwind `absolute inset-0`…)
    // keep applying. Industry pattern also used by Iubenda / Termly.
    wall.className = 'wl-cc-wall' + (origClass ? ' ' + origClass : '');
    wall.dataset.origWidth = origWidth || '';
    wall.dataset.origHeight = origHeight || '';
    wall.dataset.origStyle = origStyle || '';
    wall.dataset.origClass = origClass || '';
    // Service identification + data-i18n attrs for post-fetch re-localization (#155)
    var serviceId = detectEmbedServiceFromUrl(src);
    wall.innerHTML =
      '<div class="wl-cc-wall-inner">' +
        '<div class="wl-cc-wall-icon">\uD83C\uDF6A</div>' +
        (serviceId ? '<div class="wl-cc-wall-service" data-i18n-embed="' + serviceId + '">' + tEmbed(serviceId) + '</div>' : '') +
        '<div class="wl-cc-wall-text" data-i18n-key="wallText">' + t('wallText') + '</div>' +
        '<button class="wl-cc-wall-btn" data-i18n-key="wallAccept">' + t('wallAccept') + '</button>' +
      '</div>';
    // Style the wall to match original iframe dimensions
    if (origWidth) wall.style.width = /^\d+$/.test(origWidth) ? origWidth + 'px' : origWidth;
    if (origHeight) wall.style.height = /^\d+$/.test(origHeight) ? origHeight + 'px' : origHeight;
    // Accept button grants consent for this category
    wall.querySelector('.wl-cc-wall-btn').onclick = function(e) {
      e.preventDefault();
      var consent = getConsent() || { necessary: true, analytics: false, marketing: false };
      consent[category] = true;
      setConsent(consent);
    };
    // Track for unblocking
    blockedResources.push({ src: src, category: category, type: 'iframe', placeholder: wall });
    exigerStyles(); // #423 : la CSS des encarts vit dans wl-cc-ui.js
    return wall;
  }

  // Re-localize walls rendered before T loaded (#155 — fixes EN-fallback flash).
  function reapplyWallTranslations() {
    var walls = document.querySelectorAll('.wl-cc-wall');
    for (var i = 0; i < walls.length; i++) {
      var w = walls[i];
      var textEl = w.querySelector('[data-i18n-key="wallText"]');
      if (textEl) textEl.textContent = t('wallText');
      var btnEl = w.querySelector('[data-i18n-key="wallAccept"]');
      if (btnEl) btnEl.textContent = t('wallAccept');
      var svcEl = w.querySelector('[data-i18n-embed]');
      if (svcEl) {
        var id = svcEl.getAttribute('data-i18n-embed');
        if (id) svcEl.textContent = tEmbed(id);
      }
    }
  }

  // Monkey-patch createElement to intercept script/iframe creation
  var _createElement = document.createElement.bind(document);
  document.createElement = function(tag) {
    var el = _createElement(tag);
    var tagLC = tag.toLowerCase();
    if (tagLC === 'script' || tagLC === 'iframe') {
      var origSetAttribute = el.setAttribute.bind(el);
      el.setAttribute = function(name, value) {
        // Casse (#386) : setAttribute('SRC', …) est valide et passait a travers.
        // Le MutationObserver n'a pas ce trou, le parseur normalisant les noms.
        if (String(name).toLowerCase() === 'src' && !el.__wlAllowed) {
          var consent = getConsent();
          var cat = getCategory(value);
          if (cat && (!consent || !consent[cat])) {
            blockedResources.push({ src: value, category: cat, type: tagLC, async: el.async });
            el.__wlBlocked = true;
            return; // don't set src
          }
        }
        return origSetAttribute(name, value);
      };
      // Also intercept direct .src assignment for scripts
      var srcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      if (srcDesc && tagLC === 'script') {
        Object.defineProperty(el, 'src', {
          set: function(val) {
            if (!el.__wlAllowed) {
              var consent = getConsent();
              var cat = getCategory(val);
              if (cat && (!consent || !consent[cat])) {
                blockedResources.push({ src: val, category: cat, type: 'script', async: el.async });
                el.__wlBlocked = true;
                return;
              }
            }
            srcDesc.set.call(el, val);
          },
          get: function() { return srcDesc.get.call(el); },
        });
      }
    }
    return el;
  };

  // MutationObserver — catch scripts and iframes added directly to DOM
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (!node.tagName || node.__wlAllowed) return;
        var tag = node.tagName;
        var src = node.src || node.getAttribute('src');
        if (!src) return;
        var consent = getConsent();
        var cat = getCategory(src);
        if (!cat || (consent && consent[cat])) return;

        if (tag === 'SCRIPT') {
          var origSrc = src;
          node.type = 'javascript/blocked';
          node.removeAttribute('src');
          blockedResources.push({ src: origSrc, category: cat, type: 'script', async: node.async });
        } else if (tag === 'IFRAME') {
          // Replace iframe with consent wall
          var wall = createConsentWall(
            src, cat,
            node.getAttribute('width') || node.width,
            node.getAttribute('height') || node.height,
            node.style.cssText,
            node.className
          );
          node.replaceWith(wall);
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Also scan existing iframes on init (for statically-embedded videos)
  function scanExistingIframes() {
    var consent = getConsent();
    document.querySelectorAll('iframe[src]').forEach(function(iframe) {
      if (iframe.__wlAllowed) return;
      var src = iframe.getAttribute('src');
      var cat = getCategory(src);
      if (cat && (!consent || !consent[cat])) {
        var wall = createConsentWall(
          src, cat,
          iframe.getAttribute('width') || iframe.width,
          iframe.getAttribute('height') || iframe.height,
          iframe.style.cssText,
          iframe.className
        );
        iframe.replaceWith(wall);
      }
    });
  }

  // ── Consent cookie ──
  var COOKIE_NAME = 'wl_cc_consent';

  // Echappement d'une valeur destinee a un attribut HTML (#389). On neutralise
  // aussi `javascript:` : un href n'est pas qu'une question de guillemets.
  function escAttr(v) {
    var t = String(v == null ? '' : v);
    if (/^\s*javascript:/i.test(t)) return '';
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getConsent() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
    if (!match) return null;
    try { return JSON.parse(decodeURIComponent(match[1])); } catch(e) { return null; }
  }

  // #384 — un consentement sans date ni version ne se prouve pas (EDPB 05/2020,
  // §110) : `ts` dit QUAND, `v` dit CONTRE QUEL perimetre. A incrementer des que
  // la liste des services change — un ancien consentement ne le couvre plus.
  var CONSENT_VERSION = '2.5'; // 2.5 : Contentsquare ajoute (#429)

  // Cookies et cles de stockage poses en PREMIERE PARTIE, par categorie. Une
  // entree de trop efface ce qui ne nous appartient pas ; une qui manque laisse
  // un traceur en vie apres un refus.
  var PURGE = {
    // Contentsquare : _cs_id (13 mois) et _cs_s (session). PAS _cs_c ni _cs_optout,
    // qui gardent un choix du visiteur (docs.contentsquare.com/en/web/cookies, #429).
    analytics: [/^_ga($|_)/, /^_gid$/, /^_gat/, /^__utm[abcvxz]$/, /^_hj/, /^_clck$/, /^_clsk$/, /^_cs_(id|s)$/,
                /^CLID$/, /^ANONCHK$/, /^MUID$/, /^_pk_(id|ses|ref|cvar)/, /^MATOMO_SESSID$/,
                /^mp_[0-9a-f]+_mixpanel$/, /^ajs_(anonymous_id|user_id|group_id)$/,
                /^amplitude_/, /^AMP_/, /^_fs_uid$/, /^fs_uid$/, /^_lr_/,
                // Pendo pose `_pendo_visitorId`, `_pendo_accountId`, `_pendo_meta`.
                /^_pendo_/, /^SL_[CGw]/],
    // Pas de `^fr$` : le cookie Facebook `fr` est pose sur .facebook.com (tiers,
    // hors d'atteinte de document.cookie), et un site multilingue peut avoir son
    // propre cookie de langue `fr`, qu'il ne faut pas effacer.
    // TikTok pose ttcsid / ttcsid_<pixel> et ttclid en first-party (13 mois,
    // ads.tiktok.com/help/article/using-cookies-with-tiktok-pixel).
    marketing: [/^_fbp$/, /^_fbc$/, /^_ttp$/, /^_tt_enable_cookie$/, /^ttcsid(_|$)/, /^ttclid$/, /^_scid/, /^_schn/,
                /^sc_at$/, /^_uetsid/, /^_uetvid/, /^_gcl_/, /^_rdt_uuid$/, /^_pin_unauth$/,
                /^_pinterest_/, /^personalization_id$/, /^muc_ads$/, /^li_(fat_id|sugr)$/,
                /^bcookie$/, /^bscookie$/, /^lidc$/, /^UserMatchHistory$/,
                /^intercom-/, /^crisp-client/, /^__tawkuuid$/, /^_mkto_trk$/, /^t_gid$/, /^taboola/]
  };

  // Domaine exact + parents : un cookie de `.exemple.fr` ne s'efface pas depuis
  // `www.exemple.fr` sans repreciser le domaine. Piege qui fait croire le
  // retrait applique alors qu'il ne l'est pas.
  function purgeDomains() {
    var h = location.hostname, out = ['', h];
    var parts = h.split('.');
    for (var i = 1; i < parts.length - 1; i++) out.push('.' + parts.slice(i).join('.'));
    return out;
  }

  function purgeStorage(categorie) {
    var motifs = PURGE[categorie];
    if (!motifs) return;
    var correspond = function(nom) {
      for (var i = 0; i < motifs.length; i++) if (motifs[i].test(nom)) return true;
      return false;
    };
    // Cookies
    var domaines = purgeDomains();
    (document.cookie || '').split(';').forEach(function(paire) {
      var nom = paire.split('=')[0].trim();
      if (!nom || !correspond(nom)) return;
      domaines.forEach(function(d) {
        document.cookie = nom + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT'
          + (d ? ';domain=' + d : '');
      });
    });
    // Hotjar, Amplitude et Segment logent l'identifiant durable dans le
    // stockage : effacer le seul cookie ne suffirait pas.
    ['localStorage', 'sessionStorage'].forEach(function(magasin) {
      try {
        var m = window[magasin], aSupprimer = [];
        for (var i = 0; i < m.length; i++) { var k = m.key(i); if (correspond(k)) aSupprimer.push(k); }
        aSupprimer.forEach(function(k) { m.removeItem(k); });
      } catch (e) { /* mode prive ou stockage bloque : rien a faire */ }
    });
  }

  function setConsent(consent) {
    if (!consent.ts) consent.ts = new Date().toISOString();
    if (!consent.v) consent.v = CONSENT_VERSION;
    var val = encodeURIComponent(JSON.stringify(consent));
    var expires = new Date(Date.now() + cfg.expire * 86400000).toUTCString();
    document.cookie = COOKIE_NAME + '=' + val + ';path=/;expires=' + expires + ';SameSite=Lax';

    // Google Consent Mode v2 — functionality/personalization tied to marketing
    // since third-party embeds (YouTube/Maps/Vimeo) and chat widgets are now in marketing
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
        functionality_storage: consent.marketing ? 'granted' : 'denied',
        personalization_storage: consent.marketing ? 'granted' : 'denied',
        security_storage: 'granted',
      });
    }

    // Le retrait doit EFFACER, pas seulement cesser de charger (art. 7-3 RGPD) :
    // `_ga` et `_fbp` vivent treize mois.
    // Hors de portee par construction : un cookie pose sur le domaine du
    // fournisseur — seul le blocage l'empeche d'exister.
    if (!consent.analytics) purgeStorage('analytics');
    if (!consent.marketing) purgeStorage('marketing');

    // Unblock scripts for accepted categories
    if (consent.analytics) unblockCategory('analytics');
    if (consent.marketing) unblockCategory('marketing');

    // Custom event
    window.dispatchEvent(new CustomEvent('wl-cc-consent', { detail: consent }));
  }

  // ── Language detection ──
  function detectLang() {
    if (cfg.lang) return cfg.lang.substring(0, 2).toLowerCase();
    var htmlLang = document.documentElement.lang || '';
    if (htmlLang) return htmlLang.substring(0, 2).toLowerCase();
    var navLang = (navigator.language || navigator.userLanguage || 'en');
    return navLang.substring(0, 2).toLowerCase();
  }

  // ── Translations (loaded async or inline fallback) ──
  var T = null; // will be set when translations load
  var FALLBACK = {
    skipToBanner: "Skip to cookie banner",
    title: "This site uses cookies",
    desc: "We use cookies to improve your experience, analyze traffic and personalize content.",
    learnMore: "Learn more",
    accept: "Accept all", reject: "Reject all", settings: "Customize", save: "Save preferences",
    necessary: "Necessary", necessaryDesc: "Essential for the site to function. Cannot be disabled.",
    analytics: "Analytics", analyticsDesc: "Help us understand how you use the site.",
    marketing: "Marketing", marketingDesc: "Personalized ads, embedded media (YouTube, Vimeo, Maps) and chat widgets.",
    branding: "Powered by",
    wallText: "This content requires cookies to load.",
    wallAccept: "Accept & load",
    reopenLabel: "Cookie settings",
    gpcNotice: "Your browser sent a Global Privacy Control signal. Your privacy preferences have been applied automatically.",
    gpcManage: "Manage",
    gpcDismiss: "Dismiss",
  };

  function t(key) {
    var lang = detectLang();
    if (T && T[lang]) return T[lang][key] || FALLBACK[key] || key;
    return FALLBACK[key] || key;
  }

  // Embed label helper (#155) — T[lang].embedLabels[id] → EN → capitalized id.
  function tEmbed(serviceId) {
    if (!serviceId) return '';
    var lang = detectLang();
    if (T && T[lang] && T[lang].embedLabels && T[lang].embedLabels[serviceId]) {
      return T[lang].embedLabels[serviceId];
    }
    if (T && T.en && T.en.embedLabels && T.en.embedLabels[serviceId]) {
      return T.en.embedLabels[serviceId];
    }
    return serviceId.charAt(0).toUpperCase() + serviceId.slice(1);
  }

  function isRTL() {
    var lang = detectLang();
    return lang === 'ar' || lang === 'he' || lang === 'fa' || lang === 'ur';
  }

  // ── Theme detection ──
  function isDarkMode() {
    if (cfg.theme === 'dark') return true;
    if (cfg.theme === 'light') return false;
    // Auto: check page theme
    if (document.documentElement.classList.contains('dark-theme') ||
        document.documentElement.getAttribute('data-theme') === 'dark') return true;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // ── CSS injection ──

  // ── #423 — INTERFACE CHARGEE A PART, EN ASYNC ──────────────────────────────
  //
  // Ce fichier reste synchrone et en premier dans <head> : tout ce qui bloque un
  // traceur est au-dessus (Consent Mode, motifs, createElement, MutationObserver,
  // encarts, consentement). Le bandeau, sa CSS, le panneau et le bouton de
  // reouverture vivent dans wl-cc-ui.js, demande en async a cote de ce fichier.
  // (Cache des deux fichiers : max-age=300 + stale-while-revalidate=600, soit 15 min
  // au pire pour qu'une nouvelle version soit vue partout — cf. .htaccess.)
  // Objectif : moitie moins d'octets et d'analyse synchrones, sans rien changer
  // chez les integrateurs (meme URL, meme balise).
  //
  // REGLE DE SURETE : si wl-cc-ui.js ne vient jamais (bloqueur, panne, CSP),
  // rien n'est debloque. Pas de bandeau, donc pas de consentement possible, mais
  // aucun traceur non plus : on echoue ferme, jamais ouvert.
  //
  // CONTRAT entre les deux fichiers : window.__wlCC, version API_UI. Un noyau en
  // cache (jusqu'a 15 min) peut rencontrer une interface plus recente pendant un deploiement :
  // l'interface refuse de demarrer si la version differe (echec ferme, le temps
  // que le cache expire). Changer API_UI dans les DEUX fichiers a chaque rupture.
  var API_UI = 1;
  var ui = null, uiFile = [], uiDemande = false;

  function urlInterface(base) {
    return base + 'wl-cc-ui.js?v=' + API_UI;
  }

  function chargerUI() {
    if (uiDemande) return;
    uiDemande = true;
    var src = (script && script.src) || '';
    var base = /wl-cookie-consent\.js(?:[?#].*)?$/.test(src)
      ? src.replace(/wl-cookie-consent\.js(?:[?#].*)?$/, '')
      : 'https://weblegal.ai/js/';
    var essais = [urlInterface(base)];
    // Un site qui heberge sa propre copie du noyau n'a pas forcement l'interface :
    // on se rabat sur notre CDN.
    if (base !== 'https://weblegal.ai/js/') essais.push(urlInterface('https://weblegal.ai/js/'));
    (function essayer(k) {
      if (k >= essais.length) return; // echec ferme : rien n'est debloque
      var s = _createElement('script');
      s.__wlAllowed = true; // ne jamais passer par notre propre filtre
      // CSP a nonce : sans lui, le navigateur refuserait l'interface (le fichier
      // unique d'avant n'avait rien a charger). Propriete IDL, pas l'attribut :
      // les navigateurs masquent l'attribut nonce apres l'analyse.
      if (script && script.nonce) s.nonce = script.nonce;
      s.fetchPriority = 'high'; // sinon Chrome la retarde derriere un <head> charge
      s.src = essais[k];
      s.async = true;
      var suivant = function () { if (s.parentNode) s.parentNode.removeChild(s); essayer(k + 1); };
      s.onerror = suivant;
      // Un hebergeur a reecriture (SPA, WordPress) repond 200 + HTML pour un fichier
      // absent : onerror ne tire pas. pret() est appele pendant l'execution de
      // l'interface, donc a onload `ui` est renseigne si elle a vraiment demarre.
      s.onload = function () { if (!ui) suivant(); };
      (document.head || document.documentElement).appendChild(s);
    })(0);
  }

  // Une erreur de l'interface ne doit jamais casser la page hote, mais ne doit pas
  // non plus disparaitre : sans trace, « pas de bandeau » serait indiagnosticable.
  function signaler(e) {
    try { console.error('[WebLegal CCB] interface :', e); } catch (_) {}
  }

  function avecUI(fn) {
    if (ui) { try { fn(ui); } catch (e) { signaler(e); } return; }
    uiFile.push(fn);
    chargerUI();
  }

  var _stylesDemandes = false;
  function exigerStyles() {
    if (_stylesDemandes) return;
    _stylesDemandes = true;
    avecUI(function (u) { u.injectCSS(); });
  }

  function reopenBanner() {
    if (window.self !== window.top) return; // #281: no consent UI inside an iframe
    // injectCSS d'abord : sans bouton flottant ni encart, la CSS n'a peut-etre jamais ete posee.
    avecUI(function (u) { u.injectCSS(); u.reopenBanner(); });
  }

  function loadTranslationsThen(cb) {
    var translationsUrl = (script && script.src)
      ? script.src.replace('wl-cookie-consent.js', 'wl-cc-translations.json')
      : '/js/wl-cc-translations.json';
    fetch(translationsUrl)
      .then(function(r) { return r.json(); })
      .then(function(data) { T = data; })
      .catch(function() { /* use fallback */ })
      .finally(function() { reapplyWallTranslations(); cb(); });
  }

  // Ce que l'interface recoit du noyau — rien de plus. Objet fige et propriete non
  // reecrivable : ce n'est PAS une API d'integration (ne jamais la documenter ;
  // l'API publique est window.WebLegalConsent). Toute NOUVELLE cle consommee par
  // l'interface est une rupture de contrat : incrementer API_UI dans les deux fichiers.
  var __wlCC = {
    api: API_UI,
    cfg: cfg,
    escAttr: escAttr,
    getConsent: getConsent,
    setConsent: setConsent,
    detectLang: detectLang,
    t: t,
    T: function () { return T; },
    isRTL: isRTL,
    isDarkMode: isDarkMode,
    loadTranslationsThen: loadTranslationsThen,
    // appele par wl-cc-ui.js une fois charge
    pret: function (u) {
      if (ui) return false;
      ui = u;
      var f = uiFile; uiFile = [];
      for (var i = 0; i < f.length; i++) { try { f[i](u); } catch (e) { signaler(e); } }
      return true;
    }
  };
  try {
    Object.defineProperty(window, '__wlCC', { value: Object.freeze(__wlCC), writable: false, configurable: false });
  } catch (e) { window.__wlCC = __wlCC; }

  // Premiere visite (aucun consentement) : le bandeau sera necessaire, on demande
  // l'interface TOUT DE SUITE, en parallele de l'analyse de la page.
  if (!getConsent() && !navigator.globalPrivacyControl && window.self === window.top) chargerUI();


  // ── Custom triggers — webmaster-embedded links or buttons ──
  // Any <a href="#cookie-settings"> or any element with class="weblegal-cookie-settings"
  // will reopen the banner when clicked. (#423 : charge l'interface a la demande.)
  var _declencheurs = false;
  function registerCustomTriggers() {
    if (_declencheurs) return;
    _declencheurs = true;
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest && e.target.closest('.weblegal-cookie-settings, a[href="#cookie-settings"], a[href$="#cookie-settings"]');
      if (!trigger) return;
      e.preventDefault();
      reopenBanner();
    }, true);
  }

  // ── Public API ──
  window.WebLegalConsent = {
    reopen: reopenBanner,
    getConsent: getConsent,
  };


  // #388 — AVERTIR QUAND IL EST DEJA TROP TARD. Ce script ne peut bloquer que
  // ce qui n'a pas encore ete demande. Charge par un gestionnaire de balises,
  // en `defer`/`async`, ou simplement pose apres les traceurs, il s'installe
  // sur un site ou les requetes sont deja parties : le bandeau s'affiche, tout
  // semble normal, et rien n'est bloque.
  // Le message part une seule fois, en console, sans jamais casser la page.
  // Traceurs ACTIFS deja dans la page : balises <script src> et <iframe src> qui
  // correspondent a un motif. Les balises neutralisees (type text/plain ou
  // javascript/blocked + data-wl-src) n'ont pas de src : elles ne comptent pas.
  function traceursActifsDansLaPage() {
    var n = 0;
    try {
      var l = document.querySelectorAll('script[src], iframe[src]');
      for (var i = 0; i < l.length; i++) {
        if (l[i] === __wlBalise || l[i].__wlAllowed) continue;
        if (getCategory(l[i].getAttribute('src') || l[i].src)) n++;
      }
    } catch (e) {}
    return n;
  }

  function avertirChargementTardif() {
    try {
      var raisons = [];
      var tardif = !!(__wlBalise && (__wlBalise.defer || __wlBalise.async)) || __wlEtatAuChargement !== 'loading';
      // Un chargement tardif n'est un probleme QUE s'il reste un traceur actif dans la
      // page. Une page dont chaque traceur est ecrit neutralise (data-wl-src) est
      // conforme meme avec un chargeur defer (variante TOWeb 14, 2026-10) : avertir
      // la ferait passer pour fautive et embrouillerait le support.
      var actifs = tardif ? traceursActifsDansLaPage() : 0;
      if (tardif && actifs) {
        if (__wlBalise && (__wlBalise.defer || __wlBalise.async)) raisons.push('il porte defer ou async');
        // 'loading' = l'analyseur HTML est encore dans la page, donc le script est
        // arrive par une balise en place. Toute autre valeur signale une insertion
        // apres coup : gestionnaire de balises, chargeur dynamique, fin de body.
        else raisons.push('il a ete insere apres l\'analyse du document');
        raisons.push(actifs + ' traceur(s) actif(s) deja dans la page');
      }
      // Un traceur charge avant nous : la preuve directe, pas un indice.
      var passes = 0;
      for (var i = 0; i < __wlTraceursAvant.liste.length; i++) {
        if (getCategory(__wlTraceursAvant.liste[i])) passes++;
      }
      if (passes) raisons.push(passes + ' script(s) de suivi le precedent dans la page');
      if (!raisons.length) return;
      console.warn('[WebLegal CCB] Chargement tardif : ' + raisons.join(', ')
        + '. Le bandeau ne peut bloquer que ce qui n\'a pas encore ete demande.'
        + ' Placez le script EN PREMIER dans <head>, sans defer ni async, et jamais'
        + ' via un gestionnaire de balises. https://weblegal.ai/en/cookie-banner/');
    } catch (e) { /* un avertissement ne doit jamais casser une page */ }
  }

  // #398 — ADOPTION DES BALISES PRE-NEUTRALISEES PAR L'INTEGRATEUR.
  //
  // Le bandeau ne peut pas empecher la REQUETE d'une balise ecrite en dur dans
  // le HTML : le preload scanner du navigateur lance le telechargement pendant
  // l'analyse du document, avant qu'aucun observateur JavaScript n'existe.
  // Mesure sur notre page temoin, avec le montage que nous documentons :
  // exécution empechee, aucun cookie — mais deux requetes parties.
  //
  // La seule parade est que la balise ne soit PAS une balise de script chargeable.
  // Un `type` non executable n'est jamais telecharge : la garantie vient de la
  // specification HTML, pas d'une course gagnee contre l'analyseur. C'est ce que
  // documentent aussi les autres CMP.
  //
  //   <script type="javascript/blocked"
  //           data-wl-src="https://www.googletagmanager.com/gtag/js?id=G-XXX"></script>
  //
  // `text/plain` est accepte aussi : c'est la forme que les integrateurs venant
  // d'un autre CMP connaissent deja.
  //
  // Aucune contrainte de moment : la balise etant inerte, l'adoption peut avoir
  // lieu a DOMContentLoaded sans qu'il ne se soit rien passe entre-temps.
  function adopterBalisesPreBloquees() {
    try {
      var l = document.querySelectorAll(
        'script[data-wl-src][type="javascript/blocked"], script[data-wl-src][type="text/plain"]');
      for (var i = 0; i < l.length; i++) {
        var el = l[i];
        if (el.__wlAdopted) continue;
        el.__wlAdopted = true;
        var src = el.getAttribute('data-wl-src');
        if (!src) continue;
        // La categorie declaree par l'integrateur prime : elle lui permet de
        // proteger un service que notre catalogue ne connait pas — ce qu'aucun
        // de nos 82 motifs ne peut faire aujourd'hui.
        var cat = (el.getAttribute('data-wl-category') || '').toLowerCase();
        if (cat !== 'analytics' && cat !== 'marketing') cat = getCategory(src) || '';
        // Sans categorie identifiable, on retient la plus exigeante : une balise
        // que l'integrateur a pris la peine de neutraliser attend un consentement.
        if (!cat) cat = 'marketing';
        blockedResources.push({
          src: src, category: cat, type: 'script',
          async: el.hasAttribute('async'), element: el
        });
      }
    } catch (e) { /* l'adoption ne doit jamais empecher le bandeau de s'afficher */ }
  }

  // ── Init ──
  function init() {
    avertirChargementTardif();
    // AVANT toute lecture du consentement : setConsent() debloque les categories
    // acceptees, donc un visiteur qui a deja consenti doit trouver ses balises
    // deja adoptees, sans quoi son analytics ne se chargerait jamais.
    adopterBalisesPreBloquees();
    registerCustomTriggers();
    var existing = getConsent();
    if (existing) {
      scanExistingIframes(); // block iframes for denied categories
      setConsent(existing); // unblock accepted categories + Google Consent Mode
      // #423 : l'interface n'est chargee que si elle sert. Un site sans bouton de
      // reouverture (data-reopen-position="hidden"), sans encart video et sans
      // GPC ne la telecharge qu'au clic sur « Gerer les cookies ».
      var walls = !!document.querySelector('.wl-cc-wall');
      var bouton = cfg.reopenPosition !== 'hidden' && window.self === window.top;
      var avisGpc = false;
      if (existing.gpc === true) { try { avisGpc = localStorage.getItem('wl-cc-gpc-ack') !== '1'; } catch (e) { avisGpc = true; } }
      if (walls || bouton || avisGpc) {
        avecUI(function (u) {
          u.injectCSS();
          u.injectReopenButton();
          // #331: a GPC visitor whose FIRST visit was backgrounded never saw the
          // §7025 notice. Re-attempt; the ack guard makes it a cheap no-op once seen.
          if (avisGpc) u.maybeShowGpcNotice();
        });
      }
      // Lazy-load translations only if walls exist (#155 — else EN fallback sticks).
      if (walls) loadTranslationsThen(function(){});
      return;
    }

    // GPC auto-reject (#173) — W3C Global Privacy Control signal (CPRA-mandated).
    // First-visit opt-out, no banner. Reopen button lets user override.
    if (navigator.globalPrivacyControl) {
      setConsent({ necessary: true, analytics: false, marketing: false, gpc: true });
      avecUI(function (u) {
        u.injectCSS();
        u.injectReopenButton();
        u.maybeShowGpcNotice(); // #331: make the silent auto opt-out visible
      });
      return;
    }

    // Block existing iframes with tracker URLs
    scanExistingIframes();

    // #281 : jamais de bandeau dans une iframe — inutile d'y telecharger l'interface.
    if (window.self !== window.top) return;

    // Bandeau : il faut l'interface ET les traductions, chargees en parallele.
    var attendus = 2;
    function montrer() {
      if (--attendus > 0) return;
      ui.injectCSS();
      // Un clic sur « Gerer les cookies » pendant le chargement a pu ouvrir le
      // panneau entre-temps : une seule boite, jamais deux.
      if (document.getElementById('wl-cc-box')) return;
      ui.buildBanner();
    }
    loadTranslationsThen(montrer);
    avecUI(montrer);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
