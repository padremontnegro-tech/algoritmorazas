// =====================
// 1) Razas
// =====================

const razas = [
  "Golden Retriever",
  "Labrador Retriever",
  "Pastor Alemán",
  "Bulldog",
  "Poodle",
  "Gato Siamés",
  "Gato Persa",
  "Maine Coon",
  "Gato Bengalí",
  "Gato Europeo"
];

const perfiles = {
  F: "Familia con niños",
  D: "Departamento",
  A: "Persona activa",
  P: "Primer mascota"
};

const contextos = {
  C: "¿Cuál es mejor como mascota de compañía?",
  M: "¿Cuál requiere menos mantenimiento?",
  E: "¿Cuál se adapta mejor a espacios pequeños?"
};

// =====================
// 2) Elo
// =====================

const RATING_INICIAL = 1000;
const K = 32;
const STORAGE_KEY = "mascotasmash_state";

function expected(ra, rb){
  return 1 / (1 + Math.pow(10, (rb-ra)/400));
}

function updateElo(bucket, a, b, winner){
  const ra = bucket[a], rb = bucket[b];
  const ea = expected(ra, rb);
  const eb = expected(rb, ra);

  bucket[a] = ra + K * ((winner==="A"?1:0) - ea);
  bucket[b] = rb + K * ((winner==="B"?1:0) - eb);
}

// =====================
// 3) Estado
// =====================

function defaultState(){
  const buckets = {};
  for(const p in perfiles){
    for(const c in contextos){
      const key = `${p}__${c}`;
      buckets[key] = {};
      razas.forEach(r => buckets[key][r]=RATING_INICIAL);
    }
  }
  return { buckets };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// =====================
// 4) UI
// =====================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const questionEl = document.getElementById("question");
const topBox = document.getElementById("topBox");

function fillSelect(el, obj){
  for(const k in obj){
    const o = document.createElement("option");
    o.value = k;
    o.textContent = obj[k];
    el.appendChild(o);
  }
}

fillSelect(segmentSelect, perfiles);
fillSelect(contextSelect, contextos);

let A,B;

function newDuel(){
  A = razas[Math.floor(Math.random()*razas.length)];
  do {
    B = razas[Math.floor(Math.random()*razas.length)];
  } while(A===B);
  labelA.textContent=A;
  labelB.textContent=B;
  questionEl.textContent=contextos[contextSelect.value];
}

function vote(w){
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  updateElo(state.buckets[key], A, B, w);
  save();
  renderTop();
  newDuel();
}

document.getElementById("btnA").onclick=()=>vote("A");
document.getElementById("btnB").onclick=()=>vote("B");

function renderTop(){
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  const arr = Object.entries(state.buckets[key])
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);

  topBox.innerHTML = arr.map((r,i)=>`
    <div class="toprow">
      <div><b>${i+1}.</b> ${r[0]}</div>
      <div>${r[1].toFixed(1)}</div>
    </div>
  `).join("");
}

newDuel();
renderTop();
