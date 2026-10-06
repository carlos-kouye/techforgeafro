/* ================================================================
   TechForgeAfro — profil.js
   Gère la page profil — lecture données Supabase
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase          = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var profilContenu     = document.getElementById("profilContenu");
  var profilNonConnecte = document.getElementById("profilNonConnecte");
  var profilConnexion   = document.getElementById("profilConnexion");

  /* ── Vérifie session au chargement ── */
  supabase.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) {
      /* Pas connecté — affiche formulaire connexion */
      if (profilNonConnecte) profilNonConnecte.style.display = "none";
      if (profilContenu)     profilContenu.style.display     = "none";
      if (profilConnexion)   profilConnexion.style.display   = "flex";
      return;
    }
    chargerProfil(session.user.id);
  });

  /* ── Charge les données depuis Supabase ── */
  function chargerProfil(userId) {
    afficherDonneesLocales();

    supabase.from("inscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(function (res) {
        if (res.error || !res.data) return;
        var data = res.data;

        localStorage.setItem("techforge-connecte",  "oui");
        localStorage.setItem("techforge-nom",        data.nom);
        localStorage.setItem("techforge-email",      data.email);
        localStorage.setItem("techforge-universite", data.universite);
        localStorage.setItem("techforge-niveau",     data.niveau);
        localStorage.setItem("techforge-categorie",  data.categorie);

        afficherDonnees(data);

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
      "dev-web"            : "Développement Web",
      "ui-ux"              : "UI/UX Design",
      "graphisme"          : "Design Graphique",
      "ia-creativite"      : "IA & Créativité",
      "constructeur-plans" : "Constructeur de plans"
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

    var avatar = document.getElementById("profilAvatar");
    if (avatar && data.nom) {
      avatar.textContent = data.nom.charAt(0).toUpperCase();
    }

    var statutEl = document.getElementById("statutSaison");
    if (statutEl && SOUMISSION_OUVERTE) {
      statutEl.innerHTML = '<i class="fa-solid fa-bolt"></i> Challenge en cours';
      statutEl.style.cssText = "background:rgba(16,185,129,0.1);color:#10b981;border-color:rgba(16,185,129,0.22);";
    }

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

  /* ── Déconnexion — recharge la page pour afficher connexion ── */
  var btnDeconnexion = document.getElementById("btnDeconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function () {
      if (confirm("Veux-tu vraiment te déconnecter ?")) {
        supabase.auth.signOut().then(function () {
          localStorage.removeItem("techforge-connecte");
          localStorage.removeItem("techforge-nom");
          localStorage.removeItem("techforge-email");
          localStorage.removeItem("techforge-universite");
          localStorage.removeItem("techforge-niveau");
          localStorage.removeItem("techforge-categorie");
          localStorage.removeItem("techforge-soumis");
          /* Recharge la page → affiche formulaire connexion */
          window.location.reload();
        });
      }
    });
  }

}); // Fin DOMContentLoaded