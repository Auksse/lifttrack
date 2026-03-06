let db=null;

// ═══════════════════════════════════════════════
// MUSCLE MAP  score /5 per muscle group
// ═══════════════════════════════════════════════
const MUSCLE_MAP={
  'Bench press':           {Chest:5,Triceps:3,Shoulders:2},
  'Bench press DB':        {Chest:5,Triceps:3,Shoulders:2},
  'Inclined bench DB':     {Chest:4,Shoulders:3,Triceps:2},
  'Overhead press DB':     {Shoulders:5,Triceps:3,Chest:1},
  'Overhead press barbell':{Shoulders:5,Triceps:3,Chest:1},
  'Arnold press':          {Shoulders:5,Triceps:2},
  'Lateral raise cable':   {Shoulders:5},
  'Lateral raise DB':      {Shoulders:5},
  'Fly':                   {Chest:5,Shoulders:2},
  'Fly DB':                {Chest:5,Shoulders:2},
  'Fly machine':           {Chest:5,Shoulders:2},
  'Seated dips':           {Triceps:5,Chest:3,Shoulders:1},
  'Dip assist':            {Triceps:4,Chest:3,Shoulders:2},
  'Triceps pushdown':      {Triceps:5},
  'Triceps overhead cable':{Triceps:5,Shoulders:1},
  'Triceps overhead DB':   {Triceps:5,Shoulders:1},
  'Close grip bench':      {Triceps:5,Chest:3},
  'Lat pulldown':          {Back:5,Biceps:3,Shoulders:2},
  'Pull-up':               {Back:5,Biceps:3,Shoulders:2},
  'Straight arm pulldown': {Back:4,Triceps:2},
  'Seated row':            {Back:5,Biceps:3,Shoulders:1},
  'DB row':                {Back:5,Biceps:3},
  'Rear delt':             {Shoulders:4,Back:3},
  'Face pull':             {Shoulders:4,Back:3},
  'Curl bar':              {Biceps:5,Forearms:2},
  'Arm curl machine':      {Biceps:5,Forearms:1},
  'Inclined DB curl':      {Biceps:5,Forearms:2},
  'DB curl':               {Biceps:5,Forearms:2},
  'Hammer curl':           {Biceps:4,Forearms:3},
  'Leg press':             {Quads:5,Glutes:3,Hamstrings:2},
  'Leg extension':         {Quads:5},
  'Leg curl':              {Hamstrings:5,Glutes:2},
  'Bulgarian split squat': {Quads:4,Glutes:4,Hamstrings:2},
  'Squat':                 {Quads:5,Glutes:4,Hamstrings:2},
  'Hip thrust':            {Glutes:5,Hamstrings:3},
  'Calf press':            {Calves:5},
  'Calf raise':            {Calves:5},
  'Romanian deadlift':     {Hamstrings:5,Glutes:4,Back:2},
};
const MUSCLE_COLORS={
  Chest:'#c96b4a',Shoulders:'#b85a90',Triceps:'#7858c0',
  Back:'#4a90b8',Biceps:'#4aabab',Forearms:'#4a7890',
  Quads:'#5a9e62',Hamstrings:'#8a9e40',Glutes:'#c09040',Calves:'#7a8060',
};

// Returns a {muscle:score} map for an exercise name.
// Checks MUSCLE_MAP first; falls back to exerciseDatabase for new canonical names.
function getMuscleMap(name){return MUSCLE_MAP[name]||getDbMuscleMap(name)||null;}

// ═══════════════════════════════════════════════
// MOVEMENT PATTERNS
// ═══════════════════════════════════════════════
const MOVEMENT_PATTERNS={
  'horizontal_push':['Bench press','Bench press DB','Inclined bench DB','Fly machine','Fly DB','Fly'],
  'vertical_push':  ['Overhead press DB','Overhead press barbell','Arnold press','Lateral raise cable','Lateral raise DB'],
  'triceps':        ['Triceps pushdown','Triceps overhead cable','Triceps overhead DB','Seated dips','Dip assist','Close grip bench'],
  'vertical_pull':  ['Lat pulldown','Pull-up','Straight arm pulldown'],
  'horizontal_pull':['Seated row','DB row','Rear delt','Face pull'],
  'biceps':         ['Curl bar','Arm curl machine','Inclined DB curl','DB curl','Hammer curl'],
  'quad':           ['Leg press','Leg extension','Bulgarian split squat','Squat'],
  'hamstring':      ['Leg curl','Romanian deadlift'],
  'glutes':         ['Hip thrust','Bulgarian split squat'],
  'calves':         ['Calf press','Calf raise'],
};

// ═══════════════════════════════════════════════
// PROGRESSION PROFILES
// ═══════════════════════════════════════════════
const EX_PROFILES={
  'bench press':{min:5,max:8,inc:2.5,sets:4},'bench press db':{min:8,max:12,inc:2,sets:4},
  'inclined bench db':{min:8,max:12,inc:2,sets:3},'overhead press db':{min:6,max:10,inc:2,sets:3},
  'lat pulldown':{min:8,max:12,inc:2.5,sets:4},'seated row':{min:8,max:12,inc:2.5,sets:4},
  'seated dips':{min:10,max:15,inc:5,sets:3},'dip assist':{min:8,max:12,inc:2.5,sets:3},
  'leg press':{min:10,max:15,inc:5,sets:4},'leg curl':{min:10,max:15,inc:2.5,sets:3},
  'leg extension':{min:10,max:15,inc:2.5,sets:3},'bulgarian split squat':{min:8,max:12,inc:2,sets:3},
  'hip thrust':{min:12,max:20,inc:5,sets:3},'curl bar':{min:10,max:15,inc:1.25,sets:3},
  'arm curl machine':{min:10,max:15,inc:2.5,sets:3},'inclined db curl':{min:10,max:15,inc:1,sets:3},
  'triceps pushdown':{min:12,max:15,inc:1,sets:3},'triceps overhead cable':{min:12,max:15,inc:1,sets:3},
  'triceps overhead db':{min:12,max:15,inc:1,sets:3},'lateral raise cable':{min:12,max:20,inc:0.5,sets:3},
  'lateral raise db':{min:12,max:20,inc:0.5,sets:3},'rear delt':{min:15,max:20,inc:2.5,sets:3},
  'face pull':{min:15,max:20,inc:1,sets:3},'fly':{min:10,max:14,inc:2,sets:3},
  'fly db':{min:10,max:14,inc:2,sets:3},'fly machine':{min:10,max:14,inc:3.5,sets:3},
  'straight arm pulldown':{min:10,max:15,inc:1,sets:3},'calf press':{min:15,max:25,inc:5,sets:3},
};
function getProfile(n){return EX_PROFILES[n.toLowerCase()]||{min:8,max:12,inc:2.5,sets:3};}

// ═══════════════════════════════════════════════
// FUZZY MATCH
// ═══════════════════════════════════════════════
function normName(n){return n.toLowerCase().replace(/\bdbs?\b/g,'dumbbell').replace(/\boh\b/g,'overhead').replace(/\bbb\b/g,'barbell').replace(/\bincl\.?\b/g,'inclined').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();}
function lev(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);return d[m][n];}
function fuzzyMatch(input,names,thr=0.5){if(!input||input.length<2)return[];const ni=normName(input);return names.map(name=>{const nn=normName(name);const c=nn.includes(ni)||ni.includes(nn);const s=c?0.95:1-lev(ni,nn)/Math.max(ni.length,nn.length);return{name,s};}).filter(x=>x.s>=thr&&normName(x.name)!==normName(input)).sort((a,b)=>b.s-a.s).slice(0,4).map(x=>x.name);}
function getAlts(name,current){const nn=normName(name);for(const[,ms]of Object.entries(MOVEMENT_PATTERNS)){const f=ms.find(m=>normName(m)===nn||nn.includes(normName(m))||normName(m).includes(nn));if(f)return ms.filter(m=>normName(m)!==nn&&!current.some(c=>normName(c)===normName(m))).slice(0,4);}return[];}
function getProgSugg(name,lastSets){if(!lastSets||!lastSets.length)return null;const p=getProfile(name);const vs=lastSets.filter(s=>s.r>0&&s.w>0);if(!vs.length)return null;const mw=Math.max(...vs.map(s=>s.w));const ar=vs.reduce((t,s)=>t+s.r,0)/vs.length;const allMax=vs.every(s=>s.r>=p.max);const allMin=vs.every(s=>s.r>=p.min);const n=vs.length;if(allMax)return{type:'increase',text:`Hit ${p.max}+ reps on all sets`,suggestion:`${n}×${p.min} @ ${+(mw+p.inc).toFixed(2)}kg`,sets:n,reps:p.min,weight:mw+p.inc};if(allMin){const tr=Math.min(Math.round(ar)+1,p.max);return{type:'progress',text:`Avg ${Math.round(ar)} reps`,suggestion:`Aim ${n}×${tr} @ ${mw}kg`,sets:n,reps:tr,weight:mw};}return{type:'consolidate',text:`Avg ${Math.round(ar)} reps (target ${p.min}+)`,suggestion:`Same ${mw}kg, aim ${n}×${p.min}`,sets:n,reps:p.min,weight:mw};}

// ═══════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════
const SEED=[
  {date:"2025-12-23",focus:"Upper",exercises:[{name:"Bench press",sets:[{r:6,w:40},{r:6,w:40},{r:6,w:30},{r:6,w:30}]},{name:"Seated row",sets:[{r:8,w:39},{r:8,w:39},{r:8,w:39},{r:8,w:39}]},{name:"Overhead press DB",sets:[{r:10,w:10},{r:8,w:10},{r:6,w:10}]},{name:"Lat pulldown",sets:[{r:8,w:39},{r:8,w:39},{r:8,w:39}]},{name:"Inclined bench DB",sets:[{r:10,w:12},{r:8,w:12},{r:7,w:12}]},{name:"Curl bar",sets:[{r:15,w:10},{r:15,w:10},{r:15,w:10}]},{name:"Triceps pushdown",sets:[{r:15,w:9},{r:15,w:9},{r:15,w:9}]}]},
  {date:"2025-12-28",focus:"Upper",exercises:[{name:"Bench press DB",sets:[{r:10,w:14},{r:10,w:14},{r:10,w:14},{r:10,w:14}]},{name:"Overhead press DB",sets:[{r:10,w:8},{r:10,w:9},{r:10,w:9}]},{name:"Inclined bench DB",sets:[{r:12,w:10},{r:12,w:10},{r:12,w:10}]},{name:"Seated row",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:39},{r:10,w:39}]},{name:"Lat pulldown",sets:[{r:10,w:32},{r:10,w:32},{r:8,w:39}]},{name:"Curl bar",sets:[{r:10,w:15},{r:10,w:15},{r:10,w:15}]},{name:"Triceps overhead DB",sets:[{r:10,w:12},{r:10,w:12},{r:8,w:12}]}]},
  {date:"2026-01-13",focus:"Upper",exercises:[{name:"Lat pulldown",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:42.5}]},{name:"Bench press",sets:[{r:8,w:42.5},{r:10,w:40},{r:7,w:35}]},{name:"Overhead press DB",sets:[{r:10,w:10},{r:10,w:10},{r:12,w:10}]},{name:"Seated row",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:10,w:45}]},{name:"Dip assist",sets:[{r:10,w:-9},{r:10,w:-9},{r:8,w:-14}]},{name:"Inclined bench DB",sets:[{r:10,w:12},{r:8,w:12},{r:6,w:12}]},{name:"Curl bar",sets:[{r:12,w:15},{r:12,w:15},{r:12,w:15}]}]},
  {date:"2026-01-31",focus:"Push",exercises:[{name:"Bench press DB",sets:[{r:10,w:16},{r:10,w:18},{r:10,w:20},{r:6,w:20}]},{name:"Inclined bench DB",sets:[{r:12,w:12},{r:12,w:14},{r:10,w:16}]},{name:"Overhead press DB",sets:[{r:12,w:14},{r:12,w:14},{r:8,w:16}]},{name:"Triceps overhead cable",sets:[{r:12,w:10},{r:12,w:12},{r:10,w:12}],ss:true},{name:"Lateral raise cable",sets:[{r:10,w:3},{r:8,w:3},{r:8,w:3}],ss:true},{name:"Fly",sets:[{r:10,w:45},{r:10,w:66},{r:6,w:73}]}]},
  {date:"2026-02-01",focus:"Pull",exercises:[{name:"Lat pulldown",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:39},{r:10,w:39}]},{name:"Seated row",sets:[{r:10,w:45},{r:10,w:45},{r:12,w:45},{r:12,w:45}]},{name:"Rear delt",sets:[{r:20,w:39},{r:20,w:39},{r:20,w:39}]},{name:"Arm curl machine",sets:[{r:12,w:20},{r:10,w:25},{r:10,w:25}]},{name:"Straight arm pulldown",sets:[{r:10,w:11},{r:10,w:11},{r:10,w:11}]},{name:"Inclined DB curl",sets:[{r:10,w:9},{r:10,w:9},{r:10,w:9}]}]},
  {date:"2026-02-03",focus:"Legs",exercises:[{name:"Leg press",sets:[{r:12,w:73},{r:12,w:79},{r:12,w:79},{r:12,w:79}]},{name:"Bulgarian split squat",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]},{name:"Leg curl",sets:[{r:10,w:32},{r:10,w:32},{r:10,w:32}]},{name:"Leg extension",sets:[{r:10,w:25},{r:10,w:25},{r:10,w:25}]}]},
  {date:"2026-02-05",focus:"Push",exercises:[{name:"Bench press",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:6,w:45}]},{name:"Inclined bench DB",sets:[{r:12,w:14},{r:12,w:14},{r:10,w:14}]},{name:"Overhead press DB",sets:[{r:8,w:16},{r:10,w:14},{r:10,w:14}]},{name:"Triceps overhead cable",sets:[{r:12,w:14},{r:12,w:14},{r:12,w:14}],ss:true},{name:"Lateral raise cable",sets:[{r:10,w:4.5},{r:8,w:4.5},{r:8,w:4.5}],ss:true},{name:"Seated dips",sets:[{r:12,w:35},{r:15,w:41},{r:15,w:41}]},{name:"Fly DB",sets:[{r:10,w:10},{r:8,w:10},{r:8,w:10}]}]},
  {date:"2026-02-08",focus:"Pull",exercises:[{name:"Lat pulldown",sets:[{r:12,w:39},{r:12,w:39},{r:12,w:39},{r:12,w:39}]},{name:"Seated row",sets:[{r:12,w:45},{r:12,w:45},{r:12,w:45},{r:12,w:45}]},{name:"Rear delt",sets:[{r:15,w:45},{r:15,w:45},{r:15,w:45}]},{name:"Arm curl machine",sets:[{r:12,w:25},{r:12,w:25},{r:12,w:25}]},{name:"Inclined DB curl",sets:[{r:12,w:9},{r:12,w:9},{r:12,w:9}]}]},
  {date:"2026-02-17",focus:"Push",exercises:[{name:"Bench press DB",sets:[{r:8,w:22},{r:8,w:22},{r:6,w:22}]},{name:"Inclined bench DB",sets:[{r:8,w:16},{r:8,w:16},{r:8,w:16}]},{name:"Overhead press DB",sets:[{r:10,w:14},{r:8,w:14},{r:8,w:14}]},{name:"Triceps overhead cable",sets:[{r:10,w:11},{r:10,w:11},{r:10,w:11}],ss:true},{name:"Lateral raise cable",sets:[{r:10,w:2.3},{r:10,w:2.3},{r:10,w:2.3}],ss:true},{name:"Fly machine",sets:[{r:10,w:73},{r:10,w:66},{r:10,w:66}]},{name:"Seated dips",sets:[{r:10,w:45},{r:10,w:50},{r:10,w:50}]}]},
  {date:"2026-02-19",focus:"Pull",exercises:[{name:"Lat pulldown",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:8,w:45}]},{name:"Seated row",sets:[{r:8,w:52},{r:8,w:52},{r:8,w:52},{r:8,w:52}]},{name:"Rear delt",sets:[{r:15,w:45},{r:12,w:45},{r:10,w:45}]},{name:"Face pull",sets:[{r:15,w:9},{r:15,w:9},{r:15,w:9}]},{name:"Arm curl machine",sets:[{r:8,w:28},{r:8,w:28},{r:8,w:28}]},{name:"Inclined DB curl",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]}]},
  {date:"2026-02-23",focus:"Legs",exercises:[{name:"Hip thrust",sets:[{r:15,w:10},{r:15,w:10},{r:15,w:10}]},{name:"Calf press",sets:[{r:20,w:79},{r:20,w:79},{r:20,w:79}]},{name:"Leg press",sets:[{r:15,w:86},{r:12,w:93},{r:12,w:93},{r:12,w:93}]},{name:"Leg extension",sets:[{r:12,w:32},{r:12,w:32},{r:12,w:32}]},{name:"Leg curl",sets:[{r:12,w:39},{r:12,w:39},{r:12,w:39}]}]},
  {date:"2026-02-24",focus:"Push",exercises:[{name:"Bench press",sets:[{r:10,w:45},{r:10,w:45},{r:10,w:45},{r:10,w:45}]},{name:"Inclined bench DB",sets:[{r:10,w:16},{r:10,w:16},{r:10,w:16}]},{name:"Overhead press DB",sets:[{r:10,w:14},{r:10,w:14},{r:10,w:14}]},{name:"Triceps overhead DB",sets:[{r:12,w:14},{r:12,w:14},{r:12,w:14}],ss:true},{name:"Lateral raise DB",sets:[{r:10,w:5},{r:10,w:5},{r:10,w:5}],ss:true},{name:"Seated dips",sets:[{r:12,w:50},{r:12,w:50},{r:12,w:50}]}]},
  {date:"2026-02-26",focus:"Pull",exercises:[{name:"Lat pulldown",sets:[{r:10,w:45},{r:10,w:45},{r:10,w:45},{r:10,w:45}]},{name:"Rear delt",sets:[{r:15,w:45},{r:15,w:45},{r:15,w:45}]},{name:"Seated row",sets:[{r:10,w:52},{r:10,w:52},{r:10,w:52},{r:10,w:52}]},{name:"Face pull",sets:[{r:20,w:9},{r:20,w:9},{r:20,w:9}]},{name:"Curl bar",sets:[{r:10,w:20},{r:10,w:20},{r:10,w:20}]},{name:"Inclined DB curl",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]}]},
  {date:"2026-03-03",focus:"Push",exercises:[{name:"Bench press",sets:[{r:10,w:50},{r:6,w:50},{r:6,w:50},{r:6,w:50}]},{name:"Inclined bench DB",sets:[{r:10,w:18},{r:8,w:18},{r:7,w:18}]},{name:"Overhead press DB",sets:[{r:6,w:16},{r:8,w:14},{r:8,w:14}]},{name:"Triceps overhead cable",sets:[{r:15,w:11},{r:15,w:11},{r:15,w:11}],ss:true},{name:"Lateral raise cable",sets:[{r:15,w:2},{r:15,w:2},{r:15,w:2}],ss:true},{name:"Fly DB",sets:[{r:12,w:10},{r:12,w:10},{r:12,w:10}]},{name:"Triceps pushdown",sets:[{r:15,w:11},{r:15,w:11},{r:15,w:11}]}]},
];

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let sessions=[],tab='sessions',expandedId=null,selEx=null,loading=false;
let addForm=defaultForm(),editId=null,editForm=null,acActive=null,selMuscle=null,charts={};

function defaultForm(){return{date:new Date().toISOString().split('T')[0],focus:'Push',exercises:[{name:'',sets:[{r:'',w:''}]}],templateFrom:null};}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
const FCHEX={Push:'#c96b4a',Pull:'#4a90b8',Legs:'#5a9e62',Upper:'#8860b8',Other:'#6a6050'};
function fmtDate(ds){const d=new Date(ds+'T12:00:00');return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
function fmtMonth(ds){const d=new Date(ds+'T12:00:00');return d.toLocaleDateString('en-GB',{month:'long',year:'numeric'});}
function daysSince(ds){return Math.floor((Date.now()-new Date(ds+'T12:00:00'))/86400000);}
function sVol(s){return s.exercises.reduce((t,ex)=>t+ex.sets.reduce((st,set)=>st+set.r*Math.max(set.w,0),0),0);}
function allExNames(){const c={};sessions.forEach(s=>s.exercises.forEach(e=>{c[e.name]=(c[e.name]||0)+1;}));return Object.entries(c).filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]).map(([n])=>n);}
function nextSugg(){if(!sessions.length)return{focus:'Push',reason:'First session'};const last=sessions[sessions.length-1];const rot=['Push','Pull','Legs'];const da=daysSince(last.date);if(rot.includes(last.focus)){const next=rot[(rot.indexOf(last.focus)+1)%3];return{focus:next,reason:`${last.focus} was ${da}d ago`};}const ld={};sessions.forEach(s=>{if(rot.includes(s.focus))ld[s.focus]=s.date;});const next=rot.sort((a,b)=>(ld[a]||'0')<(ld[b]||'0')?-1:1)[0];return{focus:next,reason:'Least recently trained'};}
function lastByFocus(focus){return[...sessions].reverse().find(s=>s.focus===focus)||null;}
function isNewPR(session,exName){const ex=session.exercises.find(e=>e.name===exName);if(!ex)return false;const mw=Math.max(...ex.sets.map(s=>s.w));const prev=sessions.filter(s=>s.date<session.date||(s.date===session.date&&s.id!==session.id)).flatMap(s=>s.exercises.filter(e=>e.name===exName)).flatMap(e=>e.sets.map(s=>s.w));if(!prev.length)return false;return mw>Math.max(...prev);}
function countPRs(){let n=0;sessions.forEach(s=>s.exercises.forEach(ex=>{if(isNewPR(s,ex.name))n++;}));return n;}
function progressFor(name){return sessions.filter(s=>s.exercises.some(e=>e.name===name)).map(s=>{const ex=s.exercises.find(e=>e.name===name);return{date:fmtDate(s.date),mw:Math.max(...ex.sets.map(s=>s.w)),vol:Math.round(ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0))};});}
function groupByMonth(ss){const g={};ss.forEach(s=>{const k=fmtMonth(s.date);if(!g[k])g[k]=[];g[k].push(s);});return g;}

function getMuscleStats(){
  const stats={};
  sessions.forEach(s=>s.exercises.forEach(ex=>{
    const map=getMuscleMap(ex.name);if(!map)return;
    const vol=ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0);
    const maxW=Math.max(...ex.sets.map(set=>set.w));
    Object.entries(map).forEach(([muscle,score])=>{
      if(!stats[muscle])stats[muscle]={totalVol:0,exercises:{}};
      stats[muscle].totalVol+=vol*(score/5);
      if(!stats[muscle].exercises[ex.name])stats[muscle].exercises[ex.name]={vol:0,sessions:0,maxW:0,score};
      stats[muscle].exercises[ex.name].vol+=vol;
      stats[muscle].exercises[ex.name].sessions++;
      stats[muscle].exercises[ex.name].maxW=Math.max(stats[muscle].exercises[ex.name].maxW,maxW);
    });
  }));
  return stats;
}

// ═══════════════════════════════════════════════
// INDEXEDDB
// ═══════════════════════════════════════════════
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('lifttrack',1);req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('sessions')){const store=d.createObjectStore('sessions',{keyPath:'id'});store.createIndex('date','date',{unique:false});}};req.onsuccess=e=>resolve(e.target.result);req.onerror=e=>reject(e.target.error);});}
async function initDb(){db=await openDb();}
async function loadSessions(){return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readonly');const req=tx.objectStore('sessions').getAll();req.onsuccess=e=>{sessions=(e.target.result||[]).map(r=>({...r,exercises:r.exercises||[]})).sort((a,b)=>a.date.localeCompare(b.date));if(!sessions.length)seedData().then(resolve).catch(reject);else resolve();};req.onerror=e=>reject(e.target.error);});}
async function seedData(){const withIds=SEED.map(s=>({...s,id:crypto.randomUUID()}));return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');const store=tx.objectStore('sessions');withIds.forEach(s=>store.put(s));tx.oncomplete=()=>{sessions=withIds;resolve();};tx.onerror=e=>reject(e.target.error);});}
async function addSession(s){const session={...s,id:crypto.randomUUID()};return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').put(session);tx.oncomplete=()=>{sessions=[...sessions,session].sort((a,b)=>a.date.localeCompare(b.date));resolve();};tx.onerror=e=>reject(e.target.error);});}
async function updateSession(id,s){const updated={...sessions.find(x=>x.id===id),...s,id};return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').put(updated);tx.oncomplete=()=>{sessions=sessions.map(x=>x.id===id?updated:x);resolve();};tx.onerror=e=>reject(e.target.error);});}
async function deleteSession(id){return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').delete(id);tx.oncomplete=()=>{sessions=sessions.filter(s=>s.id!==id);resolve();};tx.onerror=e=>reject(e.target.error);});}

// ═══════════════════════════════════════════════
// TOAST / UPDATE
// ═══════════════════════════════════════════════
function toast(msg,err=false){const el=document.getElementById('toast');el.textContent=msg;el.className='toast show'+(err?' error':'');setTimeout(()=>el.className='toast',2400);}

function showUpdateBanner(){
  if(document.getElementById('ub'))return;
  const b=document.createElement('div');
  b.id='ub';
  b.style.cssText='position:fixed;top:calc(env(safe-area-inset-top)+10px);left:50%;transform:translateX(-50%);background:rgba(18,16,14,.80);backdrop-filter:blur(10px);border:1px solid rgba(232,184,75,.25);color:#f5d47a;border-radius:16px;padding:10px 14px;font-size:12px;font-family:DM Sans,sans-serif;font-weight:700;z-index:350;display:flex;align-items:center;gap:10px;box-shadow:0 18px 40px rgba(0,0,0,.55);cursor:pointer;white-space:nowrap;';
  b.innerHTML='<span>⬆ Update available</span><span style="background:linear-gradient(135deg,#f5d47a,#c89830);color:#0b0b0a;border-radius:999px;padding:6px 10px;font-weight:900;font-size:10px;letter-spacing:.08em;text-transform:uppercase">Reload</span>';
  b.onclick=()=>window.location.reload();
  document.body.appendChild(b);
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',e=>{if(e?.data?.type==='SW_UPDATED')showUpdateBanner();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'CHECK_UPDATE'});});
}

// ═══════════════════════════════════════════════
// RENDER MASTER
// ═══════════════════════════════════════════════
function render(){
  const totalVol=Math.round(sessions.reduce((t,s)=>t+sVol(s),0));
  const last=sessions[sessions.length-1];
  const da=last?daysSince(last.date):0;
  const next=nextSugg();
  const nc=FCHEX[next.focus]||'#888';
  const exList=allExNames();
  if(!selEx&&exList.length)selEx=exList[0];

  document.getElementById('app').innerHTML=`
    ${loading?'<div class="loading-overlay"><div class="spinner"></div></div>':''}

    <div class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="logo">LIFT<em>TRACK</em></div>
          <div class="pill">
            <div class="rest-badge ${da>4?'warn':''}">${da}d rest</div>
          </div>
        </div>
        <button class="cta" onclick="switchTab('add')">+ Log</button>
      </div>
    </div>

    <div class="stat-strip">
      <div class="stat-cell">
        <div class="stat-cell-label">Sessions</div>
        <div class="stat-cell-val" style="color:var(--gold)">${sessions.length}</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-label">Volume</div>
        <div class="stat-cell-val" style="color:var(--pull)">${(totalVol/1000).toFixed(1)}<span style="font-size:11px;color:var(--muted)">t</span></div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-label">PRs</div>
        <div class="stat-cell-val" style="color:var(--gold2)">${countPRs()}</div>
      </div>
      <div class="stat-cell next" onclick="switchTab('add')">
        <div class="stat-cell-label" style="color:${nc}aa">Next up</div>
        <div class="stat-cell-val" style="color:${nc};font-size:18px">${next.focus}</div>
        <div class="stat-cell-sub">${next.reason}</div>
      </div>
    </div>

    <div class="content" id="content">
      ${tab==='sessions'?renderSessions():tab==='progress'?renderProgress():tab==='muscles'?renderMusclesTab():tab==='overview'?renderOverview():renderAdd()}
    </div>

    <div class="dock">
      <div class="dock-inner">
        ${[
          ['sessions','📋','Log'],
          ['progress','📈','Gains'],
          ['muscles','💪','Muscles'],
          ['overview','◎','Stats'],
          ['add','＋','Add']
        ].map(([t,ic,lb])=>`
          <button class="tab ${tab===t?'active':''}" onclick="switchTab('${t}')">
            <span class="tab-icon">${ic}</span>${lb}<span class="tab-dot"></span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  if(tab==='progress')renderCharts();
}

// ═══════════════════════════════════════════════
// SESSIONS TAB
// ═══════════════════════════════════════════════
function renderSessions(){
  if(!sessions.length)return'<div style="padding:40px 16px;text-align:center;color:var(--muted);font-size:13px">No sessions yet.</div>';
  const sorted=[...sessions].reverse();
  const groups=groupByMonth(sorted);
  const maxExVol={};
  sessions.forEach(s=>s.exercises.forEach(ex=>{const v=ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0);if(!maxExVol[ex.name]||v>maxExVol[ex.name])maxExVol[ex.name]=v;}));

  return Object.entries(groups).map(([month,ss])=>`
    <div class="month-header">
      <div class="month-label">${month.toUpperCase()}</div>
      <div class="month-line"></div>
      <div class="month-count">${ss.length}</div>
    </div>
    ${ss.map(s=>{
      const fc=FCHEX[s.focus]||'#888';
      const vol=Math.round(sVol(s));
      const open=expandedId===s.id;
      const prExNames=s.exercises.filter(ex=>isNewPR(s,ex.name)).map(e=>e.name);
      const hasPR=prExNames.length>0;
      const isEditing=editId===s.id;
      return`
        <div class="session-card ${open?'open':''}">
          <div class="s-top" style="background:linear-gradient(135deg,${fc}12 0%, rgba(16,14,12,.95) 65%)" onclick="toggleSession('${s.id}')">
            <div class="s-stripe" style="background:linear-gradient(180deg,${fc} 0%,${fc}66 100%)"></div>
            <div class="s-main">
              <div class="s-date">${fmtDate(s.date)}</div>
              <div class="s-title-row">
                <div class="s-title" style="color:${fc}">${s.focus}</div>
                <span class="focus-tag" style="color:${fc}">${s.exercises.length} ex</span>
                ${hasPR?'<span class="pr-tag">★ PR</span>':''}
              </div>
              <div class="s-mini-bars">
                ${s.exercises.map(ex=>{
                  const ev=ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0);
                  const h=Math.max(3,Math.round((ev/(maxExVol[ex.name]||1))*16));
                  return`<div style="flex:1;height:${h}px;background:${fc};opacity:0.40;border-radius:6px 6px 0 0"></div>`;
                }).join('')}
              </div>
            </div>
            <div class="s-right">
              <div><span class="s-vol-num">${vol}</span><span class="s-vol-unit">kg</span></div>
              <span class="s-chevron ${open?'open':''}">▼</span>
            </div>
          </div>

          ${open?`
            <div class="s-body">
              ${isEditing?renderEditForm(s):`
                <div class="s-body-inner">
                  ${s.exercises.map(ex=>{
                    const isPR=prExNames.includes(ex.name);
                    const mw=Math.max(...ex.sets.map(s=>s.w));
                    return`
                      <div class="ex-row">
                        <div class="ex-name-row">
                          ${ex.ss?'<span class="ss-pill">SS</span>':''}
                          <span class="ex-name-lbl ${isPR?'pr':''}">${ex.name}${isPR?` <span class="ex-pr-lbl">★${mw}kg</span>`:''}</span>
                        </div>
                        <div class="sets-row">
                          ${ex.sets.map(set=>`<span class="set-pill ${set.w===mw&&isPR?'top':''}">${set.r}×${set.w}</span>`).join('')}
                        </div>
                      </div>`;
                  }).join('')}
                  <div class="s-actions">
                    <button class="s-act-btn" onclick="event.stopPropagation();startEdit('${s.id}')">Edit</button>
                    <button class="s-act-btn" onclick="event.stopPropagation();useAsTemplate('${s.id}')">Use as template</button>
                    <button class="s-act-btn danger" onclick="event.stopPropagation();confirmDelete('${s.id}')">Delete</button>
                  </div>
                </div>`}
            </div>`:''}
        </div>`;
    }).join('')}
  `).join('');
}

function renderEditForm(s){
  const f=editForm;
  return`
    <div class="edit-form" onclick="event.stopPropagation()">
      <div class="form-row" style="margin-bottom:10px">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input class="form-input" type="date" value="${f.date}" onchange="editForm.date=this.value" style="color-scheme:dark">
        </div>
        <div class="form-group">
          <label class="form-label">Focus</label>
          <select class="form-input" onchange="editForm.focus=this.value">
            ${['Push','Pull','Legs','Upper','Other'].map(foc=>`<option ${f.focus===foc?'selected':''}>${foc}</option>`).join('')}
          </select>
        </div>
      </div>

      ${f.exercises.map((ex,ei)=>`
        <div class="ex-card">
          <div class="ex-card-header">
            <div class="reorder-btns">
              <button class="reorder-btn" ${ei===0?'disabled':''} onclick="eMoveEx(${ei},-1)">▲</button>
              <button class="reorder-btn" ${ei===f.exercises.length-1?'disabled':''} onclick="eMoveEx(${ei},1)">▼</button>
            </div>
            <input class="ex-name-input" style="flex:1;margin:0 6px" placeholder="Exercise…" value="${ex.name}" oninput="editForm.exercises[${ei}].name=this.value">
            <button class="rm-ex-btn-add" style="width:42px;height:46px" onclick="eRemoveEx(${ei})">×</button>
          </div>

          ${ex.sets.map((set,si)=>`
            <div class="set-form-row">
              <span class="set-num">${si+1}</span>
              <input class="set-input" type="number" placeholder="Reps" value="${set.r}" oninput="editForm.exercises[${ei}].sets[${si}].r=this.value">
              <span class="set-sep">×</span>
              <input class="set-input" type="number" placeholder="kg" step="0.5" value="${set.w}" oninput="editForm.exercises[${ei}].sets[${si}].w=this.value">
              ${ex.sets.length>1?`<button class="rm-set-btn" onclick="eRemoveSet(${ei},${si})">×</button>`:''}
            </div>`).join('')}
          <button class="add-set-btn" onclick="eAddSet(${ei})">+ Set</button>
        </div>`).join('')}

      <button class="ghost-btn" style="margin-top:4px" onclick="eAddEx()">+ Exercise</button>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="s-act-btn" style="flex:1" onclick="cancelEdit()">Cancel</button>
        <button class="s-act-btn primary" style="flex:2" onclick="saveEdit()">Save changes</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════
// PROGRESS TAB
// ═══════════════════════════════════════════════
function renderProgress(){
  const exList=allExNames();
  if(!exList.length)return'<div style="padding:40px 16px;text-align:center;color:var(--muted);font-size:13px">Log more sessions first.</div>';
  const pd=selEx?progressFor(selEx):[];
  const cur=pd[pd.length-1],first=pd[0];
  const wDelta=cur&&first?cur.mw-first.mw:0;
  return`
    <div class="section-header">
      <div class="section-title">PROGRESS</div>
      <div class="ex-chips">${exList.map(ex=>`<button class="ex-chip ${selEx===ex?'active':''}" onclick="selectEx('${ex.replace(/'/g,"\\'")}')"><span>${ex}</span></button>`).join('')}</div>
    </div>
    ${pd.length<2?`<div style="padding:20px 16px;color:var(--muted);font-size:12px">Not enough data for ${selEx}.</div>`:`
      <div class="chart-block">
        <div class="chart-block-title">Max Weight</div>
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div class="chart-big" style="color:var(--gold)">${cur.mw}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg</span></div>
          <span class="chart-delta" style="color:${wDelta>=0?'var(--green)':'var(--red)'}">${wDelta>=0?'▲':'▼'} ${Math.abs(wDelta).toFixed(1)} since start</span>
        </div>
        <div class="chart-wrap"><canvas id="wChart"></canvas></div>
      </div>
      <div class="chart-block">
        <div class="chart-block-title">Session Volume</div>
        <div class="chart-big" style="color:var(--pull)">${cur.vol}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg·reps</span></div>
        <div class="chart-wrap"><canvas id="vChart"></canvas></div>
      </div>`}`;
}

function renderCharts(){
  const pd=selEx?progressFor(selEx):[];
  if(pd.length<2)return;
  Object.values(charts).forEach(c=>c.destroy());charts={};

  const cfg=(id,key,color)=>{
    const el=document.getElementById(id); if(!el)return;
    charts[id]=new Chart(el,{
      type:'line',
      data:{labels:pd.map(p=>p.date),datasets:[{
        data:pd.map(p=>p[key]),
        borderColor:color,
        backgroundColor:color+'18',
        borderWidth:2,
        pointBackgroundColor:color,
        pointRadius:3,
        pointHoverRadius:5,
        fill:true,
        tension:0.35
      }]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        animation:{duration:250},
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:'rgba(18,16,14,.92)',
            borderColor:'rgba(58,49,39,.70)',
            borderWidth:1,
            titleColor:'#7b715f',
            bodyColor:color,
            titleFont:{family:'IBM Plex Mono',size:9},
            bodyFont:{family:'IBM Plex Mono',size:12}
          }
        },
        scales:{
          x:{grid:{color:'rgba(58,49,39,.22)'},ticks:{color:'rgba(123,113,95,.55)',font:{family:'IBM Plex Mono',size:9}}},
          y:{grid:{color:'rgba(58,49,39,.22)'},ticks:{color:'rgba(123,113,95,.55)',font:{family:'IBM Plex Mono',size:9}},beginAtZero:false}
        }
      }
    });
  };
  cfg('wChart','mw','#e8b84b');
  cfg('vChart','vol','#4a90b8');
}

// ═══════════════════════════════════════════════
// MUSCLES TAB
// ═══════════════════════════════════════════════
function renderMusclesTab(){
  const stats=getMuscleStats();
  if(selMuscle&&stats[selMuscle])return renderMuscleDetail(selMuscle,stats[selMuscle]);
  const muscles=Object.keys(stats).sort((a,b)=>stats[b].totalVol-stats[a].totalVol);
  if(!muscles.length)return'<div style="padding:40px 16px;text-align:center;color:var(--muted);font-size:13px">Log sessions to see muscle stats.</div>';
  const maxVol=Math.max(...muscles.map(m=>stats[m].totalVol));
  return`
    <div class="section-header">
      <div class="section-title">MUSCLES</div>
      <div style="font-size:11px;color:var(--muted)">Tap a muscle to see exercises</div>
    </div>
    <div class="muscle-grid">
      ${muscles.map(muscle=>{
        const s=stats[muscle];const c=MUSCLE_COLORS[muscle]||'#888';
        const pct=Math.round((s.totalVol/maxVol)*100);
        const exCount=Object.keys(s.exercises).length;
        return`
          <div class="muscle-cell" onclick="selMuscle='${muscle}';render()">
            <div class="muscle-cell-name" style="color:${c}">${muscle}</div>
            <div class="muscle-cell-sub">${exCount} exercise${exCount!==1?'s':''}</div>
            <div class="muscle-cell-bar"><div class="muscle-cell-fill" style="width:${pct}%;background:${c}"></div></div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderMuscleDetail(muscle,stat){
  const c=MUSCLE_COLORS[muscle]||'#888';
  const exercises=Object.entries(stat.exercises).sort((a,b)=>b[1].vol-a[1].vol);
  return`
    <div class="muscle-detail-header">
      <button class="back-btn" onclick="selMuscle=null;render()">←</button>
      <div>
        <div class="section-title" style="color:${c};margin-bottom:0">${muscle.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${exercises.length} exercise${exercises.length!==1?'s':''} tracked</div>
      </div>
    </div>
    <div style="padding:12px">
      ${exercises.map(([name,data])=>{
        const isPrimary=data.score>=4;
        const dots=Array.from({length:5},(_,i)=>`<span class="score-dot ${i<data.score?'on'+(isPrimary?'':' sec'):''}"></span>`).join('');
        const lastSession=[...sessions].reverse().find(s=>s.exercises.some(e=>e.name===name));
        const lastDate=lastSession?fmtDate(lastSession.date):'—';
        return`
          <div class="muscle-ex-card">
            <div class="muscle-ex-name">${name}</div>
            <div class="score-row">
              <span class="score-label">${isPrimary?'Primary':'Secondary'}</span>
              <div class="score-dots">${dots}</div>
            </div>
            <div class="muscle-ex-stats">${data.sessions} sessions · max ${data.maxW}kg · last ${lastDate}</div>
          </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════
function renderOverview(){
  const totVol=Math.round(sessions.reduce((t,s)=>t+sVol(s),0));
  const fc={};sessions.forEach(s=>{fc[s.focus]=(fc[s.focus]||0)+1;});
  const exFreq={};sessions.forEach(s=>s.exercises.forEach(e=>{exFreq[e.name]=(exFreq[e.name]||0)+1;}));
  const vols=sessions.map(s=>({vol:Math.round(sVol(s)),focus:s.focus}));
  const maxVol=Math.max(1,...vols.map(s=>s.vol));
  return`
    <div class="section-header">
      <div class="section-title">OVERVIEW</div>
      <div style="font-size:11px;color:var(--muted)">${sessions.length} sessions · ${(totVol/1000).toFixed(1)}t total</div>
    </div>

    <div class="ov-section">
      <div class="ov-title">Session Split</div>
      ${Object.entries(fc).sort((a,b)=>b[1]-a[1]).map(([focus,count])=>`
        <div class="focus-row">
          <div class="focus-row-top">
            <span class="focus-row-name" style="color:${FCHEX[focus]||'#888'}">${focus}</span>
            <span class="focus-row-count">${count}/${sessions.length}</span>
          </div>
          <div class="focus-track"><div class="focus-fill" style="width:${(count/sessions.length)*100}%;background:${FCHEX[focus]||'#888'}"></div></div>
        </div>`).join('')}
    </div>

    <div class="ov-section">
      <div class="ov-title">Volume per Session</div>
      <div class="vol-bars">${vols.map(s=>`<div class="vol-bar" style="height:${Math.round((s.vol/maxVol)*56)+6}px;background:${FCHEX[s.focus]||'#888'}"></div>`).join('')}</div>
    </div>

    <div class="ov-section">
      <div class="ov-title">Exercise Frequency</div>
      <div class="freq-grid">${Object.entries(exFreq).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`
        <div class="freq-item"><span class="freq-name">${name}</span><span class="freq-n">${count}×</span></div>
      `).join('')}</div>
    </div>`;
}

// ═══════════════════════════════════════════════
// ADD FORM
// ═══════════════════════════════════════════════
function renderAdd(){
  const f=addForm;
  const last=f.templateFrom?sessions.find(s=>s.id===f.templateFrom.id):null;
  const lastByEx={};
  if(last)last.exercises.forEach(ex=>{lastByEx[ex.name]=ex.sets;});
  const existingNames=sessions.flatMap(s=>s.exercises.map(e=>e.name)).filter((n,i,a)=>a.indexOf(n)===i);
  const allCandidates=[...new Set([...existingNames,...getDbExerciseNames()])];
  const currentNames=f.exercises.map(e=>e.name).filter(Boolean);

  return`
    <div class="add-header"><div class="add-title">LOG WORKOUT</div></div>
    <div class="add-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input class="form-input" type="date" value="${f.date}" onchange="addForm.date=this.value">
        </div>
        <div class="form-group">
          <label class="form-label">Focus</label>
          <select class="form-input" onchange="changeFocus(this.value)">
            ${['Push','Pull','Legs','Upper','Other'].map(foc=>`<option ${f.focus===foc?'selected':''}>${foc}</option>`).join('')}
          </select>
        </div>
      </div>

      ${last?`
        <div class="tmpl-banner">
          <div>
            <div class="tmpl-lbl">Template from</div>
            <div class="tmpl-date">${fmtDate(last.date)} · ${last.exercises.length} ex</div>
          </div>
          <button class="tmpl-clear" onclick="clearTemplate()">Clear</button>
        </div>`:`
        <div class="no-tmpl">No previous ${f.focus} session — starting fresh</div>`}

      <div id="ex-list">
        ${f.exercises.map((ex,ei)=>{
          const lastSets=lastByEx[ex.name]||null;
          const sugg=ex.name?getProgSugg(ex.name,lastSets):null;
          const alts=ex.name?getAlts(ex.name,currentNames):[];
          const fuzzy=ex.name?fuzzyMatch(ex.name,allCandidates,0.5):[];
          const isAcOpen=acActive===ei&&fuzzy.length>0;
          return`
            <div class="ex-card">
              <div class="ex-card-header">
                <div class="reorder-wrap">
                  <button class="reorder-btn-add" ${ei===0?'disabled':''} onclick="moveEx(${ei},-1)">▲</button>
                  <button class="reorder-btn-add" ${ei===f.exercises.length-1?'disabled':''} onclick="moveEx(${ei},1)">▼</button>
                </div>
                <div class="ex-name-wrap" style="flex:1;margin:0 6px">
                  <input class="ex-name-input" placeholder="Exercise name…" value="${ex.name}" oninput="onExIn(${ei},this.value)" onfocus="onExFocus(${ei})" onblur="onExBlur()" autocomplete="off">
                  ${isAcOpen?`<div class="autocomplete">${fuzzy.map(name=>`<div class="ac-item" onmousedown="pickAc(${ei},'${name.replace(/'/g,"\\'")}')"><span>${name}</span><span class="ac-match">similar</span></div>`).join('')}</div>`:''}
                </div>
                <button class="rm-ex-btn-add" onclick="removeEx(${ei})">×</button>
              </div>

              ${sugg?`<div class="overload-hint"><span class="oh-icon">${sugg.type==='increase'?'🔼':sugg.type==='progress'?'💪':'🔄'}</span><div class="oh-text">${sugg.text}<br><strong>${sugg.suggestion}</strong></div><button class="oh-apply" onclick="applySugg(${ei},${sugg.sets},${sugg.reps},${sugg.weight})">Apply</button></div>`:''}
              ${alts.length?`<div class="alt-row"><span class="alt-label">Alt</span><div class="alt-chips">${alts.map(a=>`<button class="alt-chip" onclick="addAlt('${a.replace(/'/g,"\\'")}',${ei})">${a}</button>`).join('')}</div></div>`:''}

              ${ex.sets.map((set,si)=>{
                const prevSet=lastSets&&lastSets[si];
                const wNum=parseFloat(set.w)||0;
                const wd=wNum&&prevSet?wNum-prevSet.w:null;
                return`
                  <div class="set-form-row">
                    <span class="set-num">${si+1}</span>
                    <input class="set-input" type="number" placeholder="Reps" value="${set.r}" oninput="addForm.exercises[${ei}].sets[${si}].r=this.value">
                    <span class="set-sep">×</span>
                    <input class="set-input" type="number" placeholder="kg" step="0.5" value="${set.w}" oninput="addForm.exercises[${ei}].sets[${si}].w=this.value">
                    ${prevSet?`<span class="prev-ref ${wd===null?'':wd>0?'prev-up':wd<0?'prev-dn':''}">${prevSet.r}×${prevSet.w}</span>`:''}
                    ${ex.sets.length>1?`<button class="rm-set-btn" onclick="removeSet(${ei},${si})">×</button>`:''}
                  </div>`;
              }).join('')}

              <button class="add-set-btn" onclick="addSet(${ei})">+ Set</button>
            </div>`;
        }).join('')}
      </div>

      <button class="ghost-btn" onclick="addEx()">+ Exercise</button>
      <button class="save-btn" id="save-btn" onclick="saveSession()">Save Session →</button>
      <div style="height:10px"></div>
    </div>`;
}

// ═══════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════
function switchTab(t){
  tab=t; acActive=null;
  if(t==='add'){addForm=defaultForm();loadTemplate(addForm.focus);return;}
  if(t!=='muscles')selMuscle=null;
  render();
}
function selectEx(name){selEx=name;render();}
function toggleSession(id){if(editId===id){cancelEdit();return;}expandedId=expandedId===id?null:id;render();}
function changeFocus(focus){addForm.focus=focus;loadTemplate(focus);}
function loadTemplate(focus){
  const last=lastByFocus(focus);
  if(!last){addForm.exercises=[{name:'',sets:[{r:'',w:''}]}];addForm.templateFrom=null;}
  else{
    addForm.exercises=last.exercises.map(ex=>({name:ex.name,ss:ex.ss||false,sets:ex.sets.map(s=>({r:String(s.r),w:String(s.w)}))}));
    addForm.templateFrom={date:last.date,id:last.id};
  }
  acActive=null;render();
}
function clearTemplate(){addForm.exercises=[{name:'',sets:[{r:'',w:''}]}];addForm.templateFrom=null;render();}
function useAsTemplate(id){
  const s=sessions.find(x=>x.id===id); if(!s)return;
  addForm={
    date:new Date().toISOString().split('T')[0],
    focus:s.focus,
    exercises:s.exercises.map(ex=>({name:ex.name,ss:ex.ss||false,sets:ex.sets.map(set=>({r:String(set.r),w:String(set.w)}))})),
    templateFrom:{date:s.date,id:s.id}
  };
  tab='add';acActive=null;render();
  setTimeout(()=>{const c=document.getElementById('content');if(c)c.scrollTop=0;},50);
}

// Edit session
function startEdit(id){
  const s=sessions.find(x=>x.id===id); if(!s)return;
  editId=id;
  editForm={date:s.date,focus:s.focus,exercises:s.exercises.map(ex=>({name:ex.name,ss:ex.ss||false,sets:ex.sets.map(set=>({r:String(set.r),w:String(set.w)}))}))};
  render();
}
function cancelEdit(){editId=null;editForm=null;render();}
function eAddEx(){editForm.exercises.push({name:'',sets:[{r:'',w:''}]});render();}
function eRemoveEx(i){editForm.exercises.splice(i,1);render();}
function eAddSet(ei){editForm.exercises[ei].sets.push({r:'',w:''});render();}
function eRemoveSet(ei,si){editForm.exercises[ei].sets.splice(si,1);render();}
function eMoveEx(ei,dir){const exs=editForm.exercises;const t=ei+dir;if(t<0||t>=exs.length)return;[exs[ei],exs[t]]=[exs[t],exs[ei]];render();}
async function saveEdit(){
  const exs=editForm.exercises.filter(e=>e.name.trim()).map(e=>({name:e.name.trim(),ss:e.ss||false,sets:e.sets.filter(s=>s.r&&s.w).map(s=>({r:+s.r,w:+s.w}))})).filter(e=>e.sets.length);
  if(!exs.length){toast('Add at least one exercise',true);return;}
  loading=true;render();
  try{await updateSession(editId,{date:editForm.date,focus:editForm.focus,exercises:exs});toast('Session updated ✓');editId=null;editForm=null;}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}

// Add form
function onExIn(ei,val){addForm.exercises[ei].name=val;acActive=val.length>=2?ei:null;render();}
function onExFocus(ei){if(addForm.exercises[ei].name.length>=2)acActive=ei;}
function onExBlur(){setTimeout(()=>{acActive=null;render();},150);}
function pickAc(ei,name){addForm.exercises[ei].name=name;acActive=null;render();}
function moveEx(ei,dir){const exs=addForm.exercises;const t=ei+dir;if(t<0||t>=exs.length)return;[exs[ei],exs[t]]=[exs[t],exs[ei]];render();}
function addEx(){addForm.exercises.push({name:'',sets:[{r:'',w:''}]});acActive=null;render();}
function removeEx(i){addForm.exercises.splice(i,1);acActive=null;render();}
function addSet(ei){addForm.exercises[ei].sets.push({r:'',w:''});render();}
function removeSet(ei,si){addForm.exercises[ei].sets.splice(si,1);render();}
function applySugg(ei,sets,reps,weight){addForm.exercises[ei].sets=Array.from({length:sets},()=>({r:String(reps),w:String(weight)}));render();}
function addAlt(name,afterIdx){
  const ls=[...sessions].reverse().find(s=>s.exercises.some(e=>e.name===name));
  const sets=ls?ls.exercises.find(e=>e.name===name).sets.map(s=>({r:String(s.r),w:String(s.w)})):[{r:'',w:''}];
  addForm.exercises.splice(afterIdx+1,0,{name,sets});
  render();
}

async function saveSession(){
  const btn=document.getElementById('save-btn'); if(btn)btn.disabled=true;
  const exs=addForm.exercises.filter(e=>e.name.trim()).map(e=>({name:e.name.trim(),sets:e.sets.filter(s=>s.r&&s.w).map(s=>({r:+s.r,w:+s.w}))})).filter(e=>e.sets.length);
  if(!exs.length){toast('Add at least one exercise',true);if(btn)btn.disabled=false;return;}
  loading=true;render();
  try{await addSession({date:addForm.date,focus:addForm.focus,exercises:exs});toast('Session saved ✓');tab='sessions';addForm=defaultForm();}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}
async function confirmDelete(id){
  if(!confirm('Delete this session?'))return;
  loading=true;render();
  try{await deleteSession(id);toast('Deleted');}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
async function init(){
  loading=true;render();
  try{await initDb();await loadSessions();}
  catch(e){toast('Failed to load data',true);}
  loading=false;render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/lifttrack/sw.js', { scope: '/lifttrack/' }).catch(()=>{});
}
init();
