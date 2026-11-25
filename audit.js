(function () {
  "use strict";

  // Each check: id, label (client-friendly), fix (what to do), weight 10
  var CHECKS = [
    { id: "name", label: "ব্যবসার নাম সাইনবোর্ড ও প্রোফাইলে একই",
      fix: "প্রোফাইলের নাম আপনার দোকানের সাইনবোর্ডের নামের সাথে হুবহু মিলিয়ে দিন। অতিরিক্ত কীওয়ার্ড যোগ করবেন না।" },
    { id: "address", label: "সম্পূর্ণ ঠিকানা দেওয়া আছে",
      fix: "রোড, বাড়ি নম্বর, এলাকা ও শহর সহ পূর্ণ ঠিকানা লিখুন। ম্যাপের পিন সঠিক জায়গায় আছে কিনা দেখুন।" },
    { id: "phone", label: "সরাসরি কল করার নম্বর আছে",
      fix: "সক্রিয় ফোন নম্বর যোগ করুন। সম্ভব হলে WhatsApp নম্বরও একই সাথে দিন।" },
    { id: "hours", label: "খোলার সময় ও ছুটির দিনের সময় দেওয়া",
      fix: "প্রতিদিনের খোলার সময় লিখুন। ঈদ ও বিশেষ ছুটির দিনের সময়ও আপডেট রাখুন।" },
    { id: "category", label: "প্রধান ক্যাটাগরি সঠিক",
      fix: "আপনার প্রধান সেবার সাথে মেলে এমন ক্যাটাগরি বেছে নিন। অপ্রাসঙ্গিক ক্যাটাগরি সরিয়ে দিন।" },
    { id: "website", label: "ওয়েবসাইট বা বুকিং লিংক আছে",
      fix: "ওয়েবসাইট না থাকলে ফেসবুক পেজ বা অ্যাপয়েন্টমেন্ট লিংক যোগ করুন। অন্তত একটি লিংক থাকা জরুরি।" },
    { id: "description", label: "ব্যবসার বর্ণনা লেখা আছে",
      fix: "কী সেবা দেন, কোথায় দেন এবং কাদের জন্য, তা ২-৩ বাক্যে লিখুন। স্বাভাবিক ভাষায় লিখুন, কীওয়ার্ড ঠাসবেন না।" },
    { id: "services", label: "প্রধান সেবা/পণ্যের তালিকা আছে",
      fix: "আপনার প্রধান সেবাগুলো তালিকায় যোগ করুন, প্রতিটির পাশে সম্ভব হলে দাম দিন।" },
    { id: "ownerVerified", label: "প্রোফাইলটি মালিকের দ্বারা যাচাই করা",
      fix: "গুগল বিজনেস প্রোফাইলে যাচাই (verification) সম্পন্ন করুন। এটি ছাড়া অনেক তথ্য সম্পাদনা করা যায় না।" },
    { id: "realPhotos", label: "দোকান/অফিসের আসল ছবি আছে (স্টক ছবি নয়)",
      fix: "দোকানের ভেতর, বাইরে, সেবার মুহূর্ত ও দলের ছবি তুলে যোগ করুন। স্টক বা নকল ছবি ব্যবহার করবেন না।" }
  ];

  // Auto-scored items: id, label, threshold, fix
  var AUTO = [
    { id: "photos", label: "আসল ছবি ১০টি বা তার বেশি", key: "photos", min: 10,
      fix: "নিয়মিত নতুন আসল ছবি যোগ করুন। মাসে অন্তত ২-৩টি নতুন ছবি দিলে প্রোফাইল সক্রিয় থাকে।" },
    { id: "reviews", label: "মোট রিভিউ ২০টি বা তার বেশি", key: "reviews", min: 20,
      fix: "সেবা শেষে সৌজন্যে রিভিউ চাইতে বলুন। একটি QR কোড বা ছোট কার্ড কাউন্টারে রাখলে সহজ হয়। রিভিউ কেনা বা জাল রিভিউ নীতিবিরুদ্ধ, তা এড়িয়ে চলুন।" },
    { id: "replies", label: "৮০% বা তার বেশি রিভিউয়ের উত্তর দেওয়া", key: "replyPct", min: 80,
      fix: "প্রতিটি রিভিউয়ে ধন্যবাদ দিন। খারাপ রিভিউয়ে শান্তভাবে সমাধান জানান। উত্তর দেওয়া গ্রাহকদের আস্থা বাড়ায়।" }
  ];

  var WEIGHT = 10;

  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseInt($(id).value, 10); return isNaN(v) ? 0 : v; }

  // Build checkboxes
  var checksDiv = $("checks");
  CHECKS.forEach(function (c) {
    var row = document.createElement("label");
    row.className = "check-row";
    row.innerHTML = '<input type="checkbox" id="c_' + c.id + '"> <span>' + c.label + '</span>';
    checksDiv.appendChild(row);
  });

  function score() {
    var results = [];

    CHECKS.forEach(function (c) {
      var ok = $("c_" + c.id).checked;
      results.push({ label: c.label, ok: ok, fix: c.fix, points: ok ? WEIGHT : 0 });
    });

    AUTO.forEach(function (a) {
      var value = num(a.key);
      var ok = value >= a.min;
      results.push({ label: a.label, ok: ok, fix: a.fix, points: ok ? WEIGHT : 0 });
    });

    var total = results.reduce(function (s, r) { return s + r.points; }, 0);
    return { total: total, results: results };
  }

  function level(total) {
    if (total >= 80) return { name: "ভালো অবস্থায় আছে", tone: "ok",
      note: "প্রোফাইল শক্ত। এখন নিয়মিত আপডেট রাখলেই হবে।" };
    if (total >= 50) return { name: "উন্নতি দরকার", tone: "warn",
      note: "ভিত্তি ভালো, কিন্তু কিছু গুরুত্বপূর্ণ তথ্য বাদ আছে। সেগুলো ঠিক করলে খদ্দের বাড়তে পারে।" };
    return { name: "মনোযোগ দরকার", tone: "err",
      note: "অনেক গুরুত্বপূর্ণ তথ্য নেই। গ্রাহকরা হয়তো আপনাকে খুঁজে পাচ্ছেন না বা কল করতে দ্বিধা করছেন।" };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function buildReport() {
    var name = $("bizName").value.trim() || "আপনার ব্যবসা";
    var area = $("bizArea").value.trim();
    var s = score();
    var lv = level(s.total);
    var date = new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

    var failed = s.results.filter(function (r) { return !r.ok; });
    var top = failed.slice(0, 3);
    var passed = s.results.filter(function (r) { return r.ok; });

    var html = "";
    html += '<header class="report-head">';
    html += '<h1>গুগল বিজনেস প্রোফাইল অডিট</h1>';
    html += '<p class="report-meta"><strong>' + esc(name) + '</strong>' + (area ? ' · ' + esc(area) : '') + '<br>তারিখ: ' + esc(date) + '</p>';
    html += '</header>';

    html += '<section class="report-score tone-' + lv.tone + '">';
    html += '<div class="score-num">' + s.total + '<span>/১০০</span></div>';
    html += '<div><strong>' + lv.name + '</strong><p>' + lv.note + '</p></div>';
    html += '</section>';

    html += '<section><h2>সবচেয়ে গুরুত্বপূর্ণ ৩টি সমস্যা</h2>';
    if (top.length === 0) {
      html += '<p>কোনো বড় সমস্যা পাওয়া যায়নি।</p>';
    } else {
      html += '<ol class="issue-list">';
      top.forEach(function (r) {
        html += '<li><strong>' + esc(r.label) + '</strong><br><span>কী করবেন: ' + esc(r.fix) + '</span></li>';
      });
      html += '</ol>';
    }
    html += '</section>';

    html += '<section><h2>সম্পূর্ণ চেকলিস্ট</h2><table class="report-table"><thead><tr><th>বিষয়</th><th>অবস্থা</th></tr></thead><tbody>';
    s.results.forEach(function (r) {
      html += '<tr><td>' + esc(r.label) + '</td><td class="' + (r.ok ? 'pass' : 'fail') + '">' + (r.ok ? 'ঠিক আছে' : 'উন্নতি দরকার') + '</td></tr>';
    });
    html += '</tbody></table></section>';

    if (failed.length > 3) {
      html += '<section><h2>অন্যান্য উন্নতি</h2><ul>';
      failed.slice(3).forEach(function (r) {
        html += '<li>' + esc(r.label) + ': ' + esc(r.fix) + '</li>';
      });
      html += '</ul></section>';
    }

    html += '<section class="report-foot"><p><strong>সীমাবদ্ধতা:</strong> এই স্কোর আপনার দেওয়া তথ্যের ভিত্তিতে তৈরি। গুগলের লাইভ ডেটা বা র‍্যাঙ্কিং এখানে যাচাই করা হয়নি। গুগল র‍্যাঙ্কিং অনেক কারণের উপর নির্ভর করে, এবং কোনো নির্দিষ্ট ফলাফল নিশ্চিত করা যায় না।</p></section>';

    return html;
  }

  $("showReport").addEventListener("click", function () {
    if (!$("bizName").value.trim()) {
      alert("ব্যবসার নাম লিখুন।");
      $("bizName").focus();
      return;
    }
    $("report").innerHTML = buildReport();
    $("formArea").hidden = true;
    $("reportArea").hidden = false;
    window.scrollTo(0, 0);
  });

  $("backBtn").addEventListener("click", function () {
    $("reportArea").hidden = true;
    $("formArea").hidden = false;
    window.scrollTo(0, 0);
  });

  $("printBtn").addEventListener("click", function () {
    window.print();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
