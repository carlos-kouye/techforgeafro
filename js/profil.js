/* ================================================================
   TechForgeAfro — profil.js
   Gère la page profil — lecture données Supabase
   Chargé sur : profil.html uniquement
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase          = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var profilContenu     = document.getElementById("profilContenu");
  var profilNonConnecte = document.getElementById("profilNonConnecte");
  var profilConnexion   = document.getElementById("profilConnexion");

  /* ── Vérifie si l'utilisateur est connecté ── */
  supabase.auth.getSession().then(function (res) {
    var session = res.data.session;

    if (!session) {
      /* Pas connecté — affiche formulaire connexion */
      if (profilNonConnecte) profilNonConnecte.style.display = "none";
      if (profilContenu)     profilContenu.style.display     = "none";
      if (profilConnexion)   profilConnexion.style.display   = "flex";
      return;
    }

    /* Connecté — charge les données */
    chargerProfil(session.user.id);
  });


  function chargerProfil(userId) {
    /* Affiche d'abord les données locales pour rapidité */
    afficherDonneesLocales();

    /* Puis charge depuis Supabase pour avoir les vraies données à jour */
    supabase.from("inscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(function (res) {
        if (res.error || !res.data) {
          console.error("Erreur chargement profil:", res.error);
          return;
        }

        var data = res.data;

        /* Met à jour localStorage */
        localStorage.setItem("techforge-connecte",  "oui");
        localStorage.setItem("techforge-nom",        data.nom);
        localStorage.setItem("techforge-email",      data.email);
        localStorage.setItem("techforge-universite", data.universite);
        localStorage.setItem("techforge-niveau",     data.niveau);
        localStorage.setItem("techforge-categorie",  data.categorie);

        /* Affiche les données */
        afficherDonnees(data);

        /* Vérifie si une soumission existe */
        return supabase.from("soumissions")
          .select("id, created_at")
          .eq("user_id", userId)
          .single();
      })
      .then(function (res) {
        if (!res || res.error) return;
        if (res.data) {
          localStorage.setItem("techforge-soumis", "oui");
          var statutSou = document.getElementById("statutSoumission");
          if (statutSou) statutSou.textContent = "Projet soumis ✓";
          /* Active l'étape soumission dans la timeline */
          var etapeSou = document.getElementById("etapeSoumission");
          if (etapeSou) {
            var point = etapeSou.querySelector(".profil-etape-point");
            if (point) {
              point.classList.remove("profil-etape-point-attente");
              point.style.background = "#10b981";
              point.style.color = "#fff";
            }
          }
        }
      });
  }


  function afficherDonneesLocales() {
    var data = {
      nom:        localStorage.getItem("techforge-nom")        || "—",
      email:      localStorage.getItem("techforge-email")      || "—",
      universite: localStorage.getItem("techforge-universite") || "—",
      niveau:     localStorage.getItem("techforge-niveau")     || "—",
      categorie:  localStorage.getItem("techforge-categorie")  || "—",
    };
    afficherDonnees(data);
  }


  function afficherDonnees(data) {
    if (!profilContenu) return;

    if (profilNonConnecte) profilNonConnecte.style.display = "none";
    if (profilConnexion)   profilConnexion.style.display   = "none";
    profilContenu.style.display = "block";

    var labelsCategorie = {
      "dev-web"       : "Développement Web",
      "ui-ux"         : "UI/UX Design",
      "graphisme"     : "Design Graphique",
      "ia-creativite" : "IA & Créativité"
    };
    var categorieLabel = labelsCategorie[data.categorie] || data.categorie;

    function remplir(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val || "—";
    }

    remplir("profilNom",            data.nom);
    remplir("profilUniversite",     data.universite);
    remplir("profilNiveau",         data.niveau);
    remplir("profilCategorie",      categorieLabel);
    remplir("profilEmail",          data.email);
    remplir("profilUniversiteInfo", data.universite);
    remplir("profilCategorieInfo",  categorieLabel);

    /* Avatar — première lettre */
    var avatar = document.getElementById("profilAvatar");
    if (avatar && data.nom) {
      avatar.textContent = data.nom.charAt(0).toUpperCase();
    }

    /* Statut saison */
    var statutEl = document.getElementById("statutSaison");
    if (statutEl && SOUMISSION_OUVERTE) {
      statutEl.innerHTML = '<i class="fa-solid fa-bolt"></i> Challenge en cours';
      statutEl.style.cssText = "background:rgba(16,185,129,0.1);color:#10b981;border-color:rgba(16,185,129,0.22);";
    }

    /* Bouton action */
    var actionTexte = document.getElementById("profilActionTexte");
    var actionBtn   = document.getElementById("profilBtnAction");
    if (actionTexte && actionBtn) {
      if (SOUMISSION_OUVERTE) {
        actionTexte.textContent = "Le challenge est en cours ! Soumets ton projet avant la date limite.";
        actionBtn.style.display = "flex";
      } else {
        actionTexte.textContent = "Le challenge n'a pas encore démarré. Reste à l'écoute dans le groupe WhatsApp.";
        actionBtn.style.display = "none";
      }
    }
  }


  /* ── Déconnexion ── */
  var btnDeconnexion = document.getElementById("btnDeconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function () {
      if (confirm("Veux-tu vraiment te déconnecter ?")) {
        supabase.auth.signOut().then(function () {
          localStorage.clear();
          window.location.href = "index.html";
        });
      }
    });
  }

}); // Fin DOMContentLoaded
