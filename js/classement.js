/* ================================================================
   TechForgeAfro  classement.js
   Gère : affichage classement depuis Supabase, filtres
   Chargé sur : classement.html uniquement
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var supabase          = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var classementContenu = document.getElementById("classementContenu");
  var classementAttente = document.getElementById("classementAttente");

  /* ── Affichage selon état saison ── */
  if (!CLASSEMENT_DISPONIBLE) {
    if (classementContenu) classementContenu.style.display = "none";
    if (classementAttente) classementAttente.style.display = "block";
    return;
  }

  /* ── Charge le classement depuis Supabase ── */
  if (classementContenu) {
    classementContenu.style.display = "block";
    if (classementAttente) classementAttente.style.display = "none";
    chargerClassement();
  }

  function chargerClassement() {
    supabase.from("classement")
      .select("*")
      .order("rang", { ascending: true })
      .then(function (res) {
        if (res.error || !res.data) {
          console.error("Erreur classement:", res.error);
          return;
        }
        afficherClassement(res.data);
      });
  }

  function afficherClassement(data) {
    /* Podium top 3 */
    var top3 = data.filter(function (r) { return r.rang <= 3; });
    top3.forEach(function (item) {
      var carte = document.querySelector(".podium-carte-" + item.rang);
      if (!carte) return;

      var nomEl = carte.querySelector(".podium-nom");
      var catEl = carte.querySelector(".podium-categorie");
      var scorEl = carte.querySelector(".score-valeur");
      var lienEl = carte.querySelector(".podium-lien");

      if (nomEl)  nomEl.textContent  = item.nom;
      if (catEl)  catEl.textContent  = item.categorie;
      if (scorEl) scorEl.textContent = item.score;
      if (lienEl) lienEl.href        = item.lien_projet || "#";
    });

    /* Tableau — rang 4 et plus */
    var tbody = document.getElementById("tbodyClassement");
    if (!tbody) return;

    tbody.innerHTML = "";
    var reste = data.filter(function (r) { return r.rang > 3; });

    reste.forEach(function (item) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-categorie", item.categorie);
      tr.className = "classement-ligne";
      tr.innerHTML =
        '<span class="cl-rang">' + item.rang + '</span>' +
        '<span class="cl-nom">' + item.nom + '</span>' +
        '<span class="cl-categorie">' + item.categorie + '</span>' +
        '<span class="cl-score">' + (item.score || "—") + '</span>' +
        '<a href="' + (item.lien_projet || "#") + '" target="_blank" class="cl-lien">' +
          '<i class="fa-solid fa-arrow-up-right-from-square"></i> Voir' +
        '</a>';
      tbody.appendChild(tr);
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
