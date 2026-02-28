/**
 * Generates a fully self-contained, offline-capable HTML file with
 * an interactive JSON tree viewer, search, expand/collapse, and syntax highlighting.
 * No external dependencies or network calls.
 */
export function generateHtml(json: string): string {
  // Safely embed JSON as a JS string literal
  // Double-encode: JSON string → JSON-stringified → safe to embed in <script>
  const jsonLiteral = JSON.stringify(json)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");

  const now = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Export · JSON Prism</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0f1117;
      --bg2: #161b22;
      --border: #21262d;
      --text: #c9d1d9;
      --muted: #8b949e;
      --dim: #484f58;
      --primary: #22d3ee;
      --s: #7ee787;
      --num: #ffa657;
      --b: #d2a8ff;
      --k: #79c0ff;
      --br: #6e7681;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f6f8fa;
        --bg2: #ffffff;
        --border: #d0d7de;
        --text: #1f2328;
        --muted: #57606a;
        --dim: #8c959f;
        --primary: #0e7490;
        --s: #116329;
        --num: #953800;
        --b: #8250df;
        --k: #0550ae;
        --br: #6e7781;
      }
    }

    body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; min-height: 100vh; }

    header {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 20px;
      background: var(--bg2); border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 10;
    }
    .logo-icon {
      width: 28px; height: 28px; border-radius: 6px;
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: var(--primary);
    }
    .logo-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1; }
    .logo-sub { font-size: 11px; color: var(--muted); }
    .privacy {
      margin-left: auto; display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: var(--muted);
      background: color-mix(in srgb, var(--primary) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
      border-radius: 20px; padding: 3px 10px;
    }
    .dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }

    .toolbar {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 8px 20px;
      background: var(--bg2); border-bottom: 1px solid var(--border);
      position: sticky; top: 49px; z-index: 9;
    }
    #q {
      flex: 1; min-width: 180px; max-width: 360px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
      color: var(--text); font-size: 13px; padding: 5px 10px;
      outline: none; transition: border-color 0.15s;
    }
    #q:focus { border-color: color-mix(in srgb, var(--primary) 40%, transparent); }
    #q::placeholder { color: var(--dim); }
    .btn {
      background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
      color: var(--muted); padding: 5px 12px; font-size: 12px;
      cursor: pointer; transition: all 0.15s;
    }
    .btn:hover { color: var(--primary); border-color: color-mix(in srgb, var(--primary) 30%, transparent); }
    #mc { font-size: 11px; color: var(--dim); }
    .stats { margin-left: auto; font-size: 11px; color: var(--dim); }

    main { padding: 20px; }

    .tree {
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
      font-size: 13px; line-height: 1.85;
    }
    .row { display: block; border-radius: 3px; padding: 0 2px; }
    .row.h { background: color-mix(in srgb, #fbbf24 12%, transparent); }
    .row.hidden { display: none; }
    .ch { margin-left: 18px; border-left: 1px solid var(--border); padding-left: 10px; }
    .tog {
      display: inline-block; width: 14px; font-size: 10px;
      cursor: pointer; user-select: none; color: var(--dim);
      transition: color 0.1s;
    }
    .tog:hover { color: var(--muted); }
    .sm { color: var(--dim); font-size: 11px; font-family: -apple-system, system-ui, sans-serif; }

    .k { color: var(--k); }
    .s { color: var(--s); }
    .num { color: var(--num); }
    .b { color: var(--b); }
    .n { color: var(--br); font-style: italic; }
    .br { color: var(--br); }
    .cm { color: var(--br); }

    .invalid {
      padding: 20px; color: #f85149; font-family: monospace;
      white-space: pre-wrap; background: #ff000010;
      border: 1px solid #f8514930; border-radius: 8px; margin: 20px;
    }

    footer {
      text-align: center; padding: 24px; margin-top: 40px;
      font-size: 11px; color: var(--dim); border-top: 1px solid var(--border);
    }
    footer a { color: var(--primary); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <div class="logo-icon">{}</div>
    <div>
      <div class="logo-name">JSON Prism</div>
      <div class="logo-sub">Interactive Export</div>
    </div>
    <div class="privacy">
      <div class="dot"></div>
      No data sent anywhere &middot; Works offline
    </div>
  </header>

  <div class="toolbar">
    <input id="q" type="text" placeholder="&#128269; Search keys and values&hellip;" autocomplete="off" />
    <button class="btn" id="exp-btn">&#9660; Expand All</button>
    <button class="btn" id="col-btn">&#9654; Collapse All</button>
    <span id="mc"></span>
    <span class="stats" id="stats"></span>
  </div>

  <main><div id="root" class="tree"></div></main>

  <footer>
    Generated by <a href="https://bright-json.vercel.app" target="_blank">JSON Prism</a>
    &middot; ${now} &middot; Your data never leaves your browser
  </footer>

  <script>
  (function () {
    var RAW = ${jsonLiteral};
    var data;
    try { data = JSON.parse(RAW); } catch (e) {
      document.getElementById('root').innerHTML =
        '<div class="invalid">&#10060; Invalid JSON\\n\\n' + RAW.replace(/</g,'&lt;') + '</div>';
      return;
    }

    var nid = 0;

    function esc(s) {
      return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function render(val, isLast) {
      var comma = isLast ? '' : '<span class="cm">,</span>';
      if (val === null)             return '<span class="n">null</span>' + comma;
      if (typeof val === 'boolean') return '<span class="b">' + val + '</span>' + comma;
      if (typeof val === 'number')  return '<span class="num">' + val + '</span>' + comma;
      if (typeof val === 'string')  return '<span class="s">&quot;' + esc(val) + '&quot;</span>' + comma;

      var isArr = Array.isArray(val);
      var keys  = Object.keys(val);
      var id    = ++nid;
      var open  = isArr ? '[' : '{';
      var close = isArr ? ']' : '}';

      if (keys.length === 0) return '<span class="br">' + open + close + '</span>' + comma;

      var count = isArr
        ? keys.length + ' item' + (keys.length !== 1 ? 's' : '')
        : keys.length + ' key' + (keys.length !== 1 ? 's' : '');

      var rows = keys.map(function (k, i) {
        var last    = i === keys.length - 1;
        var keyPart = isArr ? '' : '<span class="k">&quot;' + esc(k) + '&quot;</span><span class="br">: </span>';
        return '<div class="row" data-t="' + esc(k) + ' ' + esc(String(val[k])).slice(0, 80) + '">' + keyPart + render(val[k], last) + '</div>';
      }).join('');

      return '<span class="tog" data-id="' + id + '">&#9660;</span>' +
             '<span class="br">' + open + '</span>' +
             '<span class="sm" id="sm' + id + '" style="display:none">&nbsp;' + count + '</span>' +
             '<div class="ch" id="ch' + id + '">' + rows + '</div>' +
             '<span class="br">' + close + '</span>' + comma;
    }

    var root = document.getElementById('root');
    root.innerHTML = '<div class="row">' + render(data, true) + '</div>';

    // Show stats
    var totalKeys = root.querySelectorAll('.row').length;
    document.getElementById('stats').textContent =
      totalKeys.toLocaleString() + ' nodes · ' + RAW.length.toLocaleString() + ' chars';

    // Toggle via event delegation
    root.addEventListener('click', function (e) {
      var tg = e.target;
      if (!tg || tg.className !== 'tog') return;
      var id = tg.getAttribute('data-id');
      var ch = document.getElementById('ch' + id);
      var sm = document.getElementById('sm' + id);
      var collapsed = ch.style.display === 'none';
      ch.style.display = collapsed ? '' : 'none';
      sm.style.display = collapsed ? 'none' : 'inline';
      tg.innerHTML     = collapsed ? '&#9660;' : '&#9654;';
    });

    // Expand all
    document.getElementById('exp-btn').onclick = function () {
      root.querySelectorAll('.ch').forEach(function (el) { el.style.display = ''; });
      root.querySelectorAll('.sm').forEach(function (el) { el.style.display = 'none'; });
      root.querySelectorAll('.tog').forEach(function (el) { el.innerHTML = '&#9660;'; });
    };

    // Collapse all
    document.getElementById('col-btn').onclick = function () {
      root.querySelectorAll('.ch').forEach(function (el) { el.style.display = 'none'; });
      root.querySelectorAll('.sm').forEach(function (el) { el.style.display = 'inline'; });
      root.querySelectorAll('.tog').forEach(function (el) { el.innerHTML = '&#9654;'; });
    };

    // Search
    var searchTimer;
    document.getElementById('q').addEventListener('input', function () {
      clearTimeout(searchTimer);
      var q = this.value;
      searchTimer = setTimeout(function () {
        var lq = q.toLowerCase().trim();
        var rows = root.querySelectorAll('.row');
        var count = 0;
        rows.forEach(function (r) {
          var t = (r.getAttribute('data-t') || r.textContent || '').toLowerCase();
          var match = lq.length > 0 && t.includes(lq);
          r.classList.toggle('h', match);
          if (match) count++;
        });
        document.getElementById('mc').textContent =
          lq ? count.toLocaleString() + ' match' + (count !== 1 ? 'es' : '') : '';
      }, 120);
    });
  })();
  </script>
</body>
</html>`;
}
