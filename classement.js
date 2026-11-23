/* ================================================================
   TechForgeAfro — classement.js
   Affiche le classement lu dans Supabase (visible seulement si
   l'admin l'a activé dans la table "config") + filtres.
   Chargé sur : classement.html uniquement
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase          = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var classementContenu = document.getElementById("classementContenu");
  var classementAttente = document.getElementById("classementAttente");

  var ICONES = {
    "dev-web"            : "fa-laptop-code",
    "copywriter"         : "fa-pencil",
    "graphisme"          : "fa-palette",
    "ia-creativite"      : "fa-robot",
    "constructeur-plans" : "fa-compass-drafting"
  };

  /* Protège le texte avant de l'insérer dans la page */
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function lienSur(url) { return /^https?:\/\//i.test(url || "") ? url : "#"; }

  function montrerAttente() {
    if (classementContenu) classementContenu.style.display = "none";
    if (classementAttente) classementAttente.style.display = "block";
  }
  function montrerContenu() {
    if (classementAttente) classementAttente.style.display = "none";
    if (classementContenu) classementContenu.style.display = "block";
  }

  /* Caché tant que la configuration n'est pas lue */
  if (classementContenu) classementContenu.style.display = "none";

  chargerConfig().then(function () {
    if (!CLASSEMENT_DISPONIBLE) { montrerAttente(); return; }
    chargerClassement();
  });

  function chargerClassement() {
    supabase.from("classement")
      .select("*")
      .order("rang", { ascending: true })
      .then(function (res) {
        if (res.error || !res.data || res.data.length === 0) {
          if (res.error) console.error("Erreur classement :", res.error.message);
          montrerAttente();   /* rien à afficher : on garde le message d'attente */
          return;
        }
        afficherClassement(res.data);
        montrerContenu();
      });
  }

  function afficherClassement(data) {

    /* Podium : 3 premiers (une carte sans résultat est masquée) */
    [1, 2, 3].forEach(function (rang) {
      var carte = document.querySelector(".podium-carte-" + rang);
      if (!carte) return;
      var item = data.filter(function (r) { return r.rang === rang; })[0];
      if (!item) { carte.style.display = "none"; return; }
      carte.style.display = "";

      var nomEl  = carte.querySelector(".podium-nom");
      var catEl  = carte.querySelector(".podium-categorie");
      var scorEl = carte.querySelector(".score-valeur");
      var lienEl = carte.querySelector(".podium-lien");

      if (nomEl)  nomEl.textContent  = item.nom;
      if (catEl)  catEl.textContent  = libelleCategorie(item.categorie);
      if (scorEl) scorEl.textContent = item.score != null ? item.score : "—";
      if (lienEl) lienEl.href        = lienSur(item.lien_projet);
    });

    /* Tableau : on retire les lignes d'exemple puis on ajoute les vraies (rang 4 et plus) */
    var tableau = document.querySelector(".classement-tableau");
    if (!tableau) return;
    tableau.querySelectorAll(".classement-ligne").forEach(function (l) { l.remove(); });

    data.filter(function (r) { return r.rang > 3; }).forEach(function (item) {
      var ligne = document.createElement("div");
      ligne.className = "classement-ligne";
      ligne.setAttribute("data-categorie", item.categorie);
      ligne.innerHTML =
        '<span class="cl-rang">' + esc(item.rang) + '</span>' +
        '<span class="cl-nom">' + esc(item.nom) + '</span>' +
        '<span class="cl-categorie"><i class="fa-solid ' + (ICONES[item.categorie] || "fa-star") + '"></i> ' +
          esc(libelleCategorie(item.categorie)) + '</span>' +
        '<span class="cl-score">' + esc(item.score != null ? item.score : "—") + '</span>' +
        '<a href="' + esc(lienSur(item.lien_projet)) + '" target="_blank" rel="noopener" class="cl-lien">' +
          '<i class="fa-solid fa-arrow-up-right-from-square"></i> Voir</a>';
      tableau.appendChild(ligne);
    });
  }

  /* ── Filtres ── */
  var filtres = document.getElementById("filtres");
  if (filtres) {
    var boutonsFiltre = filtres.querySelectorAll(".filtre-btn");
    boutonsFiltre.forEach(function (btn) {
      btn.addEventListener("click", function () {
        boutonsFiltre.forEach(function (b) { b.classList.remove("actif"); });
        btn.classList.add("actif");
        var filtre = btn.getAttribute("data-filtre");
        document.querySelectorAll(".classement-ligne").forEach(function (ligne) {
          ligne.classList.toggle(
            "masquee",
            filtre !== "tous" && ligne.getAttribute("data-categorie") !== filtre
          );
        });
      });
    });
  }

}); // Fin DOMContentLoaded
