/**
 * WebLegal.ai Cookie Consent — INTERFACE (#423)
 *
 * Ne s'integre PAS directement : ce fichier est charge en async par
 * wl-cookie-consent.js (le noyau), qui reste la seule balise a poser.
 * Il contient le bandeau, sa CSS, le panneau de personnalisation, le bouton de
 * reouverture et l'avis GPC. Tout ce qui bloque les traceurs est dans le noyau :
 * si ce fichier ne se charge pas, rien n'est debloque.
 *
 * Servi NON MINIFIE deliberement, comme le noyau.
 */
(function() {
  'use strict';
  var C = window.__wlCC;
  // Contrat : meme version d'API que le noyau, sinon on ne demarre pas (echec ferme).
  if (!C || C.api !== 1) return;
  var cfg = C.cfg, escAttr = C.escAttr, getConsent = C.getConsent, setConsent = C.setConsent,
      detectLang = C.detectLang, t = C.t, isRTL = C.isRTL, isDarkMode = C.isDarkMode,
      loadTranslationsThen = C.loadTranslationsThen;

  function injectCSS() {
    if (document.getElementById('wl-cc-styles')) return;
    var style = document.createElement('style');
    style.id = 'wl-cc-styles';
    style.textContent = `
      .wl-cc-backdrop{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .3s}
      .wl-cc-backdrop.wl-cc-show{opacity:1;pointer-events:auto}
      .wl-cc-skip{position:fixed;top:8px;left:8px;z-index:100000;padding:10px 16px;border-radius:8px;background:#111827;color:#fff;font:600 14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-decoration:none;transform:translateY(-200%);transition:none}
      .wl-cc-skip:focus{transform:none;outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px #111827}
      [dir="rtl"] .wl-cc-skip,.wl-cc-skip[dir="rtl"]{left:auto;right:8px}
      .wl-cc-box{position:fixed;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;transition:transform .4s cubic-bezier(.4,0,.2,1),opacity .3s}
      .wl-cc-box *{box-sizing:border-box;margin:0;padding:0}
      .wl-cc-box a{color:var(--wl-cc-a-txt);text-decoration:underline;text-underline-offset:.15em}
      .wl-cc-box a:hover{text-decoration:underline}

      /* Bottom bar — full-width background, content centered in a 1200px container (#102) */
      .wl-cc-bottom{bottom:0;left:0;right:0;transform:translateY(100%);padding:18px 24px;border-top:1px solid var(--wl-cc-border)}
      .wl-cc-bottom > div{max-width:1200px;margin:0 auto}
      .wl-cc-bottom.wl-cc-show{transform:translateY(0)}

      /* Popup */
      .wl-cc-popup{bottom:16px;left:16px;max-width:400px;width:calc(100% - 32px);border-radius:12px;padding:20px;transform:translateY(20px);opacity:0;border:1px solid var(--wl-cc-border);box-shadow:0 10px 40px rgba(0,0,0,.15)}
      .wl-cc-popup.wl-cc-show{transform:translateY(0);opacity:1}

      /* Modal */
      .wl-cc-modal{top:50%;left:50%;transform:translate(-50%,-50%) scale(.9);opacity:0;max-width:520px;width:90%;border-radius:16px;padding:28px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
      .wl-cc-modal.wl-cc-show{transform:translate(-50%,-50%) scale(1);opacity:1}

      /* Content */
      .wl-cc-ttl{font-size:16px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px;color:var(--wl-cc-fg)}
      .wl-cc-dsc{color:var(--wl-cc-muted);font-size:13px;line-height:1.6;margin-bottom:16px}
      .wl-cc-btns{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
      .wl-cc-btn{padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .15s;flex:1;min-width:100px;text-align:center}
      .wl-cc-ba{background:var(--wl-cc-a);color:var(--wl-cc-on-a)}
      .wl-cc-ba:hover{filter:brightness(1.1)}
      .wl-cc-br{background:var(--wl-cc-card);color:var(--wl-cc-muted);border:1px solid var(--wl-cc-border)}
      .wl-cc-br:hover{background:var(--wl-cc-border)}
      .wl-cc-bs{background:transparent;color:var(--wl-cc-a-txt);border:1px solid var(--wl-cc-a)}
      .wl-cc-bs:hover{background:rgba(16,185,129,.05)}

      /* Categories */
      .wl-cc-cats{display:none;margin-bottom:14px}
      .wl-cc-cats.wl-cc-exp{display:block}
      .wl-cc-cat{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--wl-cc-border)}
      .wl-cc-cat:last-child{border-bottom:none}
      .wl-cc-cn{font-size:13px;font-weight:600;color:var(--wl-cc-fg)}
      .wl-cc-cd{font-size:11px;color:var(--wl-cc-muted)}
      .wl-cc-tg{position:relative;width:40px;height:22px;flex-shrink:0;margin-left:12px}
      .wl-cc-tg input{opacity:0;width:0;height:0;position:absolute}
      .wl-cc-sl{position:absolute;inset:0;background:var(--wl-cc-border);border-radius:22px;cursor:pointer;transition:background .2s}
      .wl-cc-sl::before{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s}
      .wl-cc-tg input:checked+.wl-cc-sl{background:var(--wl-cc-a)}
      .wl-cc-tg input:checked+.wl-cc-sl::before{transform:translateX(18px)}
      .wl-cc-tg input:disabled+.wl-cc-sl{opacity:.5;cursor:not-allowed}

      /* Branding */
      .wl-cc-brd{text-align:center;font-size:10px;color:var(--wl-cc-muted);padding-top:8px;border-top:1px solid var(--wl-cc-border)}
      .wl-cc-brd a{color:var(--wl-cc-a-txt);font-weight:600}

      /* Consent wall (replaces blocked iframes) */
      .wl-cc-wall{display:flex;align-items:center;justify-content:center;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;min-height:200px;max-width:100%;overflow:hidden}
      .wl-cc-wall-inner{text-align:center;padding:24px}
      .wl-cc-wall-icon{font-size:32px;margin-bottom:8px}
      .wl-cc-wall-service{font-size:14px;font-weight:600;color:#1e293b;margin-bottom:6px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      .wl-cc-wall-text{font-size:13px;color:#475569;margin-bottom:12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.5}
      .wl-cc-wall-btn{background:#10b981;color:#111827;border:none;border-radius:8px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
      .wl-cc-wall-btn:hover{background:#059669}
      @media(prefers-color-scheme:dark){.wl-cc-wall{background:#1e293b;border-color:#334155}.wl-cc-wall-service{color:#f1f5f9}.wl-cc-wall-text{color:#94a3b8}}

      /* Reopen button (floating cookie icon — GDPR art. 7.3 withdrawal right) */
      /* color and border-color are set inline at injection time from pickContrastColor(data-color) — see #162 */
      .wl-cc-reopen{position:fixed;z-index:99997;width:48px;height:48px;border-radius:50%;border:2px solid currentColor;background:var(--wl-cc-reopen-bg,#10b981);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .18s ease, box-shadow .18s ease;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;opacity:0;transform:scale(.7) translateY(8px)}
      .wl-cc-reopen.wl-cc-show{opacity:1;transform:scale(1) translateY(0)}
      .wl-cc-reopen.wl-cc-show.wl-cc-away{opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s ease, transform .2s ease}
      .wl-cc-reopen.wl-cc-show.wl-cc-away:focus{opacity:1;transform:none;pointer-events:auto}
      @media(prefers-reduced-motion:reduce){.wl-cc-reopen,.wl-cc-reopen.wl-cc-show.wl-cc-away{transition:none}}
      .wl-cc-reopen:hover{transform:scale(1.08);box-shadow:0 6px 18px rgba(0,0,0,.22)}
      .wl-cc-reopen:focus-visible{outline:2px solid var(--wl-cc-reopen-bg,#10b981);outline-offset:3px}
      .wl-cc-reopen svg{display:block;width:24px;height:24px}
      /* bottom = base margin + iOS home-indicator safe-area + dynamic offset detected at runtime (#165) */
      .wl-cc-reopen-bottom-left{bottom:calc(16px + env(safe-area-inset-bottom, 0px) + var(--wl-cc-reopen-sticky-offset, 0px));left:16px}
      .wl-cc-reopen-bottom-right{bottom:calc(16px + env(safe-area-inset-bottom, 0px) + var(--wl-cc-reopen-sticky-offset, 0px));right:16px}
      @media(max-width:480px){.wl-cc-reopen{width:44px;height:44px}.wl-cc-reopen-bottom-left{bottom:calc(12px + env(safe-area-inset-bottom, 0px) + var(--wl-cc-reopen-sticky-offset, 0px));left:12px}.wl-cc-reopen-bottom-right{bottom:calc(12px + env(safe-area-inset-bottom, 0px) + var(--wl-cc-reopen-sticky-offset, 0px));right:12px}.wl-cc-reopen svg{width:22px;height:22px}}

      /* Mobile */
      @media(max-width:480px){.wl-cc-popup{left:8px;right:8px;bottom:8px;width:auto;max-width:none}.wl-cc-btns{flex-direction:column}.wl-cc-btn{min-width:auto}}

      /* GPC notice (#331) — visible confirmation the auto opt-out ran (CCPA §7025) */
      .wl-cc-gpc{position:fixed;z-index:99997;bottom:calc(16px + env(safe-area-inset-bottom, 0px));left:50%;transform:translateX(-50%) translateY(12px);max-width:440px;width:calc(100% - 32px);border-radius:10px;padding:12px 38px 12px 14px;box-shadow:0 4px 16px rgba(0,0,0,.16);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:1.45;display:flex;align-items:flex-start;gap:9px;opacity:0;pointer-events:none;transition:opacity .3s,transform .3s}
      .wl-cc-gpc.wl-cc-show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
      .wl-cc-gpc-ico{flex:none;font-size:16px;line-height:1.35}
      /* Defensive resets: host sites often ship global button{} / button:hover{}
         rules that (by specificity) would repaint these. !important on the
         visual reset keeps them flat on every client site. */
      .wl-cc-gpc button{-webkit-appearance:none;appearance:none;background:none!important;border:0!important;box-shadow:none!important;outline:none;border-radius:0;cursor:pointer;font:inherit;padding:0;margin:0}
      .wl-cc-gpc button:hover,.wl-cc-gpc button:focus{background:none!important;box-shadow:none!important}
      .wl-cc-gpc .wl-cc-gpc-manage{margin-left:4px;color:var(--wl-cc-gpc-a,#10b981);text-decoration:underline}
      .wl-cc-gpc .wl-cc-gpc-manage:hover{text-decoration:none;opacity:.85}
      .wl-cc-gpc .wl-cc-gpc-x{position:absolute;top:6px;right:9px;font-size:18px;line-height:1;color:inherit;opacity:.5}
      .wl-cc-gpc .wl-cc-gpc-x:hover{opacity:1}
      .wl-cc-gpc button:focus-visible{outline:2px solid var(--wl-cc-gpc-a,#10b981);outline-offset:2px}
      /* Below 600px, lift above the bottom-left reopen button (avoids overlap) */
      @media(max-width:600px){.wl-cc-gpc{bottom:calc(76px + env(safe-area-inset-bottom, 0px))}}
    `;
    document.head.appendChild(style);
  }

  // ── Build banner DOM ──
  // existingConsent: if provided (reopen mode), pre-fill toggles with saved
  // consent and auto-expand the customize view with a "Save" primary button.
  // ── Contraste (WCAG 2.x, luminance relative) ──
  function lum(hex) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var c = [0, 2, 4].map(function(i) { var v = parseInt(h.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function melanger(hex, vers, t) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return '#' + [0, 2, 4].map(function(i) { var v = parseInt(h.substr(i, 2), 16); return ('0' + Math.round(v + (vers - v) * t).toString(16)).slice(-2); }).join('');
  }
  // La couleur de marque, assombrie (fond clair) ou eclaircie (fond sombre) par pas de
  // 5 % jusqu'a 4,5:1. Inchangee si elle passe deja : aucun site conforme ne bouge.
  function texteLisible(couleur, fond, sombre) {
    for (var t = 0; t <= 1.0001; t += 0.05) {
      var c = melanger(couleur, sombre ? 255 : 0, t);
      if (contraste(c, fond) >= 4.5) return c;
    }
    return sombre ? '#ffffff' : '#000000';
  }

  function buildBanner(existingConsent) {
    // #281: never render the consent UI inside an iframe (e.g. a same-origin page
    // opened in a colorbox/lightbox) — the top window owns the UI, otherwise it
    // double-displays. Tracker-blocking enforcement still runs in the iframe; a
    // same-origin iframe reads the shared consent decision from storage.
    if (window.self !== window.top) return;
    var reopenMode = !!existingConsent;
    // PLANET49 (CJUE C-673/17, EDPB 05/2020 §81) : une case PRE-COCHEE ne vaut pas
    // consentement. Tout est refuse tant que le visiteur n'a pas coche lui-meme.
    var initialChecks = existingConsent || { necessary: true, analytics: false, marketing: false };

    // CSS variables
    var dark = isDarkMode();
    // WCAG 1.4.3 (2026-09-29) : la couleur de marque (defaut #10b981) sert de FOND
    // (bouton Accepter, interrupteurs) et de TEXTE (Personnaliser, liens), ou elle ne
    // garantit pas 4,5:1. On garde la couleur
    // choisie pour les fonds et on DERIVE deux couleurs de texte lisibles : la marque
    // assombrie (clair) ou eclaircie (sombre) jusqu'a 4,5:1 sur le fond du bandeau, et
    // un texte sur la marque blanc ou quasi noir selon ce qui passe.
    var bgBandeau = dark ? '#1e293b' : '#ffffff';
    var aTexte = texteLisible(cfg.color, bgBandeau, dark);
    var surA = contraste('#ffffff', cfg.color) >= 4.5 ? '#ffffff' : '#111827';
    var vars = (dark
      ? '--wl-cc-fg:#f1f5f9;--wl-cc-muted:#cbd5e1;--wl-cc-bg:#1e293b;--wl-cc-card:#334155;--wl-cc-border:#475569;--wl-cc-a:' + cfg.color
      : '--wl-cc-fg:#1e293b;--wl-cc-muted:#475569;--wl-cc-bg:#ffffff;--wl-cc-card:#f1f5f9;--wl-cc-border:#e2e8f0;--wl-cc-a:' + cfg.color)
      + ';--wl-cc-a-txt:' + aTexte + ';--wl-cc-on-a:' + surA;

    // `data-privacy-url` vient souvent d'un champ de CMS : on l'echappe avant de
    // l'inserer dans l'attribut.
    var learnMoreLink = cfg.privacyUrl
      ? ' <a href="' + escAttr(cfg.privacyUrl) + '">' + t('learnMore') + '</a>'
      : '';

    var rtl = isRTL() ? ' dir="rtl"' : '';

    // Backdrop (for modal)
    var backdrop = document.createElement('div');
    backdrop.className = 'wl-cc-backdrop';
    backdrop.id = 'wl-cc-backdrop';
    backdrop.onclick = function() {}; // don't close on click for GDPR

    // Banner
    var box = document.createElement('div');
    box.className = 'wl-cc-box wl-cc-' + cfg.position;
    box.id = 'wl-cc-box';
    // #387 — Un dialogue de consentement doit etre atteignable et quittable au
    // clavier. `aria-modal` sort le reste de la page de l'arbre d'accessibilite,
    // le piege a focus empeche de tabuler derriere le bandeau, et Echap vaut
    // refus : un lecteur d'ecran ne doit pas etre le seul a rester coince.
    box.setAttribute('role', 'dialog');
    // `aria-modal` et le piege a focus n'ont de sens QUE si la page est
    // reellement inerte derriere — c'est-a-dire en position `modal`, la seule
    // qui pose un fond bloquant. En `popup` ou en banniere, les declarer
    // enfermerait le clavier et le lecteur d'ecran dans un bandeau que la
    // souris, elle, peut contourner : un piege qui ne frappe que ceux qui
    // n'ont pas le choix. Et un consentement dont on ne peut pas s'echapper
    // n'est pas libre.
    if (cfg.position === 'modal') box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', t('title'));
    box.style.cssText = vars + ';background:var(--wl-cc-bg);color:var(--wl-cc-fg)';

    box.innerHTML = '<div' + rtl + '>' +
      '<div class="wl-cc-ttl">🍪 ' + t('title') + '</div>' +
      '<div class="wl-cc-dsc">' + t('desc') + learnMoreLink + '</div>' +
      '<div class="wl-cc-cats' + (reopenMode ? ' wl-cc-exp' : '') + '" id="wl-cc-cats">' +
        buildCategory(t('necessary'), t('necessaryDesc'), 'necessary', true, true) +
        buildCategory(t('analytics'), t('analyticsDesc'), 'analytics', !!initialChecks.analytics, false) +
        buildCategory(t('marketing'), t('marketingDesc'), 'marketing', !!initialChecks.marketing, false) +
      '</div>' +
      '<div class="wl-cc-btns">' +
        '<button class="wl-cc-btn wl-cc-ba" id="wl-cc-accept">' + t('accept') + '</button>' +
        '<button class="wl-cc-btn wl-cc-br" id="wl-cc-reject">' + t('reject') + '</button>' +
        '<button class="wl-cc-btn wl-cc-bs" id="wl-cc-settings">' + (reopenMode ? t('save') : t('settings')) + '</button>' +
      '</div>' +
      // rel MUST keep nofollow: a sitewide keyword-anchored link injected into every
      // embedding site is the textbook shape of Google's widget link-spam policy.
      // This channel's value is humans and brand searches, never PageRank.
      (cfg.noBranding ? '' : '<div class="wl-cc-brd">' + t('branding') + ' <a href="https://weblegal.ai/?utm_source=ccb&utm_medium=branding&utm_campaign=powered_by" target="_blank" rel="nofollow noopener">WebLegal.ai</a></div>') +
    '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(box);

    // WCAG 2.4.3 / 2.4.11 (2026-09-29) — hors mode modal, le bandeau arrive en FIN de
    // <body> et ne prend pas le focus (ne pas voler le curseur). Pour qu'un utilisateur
    // clavier l'atteigne vite et que le bandeau fixe ne masque pas l'element focalise,
    // on AJOUTE, sans rien deplacer :
    //  - un lien d'evitement en tete de <body>, invisible sauf au focus clavier
    //    (position fixe : aucun effet sur la mise en page du site hote) ;
    //  - un scroll-padding-bottom egal a la hauteur du bandeau, pour que l'element
    //    focalise defile au-dessus de lui. Les deux sont retires des la fermeture.
    if (cfg.position !== 'modal' && !reopenMode) {
      var skip = document.createElement('a');
      skip.className = 'wl-cc-skip';
      skip.id = 'wl-cc-skip';
      skip.href = '#wl-cc-box';
      skip.textContent = t('skipToBanner');
      if (isRTL()) skip.setAttribute('dir', 'rtl');
      skip.addEventListener('click', function(e) {
        e.preventDefault();
        var cible = document.getElementById('wl-cc-accept');
        if (cible) try { cible.focus(); } catch (err) {}
      });
      document.body.insertBefore(skip, document.body.firstChild);
      document.addEventListener('focusin', focusSousBandeau);
    }

    // Events
    document.getElementById('wl-cc-accept').onclick = function() { saveAndClose({ necessary: true, analytics: true, marketing: true }); };
    document.getElementById('wl-cc-reject').onclick = function() { saveAndClose({ necessary: true, analytics: false, marketing: false }); };

    // #387 — clavier.
    var estModal = cfg.position === 'modal';
    box.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // En REOUVERTURE, Echap referme sans rien enregistrer. Le traiter comme
        // un refus effacerait le consentement d'un visiteur venu simplement
        // regarder ses reglages — et declencherait la purge avec. Une touche
        // banale ne doit pas detruire un choix deja fait.
        if (reopenMode) { fermerBandeau(); return; }
        // A la premiere visite il n'y a rien a preserver : Echap vaut refus,
        // et non fermeture muette, sinon le bandeau revient a chaque page.
        saveAndClose({ necessary: true, analytics: false, marketing: false });
        return;
      }
      // Le piege a focus n'existe qu'en modal (cf. plus haut) : ailleurs, la
      // page reste accessible et le clavier doit pouvoir en sortir.
      if (e.key !== 'Tab' || !estModal) return;
      // On ecarte les elements desactives (l'interrupteur `necessary`) et invisibles
      // (categories repliees), qui ne recoivent jamais le focus et casseraient la
      // boucle Shift+Tab ; les interrupteurs en opacity:0 restent focusables.
      var f = Array.prototype.filter.call(
        box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function(el) { return !el.disabled && el.getClientRects().length; });
      if (!f.length) return;
      var premier = f[0], dernier = f[f.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });
    // Le focus entre d'office dans un dialogue modal — et en REOUVERTURE, quelle
    // que soit la position : le bouton qu'on vient d'activer est supprime, et Echap
    // doit rester actif dans la boite. Rouvrir est un geste volontaire ; y porter le
    // focus est le comportement ARIA attendu. Ailleurs on s'en abstient : le
    // bandeau s'affiche apres un fetch de traductions, parfois bien apres
    // l'interactivite, et le voler arracherait le curseur a quelqu'un qui saisit.
    if (estModal || reopenMode) setTimeout(function() {
      var cible = document.getElementById('wl-cc-accept');
      if (cible) try { cible.focus(); } catch (e) {}
    }, 50);

    function saveFromToggles() {
      saveAndClose({
        necessary: true,
        analytics: !!document.getElementById('wl-cc-t-analytics').checked,
        marketing: !!document.getElementById('wl-cc-t-marketing').checked,
      });
    }

    var settingsBtn = document.getElementById('wl-cc-settings');
    if (reopenMode) {
      // Reopen: categories already expanded, button is "Save", click saves toggles
      settingsBtn.onclick = saveFromToggles;
    } else {
      // Initial visit: click toggles the customize section
      settingsBtn.onclick = function() {
        var cats = document.getElementById('wl-cc-cats');
        var btn = document.getElementById('wl-cc-settings');
        cats.classList.toggle('wl-cc-exp');
        btn.textContent = cats.classList.contains('wl-cc-exp') ? t('save') : t('settings');
        if (cats.classList.contains('wl-cc-exp')) {
          btn.onclick = saveFromToggles;
        }
      };
    }

    // Show with delay — use setTimeout fallback for background tabs where rAF doesn't fire
    var shown = false;
    function showBanner() {
      if (shown) return;
      shown = true;
      box.classList.add('wl-cc-show');
      if (cfg.position !== 'modal') {
        var hs = document.documentElement;
        if (hs.dataset.wlCcSp === undefined) hs.dataset.wlCcSp = hs.style.scrollPaddingBottom || '';
        // Du haut du bandeau au bas de l'ecran (le popup est decolle du bord) + 8 px.
        hs.style.scrollPaddingBottom = (window.innerHeight - box.offsetTop + 8) + 'px';
      }
      if (cfg.position === 'modal') {
        backdrop.classList.add('wl-cc-show');
        var h = document.documentElement;
        h.dataset.wlCcOv = h.style.overflow || '';
        h.style.overflow = 'hidden';
      }
    }
    requestAnimationFrame(function() { requestAnimationFrame(showBanner); });
    setTimeout(showBanner, 100);
  }

  function buildCategory(name, desc, id, checked, disabled) {
    // Le <label> qui enveloppe l'interrupteur ne contient que le curseur visuel :
    // le nom accessible vient de l'intitule de la categorie, la description est
    // rattachee par aria-describedby.
    var idDesc = 'wl-cc-d-' + id;
    return '<div class="wl-cc-cat"><div><div class="wl-cc-cn">' + name + '</div>' +
      '<div class="wl-cc-cd" id="' + idDesc + '">' + desc + '</div></div>' +
      '<label class="wl-cc-tg"><input type="checkbox" id="wl-cc-t-' + id + '"' +
      ' aria-label="' + escAttr(name) + '" aria-describedby="' + idDesc + '"' +
      (checked ? ' checked' : '') + (disabled ? ' disabled' : '') +
      '><span class="wl-cc-sl" aria-hidden="true"></span></label></div>';
  }

  // Fermeture SANS enregistrement — le geste d'un visiteur qui referme ses
  // reglages sans rien changer. Separe de saveAndClose pour que la difference
  // soit lisible : l'un ecrit un choix, l'autre n'ecrit rien.
  // 2.4.11 : un element focalise tout en fin de page ne peut pas defiler au-dessus du
  // bandeau fixe (scroll-padding ne cree pas de place qui n'existe pas). Seulement dans
  // ce cas — focus clavier sous le bandeau — on ajoute la place manquante en bas de
  // <body>, le temps que le bandeau soit affiche. Aucun effet pour la souris.
  function focusSousBandeau(e) {
    var box = document.getElementById('wl-cc-box');
    if (!box || !e.target || !e.target.getBoundingClientRect || box.contains(e.target) || e.target.id === 'wl-cc-skip') return;
    var r = e.target.getBoundingClientRect(), bx = box.getBoundingClientRect();
    if (!(r.bottom > bx.top && r.top < bx.bottom && r.right > bx.left && r.left < bx.right)) return;
    var bd = document.body;
    if (bd.dataset.wlCcPb === undefined) {
      bd.dataset.wlCcPb = bd.style.paddingBottom || '';
      var base = parseFloat(getComputedStyle(bd).paddingBottom) || 0;
      bd.style.paddingBottom = (base + window.innerHeight - box.offsetTop + 8) + 'px';
    }
    try { e.target.scrollIntoView({ block: 'nearest' }); } catch (err) {}
  }

  // Retire les aides clavier posees a l'affichage (lien d'evitement, scroll-padding,
  // place ajoutee en bas de page).
  function retirerAidesClavier() {
    document.removeEventListener('focusin', focusSousBandeau);
    var bd = document.body;
    if (bd.dataset.wlCcPb !== undefined) { bd.style.paddingBottom = bd.dataset.wlCcPb; delete bd.dataset.wlCcPb; }
    var sk = document.getElementById('wl-cc-skip');
    if (sk) sk.remove();
    var h = document.documentElement;
    if (h.dataset.wlCcSp !== undefined) { h.style.scrollPaddingBottom = h.dataset.wlCcSp; delete h.dataset.wlCcSp; }
  }

  function fermerBandeau() {
    retirerAidesClavier();
    var box = document.getElementById('wl-cc-box');
    var backdrop = document.getElementById('wl-cc-backdrop');
    if (box) { box.classList.remove('wl-cc-show'); setTimeout(function() { box.remove(); }, 400); }
    if (backdrop) { backdrop.classList.remove('wl-cc-show'); setTimeout(function() { backdrop.remove(); }, 400); }
    var h = document.documentElement;
    if (h.dataset.wlCcOv !== undefined) { h.style.overflow = h.dataset.wlCcOv; delete h.dataset.wlCcOv; }
    // Indispensable : doReopenBanner() a SUPPRIME le bouton flottant en ouvrant
    // le panneau. On le remet en refermant, Echap compris : l'article 7-3 veut que
    // le retrait reste aussi simple que le consentement.
    setTimeout(injectReopenButton, 420);
  }

  function saveAndClose(consent) {
    setConsent(consent);
    retirerAidesClavier();
    var box = document.getElementById('wl-cc-box');
    var backdrop = document.getElementById('wl-cc-backdrop');
    if (box) { box.classList.remove('wl-cc-show'); setTimeout(function() { box.remove(); }, 400); }
    if (backdrop) { backdrop.classList.remove('wl-cc-show'); setTimeout(function() { backdrop.remove(); }, 400); }
    var h = document.documentElement;
    if (h.dataset.wlCcOv !== undefined) { h.style.overflow = h.dataset.wlCcOv; delete h.dataset.wlCcOv; }
    // Inject the persistent reopen button once consent is saved
    setTimeout(injectReopenButton, 420);
  }

  // ── Reopen button (GDPR art. 7.3 — withdrawal as easy as consent) ──
  // Inlined labels (not fetched from translations JSON) because the button is
  // injected on every page load where consent already exists — fetching 33 KB
  // of translations just for one aria-label would be a pointless hot-path cost.
  var REOPEN_LABELS = {
    ar: 'إعدادات ملفات تعريف الارتباط',
    bg: 'Настройки за бисквитки',
    cs: 'Nastavení cookies',
    da: 'Cookie-indstillinger',
    de: 'Cookie-Einstellungen',
    el: 'Ρυθμίσεις cookies',
    en: 'Cookie settings',
    es: 'Configuración de cookies',
    fi: 'Evästeasetukset',
    fr: 'Préférences cookies',
    hi: 'कुकी सेटिंग्स',
    hr: 'Postavke kolačića',
    hu: 'Süti beállítások',
    it: 'Impostazioni cookie',
    ja: 'Cookieの設定',
    ko: '쿠키 설정',
    lt: 'Slapukų nustatymai',
    lv: 'Sīkdatņu iestatījumi',
    nl: 'Cookie-instellingen',
    pl: 'Ustawienia plików cookie',
    pt: 'Configurações de cookies',
    ro: 'Setări cookie',
    ru: 'Настройки cookie',
    sk: 'Nastavenia cookies',
    sv: 'Cookie-inställningar',
    th: 'การตั้งค่าคุกกี้',
    tr: 'Çerez ayarları',
    uk: 'Налаштування cookie',
    vi: 'Cài đặt cookie',
    zh: 'Cookie 设置'
  };

  function getReopenLabel() {
    var lang = detectLang();
    var T = C.T();
    if (T && T[lang] && T[lang].reopenLabel) return T[lang].reopenLabel;
    return REOPEN_LABELS[lang] || REOPEN_LABELS.en;
  }

  // Inline SVG cookie icon (lucide-based, MIT). currentColor inherits from CSS.
  var COOKIE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>' +
      '<path d="M8.5 8.5v.01"/>' +
      '<path d="M16 15.5v.01"/>' +
      '<path d="M12 12v.01"/>' +
      '<path d="M11 17v.01"/>' +
      '<path d="M7 14v.01"/>' +
    '</svg>';

  // Pick black or white for best contrast against the accent background
  // (perceived luminance ~ sRGB). Used for both the SVG (currentColor) and
  // the border so the button stays visible even if the host page bg matches
  // the accent color. See #162.
  function pickContrastColor(hex) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length !== 6) return '#ffffff';
    var r = parseInt(h.substr(0, 2), 16);
    var g = parseInt(h.substr(2, 2), 16);
    var b = parseInt(h.substr(4, 2), 16);
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#1e293b' : '#ffffff';
  }

  // Issue #165 — auto-detect a bar at the viewport bottom that occludes the
  // reopen button (sticky footer, fixed CTA, flex-pinned nav, etc.) and push
  // the button above it via --wl-cc-reopen-sticky-offset. Uses elementFromPoint
  // so it works regardless of how the bar is pinned (position:fixed, sticky,
  // flex-grown, grid-template-rows, …).
  function recalcStickyOffset() {
    var btn = document.getElementById('wl-cc-reopen');
    if (!btn) return;
    // Reset to base position so the probe hits the button's *default* location
    btn.style.setProperty('--wl-cc-reopen-sticky-offset', '0px');
    btn.style.visibility = 'hidden';
    void btn.offsetHeight; // force reflow
    var btnRect = btn.getBoundingClientRect();
    var vh = window.innerHeight;
    var x = Math.round(btnRect.left + btnRect.width / 2);
    var y = Math.round(btnRect.top + btnRect.height / 2);
    var el = document.elementFromPoint(x, y);
    btn.style.visibility = '';
    var maxH = 0;
    if (el && el !== document.body && el !== document.documentElement && !el.contains(btn)) {
      // Walk up to find the outermost bar-like ancestor at the viewport bottom
      var walk = el;
      for (var d = 0; d < 10 && walk && walk !== document.body && walk !== document.documentElement; d++) {
        var r = walk.getBoundingClientRect();
        if (r.bottom >= vh - 5 && r.top < vh && r.height >= 20 && r.height <= 200 && r.width >= 100) {
          if (r.height > maxH) maxH = r.height;
        }
        walk = walk.parentElement;
      }
    }
    btn.style.setProperty('--wl-cc-reopen-sticky-offset', maxH > 0 ? Math.ceil(maxH + 8) + 'px' : '0px');
  }
  var _stickyRecalcTimer = null;
  function scheduleStickyRecalc() {
    if (_stickyRecalcTimer) clearTimeout(_stickyRecalcTimer);
    _stickyRecalcTimer = setTimeout(recalcStickyOffset, 150);
  }

  function injectReopenButton() {
    if (window.self !== window.top) return; // #281: no reopen button inside an iframe
    if (cfg.reopenPosition === 'hidden') return;
    if (document.getElementById('wl-cc-reopen')) return;
    var pos = (cfg.reopenPosition === 'bottom-right') ? 'bottom-right' : 'bottom-left';
    var btn = document.createElement('button');
    btn.id = 'wl-cc-reopen';
    btn.type = 'button';
    btn.className = 'wl-cc-reopen wl-cc-reopen-' + pos;
    var label = getReopenLabel();
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.style.setProperty('--wl-cc-reopen-bg', cfg.color);
    // SVG + border inherit currentColor; set via CSS custom property
    btn.style.color = pickContrastColor(cfg.color);
    btn.innerHTML = COOKIE_SVG;
    btn.onclick = function(e) { e.preventDefault(); reopenBanner(); };
    document.body.appendChild(btn);
    // Fade in on next frame
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        btn.classList.add('wl-cc-show');
        recalcStickyOffset();
      });
    });
    // Re-run detection when viewport changes (sticky bars may appear/disappear)
    window.addEventListener('resize', scheduleStickyRecalc);
    window.addEventListener('orientationchange', scheduleStickyRecalc);
    if (cfg.reopenScroll === 'hide') watchReopenScroll();
  }

  // Le bouton s'efface quand on descend dans la page et revient quand on remonte, en haut
  // de page, ou quand le clavier l'atteint (:focus en CSS) : il reste joignable a tout
  // moment (art. 7(3) RGPD) sans couvrir le contenu pendant la lecture.
  var _reopenScrollWatched = false;
  function watchReopenScroll() {
    if (_reopenScrollWatched) return;
    _reopenScrollWatched = true;
    var lastY = window.pageYOffset || 0, ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        ticking = false;
        var btn = document.getElementById('wl-cc-reopen');
        var y = window.pageYOffset || 0;
        if (!btn) { lastY = y; return; }
        if (y <= 100 || y < lastY - 4) btn.classList.remove('wl-cc-away');
        else if (y > lastY + 4) btn.classList.add('wl-cc-away');
        lastY = y;
      });
    }, { passive: true });
  }

  function hideReopenButton() {
    var btn = document.getElementById('wl-cc-reopen');
    if (btn) btn.remove();
  }

  // #331 (CCPA §7025) — when GPC auto-processed the opt-out, tell the user (the
  // reject is otherwise silent). Once per browser, dismissable, auto-hides;
  // disable with data-gpc-notice="off". Purely informational — the blocking has
  // already run before this is called, so any failure here changes nothing.
  function maybeShowGpcNotice() {
    if (!cfg.gpcNotice) return;
    if (window.self !== window.top) return; // never inside an iframe
    try { if (localStorage.getItem('wl-cc-gpc-ack') === '1') return; } catch (e) {}
    if (document.getElementById('wl-cc-gpc')) return;
    try {
      // Build the element IMMEDIATELY (not inside the translations fetch): a
      // background-tab load freezes that fetch, which would otherwise mean the
      // notice never renders. Text uses t() — inline EN fallback until the
      // JSON loads, then upgraded in place, so there is no dependency on the
      // network for the notice to exist.
      var el = document.createElement('div');
      el.id = 'wl-cc-gpc';
      el.className = 'wl-cc-gpc';
      el.setAttribute('role', 'status');
      el.style.cssText = isDarkMode()
        ? 'background:#1e293b;color:#f1f5f9;border:1px solid #475569'
        : 'background:#ffffff;color:#1e293b;border:1px solid #e2e8f0';
      // Texte du lien « Gerer » : couleur de marque rendue lisible (4,5:1), cf. buildBanner.
      el.style.setProperty('--wl-cc-gpc-a', texteLisible(cfg.color, isDarkMode() ? '#1e293b' : '#ffffff', isDarkMode()));

      var ico = document.createElement('span');
      ico.className = 'wl-cc-gpc-ico';
      ico.setAttribute('aria-hidden', 'true');
      ico.textContent = '🛡️';

      var body = document.createElement('span');
      var textNode = document.createElement('span');
      textNode.className = 'wl-cc-gpc-text';
      textNode.dir = 'auto'; // bidi isolation for RTL languages (ar)
      body.appendChild(textNode);

      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'wl-cc-gpc-x';
      x.textContent = '×';

      el.appendChild(ico);
      el.appendChild(body);
      el.appendChild(x);
      document.body.appendChild(el);

      var remove = function () {
        el.classList.remove('wl-cc-show');
        setTimeout(function () { if (el.parentNode) el.remove(); }, 300);
      };
      x.onclick = remove;

      // Fill (and re-fill once translations load) without rebuilding structure.
      var fill = function () {
        textNode.textContent = t('gpcNotice');
        x.setAttribute('aria-label', t('gpcDismiss'));
        if (cfg.privacyUrl && !body.querySelector('.wl-cc-gpc-manage')) {
          var mng = document.createElement('button');
          mng.type = 'button';
          mng.className = 'wl-cc-gpc-manage';
          mng.onclick = function () { remove(); reopenBanner(); };
          body.appendChild(document.createTextNode(' '));
          body.appendChild(mng);
        }
        var m = body.querySelector('.wl-cc-gpc-manage');
        if (m) m.textContent = t('gpcManage');
      };
      fill(); // inline EN fallback immediately

      var shown = false;
      // Reveal ONLY when the tab is actually visible, and ack + arm the
      // auto-hide only then — so a background-tab load can't silently
      // self-acknowledge an invisible notice the user never saw.
      var show = function () {
        if (shown || !el.parentNode) return;
        if (document.hidden) {
          document.addEventListener('visibilitychange', function onVis() {
            if (!document.hidden) { document.removeEventListener('visibilitychange', onVis); show(); }
          });
          return;
        }
        shown = true;
        el.classList.add('wl-cc-show');
        try { localStorage.setItem('wl-cc-gpc-ack', '1'); } catch (e) {}
        setTimeout(remove, 9000);
      };

      // Prefer the user's language: show once translations arrive; but never
      // block on them — a 1.2 s fallback shows the EN version if the fetch is
      // slow or frozen. Either way, show() waits for tab visibility.
      var settled = false;
      var settleThenShow = function () { if (settled) return; settled = true; fill(); show(); };
      loadTranslationsThen(settleThenShow);
      setTimeout(settleThenShow, 1200);
    } catch (e) {}
  }

  function reopenBanner() {
    if (window.self !== window.top) return; // #281: defensive — no consent UI inside an iframe
    // Lazy-load translations on first reopen — init() skipped the fetch to
    // keep the hot path (pages with existing consent) cheap. Now we need
    // the full translations to rebuild the banner text.
    if (!C.T()) {
      loadTranslationsThen(doReopenBanner);
    } else {
      doReopenBanner();
    }
  }

  function doReopenBanner() {
    var consent = getConsent() || { necessary: true, analytics: false, marketing: false };
    hideReopenButton();
    var existingBox = document.getElementById('wl-cc-box');
    var existingBackdrop = document.getElementById('wl-cc-backdrop');
    if (existingBox) existingBox.remove();
    if (existingBackdrop) existingBackdrop.remove();
    buildBanner(consent);
  }

  C.pret({
    injectCSS: injectCSS,
    buildBanner: buildBanner,
    injectReopenButton: injectReopenButton,
    hideReopenButton: hideReopenButton,
    maybeShowGpcNotice: maybeShowGpcNotice,
    reopenBanner: reopenBanner
  });
})();
