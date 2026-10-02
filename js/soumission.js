/* ================================================================
   TechForgeAfro — soumission.js
   Gère : chrono, vérification inscription, formulaire soumission
   Chargé sur : soumission.html uniquement
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ================================================================
     VÉRIFICATION ÉTAT — inscrit ? saison ouverte ? déjà soumis ?
  ================================================================ */
  var soumissionContenu = document.getElementById("soumissionContenu");
  var msgNonInscrit     = document.getElementById("msgNonInscrit");
  var msgPasOuvert      = document.getElementById("msgPasOuvert");
  var msgDejasoumis     = document.getElementById("msgDejasoumis");

  /* Vérifier SOUMISSION_OUVERTE en premier — même si connecté */
  if (!SOUMISSION_OUVERTE) {
    if (soumissionContenu) soumissionContenu.style.display = "none";
    if (msgPasOuvert)      msgPasOuvert.style.display      = "flex";
    return;
  }

  supabase.auth.getSession().then(function (res) {
    var session = res.data.session;

    if (!session) {
      /* Pas connecté */
      if (soumissionContenu) soumissionContenu.style.display = "none";
      if (msgNonInscrit)     msgNonInscrit.style.display     = "flex";
      return;
    }

    /* Vérifie si déjà soumis */
    supabase.from("soumissions")
      .select("id")
      .eq("user_id", session.user.id)
      .single()
      .then(function (res) {
        if (res.data) {
          /* Déjà soumis */
          if (soumissionContenu) soumissionContenu.style.display = "none";
          if (msgDejasoumis)     msgDejasoumis.style.display     = "flex";
        } else {
          /* Peut soumettre */
          if (soumissionContenu) soumissionContenu.style.display = "block";
          lancerChrono();
        }
      });
  });


  /* ================================================================
     CHRONO
  ================================================================ */
  function lancerChrono() {
    var chronoZone    = document.getElementById("chronoZone");
    var delaiExpire   = document.getElementById("delaiExpire");
    var formulaireZone = document.getElementById("formulaireZone");

    if (!chronoZone) return;

    function mettreAJour() {
      var diff = DATE_LIMITE - new Date();
      if (diff <= 0) {
        chronoZone.style.display      = "none";
        if (formulaireZone) formulaireZone.style.display = "none";
        if (delaiExpire)    delaiExpire.style.display    = "block";
        return;
      }
      var pad = function (n) { return String(n).padStart(2, "0"); };
      var el;
      el = document.getElementById("chronoJours");    if (el) el.textContent = pad(Math.floor(diff / 86400000));
      el = document.getElementById("chronoHeures");   if (el) el.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      el = document.getElementById("chronoMinutes");  if (el) el.textContent = pad(Math.floor((diff % 3600000) / 60000));
      el = document.getElementById("chronoSecondes"); if (el) el.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    mettreAJour();
    setInterval(mettreAJour, 1000);
  }


  /* ================================================================
     FORMULAIRE SOUMISSION
  ================================================================ */
  var formulaireSoumission = document.getElementById("formulaireSoumission");

  if (formulaireSoumission) {

    /* Compteur commentaire */
    var textarea = document.getElementById("souCommentaire");
    var compteur = document.getElementById("compteurCommentaire");
    if (textarea && compteur) {
      textarea.addEventListener("input", function () {
        var nb = textarea.value.length;
        compteur.textContent = nb + " / 400";
        compteur.classList.toggle("limite", nb >= 360);
      });
    }

    /* Hints selon catégorie */
    var souCategorie      = document.getElementById("souCategorie");
    var hintLienPrincipal = document.getElementById("hintLienPrincipal");
    var hintLienSupp      = document.getElementById("hintLienSupp");
    var reqDevWeb         = document.getElementById("reqDevWeb");

    if (souCategorie) {
      souCategorie.addEventListener("change", function () {
        var cat = souCategorie.value;
        if (cat === "dev-web") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien GitHub obligatoire";
          if (hintLienSupp)      hintLienSupp.textContent      = "Site déployé (Vercel, Netlify...) — obligatoire";
          if (reqDevWeb)         reqDevWeb.style.display        = "inline-flex";
        } else if (cat === "ui-ux") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien Figma ou outil de maquette";
          if (hintLienSupp)      hintLienSupp.textContent      = "Lien secondaire si besoin (optionnel)";
          if (reqDevWeb)         reqDevWeb.style.display        = "none";
        } else {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Behance, Drive, Pinterest...";
          if (hintLienSupp)      hintLienSupp.textContent      = "Lien supplémentaire (optionnel)";
          if (reqDevWeb)         reqDevWeb.style.display        = "none";
        }
      });
    }

    /* Validation */
    function validerChamp(idChamp, idErreur, condition) {
      var champ  = document.getElementById(idChamp);
      var erreur = document.getElementById(idErreur);
      if (!champ || !erreur) return true;
      if (!condition) {
        champ.classList.add("erreur");
        erreur.classList.add("visible");
        return false;
      }
      champ.classList.remove("erreur");
      erreur.classList.remove("visible");
      return true;
    }

    formulaireSoumission.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("input", function () { el.classList.remove("erreur"); });
    });

    formulaireSoumission.addEventListener("submit", function (e) {
      e.preventDefault();

      var nomEl      = document.getElementById("souNom");
      var catEl      = document.getElementById("souCategorie");
      var lienEl     = document.getElementById("souLienPrincipal");
      var lienSuppEl = document.getElementById("souLienSupp");
      var commEl     = document.getElementById("souCommentaire");
      var estDevWeb  = catEl && catEl.value === "dev-web";

      var lienSuppOk = true;
      if (estDevWeb) {
        lienSuppOk = validerChamp(
          "souLienSupp", "erreurSouLienSupp",
          lienSuppEl && lienSuppEl.value.trim().startsWith("http")
        );
      }

      var ok = [
        validerChamp("souNom",           "erreurSouNom",      nomEl  && nomEl.value.trim().length > 1),
        validerChamp("souCategorie",     "erreurSouCategorie",catEl  && catEl.value !== ""),
        validerChamp("souLienPrincipal", "erreurSouLien",     lienEl && lienEl.value.trim().startsWith("http")),
        lienSuppOk,
      ].every(Boolean);

      if (!ok) return;

      var btn = document.getElementById("btnSoumission");
      var txt = document.getElementById("btnSouTexte");
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Envoi en cours...";

      supabase.auth.getSession().then(function (res) {
        var session = res.data.session;
        if (!session) {
          if (txt) txt.textContent = "Erreur : non connecté.";
          if (btn) btn.disabled = false;
          return;
        }

        return supabase.from("soumissions").insert([{
          user_id:       session.user.id,
          nom:           nomEl.value.trim(),
          email:         session.user.email,
          categorie:     catEl.value,
          lien_principal: lienEl.value.trim(),
          lien_supp:     lienSuppEl ? lienSuppEl.value.trim() : "",
          commentaire:   commEl ? commEl.value.trim() : "",
        }]);

      }).then(function (res) {
        if (!res) return;
        if (res.error) {
          if (txt) txt.textContent = "Erreur : " + res.error.message;
          if (btn) btn.disabled = false;
          return;
        }

        localStorage.setItem("techforge-soumis", "oui");
        if (txt) txt.textContent = "Projet envoyé avec succès !";
        if (btn) {
          btn.style.background = "#10b981";
          btn.style.boxShadow  = "0 4px 18px rgba(16,185,129,0.4)";
        }

        setTimeout(function () {
          window.location.href = "profil.html";
        }, 1500);

      }).catch(function (err) {
        if (txt) txt.textContent = "Erreur de connexion.";
        if (btn) btn.disabled = false;
        console.error(err);
      });
    });
  }

}); // Fin DOMContentLoaded