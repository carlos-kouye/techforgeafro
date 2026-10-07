/* ================================================================
   TechForgeAfro — auth.js
   Gère : inscription, connexion, déconnexion via Supabase Auth
   + EmailJS notifications
================================================================ */

/* ── EmailJS Config ── */
var EMAILJS_PUBLIC_KEY   = "bE-kZDbK4eZ75VGIY";
var EMAILJS_SERVICE_ID   = "service_pw8dgui";
var EMAILJS_TEMPLATE_NOTIF    = "template_dycv3av"; /* Notification inscription → pour toi */
var EMAILJS_TEMPLATE_BIENVENUE = "template_kj39xwr"; /* Bienvenue → pour le participant */
var LIEN_WHATSAPP = "https://chat.whatsapp.com/TONLIENICI"; /* Remplace par ton vrai lien */

document.addEventListener("DOMContentLoaded", function () {

  /* ── Client Supabase ── */
  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ================================================================
     BLOC "DÉJÀ CONNECTÉ" sur inscription.html
  ================================================================ */
  var inscriptionDeja  = document.getElementById("inscriptionDeja");
  var inscriptionCarte = document.getElementById("inscriptionCarte");

  if (inscriptionDeja && inscriptionCarte) {
    supabase.auth.getSession().then(function (res) {
      var session = res.data.session;
      if (session) {
        inscriptionCarte.style.display = "none";
        inscriptionDeja.style.display  = "flex";
        var nom = localStorage.getItem("techforge-nom") || session.user.email;
        var dejaEl = document.getElementById("dejaInscritNom");
        if (dejaEl) dejaEl.textContent = "Tu es connecté en tant que " + nom + ".";
      }
    });

    var btnDesinscrit = document.getElementById("btnDesinscrit");
    if (btnDesinscrit) {
      btnDesinscrit.addEventListener("click", function () {
        if (confirm("Veux-tu vraiment te déconnecter ?")) {
          supabase.auth.signOut().then(function () {
            localStorage.clear();
            inscriptionDeja.style.display  = "none";
            inscriptionCarte.style.display = "block";
          });
        }
      });
    }
  }

  /* ================================================================
     FORMULAIRE INSCRIPTION
  ================================================================ */
  var formulaireInscription = document.getElementById("formulaireInscription");

  if (formulaireInscription) {

    function emailValide(email) {
      return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
    }
    function nomValide(nom) {
      return nom.trim().length >= 3 && /[a-zA-ZÀ-ÿ]/.test(nom);
    }
    function mdpValide(mdp) { return mdp.length >= 6; }

    function validerChamp(idChamp, idErreur, condition, message) {
      var champ  = document.getElementById(idChamp);
      var erreur = document.getElementById(idErreur);
      if (!champ || !erreur) return true;
      if (!condition) {
        champ.classList.add("erreur");
        erreur.classList.add("visible");
        if (message) erreur.textContent = message;
        return false;
      }
      champ.classList.remove("erreur");
      erreur.classList.remove("visible");
      return true;
    }

    function afficherErreurGlobale(message) {
      var zone  = document.getElementById("erreurGlobale");
      var texte = document.getElementById("erreurGlobaleTexte");
      if (zone && texte) { texte.textContent = message; zone.style.display = "flex"; }
    }

    function cacherErreurGlobale() {
      var zone = document.getElementById("erreurGlobale");
      if (zone) zone.style.display = "none";
    }

    formulaireInscription.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("erreur");
        cacherErreurGlobale();
      });
    });

    /* Toggle mot de passe */
    var toggleMdp = document.getElementById("toggleMdp");
    var inputMdp  = document.getElementById("motDePasse");
    if (toggleMdp && inputMdp) {
      toggleMdp.addEventListener("click", function () {
        var visible = inputMdp.type === "text";
        inputMdp.type = visible ? "password" : "text";
        toggleMdp.innerHTML = visible
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
      });
    }

    formulaireInscription.addEventListener("submit", function (e) {
      e.preventDefault();
      cacherErreurGlobale();

      var nomEl   = document.getElementById("nomComplet");
      var emailEl = document.getElementById("email");
      var mdpEl   = document.getElementById("motDePasse");
      var univEl  = document.getElementById("universite");
      var nivEl   = document.getElementById("niveau");
      var catEl   = document.getElementById("categorie");

      var ok = [
        validerChamp("nomComplet",  "erreurNom",        nomEl  && nomValide(nomEl.value),           "Nom valide requis."),
        validerChamp("email",       "erreurEmail",      emailEl && emailValide(emailEl.value.trim()), "Email invalide."),
        validerChamp("motDePasse",  "erreurMdp",        mdpEl  && mdpValide(mdpEl.value),            "6 caractères minimum."),
        validerChamp("universite",  "erreurUniversite", univEl && univEl.value.trim().length >= 2,   "Université requise."),
        validerChamp("niveau",      "erreurNiveau",     nivEl  && nivEl.value !== "",                "Niveau requis."),
        validerChamp("categorie",   "erreurCategorie",  catEl  && catEl.value !== "",                "Catégorie requise."),
      ].every(Boolean);

      if (!ok) return;

      var btn = document.getElementById("btnInscription");
      var txt = document.getElementById("btnInscriptionTexte");
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Inscription en cours...";

      var nomVal   = nomEl.value.trim();
      var emailVal = emailEl.value.trim().toLowerCase();
      var mdpVal   = mdpEl.value;
      var univVal  = univEl.value.trim();
      var nivVal   = nivEl.value;
      var catVal   = catEl.value;
      var dateVal  = new Date().toLocaleDateString("fr-FR");

      /* Étape 1 — Créer le compte Supabase Auth */
      supabase.auth.signUp({
        email: emailVal,
        password: mdpVal,
        options: { data: { nom: nomVal } }
      }).then(function (res) {
        if (res.error) {
          var msg = res.error.message;
          if (msg.includes("already registered") || msg.includes("already exists")) {
            afficherErreurGlobale("Cet email est déjà inscrit.");
          } else {
            afficherErreurGlobale("Erreur : " + msg);
          }
          if (btn) btn.disabled = false;
          if (txt) txt.textContent = "Réessayer";
          return Promise.reject("auth_error");
        }

        var userId = res.data.user.id;

        /* Étape 2 — Enregistrer dans la table inscriptions */
        return supabase.from("inscriptions").insert([{
          user_id:    userId,
          nom:        nomVal,
          email:      emailVal,
          universite: univVal,
          niveau:     nivVal,
          categorie:  catVal,
        }]);

      }).then(function (res) {
        if (!res) return Promise.reject("already_handled");
        if (res.error) {
          afficherErreurGlobale("Erreur enregistrement : " + res.error.message);
          if (btn) btn.disabled = false;
          if (txt) txt.textContent = "Réessayer";
          return Promise.reject("db_error");
        }

        /* Étape 3 — Sauvegarder localement */
        localStorage.setItem("techforge-connecte",  "oui");
        localStorage.setItem("techforge-nom",        nomVal);
        localStorage.setItem("techforge-email",      emailVal);
        localStorage.setItem("techforge-universite", univVal);
        localStorage.setItem("techforge-niveau",     nivVal);
        localStorage.setItem("techforge-categorie",  catVal);

        /* Étape 4 — EmailJS : envoyer les deux emails */
        function envoyerEmails() {
          /* Notification admin */
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_NOTIF, {
            to_email:   "kouyecarlos@gmail.com",
            nom:        nomVal,
            email:      emailVal,
            universite: univVal,
            niveau:     nivVal,
            categorie:  catVal,
            date:       dateVal,
          }).then(function () {
            console.log("Notif admin envoyée");
          }).catch(function (err) {
            console.error("EmailJS notif admin erreur:", JSON.stringify(err));
          });

          /* Email bienvenue participant */
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BIENVENUE, {
            to_email:      emailVal,
            nom:           nomVal,
            email:         emailVal,
            universite:    univVal,
            categorie:     catVal,
            lien_whatsapp: LIEN_WHATSAPP,
          }).then(function () {
            console.log("Bienvenue participant envoyé");
          }).catch(function (err) {
            console.error("EmailJS bienvenue erreur:", JSON.stringify(err));
          });
        }

        /* Appeler EmailJS — avec retry si pas encore initialisé */
        if (typeof emailjs !== "undefined") {
          emailjs.init(EMAILJS_PUBLIC_KEY);
          envoyerEmails();
        } else {
          console.warn("EmailJS non chargé");
        }

        /* Succès */
        if (txt) txt.textContent = "Inscription réussie !";
        if (btn) btn.style.background = "#10b981";

        setTimeout(function () {
          window.location.href = "confirmation.html";
        }, 800);

      }).catch(function (err) {
        if (err === "auth_error" || err === "db_error" || err === "already_handled") return;
        afficherErreurGlobale("Erreur de connexion. Vérifie ta connexion internet.");
        if (btn) btn.disabled = false;
        if (txt) txt.textContent = "Réessayer";
        console.error(err);
      });
    });
  }


  /* ================================================================
     FORMULAIRE CONNEXION (profil.html)
  ================================================================ */
  var formulaireConnexion = document.getElementById("formulaireConnexion");

  if (formulaireConnexion) {

    /* Toggle mdp connexion */
    var toggleMdpCo = document.getElementById("toggleMdpConnexion");
    var inputMdpCo  = document.getElementById("connexionMdp");
    if (toggleMdpCo && inputMdpCo) {
      toggleMdpCo.addEventListener("click", function () {
        var v = inputMdpCo.type === "text";
        inputMdpCo.type = v ? "password" : "text";
        toggleMdpCo.innerHTML = v
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
      });
    }

    formulaireConnexion.addEventListener("submit", function (e) {
      e.preventDefault();

      var emailEl = document.getElementById("connexionEmail");
      var mdpEl   = document.getElementById("connexionMdp");
      if (!emailEl || !mdpEl) return;

      var btn     = document.getElementById("btnConnexion");
      var txt     = document.getElementById("btnConnexionTexte");
      var errZone = document.getElementById("erreurConnexion");

      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Connexion...";
      if (errZone) errZone.style.display = "none";

      supabase.auth.signInWithPassword({
        email:    emailEl.value.trim(),
        password: mdpEl.value,
      }).then(function (res) {
        if (res.error) {
          if (errZone) { errZone.textContent = "Email ou mot de passe incorrect."; errZone.style.display = "flex"; }
          if (btn) btn.disabled = false;
          if (txt) txt.textContent = "Se connecter";
          return;
        }

        var userId = res.data.user.id;
        return supabase.from("inscriptions").select("*").eq("user_id", userId).single();

      }).then(function (res) {
        if (!res || !res.data) return;
        localStorage.setItem("techforge-connecte",  "oui");
        localStorage.setItem("techforge-nom",        res.data.nom);
        localStorage.setItem("techforge-email",      res.data.email);
        localStorage.setItem("techforge-universite", res.data.universite);
        localStorage.setItem("techforge-niveau",     res.data.niveau);
        localStorage.setItem("techforge-categorie",  res.data.categorie);
        window.location.reload();

      }).catch(function (err) {
        if (errZone) { errZone.textContent = "Erreur de connexion."; errZone.style.display = "flex"; }
        if (btn) btn.disabled = false;
        if (txt) txt.textContent = "Se connecter";
        console.error(err);
      });
    });
  }

}); // Fin DOMContentLoaded