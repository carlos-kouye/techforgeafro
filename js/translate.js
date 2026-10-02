/* ================================================================
   TechForgeAfro — translate.js
   Gère la traduction FR/EN sur toutes les pages
   Chargé après core.js sur toutes les pages
================================================================ */

/* Initialisation widget Google Translate */
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'fr',
    includedLanguages: 'en',
    autoDisplay: false
  }, 'google_translate_element');
}

/* Injection du script Google Translate */
(function () {
  var script = document.createElement('script');
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(script);
})();

/* Logique bouton FR/EN */
document.addEventListener("DOMContentLoaded", function () {

  var btnTraduire = document.getElementById("btnTraduire");
  var langueLabel = document.getElementById("langueLabel");

  /* Vérifie si la page est déjà traduite via cookie */
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

});