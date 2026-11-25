(function () {
  "use strict";

  var DAYS = [
    ["Monday", "সোমবার"], ["Tuesday", "মঙ্গলবার"], ["Wednesday", "বুধবার"],
    ["Thursday", "বৃহস্পতিবার"], ["Friday", "শুক্রবার"], ["Saturday", "শনিবার"], ["Sunday", "রবিবার"]
  ];

  var hoursDiv = document.getElementById("hours");
  var output = document.getElementById("output");
  var issuesList = document.getElementById("issues");

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function isUrl(s) { return /^https?:\/\/[^\s]+\.[^\s]+/i.test(s); }
  function isPhone(s) { return /^\+?[0-9][0-9\s\-]{6,18}$/.test(s); }

  // Build the opening hours rows
  DAYS.forEach(function (d, i) {
    var row = document.createElement("div");
    row.className = "hours-row";
    row.innerHTML =
      '<span>' + d[1] + '</span>' +
      '<input type="time" id="open' + i + '" value="09:00" aria-label="' + d[1] + ' খোলার সময়">' +
      '<input type="time" id="close' + i + '" value="18:00" aria-label="' + d[1] + ' বন্ধের সময়">' +
      '<label class="closed-box"><input type="checkbox" id="closed' + i + '"> বন্ধ</label>';
    hoursDiv.appendChild(row);
  });

  function buildHours() {
    var specs = [];
    DAYS.forEach(function (d, i) {
      if (document.getElementById("closed" + i).checked) return;
      var o = val("open" + i), c = val("close" + i);
      if (!o || !c) return;
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "https://schema.org/" + d[0],
        "opens": o,
        "closes": c
      });
    });
    return specs;
  }

  function collect() {
    var socials = val("socials")
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(isUrl);
    var hours = buildHours();

    return {
      "@context": "https://schema.org",
      "@type": val("type") || "LocalBusiness",
      "name": val("name"),
      "description": val("description"),
      "image": isUrl(val("image")) ? val("image") : "",
      "telephone": val("phone"),
      "email": val("email"),
      "url": isUrl(val("url")) ? val("url") : "",
      "priceRange": val("priceRange"),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": val("address"),
        "addressLocality": val("locality"),
        "postalCode": val("postal"),
        "addressCountry": "BD"
      },
      "openingHoursSpecification": hours,
      "sameAs": socials,
      "hasMap": isUrl(val("mapUrl")) ? val("mapUrl") : ""
    };
  }

  // Remove empty fields so the JSON stays clean
  function clean(obj) {
    if (Array.isArray(obj)) {
      return obj.map(clean).filter(function (v) {
        return v !== "" && v !== undefined && !(typeof v === "object" && Object.keys(v).length === 0);
      });
    }
    if (obj && typeof obj === "object") {
      var out = {};
      Object.keys(obj).forEach(function (k) {
        var v = clean(obj[k]);
        if (v === "" || v === undefined || v === null) return;
        if (Array.isArray(v) && v.length === 0) return;
        if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 1 && v["@type"]) return;
        out[k] = v;
      });
      return out;
    }
    return obj;
  }

  function validate(data) {
    var list = [];
    if (!data.name) list.push(["err", "ব্যবসার নাম দিন।"]);
    if (!data.address || !data.address.streetAddress) list.push(["err", "ঠিকানা দিন।"]);
    if (!data.address || !data.address.addressLocality) list.push(["err", "শহর বা এলাকা দিন।"]);
    if (!data.telephone) list.push(["err", "ফোন নম্বর দিন। গ্রাহক সরাসরি কল করতে পারা বিশ্বাসের প্রথম ধাপ।"]);
    else if (!isPhone(data.telephone)) list.push(["warn", "ফোন নম্বরের ফরম্যাট ঠিক মনে হচ্ছে না।"]);
    if (!data.url) list.push(["warn", "ওয়েবসাইট না থাকলে Google Business Profile বা ফেসবুক পেজের লিংক দিন।"]);
    if (!data.image) list.push(["warn", "দোকানের একটি বাস্তব ছবির লিংক দিলে বিশ্বাসযোগ্যতা বাড়ে।"]);
    if (!data.openingHoursSpecification) list.push(["warn", "খোলার সময় দিন। না দিলে গ্রাহক জানতে পারবে না কখন আসবেন।"]);
    if (!data.sameAs) list.push(["warn", "সোশ্যাল মিডিয়া লিংক যোগ করলে ব্যবসা যাচাইযোগ্য মনে হয়।"]);
    if (!data.description) list.push(["warn", "একটি বর্ণনা লিখুন, এতে কী সেবা দেওয়া হয় তা স্পষ্ট হবে।"]);
    if (list.length === 0) list.push(["ok", "সব আবশ্যক তথ্য ঠিক আছে। এখন কোডটি ওয়েবসাইটে বসিয়ে পরীক্ষা করুন।"]);
    return list;
  }

  function buildScript() {
    var data = clean(collect());
    return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n</script>';
  }

  function render() {
    var data = clean(collect());
    issuesList.innerHTML = "";
    validate(data).forEach(function (item) {
      var li = document.createElement("li");
      li.className = item[0];
      li.textContent = item[1];
      issuesList.appendChild(li);
    });
    output.textContent = buildScript();
  }

  document.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  document.getElementById("copy").addEventListener("click", function () {
    var text = buildScript();
    function done() { alert("কোড কপি হয়েছে।"); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      var t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
      done();
    }
  });

  document.getElementById("download").addEventListener("click", function () {
    var name = val("name") || "business";
    var html = '<!DOCTYPE html>\n<html lang="bn">\n<head>\n<meta charset="UTF-8">\n<title>' +
      name.replace(/</g, "&lt;") + '</title>\n' + buildScript() + '\n</head>\n<body>\n<h1>' +
      name.replace(/</g, "&lt;") + '</h1>\n</body>\n</html>';
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "schema-" + name.replace(/\s+/g, "-") + ".html";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // PWA: install button and service worker
  var deferredPrompt = null;
  var installBtn = document.getElementById("installBtn");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  render();
})();
