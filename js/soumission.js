/* ================================================================
   TechForgeAfro — soumission.js
   Gère : chrono, vérification (inscrit ? saison ouverte ? déjà soumis ?),
          envoi du projet ET modification jusqu'à la date limite.
   Chargé sur : soumission.html uniquement
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  var soumissionContenu = document.getElementById("soumissionContenu");
  var msgNonInscrit     = document.getElementById("msgNonInscrit");
  var msgPasOuvert      = document.getElementById("msgPasOuvert");
  var msgDejasoumis     = document.getElementById("msgDejasoumis");

  var modeEdition = false;   /* true si le participant a déjà une soumission */
  var chronoLance = false;

  /* Masqué tant que la configuration n'est pas lue (évite d'afficher le formulaire par erreur) */
  if (soumissionContenu) soumissionContenu.style.display = "none";

  function montrer(el, mode) { if (el) el.style.display = mode || "flex"; }

  /* ================================================================
     VÉRIFICATION ÉTAT — saison ouverte ? inscrit ? déjà soumis ?
  ================================================================ */
  chargerConfig().then(function () {

    if (!SOUMISSION_OUVERTE) { montrer(msgPasOuvert); return; }

    return supabase.auth.getSession().then(function (res) {
      var session = res.data.session;
      if (!session) { montrer(msgNonInscrit); return; }

      return supabase.from("soumissions").select("*")
        .eq("user_id", session.user.id).maybeSingle()
        .then(function (r) {
          var existante = r.data;

          /* Déjà soumis et date limite passée : verrouillé */
          if (existante && new Date() > DATE_LIMITE) { montrer(msgDejasoumis); return; }

          montrer(soumissionContenu, "block");

          /* Déjà soumis mais encore dans les temps : mode modification */
          if (existante) {
            modeEdition = true;
            preremplir(existante);
            afficherAvisEdition();
            var t = document.getElementById("btnSouTexte");
            if (t) t.textContent = "Enregistrer les modifications";
          }
          lancerChrono();
        });
    });
  }).catch(function (err) { console.error("Soumission :", err); });


  /* ── Remplit le formulaire avec la soumission existante ── */
  function preremplir(s) {
    var valeurs = {
      souNom:           s.nom,
      souCategorie:     s.categorie,
      souLienPrincipal: s.lien_principal,
      souLienSupp:      s.lien_supp,
      souCommentaire:   s.commentaire
    };
    Object.keys(valeurs).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = valeurs[id] || "";
    });
    var cat = document.getElementById("souCategorie");
    if (cat) cat.dispatchEvent(new Event("change"));   /* met à jour les indications */
    var com = document.getElementById("souCommentaire");
    if (com) com.dispatchEvent(new Event("input"));    /* met à jour le compteur */
  }

  /* ── Bandeau "tu peux modifier jusqu'au ..." ── */
  function afficherAvisEdition() {
    var zone = document.getElementById("formulaireZone");
    if (!zone || document.getElementById("avisEdition")) return;
    var dateTxt = DATE_LIMITE.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
    var avis = document.createElement("div");
    avis.className = "soumission-guide";
    avis.id = "avisEdition";
    avis.innerHTML =
      '<div class="guide-icone"><i class="fa-solid fa-pen-to-square"></i></div>' +
      '<div><strong>Tu as déjà envoyé ton projet.</strong> ' +
      'Tu peux le modifier jusqu\'au <strong>' + dateTxt + '</strong>. ' +
      'Après cette date, il sera verrouillé.</div>';
    zone.insertBefore(avis, zone.firstChild);
  }

  /* ── Messages d'erreur lisibles ── */
  function messageErreur(err) {
    var m = (err && err.message) || "";
    if (err && err.code === "23505") return "Tu as déjà envoyé un projet. Recharge la page pour le modifier.";
    if (m.indexOf("row-level security") !== -1) return "Refusé : la soumission est fermée ou la date limite est dépassée.";
    return "Erreur : " + m;
  }

  function afficherErreurEnvoi(message) {
    var p = document.getElementById("erreurEnvoi");
    if (!p) {
      p = document.createElement("span");
      p.id = "erreurEnvoi";
      p.className = "champ-erreur";
      var b = document.getElementById("btnSoumission");
      if (b && b.parentNode) b.parentNode.insertBefore(p, b.nextSibling);
    }
    p.textContent = message;
    p.classList.add("visible");
  }


  /* ================================================================
     CHRONO
  ================================================================ */
  function lancerChrono() {
    if (chronoLance) return;
    chronoLance = true;

    var chronoZone     = document.getElementById("chronoZone");
    var delaiExpire    = document.getElementById("delaiExpire");
    var formulaireZone = document.getElementById("formulaireZone");

    if (!chronoZone) return;

    function mettreAJour() {
      var diff = DATE_LIMITE - new Date();
      if (diff <= 0) {
        chronoZone.style.display = "none";
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

    /* Indications selon la catégorie */
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
        } else if (cat === "constructeur-plans") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien vers tes plans (Drive, PDF, AutoCAD...)";
          if (hintLienSupp)      hintLienSupp.textContent      = "Lien supplémentaire si besoin (optionnel)";
          if (reqDevWeb)         reqDevWeb.style.display        = "none";
        } else if (cat === "copywriter") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien vers tes textes (Google Docs, Notion, Drive...)";
          if (hintLienSupp)      hintLienSupp.textContent      = "Lien secondaire si besoin (optionnel)";
          if (reqDevWeb)         reqDevWeb.style.display        = "none";
        } else {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Behance, Figma, Drive, Pinterest...";
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
        validerChamp("souNom",           "erreurSouNom",       nomEl  && nomEl.value.trim().length > 1),
        validerChamp("souCategorie",     "erreurSouCategorie", catEl  && catEl.value !== ""),
        validerChamp("souLienPrincipal", "erreurSouLien",      lienEl && lienEl.value.trim().startsWith("http")),
        lienSuppOk,
      ].every(Boolean);

      if (!ok) return;

      var btn = document.getElementById("btnSoumission");
      var txt = document.getElementById("btnSouTexte");
      var libelleBouton = modeEdition ? "Enregistrer les modifications" : "Envoyer mon projet";
      var ancienneErreur = document.getElementById("erreurEnvoi");
      if (ancienneErreur) ancienneErreur.classList.remove("visible");
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = modeEdition ? "Enregistrement..." : "Envoi en cours...";

      supabase.auth.getSession().then(function (res) {
        var session = res.data.session;
        if (!session) {
          afficherErreurEnvoi("Tu n'es plus connecté. Reconnecte-toi depuis ton profil.");
          if (txt) txt.textContent = libelleBouton;
          if (btn) btn.disabled = false;
          return;
        }

        var donnees = {
          nom:            nomEl.value.trim(),
          categorie:      catEl.value,
          lien_principal: lienEl.value.trim(),
          lien_supp:      lienSuppEl ? lienSuppEl.value.trim() : "",
          commentaire:    commEl ? commEl.value.trim() : ""
        };

        if (modeEdition) {
          /* Modification : .select() permet de vérifier qu'une ligne a bien été modifiée */
          return supabase.from("soumissions").update(donnees)
            .eq("user_id", session.user.id).select();
        }

        donnees.user_id = session.user.id;
        donnees.email   = session.user.email;
        return supabase.from("soumissions").insert([donnees]);

      }).then(function (res) {
        if (!res) return;

        if (res.error) {
          afficherErreurEnvoi(messageErreur(res.error));
          if (txt) txt.textContent = libelleBouton;
          if (btn) btn.disabled = false;
          return;
        }

        if (modeEdition) {
          if (!res.data || res.data.length === 0) {
            afficherErreurEnvoi("Modification refusée : la date limite est peut-être dépassée.");
            if (txt) txt.textContent = libelleBouton;
            if (btn) btn.disabled = false;
            return;
          }
          if (txt) txt.textContent = "Modifications enregistrées ✓";
          if (btn) {
            btn.style.background = "#10b981";
            btn.style.boxShadow  = "0 4px 18px rgba(16,185,129,0.4)";
          }
          setTimeout(function () {
            if (txt) txt.textContent = libelleBouton;
            if (btn) { btn.style.background = ""; btn.style.boxShadow = ""; btn.disabled = false; }
          }, 2500);
          return;
        }

        /* Première soumission */
        localStorage.setItem("techforge-soumis", "oui");
        if (txt) txt.textContent = "Projet envoyé avec succès !";
        if (btn) {
          btn.style.background = "#10b981";
          btn.style.boxShadow  = "0 4px 18px rgba(16,185,129,0.4)";
        }
        setTimeout(function () { window.location.href = "profil.html"; }, 1500);

      }).catch(function (err) {
        afficherErreurEnvoi("Erreur de connexion. Réessaie.");
        if (txt) txt.textContent = libelleBouton;
        if (btn) btn.disabled = false;
        console.error(err);
      });
    });
  }

}); // Fin DOMContentLoaded
