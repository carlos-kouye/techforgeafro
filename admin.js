/* ================================================================
   TechForgeAfro — admin.js
   Interface admin avec sidebar navigation
================================================================ */

var ADMIN_EMAIL = "contact.techforge@gmail.com";

document.addEventListener("DOMContentLoaded", function () {

  var supabase     = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var adminLogin   = document.getElementById("adminLogin");
  var adminPanneau = document.getElementById("adminPanneau");

  /* ── Dark mode ── */
  var htmlEl = document.documentElement;
  htmlEl.setAttribute("data-theme", localStorage.getItem("techforge-theme") || "light");
  var btnTheme = document.getElementById("toggleTheme");
  if (btnTheme) {
    btnTheme.addEventListener("click", function () {
      var t = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      htmlEl.setAttribute("data-theme", t);
      localStorage.setItem("techforge-theme", t);
    });
  }

  /* ── Notification toast ── */
  function afficherNotif(message, type) {
    var notif = document.createElement("div");
    notif.style.cssText = [
      "position:fixed", "top:1.2rem", "right:1.5rem", "z-index:9999",
      "padding:0.75rem 1.2rem", "border-radius:12px",
      "font-size:0.88rem", "font-weight:600",
      "font-family:'Manrope',sans-serif",
      "box-shadow:0 8px 24px rgba(0,0,0,0.12)",
      "display:flex", "align-items:center", "gap:0.5rem",
      "animation:slideIn 0.3s ease",
      type === "vert"
        ? "background:#dcfce7;color:#15803d;border:1px solid #bbf7d0;"
        : "background:#fee2e2;color:#dc2626;border:1px solid #fecaca;"
    ].join(";");
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(function () {
      notif.style.opacity = "0";
      notif.style.transition = "opacity 0.3s";
      setTimeout(function () { if (notif.parentNode) notif.parentNode.removeChild(notif); }, 300);
    }, 3000);
  }

  /* ── Toggle mot de passe ── */
  var toggleBtn = document.getElementById("toggleLoginMdp");
  var mdpInput  = document.getElementById("loginMdp");
  if (toggleBtn && mdpInput) {
    toggleBtn.addEventListener("click", function () {
      var v = mdpInput.type === "text";
      mdpInput.type = v ? "password" : "text";
      toggleBtn.innerHTML = v ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }

  /* ================================================================
     VÉRIFICATION SESSION
  ================================================================ */
  supabase.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (session && session.user.email === ADMIN_EMAIL) {
      ouvrirPanneau(session.user.email);
    } else {
      adminLogin.style.display  = "flex";
      adminPanneau.style.display = "none";
    }
  });

  /* ================================================================
     CONNEXION
  ================================================================ */
  var formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailEl = document.getElementById("loginEmail");
      var mdpEl   = document.getElementById("loginMdp");
      var errZone = document.getElementById("erreurLogin");
      var errTxt  = document.getElementById("erreurLoginTexte");
      var btn     = document.getElementById("btnLogin");
      var txt     = document.getElementById("btnLoginTexte");

      if (errZone) errZone.style.display = "none";
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Connexion...";

      var email = emailEl ? emailEl.value.trim() : "";
      var mdp   = mdpEl   ? mdpEl.value          : "";

      if (email !== ADMIN_EMAIL) {
        if (errZone) errZone.style.display = "flex";
        if (errTxt)  errTxt.textContent    = "Email non autorisé.";
        if (btn) btn.disabled = false;
        if (txt) txt.textContent = "Se connecter";
        return;
      }

      supabase.auth.signInWithPassword({ email: email, password: mdp })
        .then(function (res) {
          if (res.error) {
            if (errZone) errZone.style.display = "flex";
            if (errTxt)  errTxt.textContent    = "Email ou mot de passe incorrect.";
            if (btn) btn.disabled = false;
            if (txt) txt.textContent = "Se connecter";
            return;
          }
          if (res.data.user.email !== ADMIN_EMAIL) {
            supabase.auth.signOut();
            if (errZone) errZone.style.display = "flex";
            if (errTxt)  errTxt.textContent    = "Accès refusé.";
            if (btn) btn.disabled = false;
            if (txt) txt.textContent = "Se connecter";
            return;
          }
          ouvrirPanneau(res.data.user.email);
        })
        .catch(function () {
          if (errZone) errZone.style.display = "flex";
          if (errTxt)  errTxt.textContent    = "Erreur de connexion.";
          if (btn) btn.disabled = false;
          if (txt) txt.textContent = "Se connecter";
        });
    });
  }

  /* ================================================================
     DÉCONNEXION
  ================================================================ */
  var btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      supabase.auth.signOut().then(function () {
        adminPanneau.style.display = "none";
        adminLogin.style.display   = "flex";
        var em = document.getElementById("loginEmail");
        var mp = document.getElementById("loginMdp");
        if (em) em.value = "";
        if (mp) mp.value = "";
      });
    });
  }

  /* ================================================================
     OUVRIR LE PANNEAU
  ================================================================ */
  function ouvrirPanneau(email) {
    adminLogin.style.display   = "none";
    adminPanneau.style.display = "flex";
    var badge = document.getElementById("adminEmailBadge");
    if (badge) badge.textContent = email;

    /* Lire les valeurs sauvegardées */
    if (localStorage.getItem("tf-soumission-ouverte") !== null) {
      SOUMISSION_OUVERTE = localStorage.getItem("tf-soumission-ouverte") === "1";
    }
    if (localStorage.getItem("tf-classement-disponible") !== null) {
      CLASSEMENT_DISPONIBLE = localStorage.getItem("tf-classement-disponible") === "1";
    }
    if (localStorage.getItem("tf-date-limite")) {
      DATE_LIMITE = new Date(localStorage.getItem("tf-date-limite"));
    }

    chargerStats();
    chargerDerniersInscrits();
    mettreAJourStatuts();
    initialiserConfig();
  }

  /* ================================================================
     NAVIGATION SIDEBAR
  ================================================================ */
  var titres = {
    dashboard:   { titre: "Tableau de bord",   sous: "Vue d'ensemble de la saison" },
    inscrits:    { titre: "Inscrits",           sous: "Liste de tous les participants" },
    soumissions: { titre: "Soumissions",        sous: "Projets soumis par les participants" },
    classement:  { titre: "Classement",         sous: "Ajouter les résultats de la saison" },
    config:      { titre: "Configuration",      sous: "Paramètres de la saison en cours" }
  };

  function naviguer(section) {
    /* Nav items */
    document.querySelectorAll(".ap-nav-item").forEach(function (el) {
      el.classList.toggle("actif", el.getAttribute("data-section") === section);
    });
    /* Sections */
    document.querySelectorAll(".ap-section").forEach(function (el) {
      el.classList.toggle("actif", el.id === "sec-" + section);
    });
    /* Titre topbar */
    var info = titres[section] || {};
    var pt   = document.getElementById("pageTitre");
    var ps   = document.getElementById("pageSous");
    if (pt) pt.textContent = info.titre || "";
    if (ps) ps.textContent = info.sous  || "";

    /* Charger données si besoin */
    if (section === "inscrits")    chargerInscrits();
    if (section === "soumissions") chargerSoumissions();

    /* Fermer sidebar sur mobile */
    var sb = document.getElementById("sidebar");
    if (sb && window.innerWidth <= 768) sb.classList.remove("ouvert");
  }

  document.querySelectorAll(".ap-nav-item, .ap-lien-config").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var sec = el.getAttribute("data-section");
      if (sec) naviguer(sec);
    });
  });

  /* Hamburger mobile */
  var menuToggle = document.getElementById("menuToggle");
  var sidebar    = document.getElementById("sidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("ouvert");
    });
    /* Clic extérieur ferme sidebar */
    document.addEventListener("click", function (e) {
      if (sidebar.classList.contains("ouvert") &&
          !sidebar.contains(e.target) &&
          e.target !== menuToggle) {
        sidebar.classList.remove("ouvert");
      }
    });
  }

  /* ================================================================
     STATS + GRAPHE DONUT
  ================================================================ */
  var categories = [
    { key: "dev-web",            label: "Développement Web",    couleur: "#3B82F6" },
    { key: "ui-ux",              label: "UI/UX Design",         couleur: "#8b5cf6" },
    { key: "graphisme",          label: "Design Graphique",     couleur: "#ec4899" },
    { key: "ia-creativite",      label: "IA & Créativité",      couleur: "#f59e0b" },
    { key: "constructeur-plans", label: "Constructeur de plans",couleur: "#FF7A00" }
  ];

  function chargerStats() {
    /* Inscrits total */
    supabase.from("inscriptions").select("*", { count: "exact", head: true })
      .then(function (r) {
        var n = r.count || 0;
        var el = document.getElementById("statInscrits");
        if (el) el.textContent = n;
        var b = document.getElementById("badgeInscrits");
        if (b) b.textContent = n;
      });

    /* Soumissions total */
    supabase.from("soumissions").select("*", { count: "exact", head: true })
      .then(function (r) {
        var n = r.count || 0;
        var el = document.getElementById("statSoumissions");
        if (el) el.textContent = n;
        var b = document.getElementById("badgeSoumissions");
        if (b) b.textContent = n;
      });

    /* Répartition par catégorie pour le donut */
    supabase.from("inscriptions").select("categorie")
      .then(function (res) {
        if (res.error || !res.data) return;

        var compteurs = {};
        categories.forEach(function (c) { compteurs[c.key] = 0; });
        res.data.forEach(function (row) {
          if (compteurs[row.categorie] !== undefined) compteurs[row.categorie]++;
          else compteurs[row.categorie] = (compteurs[row.categorie] || 0) + 1;
        });

        var total = res.data.length;
        var donutEl = document.getElementById("donutTotal");
        if (donutEl) donutEl.textContent = total;

        /* Dessiner le donut */
        dessinerDonut(compteurs, total);

        /* Légende */
        var legende = document.getElementById("legendeCategories");
        if (legende) {
          legende.innerHTML = categories.map(function (c) {
            var val = compteurs[c.key] || 0;
            var pct = total > 0 ? Math.round(val / total * 100) : 0;
            return '<div class="ap-legende-item">' +
              '<div class="ap-legende-couleur" style="background:' + c.couleur + ';"></div>' +
              '<span class="ap-legende-nom">' + c.label + '</span>' +
              '<span class="ap-legende-val">' + val + '</span>' +
              '<span class="ap-legende-pct">(' + pct + '%)</span>' +
            '</div>';
          }).join("");
        }
      });
  }

  function dessinerDonut(compteurs, total) {
    var canvas = document.getElementById("donutChart");
    if (!canvas || !canvas.getContext) return;
    var ctx  = canvas.getContext("2d");
    var cx   = 80; var cy = 80;
    var rExt = 70; var rInt = 48;
    var start = -Math.PI / 2;

    ctx.clearRect(0, 0, 160, 160);

    if (total === 0) {
      /* Cercle gris si vide */
      ctx.beginPath();
      ctx.arc(cx, cy, rExt, 0, Math.PI * 2);
      ctx.arc(cx, cy, rInt, Math.PI * 2, 0, true);
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();
      return;
    }

    categories.forEach(function (c) {
      var val = compteurs[c.key] || 0;
      if (val === 0) return;
      var angle = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rExt, start, start + angle);
      ctx.arc(cx, cy, rInt, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = c.couleur;
      ctx.fill();
      /* Espace entre segments */
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      start += angle;
    });
  }

  /* ================================================================
     DERNIERS INSCRITS (dashboard)
  ================================================================ */
  function chargerDerniersInscrits() {
    var zone = document.getElementById("derniersInscrits");
    if (!zone) return;

    supabase.from("inscriptions").select("*").order("created_at", { ascending: false }).limit(5)
      .then(function (res) {
        if (res.error || !res.data || res.data.length === 0) {
          zone.innerHTML = '<p class="ap-vide"><i class="fa-solid fa-inbox"></i> Aucun inscrit.</p>';
          return;
        }
        zone.innerHTML = res.data.map(function (row) {
          var initiale = (row.nom || "?").charAt(0).toUpperCase();
          var date     = new Date(row.created_at).toLocaleDateString("fr-FR");
          var cat      = row.categorie || "—";
          return '<div class="ap-mini-ligne">' +
            '<div class="ap-mini-avatar">' + initiale + '</div>' +
            '<div class="ap-mini-info">' +
              '<div class="ap-mini-nom">' + (row.nom || "—") + '</div>' +
              '<div class="ap-mini-cat">' + cat + '</div>' +
            '</div>' +
            '<div class="ap-mini-date">' + date + '</div>' +
          '</div>';
        }).join("");
      });
  }

  /* ================================================================
     LISTE INSCRITS
  ================================================================ */
  function chargerInscrits() {
    var loading = document.getElementById("loadingInscrits");
    var tableau = document.getElementById("tableauInscrits");
    var tbody   = document.getElementById("tbodyInscrits");
    var vide    = document.getElementById("videInscrits");

    if (!loading || !tbody) return;
    loading.style.display = "flex";
    if (tableau) tableau.style.display = "none";
    if (vide)    vide.style.display    = "none";

    supabase.from("inscriptions").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        loading.style.display = "none";
        if (res.error || !res.data || res.data.length === 0) {
          if (vide) vide.style.display = "flex";
          return;
        }
        if (tableau) tableau.style.display = "table";
        tbody.innerHTML = res.data.map(function (row) {
          var date = new Date(row.created_at).toLocaleDateString("fr-FR");
          return "<tr><td>" + date + "</td><td>" + (row.nom||"—") + "</td><td>" +
            (row.email||"—") + "</td><td>" + (row.universite||"—") + "</td><td>" +
            (row.niveau||"—") + "</td><td>" + (row.categorie||"—") + "</td></tr>";
        }).join("");
      });
  }

  var btnRefI = document.getElementById("btnRefreshInscrits");
  if (btnRefI) btnRefI.addEventListener("click", chargerInscrits);

  /* ================================================================
     LISTE SOUMISSIONS
  ================================================================ */
  function chargerSoumissions() {
    var loading = document.getElementById("loadingSoumissions");
    var tableau = document.getElementById("tableauSoumissions");
    var tbody   = document.getElementById("tbodySoumissions");
    var vide    = document.getElementById("videSoumissions");

    if (!loading || !tbody) return;
    loading.style.display = "flex";
    if (tableau) tableau.style.display = "none";
    if (vide)    vide.style.display    = "none";

    supabase.from("soumissions").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        loading.style.display = "none";
        if (res.error || !res.data || res.data.length === 0) {
          if (vide) vide.style.display = "flex";
          return;
        }
        if (tableau) tableau.style.display = "table";
        tbody.innerHTML = res.data.map(function (row) {
          var date = new Date(row.created_at).toLocaleDateString("fr-FR");
          var lien = row.lien_principal ? "<a href='" + row.lien_principal + "' target='_blank'>Voir</a>" : "—";
          var sup  = row.lien_supp      ? "<a href='" + row.lien_supp      + "' target='_blank'>Voir</a>" : "—";
          return "<tr><td>" + date + "</td><td>" + (row.nom||"—") + "</td><td>" +
            (row.categorie||"—") + "</td><td>" + lien + "</td><td>" + sup +
            "</td><td>" + (row.commentaire ? row.commentaire.substring(0,60) + "..." : "—") + "</td></tr>";
        }).join("");
      });
  }

  var btnRefS = document.getElementById("btnRefreshSoumissions");
  if (btnRefS) btnRefS.addEventListener("click", chargerSoumissions);

  /* ================================================================
     AJOUTER SCORE
  ================================================================ */
  var formScore = document.getElementById("formScore");
  if (formScore) {
    formScore.addEventListener("submit", function (e) {
      e.preventDefault();
      var rang  = document.getElementById("scoreRang");
      var nom   = document.getElementById("scoreNom");
      var cat   = document.getElementById("scoreCategorie");
      var score = document.getElementById("scoreValeur");
      var lien  = document.getElementById("scoreLien");
      var sais  = document.getElementById("scoreSaison");
      var btn   = document.getElementById("btnAjouterScore");
      var succ  = document.getElementById("msgScoreSucces");

      if (!rang.value || !nom.value || !cat.value) {
        alert("Rang, nom et catégorie sont obligatoires.");
        return;
      }
      if (btn) btn.disabled = true;
      if (succ) succ.style.display = "none";

      supabase.from("classement").insert([{
        rang:        parseInt(rang.value),
        nom:         nom.value.trim(),
        categorie:   cat.value,
        score:       score.value ? parseInt(score.value) : null,
        lien_projet: lien.value.trim() || null,
        saison:      sais.value.trim() || "Saison 1"
      }]).then(function (res) {
        if (res.error) { alert("Erreur : " + res.error.message); if (btn) btn.disabled = false; return; }
        if (succ) succ.style.display = "inline-flex";
        formScore.reset();
        if (btn) btn.disabled = false;
        setTimeout(function () { if (succ) succ.style.display = "none"; }, 3000);
      }).catch(function () { alert("Erreur de connexion."); if (btn) btn.disabled = false; });
    });
  }

  /* ================================================================
     CONFIGURATION
  ================================================================ */
  function mettreAJourStatuts() {
    var ss = document.getElementById("statutSoumission");
    var sc = document.getElementById("statutClassement");
    var sd = document.getElementById("statutDate");

    if (ss) {
      ss.textContent = SOUMISSION_OUVERTE ? "Ouvertes" : "Fermées";
      ss.className   = "ap-badge-statut " + (SOUMISSION_OUVERTE ? "vert" : "rouge");
    }
    if (sc) {
      sc.textContent = CLASSEMENT_DISPONIBLE ? "Visible" : "Masqué";
      sc.className   = "ap-badge-statut " + (CLASSEMENT_DISPONIBLE ? "vert" : "rouge");
    }
    if (sd) {
      var d = DATE_LIMITE;
      sd.textContent = d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
  }

  function initialiserConfig() {
    var tSou = document.getElementById("toggleSoumission");
    var tCla = document.getElementById("toggleClassement");
    var dLim = document.getElementById("dateLimite");

    if (tSou) {
      tSou.checked = SOUMISSION_OUVERTE;
      tSou.addEventListener("change", function () {
        SOUMISSION_OUVERTE = tSou.checked;
        localStorage.setItem("tf-soumission-ouverte", SOUMISSION_OUVERTE ? "1" : "0");
        mettreAJourStatuts();
        var msg = SOUMISSION_OUVERTE ? "✅ Soumissions ouvertes !" : "🔒 Soumissions fermées.";
        afficherNotif(msg, SOUMISSION_OUVERTE ? "vert" : "rouge");
      });
    }
    if (tCla) {
      tCla.checked = CLASSEMENT_DISPONIBLE;
      tCla.addEventListener("change", function () {
        CLASSEMENT_DISPONIBLE = tCla.checked;
        localStorage.setItem("tf-classement-disponible", CLASSEMENT_DISPONIBLE ? "1" : "0");
        mettreAJourStatuts();
        var msg = CLASSEMENT_DISPONIBLE ? "✅ Classement visible !" : "🔒 Classement masqué.";
        afficherNotif(msg, CLASSEMENT_DISPONIBLE ? "vert" : "rouge");
      });
    }
    if (dLim) {
      var d = DATE_LIMITE;
      var pad = function (n) { return String(n).padStart(2, "0"); };
      dLim.value = d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) +
                   "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
    }

    var btnDate = document.getElementById("btnSauverDate");
    if (btnDate && dLim) {
      btnDate.addEventListener("click", function () {
        if (dLim.value) {
          DATE_LIMITE = new Date(dLim.value);
          localStorage.setItem("tf-date-limite", dLim.value);
          mettreAJourStatuts();
          afficherNotif("✅ Date limite sauvegardée !", "vert");
        }
      });
    }
  }

}); // Fin DOMContentLoaded