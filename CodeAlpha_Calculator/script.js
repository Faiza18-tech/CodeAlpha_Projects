"use strict";

/* ==========================================
   MATHFLOW — SMART CALCULATOR
   Updated JavaScript
   ========================================== */

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const landingEl = $("#landing");
const appEl = $(".app");

/* ---------- State ---------- */

let expression = "";
let lastAnswer = 0;
let sciExpr = "";
let sciAnswer = 0;
let saveHistory = localStorage.getItem("mathflow-save") !== "false";

let history = [];

try {
  const saved = JSON.parse(localStorage.getItem("mathflow-history") || "[]");
  history = Array.isArray(saved) ? saved : [];
} catch {
  history = [];
}

const titles = {
  standard: ["Standard Calculator", "Fast, reliable calculations for everyday math."],
  scientific: ["Scientific Calculator", "More functions, same simple workflow."],
  history: ["Calculation History", "Review and reuse previous results."],
  energy: ["Energy Converter", "Convert common energy units instantly."],
  area: ["Area Converter", "Convert surface measurements instantly."],
  speed: ["Speed Converter", "Convert travel speeds instantly."],
  time: ["Time Converter", "Convert durations instantly."],
  settings: ["Settings", "Personalize your MathFlow experience."]
};

/* ---------- Landing page navigation ---------- */

function launchApp() {
  landingEl.classList.add("hidden");
  appEl.classList.add("launched");

  window.scrollTo({ top: 0, behavior: "smooth" });
  navigate("standard");
}

function showLanding() {
  appEl.classList.remove("launched");
  landingEl.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#launchCalculator").addEventListener("click", launchApp);
$("#backHome").addEventListener("click", showLanding);

/* ---------- Landing preview animation ---------- */

const previewValues = ["3,072", "48", "1,024", "256"];
let previewIndex = 0;

setInterval(() => {
  const preview = $("#previewResult");
  if (!preview) return;

  previewIndex = (previewIndex + 1) % previewValues.length;
  preview.innerHTML =
    previewValues[previewIndex] + '<span class="cursor">|</span>';
}, 2400);

/* ---------- Notifications ---------- */

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

/* ---------- Page navigation ---------- */

function navigate(view) {
  if (!titles[view]) return;

  $$(".view").forEach(section => {
    section.classList.toggle("active", section.id === "view-" + view);
  });

  $$(".navitem").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("#pageTitle").textContent = titles[view][0];
  $("#pageSub").textContent = titles[view][1];

  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("show");

  if (view === "history") renderHistory();
}

$$(".navitem").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.view));
});

$$("[data-goto]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.goto));
});

/* ---------- Mobile menu ---------- */

$("#hamb").addEventListener("click", () => {
  $("#sidebar").classList.add("open");
  $("#overlay").classList.add("show");
});

$("#overlay").addEventListener("click", () => {
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("show");
});

/* ==========================================
   SAFE MATHEMATICAL EXPRESSION PARSER
   No eval() used
   ========================================== */

function format(number) {
  if (!Number.isFinite(number)) {
    throw Error("Result must be a finite number.");
  }

  if (Math.abs(number) < 1e-12) number = 0;

  return Number.parseFloat(number.toPrecision(12)).toString();
}

function tokenize(source) {
  source = source
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/π/g, "pi")
    .replace(/\s/g, "");

  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);
    let match;

    match = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);

    if (match) {
      tokens.push({ type: "number", value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    match = rest.match(/^(sqrt|sin|cos|tan|log|ln|pi|ans)/i);

    if (match) {
      tokens.push({
        type: "identifier",
        value: match[0].toLowerCase()
      });

      index += match[0].length;
      continue;
    }

    const character = source[index];

    if ("+-*/%^()".includes(character)) {
      tokens.push({ type: character, value: character });
      index++;
      continue;
    }

    throw Error("Please check the expression.");
  }

  return tokens;
}

function evaluate(source) {
  const tokens = tokenize(source);
  let position = 0;

  const peek = () => tokens[position];
  const take = () => tokens[position++];

  function primary() {
    const token = take();

    if (!token) throw Error("Complete the expression first.");

    if (token.type === "number") return token.value;

    if (token.type === "identifier") {
      const name = token.value;

      if (name === "pi") return Math.PI;
      if (name === "ans") return lastAnswer;

      if (peek()?.type !== "(") {
        throw Error("Function needs parentheses.");
      }

      take();

      const value = add();

      if (take()?.type !== ")") {
        throw Error("Missing closing bracket.");
      }

      if (name === "sqrt") return Math.sqrt(value);
      if (name === "log") return Math.log10(value);
      if (name === "ln") return Math.log(value);

      const angle = $("#angleSelect").value === "deg"
        ? value * Math.PI / 180
        : value;

      if (name === "sin") return Math.sin(angle);
      if (name === "cos") return Math.cos(angle);
      if (name === "tan") {
        if (Math.abs(Math.cos(angle)) < 1e-12) {
          throw Error("Tangent is undefined at this angle.");
        }

        return Math.tan(angle);
      }
    }

    if (token.type === "(") {
      const value = add();

      if (take()?.type !== ")") {
        throw Error("Missing closing bracket.");
      }

      return value;
    }

    if (token.type === "+" || token.type === "-") {
      return (token.type === "-" ? -1 : 1) * primary();
    }

    throw Error("Invalid expression.");
  }

  function power() {
    const value = primary();

    if (peek()?.type === "^") {
      take();
      return Math.pow(value, power());
    }

    return value;
  }

  function multiply() {
    let value = power();

    while (["*", "/", "%"].includes(peek()?.type)) {
      const operator = take().type;
      const next = power();

      if ((operator === "/" || operator === "%") && next === 0) {
        throw Error("Cannot divide by zero.");
      }

      if (operator === "*") value *= next;
      if (operator === "/") value /= next;
      if (operator === "%") value %= next;
    }

    return value;
  }

  function add() {
    let value = multiply();

    while (["+", "-"].includes(peek()?.type)) {
      const operator = take().type;
      const next = multiply();

      value = operator === "+" ? value + next : value - next;
    }

    return value;
  }

  if (!tokens.length) throw Error("Enter a calculation first.");

  const answer = add();

  if (position < tokens.length) {
    throw Error("Please check the brackets and operators.");
  }

  if (!Number.isFinite(answer)) {
    throw Error("Result is outside the supported range.");
  }

  return answer;
}

/* ==========================================
   STANDARD CALCULATOR
   ========================================== */

function renderCalc() {
  $("#expression").textContent =
    expression || "Ready for your next calculation";

  $("#result").textContent = expression ? "…" : "0";
}

function insert(value) {
  if (value === "Ans") value = format(lastAnswer);

  if (
    !expression &&
    ["+", "×", "÷", "%", "−"].includes(value)
  ) {
    if (value !== "−") return;
  }

  expression += value;

  $("#expression").textContent = expression;

  try {
    $("#result").textContent = format(evaluate(expression));
  } catch {
    $("#result").textContent = "…";
  }
}

function calculate(source, scientific = false) {
  try {
    const number = evaluate(source);
    const answer = format(number);

    lastAnswer = number;

    if (scientific) {
      sciAnswer = number;
      $("#sciExpression").textContent = source + " =";
      $("#sciResult").textContent = answer;
    } else {
      $("#expression").textContent = source + " =";
      $("#result").textContent = answer;
      expression = answer;
    }

    addHistory(source, answer);

    return number;
  } catch (error) {
    toast(error.message);
    return null;
  }
}

$("#keypad").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "clear") {
    expression = "";
    renderCalc();
  } else if (action === "backspace") {
    expression = expression.slice(0, -1);
    renderCalc();

    if (expression) {
      try {
        $("#result").textContent = format(evaluate(expression));
      } catch {
        $("#result").textContent = "…";
      }
    }
  } else if (action === "sign") {
    if (expression.startsWith("-")) {
      expression = expression.slice(1);
    } else {
      expression = "-" + expression;
    }

    renderCalc();
  } else if (action === "equals") {
    calculate(expression);
  } else if (button.dataset.value !== undefined) {
    insert(button.dataset.value);
  }
});

/* ==========================================
   CALCULATION HISTORY
   ========================================== */

function addHistory(expr, answer) {
  if (!saveHistory) return;

  history.unshift({
    expr,
    answer,
    time: new Date().toISOString()
  });

  history = history.slice(0, 100);

  try {
    localStorage.setItem("mathflow-history", JSON.stringify(history));
  } catch {
    toast("Could not save history in this browser.");
  }

  if ($("#view-history").classList.contains("active")) {
    renderHistory();
  }
}

function loadHistoryResult(item) {
  expression = item.answer;
  renderCalc();

  $("#result").textContent = item.answer;
  navigate("standard");
}

function renderHistory() {
  const element = $("#fullHistory");
  element.replaceChildren();

  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "card empty";
    empty.textContent = "No calculations yet. Start calculating!";
    element.append(empty);
    return;
  }

  history.forEach(item => {
    const row = document.createElement("div");
    row.className = "card history-row";

    const info = document.createElement("div");
    const expr = document.createElement("div");
    const answer = document.createElement("div");

    expr.className = "expr";
    answer.className = "ans";

    expr.textContent =
      item.expr + " · " + new Date(item.time).toLocaleString();

    answer.textContent = "= " + item.answer;

    info.append(expr, answer);
    row.append(info, document.createTextNode("Use result ↗"));

    row.addEventListener("click", () => {
      loadHistoryResult(item);
      toast("Result loaded into calculator");
    });

    element.append(row);
  });
}

$("#clearHistory").addEventListener("click", () => {
  if (!history.length) return toast("History is already empty");

  if (confirm("Clear all saved calculations?")) {
    history = [];
    localStorage.removeItem("mathflow-history");

    renderHistory();

    toast("History cleared");
  }
});

$("#exportHistory").addEventListener("click", () => {
  if (!history.length) return toast("Nothing to export yet");

  const csv = [
    "Expression,Result,Time",
    ...history.map(item =>
      [item.expr, item.answer, item.time]
        .map(value => '"' + String(value).replace(/"/g, '""') + '"')
        .join(",")
    )
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = "mathflow-history.csv";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  toast("History exported");
});

/* ==========================================
   SCIENTIFIC CALCULATOR
   ========================================== */

$("#sciKeypad").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.sciaction;

  if (action === "clear") {
    sciExpr = "";
    $("#sciExpression").textContent = "Enter an expression";
    $("#sciResult").textContent = "0";
  } else if (action === "backspace") {
    sciExpr = sciExpr.slice(0, -1);

    $("#sciExpression").textContent =
      sciExpr || "Enter an expression";
  } else if (action === "equals") {
    calculate(sciExpr, true);
  } else if (button.dataset.sci !== undefined) {
    const value = button.dataset.sci;

    if (value === "Ans") {
      sciExpr += format(sciAnswer);
    } else {
      sciExpr += value;
    }

    $("#sciExpression").textContent = sciExpr;

    try {
      $("#sciResult").textContent = format(evaluate(sciExpr));
    } catch {
      $("#sciResult").textContent = "…";
    }
  }
});

$("#scientificBack").addEventListener("click", () => navigate("standard"));

/* ==========================================
   KEYBOARD SUPPORT
   ========================================== */

document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (!appEl.classList.contains("launched")) return;
  if (!$("#view-standard").classList.contains("active")) return;

  if (/^[0-9.]$/.test(event.key)) {
    insert(event.key);
  } else if (["+", "-", "*", "/", "%", "(", ")"].includes(event.key)) {
    const mapped = {
      "*": "×",
      "/": "÷",
      "-": "−"
    };

    insert(mapped[event.key] || event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate(expression);
  } else if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    renderCalc();
  } else if (event.key === "Escape") {
    expression = "";
    renderCalc();
  }
});

/* ==========================================
   UNIT CONVERTERS
   ========================================== */

const units = {
  energy: {
    J: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    Wh: 3600,
    kWh: 3600000,
    eV: 1.602176634e-19
  },

  area: {
    "m²": 1,
    "km²": 1e6,
    "cm²": 1e-4,
    "mm²": 1e-6,
    hectare: 10000,
    acre: 4046.8564224,
    "ft²": 0.09290304,
    "yd²": 0.83612736
  },

  speed: {
    "m/s": 1,
    "km/h": 1 / 3.6,
    mph: 0.44704,
    "ft/s": 0.3048,
    knot: 0.514444
  },

  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800
  }
};

function setupConverters() {
  $$(".converter").forEach(card => {
    const type = card.dataset.converter;
    const options = Object.keys(units[type]);

    card.innerHTML = `
      <label class="fieldlabel" for="${type}-amount">Amount</label>
      <input class="field" id="${type}-amount"
        type="number" step="any" value="1">

      <div class="convertrow">
        <div>
          <label class="fieldlabel" for="${type}-from">From</label>
          <select class="field" id="${type}-from">
            ${options.map(unit => `<option>${unit}</option>`).join("")}
          </select>
        </div>

        <button class="swap" id="${type}-swap"
          aria-label="Swap units">⇄</button>

        <div>
          <label class="fieldlabel" for="${type}-to">To</label>
          <select class="field" id="${type}-to">
            ${options.map((unit, index) =>
              `<option ${index === 1 ? "selected" : ""}>${unit}</option>`
            ).join("")}
          </select>
        </div>
      </div>

      <div class="convertresult">
        <small>CONVERTED VALUE</small>
        <strong id="${type}-result">—</strong>
      </div>
      <p style="color:var(--muted);font-size:12px">
        Calculated locally in your browser.
      </p>
    `;

    const update = () => {
      const input = $("#" + type + "-amount");
      const amount = Number(input.value);
      const from = $("#" + type + "-from").value;
      const to = $("#" + type + "-to").value;
      const output = $("#" + type + "-result");

      if (input.value.trim() === "" || !Number.isFinite(amount)) {
        output.textContent = "Enter an amount";
        return;
      }

      const value = amount * units[type][from] / units[type][to];

      output.textContent =
        Number(value.toPrecision(10)).toLocaleString(
          undefined,
          { maximumSignificantDigits: 10 }
        ) + " " + to;
    };

    card.querySelectorAll("input, select").forEach(control => {
      control.addEventListener("input", update);
      control.addEventListener("change", update);
    });

    $("#" + type + "-swap").addEventListener("click", () => {
      const from = $("#" + type + "-from");
      const to = $("#" + type + "-to").value;

      from.value = to;

      const toSelect = $("#" + type + "-to");
      const fromValue = toSelect.value;
      toSelect.value = options.find(unit => unit !== from.value) || from.value;

      update();
    });

    update();
  });
}

/* ==========================================
   SETTINGS AND THEMES
   ========================================== */

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#themeSelect").value = theme;
  localStorage.setItem("mathflow-theme", theme);
}

$("#themeSelect").addEventListener("change", event => {
  setTheme(event.target.value);
});

$("#angleSelect").value = localStorage.getItem("mathflow-angle") || "deg";

$("#angleSelect").addEventListener("change", event => {
  localStorage.setItem("mathflow-angle", event.target.value);
  toast("Angle unit updated");
});

$("#saveHistory").checked = saveHistory;

$("#saveHistory").addEventListener("change", event => {
  saveHistory = event.target.checked;
  localStorage.setItem("mathflow-save", String(saveHistory));

  toast(saveHistory
    ? "History saving enabled"
    : "History saving disabled"
  );
});

/* ==========================================
   INITIALIZE APP
   ========================================== */

setTheme(localStorage.getItem("mathflow-theme") || "dark");
setupConverters();
renderHistory();
renderCalc();