/* ================================================================
   TECHFORGE — accueil.js (fichier JS global)

   CONFIGURATION — modifie uniquement ces valeurs :
================================================================ */
var URL_APPS_SCRIPT       = "https://script.google.com/macros/s/AKfycbxvFlFr0WGsT9ifCzCUO2EjuXn2LnL4KlTvkxL9OE7jTLhI8-mYEvVzIfd4YZpo7eb5/exec";
var SOUMISSION_OUVERTE    = false;  // true = formulaire accessible
var CLASSEMENT_DISPONIBLE = false;  // true = résultats visibles
var DATE_LIMITE           = new Date("2026-12-31T23:59:59");
var MOT_DE_PASSE_ADMIN    = "techforge2026";


document.addEventListener("DOMContentLoaded", function () {


  /* ================================================================
     1. NAVBAR — fond au scroll
  ================================================================ */
  var navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", function () {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    });
  }


  /* ================================================================
     2. DARK / LIGHT MODE
  ================================================================ */
  var boutonTheme = document.getElementById("toggleTheme");
  var htmlEl      = document.documentElement;

  var themeSauvegarde = localStorage.getItem("techforge-theme") || "light";
  htmlEl.setAttribute("data-theme", themeSauvegarde);

  if (boutonTheme) {
    boutonTheme.addEventListener("click", function () {
      var nouveau = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      htmlEl.setAttribute("data-theme", nouveau);
      localStorage.setItem("techforge-theme", nouveau);
    });
  }


  /* ================================================================
     3. DROPDOWNS NAVBAR
  ================================================================ */
  var dropdowns = document.querySelectorAll(".nav-dropdown");

  dropdowns.forEach(function (dropdown) {
    var btn = dropdown.querySelector(".nav-dropdown-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdowns.forEach(function (d) {
        if (d !== dropdown) d.classList.remove("ouvert");
      });
      dropdown.classList.toggle("ouvert");
      btn.setAttribute("aria-expanded", dropdown.classList.contains("ouvert"));
    });
  });

  document.addEventListener("click", function () {
    dropdowns.forEach(function (d) { d.classList.remove("ouvert"); });
  });

  document.querySelectorAll(".nav-dropdown-menu a").forEach(function (lien) {
    lien.addEventListener("click", function () {
      dropdowns.forEach(function (d) { d.classList.remove("ouvert"); });
    });
  });


  /* ================================================================
     4. HAMBURGER MOBILE
  ================================================================ */
  var hamburger  = document.getElementById("hamburger");
  var menuMobile = document.getElementById("menuMobile");

  if (hamburger && menuMobile) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("ouvert");
      menuMobile.classList.toggle("ouvert");
    });
    menuMobile.querySelectorAll("a").forEach(function (lien) {
      lien.addEventListener("click", function () {
        hamburger.classList.remove("ouvert");
        menuMobile.classList.remove("ouvert");
      });
    });
  }


  /* ================================================================
     5. ICÔNE PROFIL — visible si inscrit
  ================================================================ */
  var navProfil = document.getElementById("navProfil");
  if (navProfil) {
    navProfil.style.display =
      localStorage.getItem("techforge-inscrit") === "oui" ? "flex" : "none";
  }


  /* ================================================================
     6. ANIMATIONS SCROLL
  ================================================================ */
  var elementsAAnimer = document.querySelectorAll("[data-anim]");
  if (elementsAAnimer.length > 0) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          obs.unobserve(entree.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    elementsAAnimer.forEach(function (el) { obs.observe(el); });
  }


  /* ================================================================
     7. FAQ ACCORDÉON
  ================================================================ */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    if (btn) {
      btn.addEventListener("click", function () {
        var estOuvert = item.classList.contains("ouvert");
        faqItems.forEach(function (i) { i.classList.remove("ouvert"); });
        if (!estOuvert) item.classList.add("ouvert");
      });
    }
  });


  /* ================================================================
     8. DÉFILEMENT FLUIDE
  ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
    lien.addEventListener("click", function (e) {
      var id = lien.getAttribute("href");
      if (id === "#") return;
      var cible = document.querySelector(id);
      if (cible) {
        e.preventDefault();
        window.scrollTo({
          top: cible.getBoundingClientRect().top + window.scrollY - 70,
          behavior: "smooth"
        });
        if (hamburger && menuMobile) {
          hamburger.classList.remove("ouvert");
          menuMobile.classList.remove("ouvert");
        }
      }
    });
  });


  /* ================================================================
     9. BARRE PROGRESSION TIMELINE
  ================================================================ */
  var barreFill = document.querySelector(".timeline-barre-fill");
  if (barreFill) {
    var obsBar = new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting) {
        barreFill.style.width = "100%";
        obsBar.disconnect();
      }
    }, { threshold: 0.5 });
    obsBar.observe(barreFill);
  }


  /* ================================================================
     10. ASSISTANT IA
  ================================================================ */
  var assistantBtn      = document.getElementById("assistantBtn");
  var assistantFenetre  = document.getElementById("assistantFenetre");
  var assistantFermer   = document.getElementById("assistantFermer");
  var assistantInput    = document.getElementById("assistantInput");
  var assistantEnvoyer  = document.getElementById("assistantEnvoyer");
  var assistantMessages = document.getElementById("assistantMessages");

  var reponses = {
    inscription : "Pour t'inscrire, clique sur <strong>S'inscrire</strong> en haut. Remplis le formulaire avec ton nom, email, université et catégorie.",
    prix        : "La <strong>Saison normale</strong> coûte <strong>1 000 FCFA</strong> et la <strong>Saison finale</strong> coûte <strong>2 000 FCFA</strong>.",
    duree       : "Le défi dure exactement <strong>7 jours</strong> à partir de l'annonce du thème dans le groupe WhatsApp.",
    soumission  : "Va dans <strong>Participer → Soumettre un projet</strong>. Tu as besoin d'un lien GitHub, Figma, Drive ou autre selon ta catégorie.",
    whatsapp    : "Le lien du groupe WhatsApp t'est envoyé <strong>après confirmation d'inscription</strong> sur la page de confirmation.",
    classement  : "Les résultats sont publiés sur la page <strong>Classement</strong> après évaluation par les jurys.",
    categorie   : "4 catégories : <strong>Dev Web</strong>, <strong>UI/UX Design</strong>, <strong>Design Graphique</strong> et <strong>IA & Créativité</strong>.",
    default     : "Je peux t'aider sur : l'<strong>inscription</strong>, les <strong>prix</strong>, la <strong>durée</strong>, la <strong>soumission</strong>, le <strong>WhatsApp</strong> ou le <strong>classement</strong>."
  };

  function trouverReponse(texte) {
    texte = texte.toLowerCase();
    if (texte.includes("inscri"))                                    return reponses.inscription;
    if (texte.includes("prix") || texte.includes("fcfa") || texte.includes("coût")) return reponses.prix;
    if (texte.includes("dur") || texte.includes("jour"))             return reponses.duree;
    if (texte.includes("soumet") || texte.includes("projet"))        return reponses.soumission;
    if (texte.includes("whatsapp") || texte.includes("groupe"))      return reponses.whatsapp;
    if (texte.includes("classement") || texte.includes("résultat"))  return reponses.classement;
    if (texte.includes("catégorie") || texte.includes("design"))     return reponses.categorie;
    return reponses.default;
  }

  function ajouterMsg(texte, type) {
    if (!assistantMessages) return;
    var div = document.createElement("div");
    div.className = "assistant-msg " + type;
    var p = document.createElement("p");
    p.innerHTML = texte;
    div.appendChild(p);
    assistantMessages.appendChild(div);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
  }

  function envoyerMsg(texte) {
    if (!texte.trim()) return;
    ajouterMsg(texte, "user");
    setTimeout(function () { ajouterMsg(trouverReponse(texte), "bot"); }, 400);
  }

  document.querySelectorAll(".sugg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { envoyerMsg(btn.textContent.trim()); });
  });

  if (assistantEnvoyer && assistantInput) {
    assistantEnvoyer.addEventListener("click", function () {
      envoyerMsg(assistantInput.value);
      assistantInput.value = "";
    });
    assistantInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        envoyerMsg(assistantInput.value);
        assistantInput.value = "";
      }
    });
  }

  if (assistantBtn && assistantFenetre) {
    assistantBtn.addEventListener("click", function () {
      assistantFenetre.classList.toggle("ouverte");
    });
  }
  if (assistantFermer && assistantFenetre) {
    assistantFermer.addEventListener("click", function () {
      assistantFenetre.classList.remove("ouverte");
    });
  }


  /* ================================================================
     11. CHRONO SOUMISSION
  ================================================================ */
  var chronoZone    = document.getElementById("chronoZone");
  var delaiExpire   = document.getElementById("delaiExpire");
  var formulaireZone = document.getElementById("formulaireZone");

  if (chronoZone) {
    function mettreAJourChrono() {
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
    mettreAJourChrono();
    setInterval(mettreAJourChrono, 1000);
  }


  /* ================================================================
     12. PAGE SOUMISSION — vérification + état saison
  ================================================================ */
  var soumissionContenu = document.getElementById("soumissionContenu");
  var msgNonInscrit     = document.getElementById("msgNonInscrit");
  var msgPasOuvert      = document.getElementById("msgPasOuvert");

  if (soumissionContenu) {
    var estInscrit = localStorage.getItem("techforge-inscrit") === "oui";
    if (!estInscrit) {
      soumissionContenu.style.display = "none";
      if (msgNonInscrit) msgNonInscrit.style.display = "flex";
    } else if (!SOUMISSION_OUVERTE) {
      soumissionContenu.style.display = "none";
      if (msgPasOuvert) msgPasOuvert.style.display = "flex";
    } else {
      soumissionContenu.style.display = "block";
    }
  }


  /* ================================================================
     13. PAGE CLASSEMENT
  ================================================================ */
  var classementContenu = document.getElementById("classementContenu");
  var classementAttente = document.getElementById("classementAttente");

  if (classementContenu) {
    if (!CLASSEMENT_DISPONIBLE) {
      classementContenu.style.display = "none";
      if (classementAttente) classementAttente.style.display = "block";
    } else {
      classementContenu.style.display = "block";
      if (classementAttente) classementAttente.style.display = "none";
    }
  }


  /* ================================================================
     14. FILTRES CLASSEMENT
  ================================================================ */
  var filtres = document.getElementById("filtres");
  if (filtres) {
    var boutonsFiltre = filtres.querySelectorAll(".filtre-btn");
    var lignes        = document.querySelectorAll(".classement-ligne");
    boutonsFiltre.forEach(function (btn) {
      btn.addEventListener("click", function () {
        boutonsFiltre.forEach(function (b) { b.classList.remove("actif"); });
        btn.classList.add("actif");
        var filtre = btn.getAttribute("data-filtre");
        lignes.forEach(function (ligne) {
          ligne.classList.toggle(
            "masquee",
            filtre !== "tous" && ligne.getAttribute("data-categorie") !== filtre
          );
        });
      });
    });
  }


  /* ================================================================
     15. PAGE PROFIL
  ================================================================ */
  var profilContenu     = document.getElementById("profilContenu");
  var profilNonConnecte = document.getElementById("profilNonConnecte");

  if (profilContenu) {
    var estInscritProfil = localStorage.getItem("techforge-inscrit") === "oui";

    if (!estInscritProfil) {
      if (profilNonConnecte) profilNonConnecte.style.display = "flex";
      profilContenu.style.display = "none";
    } else {
      if (profilNonConnecte) profilNonConnecte.style.display = "none";
      profilContenu.style.display = "block";

      var nom        = localStorage.getItem("techforge-nom")        || "Participant";
      var email      = localStorage.getItem("techforge-email")      || "—";
      var universite = localStorage.getItem("techforge-universite")  || "—";
      var niveau     = localStorage.getItem("techforge-niveau")     || "—";
      var categorie  = localStorage.getItem("techforge-categorie")  || "—";
      var date       = localStorage.getItem("techforge-date")       || "—";

      var labelsCategorie = {
        "dev-web"       : "Développement Web",
        "ui-ux"         : "UI/UX Design",
        "graphisme"     : "Design Graphique",
        "ia-creativite" : "IA & Créativité"
      };
      var categorieLabel = labelsCategorie[categorie] || categorie;

      function remplir(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
      }

      remplir("profilNom",            nom);
      remplir("profilUniversite",     universite);
      remplir("profilNiveau",         niveau);
      remplir("profilCategorie",      categorieLabel);
      remplir("profilEmail",          email);
      remplir("profilUniversiteInfo", universite);
      remplir("profilCategorieInfo",  categorieLabel);
      remplir("profilDateInscription",date);

      var avatar = document.getElementById("profilAvatar");
      if (avatar) avatar.textContent = nom.charAt(0).toUpperCase();

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

    var btnDeconnexion = document.getElementById("btnDeconnexion");
    if (btnDeconnexion) {
      btnDeconnexion.addEventListener("click", function () {
        if (confirm("Veux-tu vraiment te déconnecter ? Tes données locales seront effacées.")) {
          ["techforge-inscrit","techforge-nom","techforge-email",
           "techforge-universite","techforge-niveau","techforge-categorie",
           "techforge-date","techforge-soumis"].forEach(function(k) {
            localStorage.removeItem(k);
          });
          window.location.href = "index.html";
        }
      });
    }
  }


  /* ================================================================
     16. FORMULAIRE INSCRIPTION → Google Sheets
     Correction : utilisation de no-cors + gestion d'erreur améliorée
  ================================================================ */
  var formulaireInscription = document.getElementById("formulaireInscription");

  if (formulaireInscription) {

    /* Validation d'un champ */
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

    /* Efface erreur au fur et à mesure */
    formulaireInscription.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("input", function () { el.classList.remove("erreur"); });
    });

    formulaireInscription.addEventListener("submit", function (e) {
      e.preventDefault();

      var nomEl   = document.getElementById("nomComplet");
      var emailEl = document.getElementById("email");
      var univEl  = document.getElementById("universite");
      var nivEl   = document.getElementById("niveau");
      var catEl   = document.getElementById("categorie");

      /* Validation */
      var ok = [
        validerChamp("nomComplet", "erreurNom",       nomEl  && nomEl.value.trim().length > 1),
        validerChamp("email",      "erreurEmail",      emailEl && emailEl.value.includes("@")),
        validerChamp("universite", "erreurUniversite", univEl && univEl.value.trim().length > 1),
        validerChamp("niveau",     "erreurNiveau",     nivEl  && nivEl.value !== ""),
        validerChamp("categorie",  "erreurCategorie",  catEl  && catEl.value !== ""),
      ].every(Boolean);

      if (!ok) return;

      var btn = document.getElementById("btnInscription");
      var txt = document.getElementById("btnInscriptionTexte");
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Envoi en cours...";

      var maintenant   = new Date();
      var dateFormatee = maintenant.toLocaleDateString("fr-FR") +
                         " à " +
                         maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      var donnees = {
        type:       "inscription",
        nom:        nomEl.value.trim(),
        email:      emailEl.value.trim(),
        universite: univEl.value.trim(),
        niveau:     nivEl.value,
        categorie:  catEl.value,
      };

      /* Envoi vers Apps Script */
      fetch(URL_APPS_SCRIPT, {
        method:  "POST",
        mode:    "no-cors", /* évite les erreurs CORS */
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(donnees),
      })
      .then(function () {
        /* no-cors = pas de réponse lisible, on considère que c'est OK */
        localStorage.setItem("techforge-inscrit",    "oui");
        localStorage.setItem("techforge-nom",        donnees.nom);
        localStorage.setItem("techforge-email",      donnees.email);
        localStorage.setItem("techforge-universite", donnees.universite);
        localStorage.setItem("techforge-niveau",     donnees.niveau);
        localStorage.setItem("techforge-categorie",  donnees.categorie);
        localStorage.setItem("techforge-date",       dateFormatee);
        window.location.href = "confirmation.html";
      })
      .catch(function (err) {
        console.error("Erreur inscription :", err);
        if (txt) txt.textContent = "Erreur de connexion. Vérifie ta connexion internet.";
        if (txt) txt.style.color = "#ef4444";
        if (btn) btn.disabled = false;
      });
    });
  }


  /* ================================================================
     17. FORMULAIRE SOUMISSION → Google Sheets
     Lien supplémentaire obligatoire pour Dev Web
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

    /* Changer le hint + obligation selon la catégorie */
    var souCategorie    = document.getElementById("souCategorie");
    var hintLienSupp    = document.getElementById("hintLienSupp");
    var reqDevWeb       = document.getElementById("reqDevWeb");
    var hintLienPrincipal = document.getElementById("hintLienPrincipal");

    if (souCategorie) {
      souCategorie.addEventListener("change", function () {
        var cat = souCategorie.value;

        if (cat === "dev-web") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien GitHub obligatoire";
          if (hintLienSupp) hintLienSupp.textContent = "Lien du site déployé (Vercel, Netlify...) — obligatoire";
          if (reqDevWeb) reqDevWeb.style.display = "inline-flex";
        } else if (cat === "ui-ux") {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Lien Figma ou outil de maquette";
          if (hintLienSupp) hintLienSupp.textContent = "Lien secondaire si besoin (optionnel)";
          if (reqDevWeb) reqDevWeb.style.display = "none";
        } else {
          if (hintLienPrincipal) hintLienPrincipal.textContent = "Behance, Drive, Pinterest...";
          if (hintLienSupp) hintLienSupp.textContent = "Lien supplémentaire (optionnel)";
          if (reqDevWeb) reqDevWeb.style.display = "none";
        }
      });
    }

    /* Validation */
    function validerChampSou(idChamp, idErreur, condition) {
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

      var estDevWeb = catEl && catEl.value === "dev-web";

      /* Lien supplémentaire obligatoire pour Dev Web */
      var lienSuppOk = true;
      if (estDevWeb) {
        lienSuppOk = validerChampSou(
          "souLienSupp",
          "erreurSouLienSupp",
          lienSuppEl && lienSuppEl.value.trim().startsWith("http")
        );
      }

      var ok = [
        validerChampSou("souNom",          "erreurSouNom",      nomEl  && nomEl.value.trim().length > 1),
        validerChampSou("souCategorie",    "erreurSouCategorie",catEl  && catEl.value !== ""),
        validerChampSou("souLienPrincipal","erreurSouLien",     lienEl && lienEl.value.trim().startsWith("http")),
        lienSuppOk,
      ].every(Boolean);

      if (!ok) return;

      var btn = document.getElementById("btnSoumission");
      var txt = document.getElementById("btnSouTexte");
      if (btn) btn.disabled = true;
      if (txt) txt.textContent = "Envoi en cours...";

      var donnees = {
        type:         "soumission",
        nom:          nomEl.value.trim(),
        categorie:    catEl.value,
        lienPrincipal: lienEl.value.trim(),
        lienSupp:     lienSuppEl ? lienSuppEl.value.trim() : "",
        commentaire:  commEl ? commEl.value.trim() : "",
      };

      fetch(URL_APPS_SCRIPT, {
        method:  "POST",
        mode:    "no-cors",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(donnees),
      })
      .then(function () {
        localStorage.setItem("techforge-soumis", "oui");
        if (txt) txt.textContent = "Projet envoyé avec succès !";
        if (btn) {
          btn.style.background = "#10b981";
          btn.style.boxShadow  = "0 4px 18px rgba(16,185,129,0.4)";
        }
      })
      .catch(function (err) {
        console.error("Erreur soumission :", err);
        if (txt) txt.textContent = "Erreur de connexion. Vérifie ta connexion internet.";
        if (txt) txt.style.color = "#ef4444";
        if (btn) btn.disabled = false;
      });
    });
  }
});