(function () {
  var KEY = "kig-analytics";
  var banner = document.getElementById("consent");
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function clearGa() {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n.indexOf("_ga") === 0) {
        var host = location.hostname.replace(/^www\./, "");
        ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
          document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }
  function loadGa() {
    var id = window.KIG_GA;
    if (!id || window.__kigGa) return;
    window.__kigGa = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
  }
  function choose(v) {
    set(v);
    if (banner) banner.hidden = true;
    if (v === "granted") loadGa();
    else { if (window.__kigGa) { set("denied"); location.reload(); return; } clearGa(); }
  }
  if (banner) {
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-consent]");
      if (b) choose(b.getAttribute("data-consent"));
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cookie-settings]");
    if (b && banner) { e.preventDefault(); banner.hidden = false; banner.querySelector("button").focus(); }
  });
  var v = get();
  if (v === "granted") loadGa();
  else if (v !== "denied" && banner) banner.hidden = false;
})();
