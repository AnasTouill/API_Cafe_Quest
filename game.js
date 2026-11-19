/* API Café Quest: a small game about REST APIs and GraphQL.
   Plain HTML, CSS and JavaScript. No libraries, no build step. */
(() => {
  "use strict";

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const reduced = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const T = (ms) => (reduced() ? 1 : ms);

  // ---------- icons ----------
  const PATHS = {
    heart: '<path d="M12 21s-7.6-4.7-9.6-9.3C.9 8.1 3.3 4.4 7 4.4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.7 0 6.1 3.7 4.6 7.3C19.6 16.3 12 21 12 21z"/>',
    star: '<path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    soundOn: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    soundOff: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    cup: '<path d="M4 8h12v5a6 6 0 0 1-12 0V8zM16 9h2a3 3 0 0 1 0 6h-2.3M7 4.5c0-1 1-1 1-2M11 4.5c0-1 1-1 1-2"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 8 5-3 5 3-1.5-8"/>',
  };
  const FILLED = new Set(["heart", "star"]);
  const icon = (n, cls = "") => `<svg class="ic ${FILLED.has(n) ? "fill" : ""} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[n]}</svg>`;

  // ---------- vocabulary ----------
  const VERB_LIST = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const VERBS = {
    GET: { meaning: "read", cafe: "look at the menu", status: "200" },
    POST: { meaning: "create", cafe: "place a new order", status: "201" },
    PUT: { meaning: "replace everything", cafe: "replace your whole order", status: "200" },
    PATCH: { meaning: "change a part", cafe: "“no harissa, please”", status: "200" },
    DELETE: { meaning: "remove", cafe: "cancel the order", status: "204" },
  };
  const STATUS = {
    "200": "OK", "201": "Created", "204": "No Content", "301": "Moved Permanently", "304": "Not Modified",
    "400": "Bad Request", "401": "Unauthorized", "403": "Forbidden", "404": "Not Found", "429": "Too Many Requests",
    "500": "Internal Server Error", "503": "Service Unavailable",
  };
  const statusTone = (c) => ({ "2": "good", "3": "info", "4": "warn", "5": "bad" }[String(c)[0]] || "q");
  const PRAISE = ["Mrigel!", "Bravo 3lik!", "Ya3tik sa77a!", "Behi barcha!", "Top!"];
  const OOPS = ["Ma3lich!", "Oups!", "Not quite!"];

  const verbChip = (v) => `<span class="chip" style="--vc:var(--${v.toLowerCase()})">${v}</span>`;
  const reqHTML = (line) => { const i = line.indexOf(" "); const v = line.slice(0, i); return `<span class="req">${verbChip(v)}<code>${esc(line.slice(i + 1))}</code></span>`; };
  const statusHTML = (code) => `<span class="req"><span class="chip status tone-${statusTone(code)}">${code}</span><span class="status-name">${STATUS[code]}</span></span>`;
  const gqlCode = (s) => esc(s)
    .replace(/\b(query|mutation)\b/g, '<span class="tk-kw">$1</span>')
    .replace(/(\w+)\(/g, '<span class="tk-fn">$1</span>(');

  // ---------- drawings ----------
  function catInner() {
    return `
      <path class="c-fur" d="M118 146c28 0 38-30 22-44-6-5-12 1-8 6 9 11 2 26-16 26z"/>
      <ellipse class="c-fur" cx="80" cy="140" rx="44" ry="27"/>
      <ellipse class="c-belly" cx="80" cy="146" rx="24" ry="17"/>
      <path class="c-fur" d="M42 70 38 24l34 22z"/><path class="c-ear" d="M48 60 46 36l18 13z"/>
      <path class="c-fur" d="M118 70l4-46-34 22z"/><path class="c-ear" d="M112 60l2-24-18 13z"/>
      <ellipse class="c-fur" cx="80" cy="86" rx="47" ry="40"/>
      <path class="c-stripe" d="M60 57l4 9M100 57l-4 9M38 84h9M113 84h9"/>
      <path class="c-chechia" d="M57 52c-2-20 8-30 23-30s25 10 23 30c-8 5-38 5-46 0z"/>
      <path class="c-chechia-band" d="M58 49c8 4 36 4 44 0"/>
      <path class="c-tassel" d="M80 23c9-3 19 4 20 15"/><path class="c-tuft" d="M97 35l9 13-10-1z"/>
      <g class="eyes eyes-open"><ellipse cx="63" cy="88" rx="6.5" ry="8.5"/><ellipse cx="97" cy="88" rx="6.5" ry="8.5"/><circle class="c-glint" cx="65.5" cy="84.5" r="2.4"/><circle class="c-glint" cx="99.5" cy="84.5" r="2.4"/></g>
      <g class="eyes eyes-happy"><path d="M55 91q8-11 16 0"/><path d="M89 91q8-11 16 0"/></g>
      <g class="eyes eyes-oops"><path d="M57 82l12 6-12 6"/><path d="M103 82l-12 6 12 6"/></g>
      <ellipse class="c-cheek" cx="51" cy="101" rx="7" ry="4.5"/><ellipse class="c-cheek" cx="109" cy="101" rx="7" ry="4.5"/>
      <path class="c-nose" d="M75 98h10l-5 6z"/>
      <path class="c-mouth" d="M80 104q-4 6-9 3M80 104q4 6 9 3"/>
      <path class="c-whisker" d="M36 99l-18-4M36 105l-18 2M124 99l18-4M124 105l18 2"/>
      <path class="c-sweat" d="M122 62q7 10 0 14-7-4 0-14z"/>
      <ellipse class="c-paw" cx="63" cy="164" rx="12" ry="6.5"/><ellipse class="c-paw" cx="97" cy="164" rx="12" ry="6.5"/>`;
  }
  const catSVG = (mood = "idle", cls = "") =>
    `<svg class="cat ${cls}" data-mood="${mood}" viewBox="0 0 160 172" role="img" aria-label="Gattous, the server cat, wearing a red chechia">${catInner()}</svg>`;

  function phoneSVG() {
    return `<svg class="phone" viewBox="0 0 110 150" aria-hidden="true">
      <path class="p-arm" d="M20 88q-15 2-13 20"/>
      <rect class="p-body" x="20" y="8" width="72" height="134" rx="16"/>
      <rect class="p-screen" x="28" y="22" width="56" height="98" rx="9"/>
      <circle class="p-eye" cx="45" cy="62" r="5.5"/><circle class="p-eye" cx="67" cy="62" r="5.5"/>
      <circle class="p-glint" cx="47" cy="60" r="1.8"/><circle class="p-glint" cx="69" cy="60" r="1.8"/>
      <ellipse class="p-cheek" cx="38" cy="74" rx="5" ry="3"/><ellipse class="p-cheek" cx="74" cy="74" rx="5" ry="3"/>
      <path class="p-smile" d="M47 76q9 9 18 0"/>
      <rect class="p-bar" x="46" y="128" width="20" height="5" rx="2.5"/>
    </svg>`;
  }

  function doorSVG() {
    let studs = "";
    for (let y = 80; y <= 138; y += 12) for (const x of [34, 47, 73, 86]) studs += `<circle cx="${x}" cy="${y}" r="2.2"/>`;
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI + (k * Math.PI) / 8;
      studs += `<circle cx="${(60 + 29 * Math.cos(a)).toFixed(1)}" cy="${(68 + 29 * Math.sin(a)).toFixed(1)}" r="2.2"/>`;
    }
    return `<svg class="door" viewBox="0 0 120 152" aria-hidden="true">
      <path class="d-frame" d="M6 150V66a54 54 0 0 1 108 0v84z"/>
      <path class="d-inside" d="M20 150V68a40 40 0 0 1 80 0v82z"/>
      <g class="door-leaf"><path class="d-leaf" d="M20 150V68a40 40 0 0 1 80 0v82z"/><g class="d-studs">${studs}</g><circle class="d-knock" cx="88" cy="112" r="5"/></g>
      <path class="d-step" d="M2 150h116"/>
    </svg>`;
  }

  const ART_MENU = `<svg viewBox="0 0 120 90" class="art" aria-hidden="true"><rect x="8" y="6" width="104" height="78" rx="8" class="a-board"/><text x="60" y="24" class="a-chalk-title">MENU</text><g class="a-chalk"><text x="17" y="42">GET /dishes</text><text x="17" y="56">POST /orders</text><text x="17" y="70">DELETE /orders/7</text></g></svg>`;
  const ART_SANDWICH = `<svg viewBox="0 0 120 90" class="art" aria-hidden="true">
    <path d="M10 42c0-17 22-26 50-26s50 9 50 26z" class="a-bread"/><path d="M34 26l6 8M54 22l6 8M76 23l6 8" class="a-score"/>
    <path d="M8 46c10-6 18 6 28 0s18 6 28 0 18 6 28 0 18 6 20 0v6H8z" class="a-lettuce"/>
    <rect x="10" y="51" width="100" height="7" rx="3" class="a-tomato"/><rect x="10" y="58" width="100" height="6" rx="3" class="a-egg"/>
    <rect x="10" y="64" width="100" height="5" rx="2.5" class="a-harissa"/><path d="M10 69h100c0 9-20 14-50 14S10 78 10 69z" class="a-bread"/></svg>`;
  const ART_READ = `<svg viewBox="0 0 120 90" class="art" aria-hidden="true"><rect x="20" y="8" width="62" height="76" rx="8" class="a-page"/><path d="M32 26h38M32 38h38M32 50h24" class="a-lines"/><circle cx="78" cy="56" r="16" class="a-lens"/><path d="M90 68l14 14" class="a-handle"/></svg>`;
  const ART_WRITE = `<svg viewBox="0 0 120 90" class="art" aria-hidden="true"><rect x="14" y="8" width="62" height="76" rx="8" class="a-page"/><path d="M26 26h38M26 38h38M26 50h18" class="a-lines"/><g transform="rotate(38 84 48)"><rect x="78" y="12" width="13" height="56" rx="3" class="a-pencil"/><path d="M78 68h13l-6.5 13z" class="a-tip"/><rect x="78" y="12" width="13" height="9" rx="2" class="a-eraser"/></g></svg>`;
  const MINI_SANDWICH = `<svg viewBox="0 0 120 90" width="70%" aria-hidden="true"><path d="M10 42c0-17 22-26 50-26s50 9 50 26z" class="a-bread"/><path d="M8 46c10-6 18 6 28 0s18 6 28 0 18 6 28 0 18 6 20 0v6H8z" class="a-lettuce"/><rect x="10" y="51" width="100" height="8" rx="3" class="a-tomato"/><rect x="10" y="59" width="100" height="7" rx="3" class="a-egg"/><path d="M10 68h100c0 9-20 14-50 14S10 77 10 68z" class="a-bread"/></svg>`;

  function heroSVG() {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let flowers = "";
    const cluster = (cx, cy, n, spread) => {
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * spread;
        const x = (cx + Math.cos(a) * d * 1.4).toFixed(1), y = (cy + Math.sin(a) * d * 0.8).toFixed(1);
        const r = 5 + rnd() * 7;
        flowers += rnd() < 0.27
          ? `<ellipse class="h-leaf" cx="${x}" cy="${y}" rx="${(r * 1.25).toFixed(1)}" ry="${(r * 0.6).toFixed(1)}" transform="rotate(${Math.round(rnd() * 180)} ${x} ${y})"/>`
          : `<circle class="${rnd() < 0.5 ? "h-bloom" : "h-bloom2"}" cx="${x}" cy="${y}" r="${r.toFixed(1)}"/>`;
      }
    };
    cluster(120, 64, 48, 62); cluster(474, 40, 40, 56); cluster(92, 160, 16, 28);
    let tiles = "";
    for (let x = 40; x <= 500; x += 30) tiles += `<rect class="h-tile" x="${x}" y="378" width="26" height="18" rx="3"/><path class="h-tile-in" d="M${x + 13} 381l7 6-7 6-7-6z"/>`;
    return `<svg class="hero-art" viewBox="0 0 560 400" role="img" aria-label="Gattous the cat, wearing a red chechia, sits in a blue Sidi Bou Said window above the sea">
      <defs>
        <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-1)"/><stop offset="1" stop-color="var(--sky-2)"/></linearGradient>
        <clipPath id="hwin"><path d="M148 356V180a92 92 0 0 1 184 0v176z"/></clipPath>
      </defs>
      <rect class="h-wall" x="0" y="0" width="560" height="400" rx="28"/>
      <path class="h-frame" d="M128 366V180a112 112 0 0 1 224 0v186z"/>
      <g clip-path="url(#hwin)">
        <rect x="140" y="80" width="200" height="290" fill="url(#hsky)"/>
        <circle class="h-sun" cx="196" cy="168" r="24"/>
        <path class="h-sea" d="M140 270q25-8 50 0t50 0 50 0 50 0v100H140z"/>
        <path class="h-wave" d="M150 296q20-6 40 0t40 0 40 0 40 0"/>
        <path class="h-sail" d="M184 262l12-28v28z"/><path class="h-boat" d="M174 264h28l-5 7h-18z"/>
      </g>
      <rect class="h-sill" x="112" y="356" width="256" height="16" rx="5"/>
      ${tiles}
      ${flowers}
      <g transform="translate(146 314)"><path class="h-glass" d="M0 0h26l-4 42H4z"/><path class="h-tea" d="M2.5 14h21l-3 25h-15z"/><circle class="h-nut" cx="9" cy="16" r="2.2"/><circle class="h-nut" cx="15.5" cy="15" r="2.2"/><circle class="h-nut" cx="12" cy="19.5" r="2.2"/><path class="h-mint" d="M15 2c5-9 14-8 14-8s-1 9-12 9z"/></g>
      <g class="cat" data-mood="idle" transform="translate(236 186)">${catInner()}</g>
    </svg>`;
  }

  // ---------- question banks ----------
  const VERB_POOL = [
    { ask: "Show me today’s menu", verb: "GET", path: "/dishes", why: "GET reads data. It never changes anything on the server." },
    { ask: "Show me the profile of student 42", verb: "GET", path: "/students/42", why: "Reading one item is still a GET. The id goes in the path." },
    { ask: "List all the exam results", verb: "GET", path: "/results", why: "Reading a whole list is a GET on the collection." },
    { ask: "Register me as a new student", verb: "POST", path: "/students", why: "POST creates a new item in a collection. The server answers 201 Created." },
    { ask: "Place a new order: one lablebi, please", verb: "POST", path: "/orders", why: "A new order is a new resource, so we use POST." },
    { ask: "Upload a new photo to the class gallery", verb: "POST", path: "/photos", why: "Adding something new means POST." },
    { ask: "Replace my whole profile with this new version", verb: "PUT", path: "/students/42", why: "PUT replaces the entire resource with what you send." },
    { ask: "Overwrite my CV completely with this new one", verb: "PUT", path: "/cvs/42", why: "A complete replacement is PUT. Any field you don't send is gone." },
    { ask: "Change only my phone number, keep the rest", verb: "PATCH", path: "/students/42", why: "PATCH changes only the fields you send." },
    { ask: "Order #7: no harissa, please. Change only that!", verb: "PATCH", path: "/orders/7", why: "Changing one detail of an existing order is a PATCH." },
    { ask: "Fix the typo in my post title, nothing else", verb: "PATCH", path: "/posts/3", why: "A small partial update is a PATCH." },
    { ask: "Cancel my order #7", verb: "DELETE", path: "/orders/7", why: "DELETE removes the resource. The usual answer is 204 No Content." },
    { ask: "Delete my old comment", verb: "DELETE", path: "/comments/15", why: "Removing something is a DELETE." },
  ];

  const ENDPOINT_POOL = [
    { ask: "Get the list of all students", opts: ["GET /students", "GET /getAllStudents", "POST /students/list"], why: "Use a plural noun for the collection. The verb GET already says “get”." },
    { ask: "Get student number 42", opts: ["GET /students/42", "GET /getStudent?id=42", "POST /students/42/read"], why: "One item = the collection + its id: /students/42." },
    { ask: "Create a new course", opts: ["POST /courses", "POST /createCourse", "GET /courses/new"], why: "No verbs in the path. A POST on the collection creates a new item." },
    { ask: "Delete course 7", opts: ["DELETE /courses/7", "GET /courses/7/delete", "POST /deleteCourse?id=7"], why: "The action is the verb DELETE, not a word in the URL. And never delete with GET!" },
    { ask: "Get all the orders of student 42", opts: ["GET /students/42/orders", "GET /ordersOfStudent42", "GET /orders/getByStudent/42"], why: "Nest resources that belong together: /students/42/orders." },
    { ask: "Students who live in Sfax, page 2", opts: ["GET /students?city=sfax&page=2", "GET /getStudentsFromSfaxPage2", "POST /students/search/2"], why: "Filters, sorting and pages go in the query string, after the ?." },
    { ask: "Change only the email of student 42", opts: ["PATCH /students/42", "POST /students/42/updateEmail", "PUT /changeEmail"], why: "A partial change on one student: PATCH /students/42, with the new email in the body." },
    { ask: "Get dish number 3 from the menu", opts: ["GET /dishes/3", "GET /dish_number_3", "GET /Menu/GetDish/3"], why: "Lowercase plural noun + id. Simple and predictable." },
  ];

  const STATUS_POOL = [
    { ask: "Create my student account", req: "POST /students", code: "201", opts: ["201", "200", "404", "500"], why: "201 Created: the new resource exists now. 2xx means success." },
    { ask: "Show me student 9999. He doesn't exist.", req: "GET /students/9999", code: "404", opts: ["404", "403", "500", "201"], why: "404 Not Found: nothing lives at that address. 4xx means the client asked for something wrong." },
    { ask: "Show my grades… but I'm not logged in", req: "GET /grades", code: "401", opts: ["401", "403", "400", "200"], why: "401 Unauthorized means “who are you?”: no valid login or token." },
    { ask: "I'm a student and I try to change my own grade", req: "PATCH /grades/42", code: "403", opts: ["403", "401", "404", "204"], why: "403 Forbidden: the server knows who you are, and the answer is still no." },
    { ask: "Gattous's code has a bug and crashes", req: "GET /dishes", code: "500", opts: ["500", "400", "404", "301"], why: "500: the server's fault, not yours. 5xx means the kitchen is on fire." },
    { ask: "I send broken JSON", req: "POST /orders", body: '{ "dish": "couscous"', code: "400", opts: ["400", "500", "201", "304"], why: "400 Bad Request: the server can't understand what you sent." },
    { ask: "Delete my order. Nothing to send back.", req: "DELETE /orders/7", code: "204", opts: ["204", "404", "201", "500"], why: "204 No Content: it worked, and the response body is empty." },
    { ask: "Show me the menu", req: "GET /dishes", code: "200", opts: ["200", "201", "404", "503"], why: "200 OK: the classic success, with the data in the body." },
    { ask: "I pressed refresh 1000 times in one second", req: "GET /dishes", code: "429", opts: ["429", "500", "400", "200"], why: "429 Too Many Requests: slow down, you hit the rate limit." },
    { ask: "Gattous moved the menu to a new address forever", req: "GET /old-menu", code: "301", opts: ["301", "404", "200", "500"], why: "301 Moved Permanently. 3xx means “look elsewhere”: the new address is in the Location header." },
  ];

  const WHY_QUERY = "Reading data is a <b>query</b> in GraphQL, just like GET in REST.";
  const WHY_MUT = "Changing data (create, update, delete) is a <b>mutation</b>, like POST, PUT, PATCH or DELETE in REST.";
  const OPS_POOL = [
    { t: "Show me today’s menu", a: "query", rest: "GET /dishes", gql: "query { dishes { name price } }" },
    { t: "Get the name of student 42", a: "query", rest: "GET /students/42", gql: "query { student(id: 42) { name } }" },
    { t: "Read my exam grades", a: "query", rest: "GET /students/42/grades", gql: "query { student(id: 42) { grades } }" },
    { t: "Find the students who live in Sfax", a: "query", rest: "GET /students?city=sfax", gql: 'query { students(city: "Sfax") { name } }' },
    { t: "List my friends’ names", a: "query", rest: "GET /students/42/friends", gql: "query { student(id: 42) { friends { name } } }" },
    { t: "Register a new student", a: "mutation", rest: "POST /students", gql: 'mutation { createStudent(name: "Amina") { id } }' },
    { t: "Change my email address", a: "mutation", rest: "PATCH /students/42", gql: 'mutation { updateEmail(id: 42, email: "new@example.com") { email } }' },
    { t: "Cancel order #7", a: "mutation", rest: "DELETE /orders/7", gql: "mutation { cancelOrder(id: 7) { id } }" },
    { t: "Order one lablebi", a: "mutation", rest: "POST /orders", gql: 'mutation { createOrder(dish: "lablebi") { id } }' },
    { t: "Replace my whole profile", a: "mutation", rest: "PUT /students/42", gql: "mutation { replaceProfile(id: 42, profile: {…}) { id } }" },
  ];

  const STYLE_POOL = [
    { t: "GET /students/42", code: true, a: "REST", why: "A verb plus a resource URL: classic REST." },
    { t: "Many URLs: /students, /orders, /dishes", a: "REST", why: "REST gives every resource its own URL." },
    { t: "Uses GET, POST, PUT, PATCH and DELETE", a: "REST", why: "REST uses the HTTP verbs to say what to do. GraphQL usually sends everything with POST." },
    { t: "Very easy to cache in the browser or a CDN", a: "REST", why: "Each GET on a clear URL can be cached by normal HTTP caching." },
    { t: "Errors come back as status codes like 404", a: "REST", why: "REST uses HTTP status codes to say what went wrong." },
    { t: "The most used API style (86% of developers in 2023)", a: "REST", why: "In Postman's 2023 State of the API survey, 86% of developers used REST." },
    { t: "query { student(id: 42) { name } }", code: true, a: "GraphQL", why: "A query that lists exact fields: GraphQL." },
    { t: "Only ONE URL for everything: /graphql", a: "GraphQL", why: "GraphQL has a single endpoint. The query says what you want." },
    { t: "The app picks exactly the fields it needs", a: "GraphQL", why: "No over-fetching: you get exactly the fields you asked for." },
    { t: "One request gets a student, their grades and their friends", a: "GraphQL", why: "GraphQL follows relations in one request, so there's no under-fetching." },
    { t: "type Student { name: String! }", code: true, a: "GraphQL", why: "A GraphQL API is described by a typed schema." },
    { t: "Answers 200 OK, with an “errors” list inside", a: "GraphQL", why: "GraphQL often returns 200 and puts the errors in the response body." },
    { t: "Created at Facebook in 2012 for its mobile app", a: "GraphQL", why: "Facebook built GraphQL in 2012 and open-sourced it in 2015." },
  ];

  const FIELDS = [
    { f: "id", v: "42", ing: "onion", word: "bsal", ink: "dark" },
    { f: "name", v: '"Amina"', ing: "lettuce", word: "salade", ink: "dark" },
    { f: "email", v: '"amina@example.com"', ing: "cheese", word: "fromage", ink: "dark" },
    { f: "phone", v: '"+216 20 123 456"', ing: "tuna", word: "thon", ink: "dark" },
    { f: "city", v: '"Sfax"', ing: "olive", word: "zitoun", ink: "light" },
    { f: "photo", v: '"/img/42.png"', ing: "tomato", word: "tmatem", ink: "light" },
    { f: "birthday", v: '"2004-03-21"', ing: "egg", word: "3dham", ink: "dark" },
    { f: "grades", v: "[15.5, 17, 12]", ing: "harissa", word: "harissa", ink: "light" },
    { f: "friends", v: "[{…}, {…}]", ing: "mechouia", word: "mechouia", ink: "dark" },
  ];
  const GQL_ROUNDS = [
    { ask: "The <b>profile card</b> shows the student's <b>name</b> and <b>photo</b>.", need: ["name", "photo"] },
    { ask: "The <b>exam results</b> page shows the student's <b>name</b> and <b>grades</b>.", need: ["name", "grades"] },
    { ask: "The <b>lablebi delivery</b> app needs the student's <b>name</b>, <b>phone</b> and <b>city</b>.", need: ["name", "phone", "city"] },
    { ask: "The <b>chat</b> screen shows the student's <b>name</b>, <b>photo</b> and <b>friends</b>.", need: ["name", "photo", "friends"] },
  ];

  const balanced = (pool, a, b, n) => shuffle([...shuffle(pool.filter((c) => c.a === a)).slice(0, n), ...shuffle(pool.filter((c) => c.a === b)).slice(0, n)]);

  // ---------- lesson pieces ----------
  const verbTable = (withCode) => `<div class="verb-table">${VERB_LIST.map((v) => `<div class="vt-row ${withCode ? "with-code" : ""}">${verbChip(v)}<b>${VERBS[v].meaning}</b>${withCode ? `<span class="code-ok">${VERBS[v].status} ${STATUS[VERBS[v].status]}</span>` : `<span>${VERBS[v].cafe}</span>`}</div>`).join("")}</div>`;

  const flowArt = () => `<div class="flow-art">
      <div class="fa-actor">${phoneSVG()}<span>Client</span></div>
      <div class="fa-arrows"><span>request ${icon("right")}</span><span class="res">${icon("left")} response</span></div>
      <div class="fa-actor">${doorSVG()}<span>API</span></div>
      <div class="fa-arrows"><span>request ${icon("right")}</span><span class="res">${icon("left")} response</span></div>
      <div class="fa-actor">${catSVG("happy")}<span>Server</span></div>
    </div>`;

  const urlArt = () => `<div class="url-line" aria-label="GET /students/42/orders?page=2, split into its parts">
      <span class="seg seg-verb">${verbChip("GET")}<small>verb</small></span>
      <span class="seg" style="--sc:var(--rest)"><code>/students</code><small>collection</small></span>
      <span class="seg" style="--sc:var(--gql)"><code>/42</code><small>id</small></span>
      <span class="seg" style="--sc:var(--sidi)"><code>/orders</code><small>nested</small></span>
      <span class="seg" style="--sc:var(--good)"><code>?page=2</code><small>filter</small></span>
    </div>
    <div class="dd">
      <div class="dd-row"><span class="dd-bad">${icon("x")} GET /getStudents</span><span class="dd-good">${icon("check")} GET /students</span></div>
      <div class="dd-row"><span class="dd-bad">${icon("x")} POST /deleteStudent?id=7</span><span class="dd-good">${icon("check")} DELETE /students/7</span></div>
    </div>`;

  const platesArt = () => `<div class="plates">${[
    ["2xx", "Success", "“Mrigel, here's your plate!”", "good"],
    ["3xx", "Redirect", "“We moved, go next door”", "info"],
    ["4xx", "Client error", "“That's not on the menu”", "warn"],
    ["5xx", "Server error", "“The kitchen is on fire”", "bad"],
  ].map(([c, n, s, t]) => `<div class="plate tone-${t}"><span class="plate-disc">${c}</span><div><b>${n}</b><span>${s}</span></div></div>`).join("")}</div>`;

  const MAP_ROWS = [
    ["GET /students/42", "query { student(id: 42) { name } }"],
    ["POST /students", 'mutation { createStudent(name: "Amina") { id } }'],
    ["PATCH /students/42", "mutation { updateEmail(id: 42, …) { email } }"],
    ["DELETE /orders/7", "mutation { cancelOrder(id: 7) { id } }"],
  ];
  const mapArt = () => `<div class="map-art">
      <div class="map-head"><span class="t-rest">REST</span><span></span><span class="t-gql">GraphQL · POST /graphql</span></div>
      ${MAP_ROWS.map(([r, g]) => `<div class="map-row">${reqHTML(r)}<span class="map-eq">${icon("right")}</span><code class="gql-chip">${gqlCode(g)}</code></div>`).join("")}
    </div>`;

  const queryHTML = (fields) => {
    const L = ['<span class="tk-kw">query</span> {', '  <span class="tk-fn">student</span>(<span class="tk-arg">id: 42</span>) {'];
    if (!fields.length) L.push('    <span class="tk-c"># pick some fields…</span>');
    fields.forEach((f) => {
      if (f === "friends") L.push('    <span class="tk-f">friends</span> {', '      <span class="tk-f">name</span>', "    }");
      else L.push(`    <span class="tk-f">${f}</span>`);
    });
    L.push("  }", "}");
    return L.join("\n");
  };
  const layersHTML = (fields, added) => fields.map((f) => { const F = FIELDS.find((x) => x.f === f); return `<div class="layer ink-${F.ink} ${f === added ? "drop" : ""}" style="--ic:var(--ing-${F.ing})"><span>${F.f}</span><span>${F.word}</span></div>`; }).join("");

  const gqlMini = () => `<div class="gql-mini">
      <div class="sandwich"><div class="bun-top"></div>${layersHTML(["name", "photo"])}<div class="bun-bottom"></div></div>
      <pre>${queryHTML(["name", "photo"])}</pre>
    </div>
    <div class="fetch-row">
      <div class="fetch bad"><b>Over-fetching</b><span>REST sends fields you don't need.</span></div>
      <div class="fetch bad"><b>Under-fetching</b><span>REST may need several requests.</span></div>
      <div class="fetch good"><b>GraphQL</b><span>One request, exactly the fields you asked for.</span></div>
    </div>`;

  const stylesArt = () => `<div class="styles2">
      <div class="style-card rest">${ART_MENU}<b>REST</b><span>the café menu</span>
        <ul><li>many URLs, one per resource</li><li>GET · POST · PUT · PATCH · DELETE</li><li>easy HTTP caching</li></ul></div>
      <div class="style-card graphql">${ART_SANDWICH}<b>GraphQL</b><span>the kaskrout bar</span>
        <ul><li>one URL: /graphql</li><li>query &amp; mutation</li><li>you pick the exact fields</li></ul></div>
    </div>`;

  const COMPARE = [
    ["URLs", "Many: /students, /orders…", "One: /graphql"],
    ["Actions", "HTTP verbs", "query &amp; mutation"],
    ["Who picks the data?", "The server", "The client"],
    ["Caching", "Easy (HTTP)", "Harder"],
    ["Errors", "Status codes", "“errors” list"],
    ["Great for", "Simple, public APIs", "Apps with many screens"],
  ];
  const compareArt = () => `<div class="cmp" role="table" aria-label="REST compared with GraphQL">
      <span role="columnheader"></span><span role="columnheader" class="cmp-h t-rest">REST</span><span role="columnheader" class="cmp-h t-gql">GraphQL</span>
      ${COMPARE.map(([k, r, g]) => `<span role="rowheader" class="cmp-k">${k}</span><span role="cell">${r}</span><span role="cell">${g}</span>`).join("")}
    </div>`;

  // ---------- levels ----------
  const LEVELS = [
    {
      id: 1, type: "verbs", title: "The 5 verbs", tag: "REST · HTTP verbs", badge: "GET", color: "var(--get)",
      lessonTitle: "REST at Gattous's café: client, API, server",
      points: [
        "Your app is the <b>client</b>. It asks for things.",
        "Gattous's kitchen is the <b>server</b>. It prepares the answer.",
        "The <b>API</b> is the door between them. A <b>REST API</b> takes orders as <b>HTTP requests</b> and sends back <b>responses</b>, usually in JSON.",
        "The <b>verb</b> says what you want to do:",
      ],
      extra: () => verbTable(false),
      art: flowArt,
      recap: VERB_LIST.map((v) => `${verbChip(v)} ${VERBS[v].meaning}`),
      make: () => shuffle(VERB_POOL).slice(0, 8),
    },
    {
      id: 2, type: "endpoint", title: "Endpoints", tag: "REST · URLs", badge: "/42", color: "var(--rest)",
      lessonTitle: "REST endpoints: where the order goes",
      points: [
        "An <b>endpoint</b> is a verb + a path: <code>GET /students/42</code>.",
        "The path names a <b>thing</b> (a noun). The verb is the action. So no <code>/getStudents</code>: write <code>GET /students</code>.",
        "Collections are plural: <code>/students</code>. One item adds its id: <code>/students/42</code>.",
        "Things that belong together are nested: <code>/students/42/orders</code>. Filters and pages go after the <code>?</code>.",
      ],
      analogy: "Like an address in Tunis: the path says where the thing lives, the verb says what to do with it.",
      art: urlArt,
      recap: ["Endpoint = verb + path", "Nouns, not verbs: <code>GET /students</code>", "Id in the path: <code>/students/42</code>", "Filters after the <code>?</code>: <code>?page=2</code>"],
      make: () => shuffle(ENDPOINT_POOL).slice(0, 6),
    },
    {
      id: 3, type: "status", title: "Status codes", tag: "REST · responses", badge: "404", color: "var(--warn)",
      lessonTitle: "Status codes: how did the order go?",
      points: [
        "Every response starts with a 3-digit <b>status code</b>. The first digit tells the story.",
        "<b>2xx</b> success: 200 OK, 201 Created, 204 No Content.",
        "<b>3xx</b> look elsewhere: 301 Moved Permanently.",
        "<b>4xx</b> the client's mistake: 400 Bad Request, 401 “who are you?”, 403 “not allowed”, 404 Not Found, 429 Too Many Requests.",
        "<b>5xx</b> the server's mistake: 500, 503.",
      ],
      analogy: "Like the waiter's answer: here's your plate, we moved next door, that's not on the menu, or the kitchen is on fire.",
      art: platesArt,
      recap: ["<b>2xx</b> = success", "<b>3xx</b> = look elsewhere", "<b>4xx</b> = the client's mistake", "<b>5xx</b> = the server's mistake"],
      make: () => shuffle(STATUS_POOL).slice(0, 7),
    },
    {
      id: 4, type: "sort", title: "Query or mutation?", tag: "GraphQL · operations", badge: "{ }", color: "var(--gql)",
      lessonTitle: "GraphQL: one door, two kinds of orders",
      points: [
        "GraphQL has <b>one</b> endpoint: <code>POST /graphql</code>. No list of URLs to remember.",
        "Instead of a verb, you write an <b>operation</b> in the request body.",
        "<b>query</b> = read data. It's the GraphQL version of <code>GET</code>.",
        "<b>mutation</b> = change data: create, update, delete. Like <code>POST</code>, <code>PUT</code>, <code>PATCH</code> and <code>DELETE</code>.",
        "Bonus: a <b>subscription</b> keeps a live connection open and pushes updates to you.",
      ],
      analogy: "The same orders as in REST, written differently: every REST request has a GraphQL twin.",
      art: mapArt,
      bins: [
        { val: "query", sub: "read data · like GET", art: ART_READ, bc: "var(--info)", bs: "var(--info-soft)" },
        { val: "mutation", sub: "change data · like POST, PUT, PATCH, DELETE", art: ART_WRITE, bc: "var(--gql)", bs: "var(--gql-soft)" },
      ],
      question: "Query or mutation?",
      recap: ["One endpoint: <code>/graphql</code>", "<b>query</b> reads (like GET)", "<b>mutation</b> writes (like POST, PUT, PATCH, DELETE)"],
      make: () => balanced(OPS_POOL, "query", "mutation", 4),
    },
    {
      id: 5, type: "gql", title: "Kaskrout query", tag: "GraphQL · fields", badge: MINI_SANDWICH, color: "var(--bougain)",
      lessonTitle: "Gattous's kaskrout: pick exactly your fields",
      points: [
        "With REST, <code>GET /students/42</code> sends the whole plate: every field, even the ones you don't need. That's <b>over-fetching</b>.",
        "Need the student, their grades and their friends? REST may need several requests. That's <b>under-fetching</b>.",
        "With GraphQL you write the <b>shape</b> you want, send it to <code>/graphql</code>, and the answer has exactly that shape.",
        "Your job: read what the screen needs and pick exactly those fields. No more, no less.",
      ],
      analogy: "Kaskrout rule: say exactly what you want inside, and that's what you get.",
      art: gqlMini,
      recap: ["Over-fetching = data you didn't need", "Under-fetching = too many requests", "GraphQL returns exactly the shape you ask for"],
      make: () => GQL_ROUNDS.slice(),
    },
    {
      id: 6, type: "sort", title: "REST or GraphQL?", tag: "Final boss", badge: "vs", color: "var(--sidi)",
      lessonTitle: "REST or GraphQL? Know the difference",
      points: [
        "<b class=\"t-rest\">REST</b> is the café menu: many URLs (one per resource), the HTTP verbs, status codes and easy caching. It's the most used style.",
        "<b class=\"t-gql\">GraphQL</b> is the kaskrout bar: one URL, you describe exactly the data you want, related data comes in one request, and a typed schema describes everything.",
        "Both travel over <b>HTTP</b> and usually speak <b>JSON</b>.",
        "A simple public API with lots of caching? REST. An app with many screens that each need different data? GraphQL.",
      ],
      art: stylesArt,
      bins: [
        { val: "REST", sub: "the café menu", art: ART_MENU, bc: "var(--rest)", bs: "var(--rest-soft)" },
        { val: "GraphQL", sub: "the kaskrout bar", art: ART_SANDWICH, bc: "var(--gql)", bs: "var(--gql-soft)" },
      ],
      question: "REST or GraphQL?",
      recap: ["REST: many URLs + HTTP verbs + easy caching", "GraphQL: one URL + exact fields + typed schema", "Both use HTTP and JSON"],
      make: () => balanced(STYLE_POOL, "REST", "GraphQL", 4),
    },
  ];
  const MAX_STARS = LEVELS.length * 3;

  // ---------- storage ----------
  const STORE = "apiCafeQuest.v2";
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
  const saved = load();
  const S = {
    score: 0, level: null, queue: [], round: 0, hearts: 3, streak: 0, results: [], busy: false, answered: false,
    sel: new Set(), cur: [], progress: saved.progress || {}, sound: saved.sound !== false, theme: saved.theme || null, name: saved.name || "",
  };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ progress: S.progress, sound: S.sound, theme: S.theme, name: S.name })); } catch (e) { /* storage blocked: progress lasts for this visit only */ } };
  const totalStars = () => LEVELS.reduce((n, L) => n + (S.progress[L.id] || 0), 0);
  const starsHTML = (n, size = "") => [1, 2, 3].map((i) => icon("star", (i <= n ? "star-on" : "star-off") + " " + size)).join("");

  // ---------- sound ----------
  let actx = null;
  function tone(freq, dur = 0.12, type = "sine", when = 0, vol = 0.07) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (e) { /* audio not available */ }
  }
  const sfx = {
    good: () => { tone(660, 0.12, "triangle"); tone(880, 0.18, "triangle", 0.1); },
    bad: () => { tone(240, 0.16, "square", 0, 0.035); tone(170, 0.22, "square", 0.12, 0.035); },
    whoosh: () => tone(520, 0.07, "sine", 0, 0.03),
    tick: (up = true) => tone(up ? 760 : 520, 0.06, "triangle", 0, 0.05),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, "triangle", i * 0.12)),
  };

  // ---------- UI bits ----------
  const app = $("#app");
  const topbar = $("#topbar");
  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function confetti(n = 60) {
    if (reduced()) return;
    const colors = ["var(--sidi)", "var(--bougain)", "var(--sun)", "var(--sea)", "var(--good)", "var(--surface)"];
    const layer = document.createElement("div"); layer.className = "confetti"; layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      if (i % 3 === 0) p.className = "petal";
      p.style.background = colors[i % colors.length];
      p.style.left = Math.random() * 100 + "%";
      layer.appendChild(p);
      const dx = (Math.random() - 0.5) * 240, r = (Math.random() - 0.5) * 900;
      p.animate([{ transform: "translate(0,0) rotate(0deg)" }, { transform: `translate(${dx}px, ${window.innerHeight + 60}px) rotate(${r}deg)` }],
        { duration: 1700 + Math.random() * 1500, delay: Math.random() * 350, easing: "cubic-bezier(.25,.6,.45,1)", fill: "forwards" });
    }
    setTimeout(() => layer.remove(), 3800);
  }

  function currentTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function renderTopbar() {
    const dark = currentTheme() === "dark";
    topbar.innerHTML = `<div class="topbar-inner">
      <button class="brand" data-action="home" aria-label="API Café Quest: back to the map"><svg class="cat" data-mood="idle" viewBox="28 16 104 116" aria-hidden="true">${catInner()}</svg><span>API Café Quest</span></button>
      <div class="top-stats"><span class="score-pill" id="score" title="Your score this session">${icon("star")}<b>${S.score}</b></span></div>
      <nav class="top-actions" aria-label="Game options">
        <button class="icon-btn" data-action="cheat" title="Cheat sheet">${icon("book")}<span class="lbl">Cheat sheet</span></button>
        <button class="icon-btn" data-action="sound" aria-pressed="${S.sound}" title="${S.sound ? "Mute sounds" : "Turn sounds on"}">${icon(S.sound ? "soundOn" : "soundOff")}<span class="sr-only">Sound</span></button>
        <button class="icon-btn" data-action="theme" title="${dark ? "Switch to day" : "Switch to night"}">${icon(dark ? "sun" : "moon")}<span class="sr-only">Theme</span></button>
      </nav>
    </div>`;
  }
  function updateScore() {
    const s = $("#score"); if (!s) return;
    s.querySelector("b").textContent = S.score;
    s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump");
  }

  function show(html, focusSel) {
    app.innerHTML = html;
    app.classList.remove("enter"); void app.offsetWidth; app.classList.add("enter");
    window.scrollTo(0, 0);
    const f = focusSel && $(focusSel, app);
    (f || app).focus({ preventScroll: true });
  }

  // ---------- screens ----------
  function renderHome() {
    S.level = null;
    const firstOpen = LEVELS.find((L) => !S.progress[L.id]);
    const started = totalStars() > 0;
    const allDone = !firstOpen;
    show(`
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">3aslema! · Sidi Bou Said</p>
          <h1>API <span class="accent">Café</span> Quest</h1>
          <p class="lead">Gattous the server cat runs the busiest café on the hill. Every app in town sends him orders. Help him serve them right, and learn how apps talk to servers with <b>REST</b> and <b>GraphQL</b>.</p>
          <div class="actions">
            <button class="btn btn-primary btn-lg" data-action="lesson" data-level="${(firstOpen || LEVELS[0]).id}">${started ? (allDone ? "Play again" : "Continue the quest") : "Start the quest"} ${icon("right")}</button>
            <button class="btn" data-action="cheat">${icon("book")} Cheat sheet</button>
          </div>
          <ol class="how"><li><span><b>Read</b> the key points</span></li><li><span><b>Serve</b> the orders</span></li><li><span><b>Earn</b> stars and a certificate</span></li></ol>
        </div>
        <div class="hero-visual">
          ${heroSVG()}
          <span class="float-chip f1" aria-hidden="true">${reqHTML("GET /dishes")}</span>
          <span class="float-chip f2" aria-hidden="true">${reqHTML("POST /graphql")}</span>
          <span class="float-chip f3" aria-hidden="true">${statusHTML("200")}</span>
        </div>
      </section>
      <section aria-labelledby="map-title">
        <div class="section-head">
          <div><p class="eyebrow">The quest</p><h2 id="map-title">Six doors to open</h2></div>
          <div class="actions">
            <span class="stars-total">${icon("star")} ${totalStars()} / ${MAX_STARS} stars</span>
            ${allDone ? `<button class="btn btn-pink btn-sm" data-action="cert">${icon("award")} Your certificate</button>` : ""}
          </div>
        </div>
        <div class="doors">${LEVELS.map((L) => `
          <button class="door-card" data-action="lesson" data-level="${L.id}" style="--lc:${L.color}" aria-label="Level ${L.id}: ${esc(L.title)}, ${S.progress[L.id] || 0} of 3 stars">
            <span class="door-arch"><span class="door-num">Level ${L.id}</span><span class="door-badge">${L.badge}</span></span>
            <span class="door-text"><span class="door-title">${L.title}</span><span class="door-tag">${L.tag}</span><span class="door-stars">${starsHTML(S.progress[L.id] || 0)}</span></span>
          </button>`).join("")}
        </div>
      </section>`);
  }

  function renderLesson(id) {
    const L = LEVELS[id - 1];
    S.level = null;
    show(`
      <section>
        <button class="btn btn-sm back" data-action="home">${icon("map")} Map</button>
        <div class="lesson-card" style="--lc:${L.color}">
          <div class="lesson-art">${L.art()}</div>
          <div class="lesson-body">
            <p class="eyebrow">Level ${L.id} · Key points</p>
            <h2>${L.lessonTitle}</h2>
            <ul class="points">${L.points.map((p) => `<li>${p}</li>`).join("")}</ul>
            ${L.extra ? L.extra() : ""}
            ${L.analogy ? `<p class="analogy">${icon("cup")}<span>${L.analogy}</span></p>` : ""}
            <div class="actions"><button class="btn btn-primary btn-lg" id="go" data-action="play" data-level="${L.id}">Play level ${L.id} ${icon("right")}</button></div>
          </div>
        </div>
      </section>`, "#go");
  }

  function startLevel(id) {
    const L = LEVELS[id - 1];
    Object.assign(S, { level: L, round: 0, hearts: 3, streak: 0, results: [], busy: false, answered: false });
    S.queue = L.make();
    const boards = { verbs: stageBoard, endpoint: stageBoard, status: stageBoard, sort: sortBoard, gql: gqlBoard };
    show(`
      <section class="play">
        <div class="play-head">
          <button class="btn btn-sm" data-action="lesson" data-level="${L.id}">${icon("left")} Key points</button>
          <div class="play-title"><p class="eyebrow">Level ${L.id} · ${L.tag}</p><h2>${L.title}</h2></div>
          <div class="play-stats"><div class="hearts" id="hearts" role="img"></div><div class="dots" id="dots" role="img"></div></div>
        </div>
        ${boards[L.type](L)}
      </section>`);
    updateHearts(false);
    renderRound();
  }

  function renderRound() {
    S.busy = false; S.answered = false;
    const q = S.queue[S.round];
    ({ verbs: verbsRound, endpoint: endpointRound, status: statusRound, sort: sortRound, gql: gqlRound })[S.level.type](q);
    updateDots();
    const first = $("#options button:not([disabled])");
    if (first && !matchMedia("(hover: none)").matches) first.focus({ preventScroll: true });
  }

  function updateHearts(lost) {
    const h = $("#hearts"); if (!h) return;
    h.innerHTML = [0, 1, 2].map((i) => icon("heart", i < S.hearts ? "heart-on" : "heart-off" + (lost && i === S.hearts ? " heart-lost" : ""))).join("");
    h.setAttribute("aria-label", `${S.hearts} of 3 lives left`);
  }
  function updateDots() {
    const d = $("#dots"); if (!d) return;
    d.innerHTML = S.queue.map((_, i) => `<i class="${S.results[i] === true ? "ok" : S.results[i] === false ? "ko" : i === S.round ? "cur" : ""}"></i>`).join("");
    d.setAttribute("aria-label", `Order ${Math.min(S.round + 1, S.queue.length)} of ${S.queue.length}`);
  }

  function scoreAnswer(ok) {
    let pts = 0;
    if (ok) {
      S.streak++; pts = 100 + Math.min(100, (S.streak - 1) * 20); S.score += pts; sfx.good();
      if (S.streak > 1 && S.streak % 3 === 0) { confetti(26); toast(`${S.streak} in a row! Behi barcha!`); }
    } else { S.streak = 0; S.hearts--; sfx.bad(); }
    S.results[S.round] = ok;
    updateHearts(!ok); updateDots(); updateScore();
    return pts;
  }

  function feedback(ok, html, pts) {
    const fb = $("#feedback"); if (!fb) return;
    const last = S.round >= S.queue.length - 1;
    const label = S.hearts <= 0 ? "See what happened" : last ? "Finish the level" : "Next order";
    fb.className = `feedback ${ok ? "good" : "bad"}`;
    fb.innerHTML = `<div class="fb-head"><span class="fb-icon">${icon(ok ? "check" : "x")}</span><strong>${ok ? pick(PRAISE) : pick(OOPS)}</strong>${ok ? `<span class="fb-pts">+${pts}</span>` : ""}</div>
      <p>${html}</p>
      <button class="btn btn-primary" id="next" data-action="next">${label} ${icon("right")}</button>`;
    fb.hidden = false;
    $("#next").focus({ preventScroll: true });
    const r = fb.getBoundingClientRect();
    if (r.bottom > window.innerHeight) fb.scrollIntoView({ block: "end", behavior: reduced() ? "auto" : "smooth" });
  }

  function lock(chosen, ok, right) {
    const box = $("#options"); if (box) box.classList.add("locked");
    $$("#options button").forEach((b) => { b.disabled = true; });
    chosen.classList.add(ok ? "is-right" : "is-wrong");
    if (right) right.classList.add("is-right");
  }

  function nextRound() {
    if (S.hearts <= 0) return renderFail();
    S.round++;
    if (S.round >= S.queue.length) return renderLevelEnd();
    renderRound();
  }

  // ---------- stage (levels 1-3) ----------
  function stageBoard() {
    return `<div class="board">
      <div class="stage" id="stage">
        <div class="actor" id="a-client">${phoneSVG()}<span class="actor-label">Client app</span></div>
        <div class="actor" id="a-api">${doorSVG()}<span class="actor-label">REST API</span></div>
        <div class="actor" id="a-server">${catSVG("idle", "js-mood")}<span class="actor-label">Server</span></div>
      </div>
      <div class="turn" id="turn"></div>
    </div>`;
  }
  function setMood(m) {
    $$(".js-mood").forEach((c) => { c.setAttribute("data-mood", "idle"); void c.getBoundingClientRect(); c.setAttribute("data-mood", m); });
  }
  function resetStage() { $$("#stage .packet").forEach((p) => p.remove()); setMood("idle"); }
  function packetPos(p, id, dy) {
    const stage = $("#stage"), sr = stage.getBoundingClientRect(), r = $(`#${id} svg`).getBoundingClientRect();
    const pw = p.offsetWidth, ph = p.offsetHeight;
    const cx = r.left - sr.left + r.width / 2, cy = r.top - sr.top + r.height * 0.42;
    const x = Math.max(6, Math.min(sr.width - pw - 6, cx - pw / 2));
    return `translate(${x.toFixed(1)}px, ${(cy - ph / 2 + dy).toFixed(1)}px)`;
  }
  function makePacket(html, kind) {
    const p = document.createElement("div");
    p.className = `packet ${kind}`; p.innerHTML = html; p.setAttribute("aria-hidden", "true");
    $("#stage").appendChild(p);
    return p;
  }
  function fly(fromId, toId, html, kind = "request", stay = false) {
    if (!$("#stage")) return Promise.resolve();
    const p = makePacket(html, kind);
    const dy = kind.startsWith("request") ? -38 : 34;
    const A = packetPos(p, fromId, dy), M = packetPos(p, "a-api", dy + (kind.startsWith("request") ? -10 : 10)), B = packetPos(p, toId, dy);
    const door = $("#a-api .door");
    if (door) { setTimeout(() => door.classList.add("open"), T(330)); setTimeout(() => door.classList.remove("open"), T(900)); }
    sfx.whoosh();
    const anim = p.animate([
      { transform: `${A} scale(.5)`, opacity: 0 },
      { transform: `${A} scale(1)`, opacity: 1, offset: 0.14 },
      { transform: `${M} scale(1.06)`, opacity: 1, offset: 0.52 },
      { transform: `${B} scale(1)`, opacity: 1, offset: 0.9 },
      stay ? { transform: `${B} scale(1)`, opacity: 1 } : { transform: `${B} scale(.6)`, opacity: 0 },
    ], { duration: T(1100), easing: "cubic-bezier(.45,.05,.35,1)", fill: "forwards" });
    return anim.finished.then(() => { if (!stay) p.remove(); }, () => {});
  }

  const bubble = (text, who = "The client asks", raw = false) =>
    `<div class="bubble"><span class="bubble-who">${who}</span><p class="bubble-text">${raw ? text : `“${esc(text)}”`}</p></div>`;

  function verbsRound(q) {
    resetStage();
    $("#turn").innerHTML = `${bubble(q.ask)}
      <p class="hint">Which HTTP verb should the request use?</p>
      <div class="options options-verbs" id="options" role="group" aria-label="HTTP verbs">
        ${VERB_LIST.map((v, i) => `<button class="opt opt-verb" style="--vc:var(--${v.toLowerCase()})" data-action="answer" data-val="${v}" data-key="${i + 1}"><span class="kbd">${i + 1}</span>${v}</button>`).join("")}
      </div>
      <div class="feedback" id="feedback" hidden></div>`;
  }
  function answerVerbs(v, btn) {
    const q = S.queue[S.round], ok = v === q.verb;
    lock(btn, ok, $(`#options [data-val="${q.verb}"]`));
    setMood("think");
    fly("a-client", "a-server", reqHTML(`${v} ${q.path}`)).then(() => {
      if (S.queue[S.round] !== q || !$("#stage")) return;
      setMood(ok ? "happy" : "oops");
      fly("a-server", "a-client", ok ? statusHTML(VERBS[v].status) : `<span class="chip status tone-bad">✗</span><span class="status-name">wrong verb</span>`, ok ? "response" : "response is-bad", true);
    });
    const pts = scoreAnswer(ok);
    feedback(ok, ok ? `<b>${v}</b> = ${VERBS[v].meaning}. ${q.why}` : `You sent <b>${v}</b> (${VERBS[v].meaning}). This order needs <b>${q.verb}</b>: ${q.why}`, pts);
  }

  function endpointRound(q) {
    resetStage();
    S.cur = shuffle(q.opts);
    $("#turn").innerHTML = `${bubble(q.ask)}
      <p class="hint">Pick the most RESTful endpoint</p>
      <div class="options options-ep" id="options" role="group" aria-label="Endpoints">
        ${S.cur.map((o, i) => `<button class="opt opt-ep" data-action="answer" data-val="${i}" data-key="${i + 1}"><span class="kbd">${i + 1}</span>${reqHTML(o)}</button>`).join("")}
      </div>
      <div class="feedback" id="feedback" hidden></div>`;
  }
  function answerEndpoint(i, btn) {
    const q = S.queue[S.round], o = S.cur[+i], ok = o === q.opts[0];
    lock(btn, ok, $(`#options [data-val="${S.cur.indexOf(q.opts[0])}"]`));
    setMood("think");
    fly("a-client", "a-server", reqHTML(o)).then(() => {
      if (S.queue[S.round] !== q || !$("#stage")) return;
      setMood(ok ? "happy" : "oops");
      fly("a-server", "a-client", ok ? statusHTML(VERBS[o.split(" ")[0]].status) : `<span class="chip status tone-warn">?!</span><span class="status-name">not RESTful</span>`, ok ? "response" : "response is-warn", true);
    });
    const pts = scoreAnswer(ok);
    feedback(ok, ok ? q.why : `The RESTful way is <code>${esc(q.opts[0])}</code>. ${q.why}`, pts);
  }

  function statusRound(q) {
    resetStage();
    S.cur = shuffle(q.opts);
    S.busy = true;
    $("#turn").innerHTML = `${bubble(q.ask)}
      <div class="req-line">Request sent: ${reqHTML(q.req)}${q.body ? `<code class="body-snippet">${esc(q.body)}</code>` : ""}</div>
      <p class="hint">Which status code does Gattous answer?</p>
      <div class="options options-status" id="options" role="group" aria-label="Status codes">
        ${S.cur.map((c, i) => `<button class="opt opt-status tone-${statusTone(c)}" data-action="answer" data-val="${c}" data-key="${i + 1}" disabled><span class="kbd">${i + 1}</span><span class="code">${c}</span><span class="name">${STATUS[c]}</span></button>`).join("")}
      </div>
      <div class="feedback" id="feedback" hidden></div>`;
    setMood("think");
    fly("a-client", "a-server", reqHTML(q.req)).then(() => {
      if (S.queue[S.round] !== q || !$("#stage")) return;
      const w = makePacket(`<span class="chip status tone-q">?</span><span class="status-name">thinking…</span>`, "response waiting");
      w.style.transform = packetPos(w, "a-server", 34);
      w.style.setProperty("--pos", w.style.transform);
      $$("#options button").forEach((b) => { b.disabled = false; });
      S.busy = false;
      const first = $("#options button");
      if (first && !matchMedia("(hover: none)").matches) first.focus({ preventScroll: true });
    });
  }
  function answerStatus(c, btn) {
    const q = S.queue[S.round], ok = c === q.code;
    lock(btn, ok, $(`#options [data-val="${q.code}"]`));
    $$("#stage .waiting").forEach((p) => p.remove());
    setMood(ok ? "happy" : "oops");
    fly("a-server", "a-client", statusHTML(q.code), "response" + (statusTone(q.code) === "good" ? "" : statusTone(q.code) === "bad" ? " is-bad" : " is-warn"), true);
    const pts = scoreAnswer(ok);
    feedback(ok, ok ? q.why : `The right answer is <b>${q.code} ${STATUS[q.code]}</b>. ${q.why}`, pts);
  }

  // ---------- sorting (levels 4 and 6) ----------
  function sortBoard(L) {
    return `<div class="board">
      <div class="sort-table"><div class="ticket-slot" id="ticket-slot"></div></div>
      <div class="bins" id="options" role="group" aria-label="${esc(L.question)}" style="--n:${L.bins.length}">
        ${L.bins.map((b, i) => `<button class="bin" data-action="answer" data-val="${b.val}" data-key="${i + 1}" style="--bc:${b.bc};--bs:${b.bs}"><span class="kbd">${i + 1}</span>${b.art}<span class="bin-name">${b.val}</span><span class="bin-sub">${b.sub}</span></button>`).join("")}
      </div>
      <div class="turn"><div class="feedback" id="feedback" hidden></div></div>
    </div>`;
  }
  function sortRound(q) {
    $$("#options .bin").forEach((b) => { b.disabled = false; b.classList.remove("is-right", "is-wrong"); });
    $("#options").classList.remove("locked");
    $("#feedback").hidden = true;
    $("#ticket-slot").innerHTML = `<div class="ticket" id="ticket">
      <span class="ticket-label">Order ticket #${S.round + 1}</span>
      <p>${q.code ? `<code>${esc(q.t)}</code>` : esc(q.t)}</p>
      <span class="ticket-q">${esc(S.level.question)}</span>
    </div>`;
  }
  function answerSort(val, btn) {
    const q = S.queue[S.round], ok = val === q.a;
    lock(btn, ok, $(`#options [data-val="${q.a}"]`));
    const t = $("#ticket");
    const done = () => {
      const slot = $("#ticket-slot");
      if (S.queue[S.round] !== q || !slot) return;
      slot.innerHTML = `<div class="ticket-done ${ok ? "good" : "bad"}">${icon(ok ? "check" : "x")} ${ok ? `Filed under ${esc(q.a)}` : `This one is ${esc(q.a)}`}</div>`;
    };
    if (t && !reduced()) {
      const tr = t.getBoundingClientRect(), br = btn.getBoundingClientRect();
      const dx = br.left + br.width / 2 - (tr.left + tr.width / 2), dy = br.top + br.height / 2 - (tr.top + tr.height / 2);
      t.animate([{ transform: "rotate(-1.5deg)", opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.2) rotate(14deg)`, opacity: 0 }],
        { duration: 560, easing: "cubic-bezier(.55,0,.75,.4)", fill: "forwards" }).finished.then(done, done);
    } else done();
    const pts = scoreAnswer(ok);
    let msg;
    if (q.rest) {
      const base = q.a === "query" ? WHY_QUERY : WHY_MUT;
      msg = `${ok ? "" : `You picked <b>${val}</b>, but this one is a <b>${q.a}</b>. `}${base}<span class="pair"><span>REST: ${reqHTML(q.rest)}</span><span>GraphQL: <code class="gql-chip">${gqlCode(q.gql)}</code></span></span>`;
    } else {
      msg = ok ? q.why : `You picked <b>${val}</b>, but this is <b>${q.a}</b>. ${q.why}`;
    }
    feedback(ok, msg, pts);
  }

  // ---------- kaskrout builder (level 5) ----------
  function gqlBoard() {
    return `<div class="board board-gql">
      <div class="turn" id="turn"></div>
      <div class="kitchen">
        <div class="kitchen-head">${catSVG("idle", "js-mood")}<div><b>Gattous's kaskrout bar</b><span>POST /graphql</span></div></div>
        <div class="sandwich" id="sandwich" aria-live="polite"></div>
      </div>
      <div class="gql-code">
        <div class="code-card"><div class="code-title">Your GraphQL query</div><pre id="gql-query"></pre></div>
        <div class="code-card"><div class="code-title">REST would send · GET /students/42</div><div class="rest-list" id="rest-list"></div><p class="rest-count" id="rest-count"></p></div>
      </div>
    </div>`;
  }
  function gqlRound(q) {
    S.sel = new Set();
    setMood("idle");
    const sw = $("#sandwich"); sw.classList.remove("served", "wrong");
    $("#turn").innerHTML = `${bubble(q.ask, "The app's screen needs", true)}
      <p class="hint">Tap the fields to put in the kaskrout, then send your query.</p>
      <div class="fields" id="options" role="group" aria-label="Student fields">
        ${FIELDS.map((F, i) => `<button class="field-chip" data-action="toggle" data-val="${F.f}" data-key="${i + 1}" aria-pressed="false" style="--ic:var(--ing-${F.ing})"><span class="dot"></span>${F.f}<span class="kbd">${i + 1}</span></button>`).join("")}
      </div>
      <div class="send-row"><button class="btn btn-pink" id="send" data-action="send">Send to /graphql ${icon("right")}</button></div>
      <div class="feedback" id="feedback" hidden></div>`;
    updateGql(null);
  }
  function updateGql(added) {
    const sel = FIELDS.filter((F) => S.sel.has(F.f)).map((F) => F.f);
    $("#sandwich").innerHTML = `<div class="bun-top"></div>${sel.length ? layersHTML(sel, added) : `<div class="sandwich-empty">Empty kaskrout. Pick some fields!</div>`}<div class="bun-bottom"></div>`;
    $("#gql-query").innerHTML = queryHTML(sel);
    const need = S.answered ? new Set(S.queue[S.round].need) : null;
    $("#rest-list").innerHTML = FIELDS.map((F) => `<div class="rest-row ${S.sel.has(F.f) ? "used" : ""} ${need && !need.has(F.f) ? "waste" : ""}"><span>${F.f}</span><span>${esc(F.v)}</span></div>`).join("");
    $("#rest-count").innerHTML = `REST sends <b>${FIELDS.length}</b> fields every time. Your query asks for <b>${sel.length}</b>.`;
  }
  function toggleField(f, btn) {
    if (S.answered) return;
    const on = !S.sel.has(f);
    if (on) S.sel.add(f); else S.sel.delete(f);
    btn.setAttribute("aria-pressed", String(on));
    sfx.tick(on);
    updateGql(on ? f : null);
  }
  function sendQuery() {
    if (S.answered) return;
    if (!S.sel.size) { toast("Pick at least one field first"); return; }
    S.answered = true;
    const q = S.queue[S.round], need = new Set(q.need);
    const missing = q.need.filter((f) => !S.sel.has(f)), extra = [...S.sel].filter((f) => !need.has(f));
    const ok = !missing.length && !extra.length;
    $$("#options button").forEach((b) => { b.disabled = true; if (need.has(b.dataset.val)) b.classList.add("is-needed"); });
    $("#send").disabled = true;
    setMood(ok ? "happy" : "oops");
    $("#sandwich").classList.add(ok ? "served" : "wrong");
    updateGql(null);
    const pts = scoreAnswer(ok);
    let msg;
    if (ok) msg = `Exactly what the screen needs, in one request. REST would have sent all ${FIELDS.length} fields, so ${FIELDS.length - q.need.length} of them would be wasted (crossed out on the right).`;
    else {
      const parts = [];
      if (missing.length) parts.push(`Missing: <b>${missing.join(", ")}</b>, so the screen can't show them.`);
      if (extra.length) parts.push(`Extra: <b>${extra.join(", ")}</b>. That's over-fetching again.`);
      msg = `${parts.join(" ")} The screen needed: <b>${q.need.join(", ")}</b> (outlined in green).`;
    }
    feedback(ok, msg, pts);
  }

  // ---------- end screens ----------
  function renderLevelEnd() {
    const L = S.level, stars = Math.max(1, S.hearts), right = S.results.filter(Boolean).length;
    if (stars > (S.progress[L.id] || 0)) { S.progress[L.id] = stars; save(); }
    sfx.win(); confetti(90);
    const next = LEVELS[L.id];
    show(`
      <section class="result">
        <div class="result-art">${catSVG("happy")}</div>
        <div class="result-body">
          <p class="eyebrow">Level ${L.id} cleared</p>
          <h2>Ya3tik sa77a!</h2>
          <div class="big-stars" role="img" aria-label="${stars} of 3 stars">${starsHTML(stars)}</div>
          <p class="lead">You served <b>${right} of ${S.queue.length}</b> orders right. Your stars = the hearts you kept.</p>
          <div class="recap"><h3>Remember</h3><ul>${L.recap.map((r) => `<li>${r}</li>`).join("")}</ul></div>
          <div class="actions">
            ${next ? `<button class="btn btn-primary btn-lg" id="go" data-action="lesson" data-level="${next.id}">Next: ${next.title} ${icon("right")}</button>`
                   : `<button class="btn btn-pink btn-lg" id="go" data-action="cert">${icon("award")} Get your certificate</button>`}
            <button class="btn" data-action="play" data-level="${L.id}">${icon("refresh")} Replay</button>
            <button class="btn" data-action="home">${icon("map")} Map</button>
          </div>
        </div>
      </section>`, "#go");
  }

  function renderFail() {
    const L = S.level;
    show(`
      <section class="result">
        <div class="result-art">${catSVG("oops")}</div>
        <div class="result-body">
          <p class="eyebrow">Level ${L.id} · out of hearts</p>
          <h2>Gattous needs a coffee break</h2>
          <p class="lead">Ma3lich! Read the key points once more, then try again. Every mistake teaches something.</p>
          <div class="recap"><h3>Remember</h3><ul>${L.recap.map((r) => `<li>${r}</li>`).join("")}</ul></div>
          <div class="actions">
            <button class="btn btn-primary btn-lg" id="go" data-action="play" data-level="${L.id}">${icon("refresh")} Try again</button>
            <button class="btn" data-action="lesson" data-level="${L.id}">${icon("book")} Key points</button>
            <button class="btn" data-action="home">${icon("map")} Map</button>
          </div>
        </div>
      </section>`, "#go");
  }

  function renderCert() {
    S.level = null;
    const done = LEVELS.every((L) => S.progress[L.id]);
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    show(`
      <section class="cert-wrap">
        <div class="cert">
          <div class="cert-border">
            <div class="cert-seal">${catSVG("happy")}</div>
            <p class="eyebrow">Café des APIs · Sidi Bou Said</p>
            <h2 class="cert-title">API Master</h2>
            <p class="cert-line">This certifies that</p>
            <label class="sr-only" for="cert-name">Your name</label>
            <input id="cert-name" class="cert-name" type="text" placeholder="Type your name" value="${esc(S.name)}" maxlength="40" autocomplete="name">
            <p class="cert-line">knows how apps talk to servers: HTTP verbs, REST endpoints, status codes, GraphQL queries and mutations.</p>
            <div class="cert-skills">${VERB_LIST.map(verbChip).join("")}<span class="chip" style="--vc:var(--gql)">query</span><span class="chip" style="--vc:var(--gql)">mutation</span></div>
            <div class="cert-stars">${icon("star")} ${totalStars()} / ${MAX_STARS} stars</div>
            <div class="cert-sign"><span>Gattous</span><small>Head server cat · ${today}</small></div>
          </div>
        </div>
        <p class="note">${done ? "Take a screenshot to show your teacher." : "Finish all six levels to complete your certificate."}</p>
        <div class="actions">
          <button class="btn btn-primary" data-action="cheat">${icon("book")} Cheat sheet</button>
          <button class="btn" data-action="home">${icon("map")} Map</button>
          <button class="btn" data-action="reset" id="reset">${icon("refresh")} Reset progress</button>
        </div>
      </section>`);
    $("#cert-name").addEventListener("input", (e) => { S.name = e.target.value; save(); });
  }

  function renderCheat() {
    S.level = null;
    show(`
      <section>
        <div class="section-head"><div><p class="eyebrow">Keep this</p><h2>Cheat sheet</h2></div><p>Everything from the six levels on one page.</p></div>
        <div class="cheat-grid">
          <article class="cheat-card span-3">
            <div class="cheat-flow">
              <div class="flow-card">${flowArt()}</div>
              <div><h3>Client · API · server</h3><p>The client sends an <b>HTTP request</b>. The API is the door with the rules. The server sends back a <b>response</b>, usually JSON, with a status code. REST and GraphQL are two ways to write those orders.</p></div>
            </div>
          </article>
          <article class="cheat-card"><h3>${verbChip("GET")} REST verbs</h3>${verbTable(true)}</article>
          <article class="cheat-card"><h3>REST endpoints</h3>${urlArt()}</article>
          <article class="cheat-card"><h3>Status codes</h3>${platesArt()}</article>
          <article class="cheat-card"><h3>GraphQL operations</h3>${mapArt()}</article>
          <article class="cheat-card"><h3>GraphQL fields</h3>${gqlMini()}</article>
          <article class="cheat-card"><h3>REST vs GraphQL</h3>${compareArt()}</article>
        </div>
      </section>`);
  }

  // ---------- events ----------
  const ANSWER = { verbs: answerVerbs, endpoint: answerEndpoint, status: answerStatus, sort: answerSort };
  let resetArmed = 0;
  const actions = {
    home: () => renderHome(),
    cheat: () => renderCheat(),
    cert: () => renderCert(),
    lesson: (b) => renderLesson(+b.dataset.level),
    play: (b) => startLevel(+b.dataset.level),
    answer: (b) => { if (!S.level || S.busy) return; S.busy = true; ANSWER[S.level.type](b.dataset.val, b); },
    next: () => nextRound(),
    toggle: (b) => toggleField(b.dataset.val, b),
    send: () => sendQuery(),
    sound: () => { S.sound = !S.sound; save(); renderTopbar(); toast(S.sound ? "Sound on" : "Sound off"); sfx.tick(true); },
    theme: () => {
      const t = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", t); S.theme = t; save(); renderTopbar();
    },
    reset: (b) => {
      if (Date.now() - resetArmed > 3000) { resetArmed = Date.now(); b.innerHTML = `${icon("refresh")} Tap again to reset`; return; }
      S.progress = {}; S.score = 0; save(); renderTopbar(); toast("Progress reset"); renderHome();
    },
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b || b.disabled) return;
    const fn = actions[b.dataset.action];
    if (fn) { e.preventDefault(); fn(b); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches && e.target.matches("input, textarea")) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 9) {
      const b = $(`#options [data-key="${n}"]`);
      if (b && !b.disabled) { b.click(); e.preventDefault(); }
    } else if (e.key === "Enter" && !(e.target.matches && e.target.matches("button"))) {
      const nx = $("#next") || $("#send:not([disabled])");
      if (nx) { nx.click(); e.preventDefault(); }
    }
  });

  // ---------- boot ----------
  function boot(data) {
    if (data && typeof data.score === "number") S.score = data.score;
    if (S.theme) document.documentElement.setAttribute("data-theme", S.theme);
    renderTopbar();
    renderHome();
  }
  const hot = window.claude && window.claude.hot;
  try { if (hot && typeof hot.snapshot === "function") hot.snapshot(() => ({ score: S.score })); } catch (e) { /* not in a viewer */ }
  if (hot && typeof hot.ready === "function") hot.ready(boot); else boot((hot && hot.data) || {});
})();
