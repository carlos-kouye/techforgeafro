/* ================================================================
   TechForgeAfro — core.js
   Chargé sur TOUTES les pages.
   Contient : navbar, dark mode, dropdowns, hamburger,
              animations scroll, FAQ, défilement fluide,
              assistant IA (discret), Google Translate
================================================================ */

/* ── Configuration Supabase ── */
var SUPABASE_URL = "https://gqsbluqfjxfpmszreeqt.supabase.co";
var SUPABASE_KEY = "sb_publishable_8C4isFsxWjKJ9dj7xBEpwA_zVwMCAcE";

/* ── Configuration saison ── */
/* Valeurs par défaut — écrasées si l'admin a sauvegardé dans localStorage */
var SOUMISSION_OUVERTE    = localStorage.getItem("tf-soumission-ouverte") !== null
  ? localStorage.getItem("tf-soumission-ouverte") === "1"
  : true;

var CLASSEMENT_DISPONIBLE = localStorage.getItem("tf-classement-disponible") !== null
  ? localStorage.getItem("tf-classement-disponible") === "1"
  : true;

var DATE_LIMITE = localStorage.getItem("tf-date-limite")
  ? new Date(localStorage.getItem("tf-date-limite"))
  : new Date("2026-12-31T23:59:59");

document.addEventListener("DOMContentLoaded", function () {

  /* ================================================================
     1. NAVBAR — fond flouté au scroll
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

  htmlEl.setAttribute("data-theme",
    localStorage.getItem("techforge-theme") || "light"
  );

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
     5. ICÔNE PROFIL — visible si connecté
  ================================================================ */
  /* ── Icône profil — vérifie la vraie session Supabase ── */
  var navProfil = document.getElementById("navProfil");
  if (navProfil) {
    var supabaseCheck = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    supabaseCheck.auth.getSession().then(function(res) {
      navProfil.style.display = res.data.session ? "flex" : "none";
    });
  }

  /* ================================================================
     6. ANIMATIONS SCROLL — douces et non agressives
     Délai progressif selon position dans la page
  ================================================================ */
  var elementsAAnimer = document.querySelectorAll("[data-anim]");

  if (elementsAAnimer.length > 0) {
    var obsAnim = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          /* Délai léger pour éviter l'effet brutal */
          setTimeout(function () {
            entree.target.classList.add("visible");
          }, 80);
          obsAnim.unobserve(entree.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -30px 0px"
    });

    elementsAAnimer.forEach(function (el) { obsAnim.observe(el); });
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
     8. DÉFILEMENT FLUIDE — moins agressif
  ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
    lien.addEventListener("click", function (e) {
      var id = lien.getAttribute("href");
      if (id === "#") return;
      var cible = document.querySelector(id);
      if (cible) {
        e.preventDefault();
        var offsetTop = cible.getBoundingClientRect().top + window.scrollY - 75;

        /* Scroll doux avec durée contrôlée */
        window.scrollTo({ top: offsetTop, behavior: "smooth" });

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
     10. ASSISTANT IA — discret, pas de popup automatique
     S'ouvre uniquement au clic sur le bouton flottant
  ================================================================ */
  var assistantBtn      = document.getElementById("assistantBtn");
  var assistantFenetre  = document.getElementById("assistantFenetre");
  var assistantFermer   = document.getElementById("assistantFermer");
  var assistantInput    = document.getElementById("assistantInput");
  var assistantEnvoyer  = document.getElementById("assistantEnvoyer");
  var assistantMessages = document.getElementById("assistantMessages");

  /* Réponses prédéfinies */
  var reponses = {
    inscription : "Pour t'inscrire, clique sur <strong>S'inscrire</strong> en haut. Remplis le formulaire avec ton nom, email, mot de passe, université et catégorie.",
    prix        : "La <strong>Saison normale</strong> coûte <strong>1 000 FCFA</strong> et la <strong>Saison finale</strong> coûte <strong>2 000 FCFA</strong>.",
    duree       : "Le défi dure exactement <strong>7 jours</strong> à partir de l'annonce du thème dans le groupe WhatsApp.",
    soumission  : "Va dans <strong>Participer → Soumettre un projet</strong>. Tu as besoin d'un lien GitHub, Figma, Drive ou autre selon ta catégorie.",
    whatsapp    : "Le lien du groupe WhatsApp t'est envoyé <strong>après confirmation d'inscription</strong>.",
    classement  : "Les résultats sont publiés sur la page <strong>Classement</strong> après évaluation par les jurys.",
    categorie   : "4 catégories : <strong>Dev Web</strong>, <strong>UI/UX Design</strong>, <strong>Design Graphique</strong> et <strong>IA & Créativité</strong>.",
    default     : "Je peux t'aider sur : l'<strong>inscription</strong>, les <strong>prix</strong>, la <strong>durée</strong>, la <strong>soumission</strong>, le <strong>WhatsApp</strong> ou le <strong>classement</strong>."
  };

  function trouverReponse(texte) {
    texte = texte.toLowerCase();
    if (texte.includes("inscri"))                                   return reponses.inscription;
    if (texte.includes("prix") || texte.includes("fcfa"))           return reponses.prix;
    if (texte.includes("dur") || texte.includes("jour"))            return reponses.duree;
    if (texte.includes("soumet") || texte.includes("projet"))       return reponses.soumission;
    if (texte.includes("whatsapp") || texte.includes("groupe"))     return reponses.whatsapp;
    if (texte.includes("classement") || texte.includes("résultat")) return reponses.classement;
    if (texte.includes("catégorie") || texte.includes("design"))    return reponses.categorie;
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
    setTimeout(function () {
      ajouterMsg(trouverReponse(texte), "bot");
    }, 350);
  }

  document.querySelectorAll(".sugg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      envoyerMsg(btn.textContent.trim());
    });
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

  /* Ouvre/ferme uniquement au clic — jamais automatique */
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
     11. GOOGLE TRANSLATE — cookie method
  ================================================================ */
  var btnTraduire = document.getElementById("btnTraduire");
  var langueLabel = document.getElementById("langueLabel");

  var enAnglais = document.cookie.indexOf("googtrans=/fr/en") !== -1;
  if (langueLabel) langueLabel.textContent = enAnglais ? "EN" : "FR";

  if (btnTraduire) {
    btnTraduire.addEventListener("click", function () {
      if (!enAnglais) {
        document.cookie = "googtrans=/fr/en; path=/";
        document.cookie = "googtrans=/fr/en; path=/; domain=" + window.location.hostname;
        window.location.reload();
      } else {
        document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "googtrans=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        window.location.reload();
      }
    });
  }

  /* Cache la barre Google Translate */
  setTimeout(function () {
    var barre = document.querySelector(".goog-te-banner-frame");
    if (barre) barre.style.display = "none";
    document.body.style.top = "0";
  }, 800);

}); // Fin DOMContentLoaded