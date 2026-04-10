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
  // Legacy aggregate keys (MUSCLE_MAP)
  Chest:'#c96b4a',Shoulders:'#b85a90',Triceps:'#7858c0',
  Back:'#4a90b8',Biceps:'#4aabab',Forearms:'#4a7890',
  Quads:'#5a9e62',Hamstrings:'#8a9e40',Glutes:'#c09040',Calves:'#7a8060',
  // Back family (blues)
  Lats:'#4a90b8','Upper Back':'#5aa4c8','Mid Back':'#3d82a8',Traps:'#6ab0d0','Spinal Erectors':'#2e6a88',
  // Shoulders family (amber/orange)
  'Front Delts':'#d4883a','Side Delts':'#e09848','Rear Delts':'#c07828','Rotator Cuff':'#b06818',
  // Core family (gold)
  Abs:'#d4a832',Obliques:'#c09020','Deep Core':'#b08010','Hip Flexors':'#e0b840',
  // Legs family (greens)
  Adductors:'#3e8e46',
};

// Group-level definitions for the 3-level muscle navigation
const MUSCLE_GROUPS=[
  {id:'Chest',        label:'Chest',        color:'#c96b4a', muscles:['Chest']},
  {id:'Back',         label:'Back',         color:'#4a90b8', muscles:['Lats','Upper Back','Mid Back','Traps','Spinal Erectors']},
  {id:'Shoulders',    label:'Shoulders',    color:'#d4883a', muscles:['Front Delts','Side Delts','Rear Delts','Rotator Cuff']},
  {id:'Arms',         label:'Arms',         color:'#8868d0', muscles:['Biceps','Triceps','Forearms']},
  {id:'Core',         label:'Core',         color:'#d4a832', muscles:['Abs','Obliques','Deep Core','Hip Flexors']},
  {id:'Legs & Glutes',label:'Legs & Glutes',color:'#5a9e62', muscles:['Quads','Hamstrings','Glutes','Adductors','Calves']},
];
// Stat keys from MUSCLE_MAP/getMuscleStats that belong to each group
const GROUP_STAT_KEYS={
  'Chest':        ['Chest'],
  'Back':         ['Back','Lats','Upper Back','Mid Back','Traps','Spinal Erectors'],
  'Shoulders':    ['Shoulders','Front Delts','Side Delts','Rear Delts','Rotator Cuff'],
  'Arms':         ['Biceps','Triceps','Forearms'],
  'Core':         ['Abs','Obliques','Deep Core','Hip Flexors'],
  'Legs & Glutes':['Quads','Hamstrings','Glutes','Adductors','Calves'],
};
// Maps visible muscle names to the actual muscle names in exerciseDatabase.muscles[]
const VISIBLE_MUSCLE_DB_NAMES={
  'Mid Back':  ['Mid Back','Rhomboids'],
  'Traps':     ['Upper Traps','Mid Traps','Mid/Lower Traps'],
  'Biceps':    ['Biceps','Brachialis'],
  'Triceps':   ['Triceps','Triceps Long Head','Other Triceps Heads'],
  'Forearms':  ['Forearms','Brachioradialis'],
  'Calves':    ['Calves','Gastrocnemius','Soleus'],
};

// Returns a {muscle:score} map for an exercise name.
// Checks MUSCLE_MAP first; falls back to exerciseDatabase for new canonical names.
function getMuscleMap(name){
  if(MUSCLE_MAP[name])return MUSCLE_MAP[name];
  const fam=getDbFamilyFor(name);
  if(fam&&fam.muscles&&fam.muscles.length){const m={};fam.muscles.forEach(e=>m[e.name]=e.score);return m;}
  return null;
}

// Maps normalized legacy/abbreviated exercise names → database familyName.
// Covers old IndexedDB data that predates canonical name standardisation.
const LEGACY_FAMILY_MAP={
  'bench press':'Flat Press','bench press dumbbell':'Flat Press','close grip bench':'Flat Press',
  'inclined bench dumbbell':'Incline Press',
  'overhead press dumbbell':'Vertical Press','overhead press barbell':'Vertical Press','arnold press':'Vertical Press',
  'fly':'Chest Fly','fly dumbbell':'Chest Fly','fly machine':'Chest Fly',
  'seated dips':'Chest Dip','dip assist':'Chest Dip',
  'lateral raise cable':'Lateral Raise','lateral raise dumbbell':'Lateral Raise',
  'triceps pushdown':'Triceps Pushdown',
  'triceps overhead cable':'Overhead Triceps Extension','triceps overhead dumbbell':'Overhead Triceps Extension',
  'lat pulldown':'Vertical Pull','pull up':'Vertical Pull',
  'straight arm pulldown':'Pullover',
  'seated row':'Horizontal Row','dumbbell row':'Horizontal Row',
  'rear delt':'Rear Delt Fly',
  'face pull':'Face Pull',
  'curl bar':'Curl','arm curl machine':'Curl','inclined dumbbell curl':'Curl','dumbbell curl':'Curl',
  'hammer curl':'Hammer Curl',
  'leg press':'Leg Press',
  'leg extension':'Leg Extension',
  'leg curl':'Leg Curl',
  'bulgarian split squat':'Split Squat',
  'squat':'Squat',
  'hip thrust':'Hip Thrust',
  'calf press':'Standing Calf Raise','calf raise':'Standing Calf Raise',
  'romanian deadlift':'Romanian Deadlift',
};

// Finds the ExerciseFamily for any exercise name — canonical or legacy.
function getDbFamilyFor(name){
  return exerciseDatabase.find(f=>f.familyName===name)||(()=>{const fn=LEGACY_FAMILY_MAP[normName(name)];return fn?exerciseDatabase.find(f=>f.familyName===fn)||null:null;})();
}

// Returns all ExerciseFamily entries that target a given muscle name.
// Handles legacy aggregate MUSCLE_MAP names (Chest, Shoulders, Back, Calves)
// by falling back to database category; granular names use exact/prefix match.
function getDbFamiliesForMuscle(muscle){
  const catMap={Chest:'chest',Shoulders:'shoulders',Back:'back'};
  if(catMap[muscle])return exerciseDatabase.filter(f=>f.category===catMap[muscle]);
  // Check explicit multi-name mappings first (e.g. Traps → Upper Traps + Mid Traps + …)
  const dbNames=VISIBLE_MUSCLE_DB_NAMES[muscle];
  if(dbNames)return exerciseDatabase.filter(f=>f.muscles.some(m=>dbNames.includes(m.name)));
  return exerciseDatabase.filter(f=>f.muscles.some(m=>m.name===muscle||m.name.startsWith(muscle+' ')));
}

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
  'barbell bench press':{min:5,max:8,inc:2.5,sets:4},'dumbbell flat press':{min:8,max:12,inc:2,sets:4},
  'dumbbell incline press':{min:8,max:12,inc:2,sets:3},'dumbbell overhead press':{min:6,max:10,inc:2,sets:3},
  'barbell overhead press':{min:6,max:10,inc:2.5,sets:3},'lat pulldown machine':{min:8,max:12,inc:2.5,sets:4},
  'seated row machine':{min:8,max:12,inc:2.5,sets:4},'assisted dip machine':{min:10,max:15,inc:5,sets:3},
  'leg press machine':{min:10,max:15,inc:5,sets:4},'plate-loaded leg press':{min:10,max:15,inc:5,sets:4},
  'leg curl machine':{min:10,max:15,inc:2.5,sets:3},'leg extension machine':{min:10,max:15,inc:2.5,sets:3},
  'dumbbell bulgarian split squat':{min:8,max:12,inc:2,sets:3},'barbell back squat':{min:5,max:8,inc:2.5,sets:4},
  'plate-loaded hip thrust':{min:12,max:20,inc:5,sets:3},'barbell romanian deadlift':{min:8,max:12,inc:2.5,sets:3},
  'barbell curl':{min:10,max:15,inc:1.25,sets:3},'biceps curl machine':{min:10,max:15,inc:2.5,sets:3},
  'dumbbell curl':{min:10,max:15,inc:1,sets:3},'dumbbell hammer curl':{min:10,max:15,inc:1,sets:3},
  'cable triceps pushdown':{min:12,max:15,inc:1,sets:3},'cable overhead triceps extension':{min:12,max:15,inc:1,sets:3},
  'dumbbell overhead triceps extension':{min:12,max:15,inc:1,sets:3},'cable lateral raise':{min:12,max:20,inc:0.5,sets:3},
  'dumbbell lateral raise':{min:12,max:20,inc:0.5,sets:3},'rear delt machine':{min:15,max:20,inc:2.5,sets:3},
  'cable face pull':{min:15,max:20,inc:1,sets:3},'pec deck':{min:10,max:14,inc:3.5,sets:3},
  'dumbbell fly':{min:10,max:14,inc:2,sets:3},'cable straight-arm pulldown':{min:10,max:15,inc:1,sets:3},
  'standing calf raise machine':{min:15,max:25,inc:5,sets:3},'standing calf raise':{min:15,max:25,inc:5,sets:3},
};
function getProfile(n){return EX_PROFILES[n.toLowerCase()]||{min:8,max:12,inc:2.5,sets:3};}

// ═══════════════════════════════════════════════
// FUZZY MATCH
// ═══════════════════════════════════════════════
function normName(n){return n.toLowerCase().replace(/\bdbs?\b/g,'dumbbell').replace(/\boh\b/g,'overhead').replace(/\bbb\b/g,'barbell').replace(/\bincl\.?\b/g,'inclined').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();}
// Looks up a LiftTrack unified exercise entry by exact name, alias, or normalized name.
function lookupMergedEx(name){
  if(!window.LIFTTRACK_EXERCISE_DB||!name)return null;
  const mdb=window.LIFTTRACK_EXERCISE_DB;
  let e=mdb.find(x=>x.name===name);if(e)return e;
  e=mdb.find(x=>x.aliases&&x.aliases.includes(name));if(e)return e;
  const n=name.toLowerCase().trim();
  return mdb.find(x=>x.name.toLowerCase()===n||(x.aliases&&x.aliases.some(a=>a.toLowerCase()===n)))||null;
}
function lev(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);return d[m][n];}
function fuzzyMatch(input,names,thr=0.5){if(!input||input.length<2)return[];const ni=normName(input);return names.map(name=>{const nn=normName(name);const c=nn.includes(ni)||ni.includes(nn);const s=c?0.95:1-lev(ni,nn)/Math.max(ni.length,nn.length);return{name,s};}).filter(x=>x.s>=thr&&normName(x.name)!==normName(input)).sort((a,b)=>b.s-a.s).slice(0,4).map(x=>x.name);}
function getAlts(name,current){
  const family=getDbFamilyFor(name);
  if(family){
    return DB_EQUIPMENT_KEYS.map(k=>family[k]).filter(n=>n&&n!==name&&!current.some(c=>normName(c)===normName(n)));
  }
  // fallback for old exercise names not in the database
  const nn=normName(name);
  for(const[,ms]of Object.entries(MOVEMENT_PATTERNS)){const f=ms.find(m=>normName(m)===nn||nn.includes(normName(m))||normName(m).includes(nn));if(f)return ms.filter(m=>normName(m)!==nn&&!current.some(c=>normName(c)===normName(m))).slice(0,4);}
  return[];
}
function getProgSugg(name,lastSets){if(!lastSets||!lastSets.length)return null;const p=getProfile(name);const vs=lastSets.filter(s=>s.r>0&&s.w>0);if(!vs.length)return null;const mw=Math.max(...vs.map(s=>s.w));const ar=vs.reduce((t,s)=>t+s.r,0)/vs.length;const allMax=vs.every(s=>s.r>=p.max);const allMin=vs.every(s=>s.r>=p.min);const n=vs.length;if(allMax)return{type:'increase',text:`Hit ${p.max}+ reps on all sets`,suggestion:`${n}×${p.min} @ ${+(mw+p.inc).toFixed(2)}kg`,sets:n,reps:p.min,weight:mw+p.inc};if(allMin){const tr=Math.min(Math.round(ar)+1,p.max);return{type:'progress',text:`Avg ${Math.round(ar)} reps`,suggestion:`Aim ${n}×${tr} @ ${mw}kg`,sets:n,reps:tr,weight:mw};}return{type:'consolidate',text:`Avg ${Math.round(ar)} reps (target ${p.min}+)`,suggestion:`Same ${mw}kg, aim ${n}×${p.min}`,sets:n,reps:p.min,weight:mw};}

// ═══════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════
const SEED=[
  {date:"2025-12-23",focus:"Upper",exercises:[{name:"Barbell Bench Press",sets:[{r:6,w:40},{r:6,w:40},{r:6,w:30},{r:6,w:30}]},{name:"Seated Row Machine",sets:[{r:8,w:39},{r:8,w:39},{r:8,w:39},{r:8,w:39}]},{name:"Dumbbell Overhead Press",sets:[{r:10,w:10},{r:8,w:10},{r:6,w:10}]},{name:"Lat Pulldown Machine",sets:[{r:8,w:39},{r:8,w:39},{r:8,w:39}]},{name:"Dumbbell Incline Press",sets:[{r:10,w:12},{r:8,w:12},{r:7,w:12}]},{name:"Barbell Curl",sets:[{r:15,w:10},{r:15,w:10},{r:15,w:10}]},{name:"Cable Triceps Pushdown",sets:[{r:15,w:9},{r:15,w:9},{r:15,w:9}]}]},
  {date:"2025-12-28",focus:"Upper",exercises:[{name:"Dumbbell Flat Press",sets:[{r:10,w:14},{r:10,w:14},{r:10,w:14},{r:10,w:14}]},{name:"Dumbbell Overhead Press",sets:[{r:10,w:8},{r:10,w:9},{r:10,w:9}]},{name:"Dumbbell Incline Press",sets:[{r:12,w:10},{r:12,w:10},{r:12,w:10}]},{name:"Seated Row Machine",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:39},{r:10,w:39}]},{name:"Lat Pulldown Machine",sets:[{r:10,w:32},{r:10,w:32},{r:8,w:39}]},{name:"Barbell Curl",sets:[{r:10,w:15},{r:10,w:15},{r:10,w:15}]},{name:"Dumbbell Overhead Triceps Extension",sets:[{r:10,w:12},{r:10,w:12},{r:8,w:12}]}]},
  {date:"2026-01-13",focus:"Upper",exercises:[{name:"Lat Pulldown Machine",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:42.5}]},{name:"Barbell Bench Press",sets:[{r:8,w:42.5},{r:10,w:40},{r:7,w:35}]},{name:"Dumbbell Overhead Press",sets:[{r:10,w:10},{r:10,w:10},{r:12,w:10}]},{name:"Seated Row Machine",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:10,w:45}]},{name:"Assisted Dip Machine",sets:[{r:10,w:-9},{r:10,w:-9},{r:8,w:-14}]},{name:"Dumbbell Incline Press",sets:[{r:10,w:12},{r:8,w:12},{r:6,w:12}]},{name:"Barbell Curl",sets:[{r:12,w:15},{r:12,w:15},{r:12,w:15}]}]},
  {date:"2026-01-31",focus:"Push",exercises:[{name:"Dumbbell Flat Press",sets:[{r:10,w:16},{r:10,w:18},{r:10,w:20},{r:6,w:20}]},{name:"Dumbbell Incline Press",sets:[{r:12,w:12},{r:12,w:14},{r:10,w:16}]},{name:"Dumbbell Overhead Press",sets:[{r:12,w:14},{r:12,w:14},{r:8,w:16}]},{name:"Cable Overhead Triceps Extension",sets:[{r:12,w:10},{r:12,w:12},{r:10,w:12}],ss:true},{name:"Cable Lateral Raise",sets:[{r:10,w:3},{r:8,w:3},{r:8,w:3}],ss:true},{name:"Pec Deck",sets:[{r:10,w:45},{r:10,w:66},{r:6,w:73}]}]},
  {date:"2026-02-01",focus:"Pull",exercises:[{name:"Lat Pulldown Machine",sets:[{r:10,w:39},{r:10,w:39},{r:10,w:39},{r:10,w:39}]},{name:"Seated Row Machine",sets:[{r:10,w:45},{r:10,w:45},{r:12,w:45},{r:12,w:45}]},{name:"Rear Delt Machine",sets:[{r:20,w:39},{r:20,w:39},{r:20,w:39}]},{name:"Biceps Curl Machine",sets:[{r:12,w:20},{r:10,w:25},{r:10,w:25}]},{name:"Cable Straight-Arm Pulldown",sets:[{r:10,w:11},{r:10,w:11},{r:10,w:11}]},{name:"Dumbbell Curl",sets:[{r:10,w:9},{r:10,w:9},{r:10,w:9}]}]},
  {date:"2026-02-03",focus:"Legs",exercises:[{name:"Leg Press Machine",sets:[{r:12,w:73},{r:12,w:79},{r:12,w:79},{r:12,w:79}]},{name:"Dumbbell Bulgarian Split Squat",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]},{name:"Leg Curl Machine",sets:[{r:10,w:32},{r:10,w:32},{r:10,w:32}]},{name:"Leg Extension Machine",sets:[{r:10,w:25},{r:10,w:25},{r:10,w:25}]}]},
  {date:"2026-02-05",focus:"Push",exercises:[{name:"Barbell Bench Press",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:6,w:45}]},{name:"Dumbbell Incline Press",sets:[{r:12,w:14},{r:12,w:14},{r:10,w:14}]},{name:"Dumbbell Overhead Press",sets:[{r:8,w:16},{r:10,w:14},{r:10,w:14}]},{name:"Cable Overhead Triceps Extension",sets:[{r:12,w:14},{r:12,w:14},{r:12,w:14}],ss:true},{name:"Cable Lateral Raise",sets:[{r:10,w:4.5},{r:8,w:4.5},{r:8,w:4.5}],ss:true},{name:"Assisted Dip Machine",sets:[{r:12,w:35},{r:15,w:41},{r:15,w:41}]},{name:"Dumbbell Fly",sets:[{r:10,w:10},{r:8,w:10},{r:8,w:10}]}]},
  {date:"2026-02-08",focus:"Pull",exercises:[{name:"Lat Pulldown Machine",sets:[{r:12,w:39},{r:12,w:39},{r:12,w:39},{r:12,w:39}]},{name:"Seated Row Machine",sets:[{r:12,w:45},{r:12,w:45},{r:12,w:45},{r:12,w:45}]},{name:"Rear Delt Machine",sets:[{r:15,w:45},{r:15,w:45},{r:15,w:45}]},{name:"Biceps Curl Machine",sets:[{r:12,w:25},{r:12,w:25},{r:12,w:25}]},{name:"Dumbbell Curl",sets:[{r:12,w:9},{r:12,w:9},{r:12,w:9}]}]},
  {date:"2026-02-17",focus:"Push",exercises:[{name:"Dumbbell Flat Press",sets:[{r:8,w:22},{r:8,w:22},{r:6,w:22}]},{name:"Dumbbell Incline Press",sets:[{r:8,w:16},{r:8,w:16},{r:8,w:16}]},{name:"Dumbbell Overhead Press",sets:[{r:10,w:14},{r:8,w:14},{r:8,w:14}]},{name:"Cable Overhead Triceps Extension",sets:[{r:10,w:11},{r:10,w:11},{r:10,w:11}],ss:true},{name:"Cable Lateral Raise",sets:[{r:10,w:2.3},{r:10,w:2.3},{r:10,w:2.3}],ss:true},{name:"Pec Deck",sets:[{r:10,w:73},{r:10,w:66},{r:10,w:66}]},{name:"Assisted Dip Machine",sets:[{r:10,w:45},{r:10,w:50},{r:10,w:50}]}]},
  {date:"2026-02-19",focus:"Pull",exercises:[{name:"Lat Pulldown Machine",sets:[{r:8,w:45},{r:8,w:45},{r:8,w:45},{r:8,w:45}]},{name:"Seated Row Machine",sets:[{r:8,w:52},{r:8,w:52},{r:8,w:52},{r:8,w:52}]},{name:"Rear Delt Machine",sets:[{r:15,w:45},{r:12,w:45},{r:10,w:45}]},{name:"Cable Face Pull",sets:[{r:15,w:9},{r:15,w:9},{r:15,w:9}]},{name:"Biceps Curl Machine",sets:[{r:8,w:28},{r:8,w:28},{r:8,w:28}]},{name:"Dumbbell Curl",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]}]},
  {date:"2026-02-23",focus:"Legs",exercises:[{name:"Plate-Loaded Hip Thrust",sets:[{r:15,w:10},{r:15,w:10},{r:15,w:10}]},{name:"Standing Calf Raise Machine",sets:[{r:20,w:79},{r:20,w:79},{r:20,w:79}]},{name:"Leg Press Machine",sets:[{r:15,w:86},{r:12,w:93},{r:12,w:93},{r:12,w:93}]},{name:"Leg Extension Machine",sets:[{r:12,w:32},{r:12,w:32},{r:12,w:32}]},{name:"Leg Curl Machine",sets:[{r:12,w:39},{r:12,w:39},{r:12,w:39}]}]},
  {date:"2026-02-24",focus:"Push",exercises:[{name:"Barbell Bench Press",sets:[{r:10,w:45},{r:10,w:45},{r:10,w:45},{r:10,w:45}]},{name:"Dumbbell Incline Press",sets:[{r:10,w:16},{r:10,w:16},{r:10,w:16}]},{name:"Dumbbell Overhead Press",sets:[{r:10,w:14},{r:10,w:14},{r:10,w:14}]},{name:"Dumbbell Overhead Triceps Extension",sets:[{r:12,w:14},{r:12,w:14},{r:12,w:14}],ss:true},{name:"Dumbbell Lateral Raise",sets:[{r:10,w:5},{r:10,w:5},{r:10,w:5}],ss:true},{name:"Assisted Dip Machine",sets:[{r:12,w:50},{r:12,w:50},{r:12,w:50}]}]},
  {date:"2026-02-26",focus:"Pull",exercises:[{name:"Lat Pulldown Machine",sets:[{r:10,w:45},{r:10,w:45},{r:10,w:45},{r:10,w:45}]},{name:"Rear Delt Machine",sets:[{r:15,w:45},{r:15,w:45},{r:15,w:45}]},{name:"Seated Row Machine",sets:[{r:10,w:52},{r:10,w:52},{r:10,w:52},{r:10,w:52}]},{name:"Cable Face Pull",sets:[{r:20,w:9},{r:20,w:9},{r:20,w:9}]},{name:"Barbell Curl",sets:[{r:10,w:20},{r:10,w:20},{r:10,w:20}]},{name:"Dumbbell Curl",sets:[{r:10,w:10},{r:10,w:10},{r:10,w:10}]}]},
  {date:"2026-03-03",focus:"Push",exercises:[{name:"Barbell Bench Press",sets:[{r:10,w:50},{r:6,w:50},{r:6,w:50},{r:6,w:50}]},{name:"Dumbbell Incline Press",sets:[{r:10,w:18},{r:8,w:18},{r:7,w:18}]},{name:"Dumbbell Overhead Press",sets:[{r:6,w:16},{r:8,w:14},{r:8,w:14}]},{name:"Cable Overhead Triceps Extension",sets:[{r:15,w:11},{r:15,w:11},{r:15,w:11}],ss:true},{name:"Cable Lateral Raise",sets:[{r:15,w:2},{r:15,w:2},{r:15,w:2}],ss:true},{name:"Dumbbell Fly",sets:[{r:12,w:10},{r:12,w:10},{r:12,w:10}]},{name:"Cable Triceps Pushdown",sets:[{r:15,w:11},{r:15,w:11},{r:15,w:11}]}]},
];

// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════
let allUsers=JSON.parse(localStorage.getItem('lifttrack_users')||'[]');
let currentUser=null; // set by selectUser()
let newUserNameInput='';

function uKey(key){return currentUser?`lifttrack_${currentUser.id}_${key}`:`lifttrack_${key}`;}

function saveUsers(){localStorage.setItem('lifttrack_users',JSON.stringify(allUsers));}

function selectUser(id){
  currentUser=allUsers.find(u=>u.id===id)||null;
  if(currentUser)localStorage.setItem('lifttrack_current_user',id);
}

function createUser(name,hasSeed=false){
  if(!name.trim())return;
  if(allUsers.some(u=>u.name.toLowerCase()===name.trim().toLowerCase())){toast('A user with that name already exists',true);return false;}
  const id=crypto.randomUUID();
  allUsers.push({id,name:name.trim(),hasSeed});
  saveUsers();
  selectUser(id);
  return true;
}

function switchUser(){
  currentUser=null;
  localStorage.removeItem('lifttrack_current_user');
  sessions=[];schedules=[];recurringSchedules=[];customTemplates=[];
  render();
}

function renameUser(){
  if(!currentUser)return;
  const newName=prompt(t('rename_user_prompt'),currentUser.name);
  if(!newName||!newName.trim())return;
  const trimmed=newName.trim();
  if(allUsers.some(u=>u.id!==currentUser.id&&u.name.toLowerCase()===trimmed.toLowerCase())){toast('A user with that name already exists',true);return;}
  currentUser.name=trimmed;
  const idx=allUsers.findIndex(u=>u.id===currentUser.id);
  if(idx>=0)allUsers[idx].name=trimmed;
  saveUsers();
  render();
}

async function deleteUser(id){
  if(!confirm('Delete this user and all their data? This cannot be undone.'))return;
  // Remove their localStorage keys
  const prefix=`lifttrack_${id}_`;
  Object.keys(localStorage).filter(k=>k.startsWith(prefix)).forEach(k=>localStorage.removeItem(k));
  // Delete their IndexedDB
  indexedDB.deleteDatabase('lifttrack_'+id);
  // Remove from users list
  allUsers=allUsers.filter(u=>u.id!==id);
  saveUsers();
  // If deleting current user, switch to picker
  if(currentUser&&currentUser.id===id){
    currentUser=null;
    localStorage.removeItem('lifttrack_current_user');
    sessions=[];schedules=[];recurringSchedules=[];customTemplates=[];
  }
  render();
}

async function migrateOldDb(){
  // Read sessions from legacy 'lifttrack' IndexedDB (any version) into current user's DB
  return new Promise((resolve)=>{
    // Open without specifying version so we don't accidentally create or downgrade it
    const req=indexedDB.open('lifttrack');
    let dbExisted=true;
    req.onupgradeneeded=()=>{
      // onupgradeneeded fires only when DB is being CREATED — means no old data exists
      dbExisted=false;
    };
    req.onsuccess=e=>{
      const oldDb=e.target.result;
      if(!dbExisted||!oldDb.objectStoreNames.contains('sessions')){oldDb.close();resolve(0);return;}
      const tx=oldDb.transaction('sessions','readonly');
      const req2=tx.objectStore('sessions').getAll();
      req2.onsuccess=async e2=>{
        const rows=e2.target.result||[];
        oldDb.close();
        if(!rows.length){resolve(0);return;}
        // only import sessions not already present (dedup by id)
        const existingIds=new Set(sessions.map(s=>s.id));
        const toImport=rows.filter(s=>s.id&&!existingIds.has(s.id));
        if(!toImport.length){resolve(-1);return;}// -1 = existed but all already imported
        const writeTx=db.transaction('sessions','readwrite');
        const store=writeTx.objectStore('sessions');
        toImport.forEach(s=>store.put(s));
        writeTx.oncomplete=async()=>{await loadSessions();resolve(toImport.length);};
        writeTx.onerror=()=>resolve(0);
      };
      req2.onerror=()=>{oldDb.close();resolve(0);};
    };
    req.onerror=()=>resolve(0);
  });
}

async function handleMigrate(){
  loading=true;render();
  const count=await migrateOldDb();
  loading=false;
  if(count>0)toast(`Imported ${count} sessions`);
  else if(count===-1)toast('Already up to date — no new sessions to import');
  else toast('No previous data found in this browser',true);
  render();
}

function exportSessions(){
  if(!sessions.length){toast('No sessions to export',true);return;}
  const data=JSON.stringify(sessions,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`lifttrack-${currentUser?currentUser.name.replace(/\s+/g,'_'):'sessions'}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImportFile(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='application/json,.json';
  inp.onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      const text=await file.text();
      const rows=JSON.parse(text);
      if(!Array.isArray(rows))throw new Error('Invalid format');
      loading=true;render();
      const existingIds=new Set(sessions.map(s=>s.id));
      const toImport=rows.filter(s=>s.id&&s.date&&s.exercises&&!existingIds.has(s.id));
      if(!toImport.length){loading=false;toast('Nothing new — all sessions already present');render();return;}
      const writeTx=db.transaction('sessions','readwrite');
      const store=writeTx.objectStore('sessions');
      toImport.forEach(s=>store.put(s));
      writeTx.oncomplete=async()=>{await loadSessions();loading=false;toast(`Imported ${toImport.length} sessions`);render();};
      writeTx.onerror=()=>{loading=false;toast('Import failed',true);render();};
    }catch(err){loading=false;toast('Could not read file: '+err.message,true);render();}
  };
  inp.click();
}

const USER_AVATAR_COLORS=['#cf7451','#4ea0c8','#67b06f','#9b78d2','#e8b84b','#c84b6e','#4bbfb4'];
function userAvatarColor(id){const n=id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);return USER_AVATAR_COLORS[n%USER_AVATAR_COLORS.length];}

function renderUserPicker(){
  const savedId=localStorage.getItem('lifttrack_current_user');
  if(savedId&&allUsers.find(u=>u.id===savedId)){selectUser(savedId);return null;}
  return`
  <div style="position:fixed;inset:0;display:flex;flex-direction:column;background:
    radial-gradient(900px 650px at 15% -10%,rgba(232,184,75,.12),transparent 56%),
    radial-gradient(820px 600px at 95% 10%,rgba(78,160,200,.07),transparent 54%),
    linear-gradient(180deg,var(--bg0),var(--bg2));overflow-y:auto;padding-top:env(safe-area-inset-top)">

    <!-- Brand hero -->
    <div style="display:flex;flex-direction:column;align-items:center;padding:56px 24px 32px;gap:10px">
      <div style="font-family:'Bebas Neue',cursive;font-size:48px;letter-spacing:.12em;line-height:1;color:var(--text)">LIFT<em style="color:var(--gold);font-style:normal">TRACK</em></div>
      <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);font-weight:600">Track · Progress · Repeat</div>
    </div>

    <!-- Body -->
    <div style="flex:1;display:flex;flex-direction:column;padding:0 20px calc(40px + env(safe-area-inset-bottom));gap:10px;max-width:400px;width:100%;margin:0 auto">

      ${allUsers.length?`
        <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);font-weight:700;padding:0 4px 4px">Who's training?</div>
        ${allUsers.map(u=>{
          const col=userAvatarColor(u.id);
          const initials=u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
          return`<button onclick="selectUser('${u.id}');initUserData()" style="display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,rgba(36,30,24,.98),rgba(28,24,20,.98));border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:14px 16px;cursor:pointer;text-align:left;width:100%;position:relative;overflow:hidden">
            <div style="position:absolute;inset:0;background:radial-gradient(160px 100px at 0% 50%,${col}22,transparent 60%);pointer-events:none"></div>
            <div style="width:40px;height:40px;border-radius:50%;background:${col}33;border:1.5px solid ${col}88;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',cursive;font-size:16px;letter-spacing:.06em;color:${col};flex-shrink:0">${initials}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:800;color:var(--text);font-family:'DM Sans',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div>
              <div style="font-size:11px;color:var(--dim);margin-top:1px;font-family:'DM Sans',sans-serif">Tap to continue</div>
            </div>
            <div style="color:${col};font-size:18px;opacity:.7;flex-shrink:0">›</div>
          </button>`;
        }).join('')}
        <div style="height:1px;background:rgba(255,255,255,.07);margin:6px 0"></div>
        <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);font-weight:700;padding:0 4px 4px">New user</div>
      `:`<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);font-weight:700;padding:0 4px 4px">Create your profile</div>`}

      <input id="newUserNameInput" placeholder="Your name…" value="${newUserNameInput}"
        oninput="newUserNameInput=this.value"
        onkeydown="if(event.key==='Enter')createUserAndInit()"
        style="background:rgba(36,30,24,.95);border:1.5px solid rgba(255,255,255,.18);border-radius:14px;padding:14px 16px;color:var(--text);font-size:16px;font-family:'DM Sans',sans-serif;outline:none;width:100%">

      <button onclick="createUserAndInit()"
        style="background:linear-gradient(135deg,#f7d98a,#c8922e);color:#0b0b0a;border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:900;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:.04em;box-shadow:0 4px 24px rgba(232,184,75,.35)">
        Create Profile →
      </button>

    </div>
  </div>`;
}

async function createUserAndInit(){
  const inp=document.getElementById('newUserNameInput');
  const name=(inp?inp.value:newUserNameInput).trim();
  if(!name){toast('Enter a name',true);return;}
  const ok=createUser(name);
  if(!ok)return;
  newUserNameInput='';
  await initUserData();
}

async function initUserData(){
  loading=true;render();
  loadSchedules();loadRecurringSchedules();loadCustomTemplates();seedDefaultTemplates();if(currentUser&&currentUser.hasSeed)seedBoxingTemplates();loadBuiltinTemplates();loadBuiltinColors();loadHiddenBuiltins();
  try{await initDb();await loadSessions();}
  catch(e){toast(t('failed_load'),true);}
  loading=false;render();
}

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let sessions=[],tab='sessions',expandedId=null,selEx=null,loading=false;
let progressGroup=null,progressMuscle=null;
let muscleSubTab='exercises';
let schedules=[],schedFocus='Push',schedSelectedDay=null,recurringSchedules=[];
let schedViewYear=new Date().getFullYear(),schedViewMonth=new Date().getMonth();
let customTemplates=[],newTemplateName='',tmplExInput='';
let builtinTemplateExercises={},builtinTemplateColors={},hiddenBuiltins=[];
let expandedTemplateKey=null,editingTemplateKey=null;
let creatingTemplate=false,newTemplateExercises=[],newTmplExInput='',newTemplateColor='';
let addForm=defaultForm(),editId=null,editForm=null,acActive=null,selMuscle=null,selGroup=null,charts={};
let dbEquipment='dumbbells';
let showExerciseLibrary=false;
let exDetailName=null;
let collapsedExercises=new Set();
let restTimerEnd=null,restTimerInterval=null;
let selectingTemplate=false;
let showTimerDock=false;
let lang=localStorage.getItem('lifttrack_lang')||'en';
let showSettings=false;

const STRINGS={
  en:{
    rest:'d rest',sessions:'Sessions',volume:'Volume',prs:'PRs',
    this_week:'This week',streak:'Streak',streak_unit:'wk',
    rename_user:'Rename',rename_user_prompt:'New name:',
    discard_confirm:'Discard this session? Changes will be lost.',
    onboard_title:'Welcome to LiftTrack',onboard_sub:'Start by picking a template and logging your first session.',onboard_cta:'Log a session',
    scheduled:'Scheduled',next_up:'Next up',
    tab_log:'Log',tab_plan:'Plan',tab_muscles:'Muscles',tab_stats:'Stats',
    no_sessions:'No sessions yet.',
    next_up_title:'Next',next_up_title2:'Up',
    schedule_link:'Schedule a date →',start_workout:'Start Workout',
    recent_pre:'Recent',recent_post:'Workouts',
    edit:'Edit',use_as_template:'Use as template',delete:'Delete',
    date:'Date',focus:'Focus',exercise_ph:'Exercise…',reps_ph:'Reps',
    add_set:'+ Set',add_exercise:'+ Exercise',cancel:'Cancel',save_changes:'Save changes',
    gains:'GAINS',select_body_part:'Select a body part',
    muscles_lbl:'muscles',exercises_lbl:'exercises',exercise_lbl:'exercise',
    not_logged_yet:'Not logged yet',
    no_logged_ex:'No logged exercises for',yet:'yet.',
    not_enough_pre:'Not enough data for',not_enough_post:'yet — log at least 2 sessions.',
    est_1rm:'Estimated 1RM',since_start:'since start',max_weight:'Max Weight',
    session_volume:'Session Volume',kg_reps:'kg·reps',
    exercises_section:'Exercises',
    subtab_exercises:'Exercises',subtab_gains:'Gains',
    muscles_title:'MUSCLES',logged_lbl:'logged',in_library:'in library',
    tap_day:'Tap a day to schedule a session',
    add_to_plan:'+ Add to plan',sched_sessions_pre:'Scheduled',sched_sessions_post:'Sessions',today_lbl:'Today',
    my_tmpl_pre:'My',my_tmpl_post:'Templates',
    no_ex_yet:'No exercises yet.',done:'Done',
    tmpl_name_ph:'Template name…',add_ex_below:'Add exercises below.',
    ex_name_ph:'Exercise name…',add_btn:'+ Add',
    save_template:'Save Template',create_template:'+ Create Template',
    plan_pre:'MY',plan_gold:'PLAN',sched_future:'Schedule future sessions',
    overview_title:'OVERVIEW',total_lbl:'total',
    session_split:'Session Split',vol_per_session:'Volume per Session',ex_freq:'Exercise Frequency',
    library:'Library',
    primary:'Primary',secondary:'Secondary',instructions:'Instructions',
    no_details:'No details available for this exercise yet.',
    log_workout:'LOG WORKOUT',tmpl_from:'Template from',clear:'Clear',
    no_prev_pre:'No previous',no_prev_post:'session — starting fresh',
    no_ex_tap:'No exercises yet — tap + Exercise to open the library',
    close_library:'✕ Close library',manual_ex:'+ Manual exercise',save_session:'Save Session →',
    session_updated:'Session updated ✓',session_saved:'Session saved ✓',
    add_at_least:'Add at least one exercise',delete_confirm:'Delete this session?',
    deleted:'Deleted',failed_load:'Failed to load data',
    update_banner:'⬆ Update available',reload:'Reload',
    select_day:'Select a day first',session_planned:'Session planned',
    enter_tmpl_name:'Enter a template name',tmpl_exists:'Template already exists',tmpl_created:'Template created',
    similar:'similar',apply:'Apply',alt_lbl:'Alt',
    logs_lbl:'logs',log_lbl:'log',no_logs:'no logs',ex_lbl:'ex',sessions_lbl:'sessions',today_meta:'Today',
    eq_body:'Body',eq_dbs:'DBs',eq_barbell:'Barbell',eq_cable:'Cable',eq_machine:'Machine',eq_plate:'Plate',
    cat_chest:'Chest',cat_shoulders:'Shoulders',cat_back:'Back',cat_legs:'Legs & Glutes',cat_arms:'Arms',cat_core:'Core',
    m1:'January',m2:'February',m3:'March',m4:'April',m5:'May',m6:'June',
    m7:'July',m8:'August',m9:'September',m10:'October',m11:'November',m12:'December',
    d_mo:'Mo',d_tu:'Tu',d_we:'We',d_th:'Th',d_fr:'Fr',d_sa:'Sa',d_su:'Su',
    settings:'Settings',language:'Language',
    f_Push:'Push',f_Pull:'Pull',f_Legs:'Legs',f_Upper:'Upper',f_Core:'Core',f_Other:'Other',
    not_logged_short:'not logged',
  },
  fr:{
    rest:'j repos',sessions:'Séances',volume:'Volume',prs:'PRs',
    this_week:'Cette sem.',streak:'Série',streak_unit:'sem',
    rename_user:'Renommer',rename_user_prompt:'Nouveau nom :',
    discard_confirm:'Abandonner cette séance ? Les changements seront perdus.',
    onboard_title:'Bienvenue sur LiftTrack',onboard_sub:'Commence par choisir un modèle et enregistrer ta première séance.',onboard_cta:'Enregistrer une séance',
    scheduled:'Planifié',next_up:'Prochaine',
    tab_log:'Journal',tab_plan:'Planning',tab_muscles:'Muscles',tab_stats:'Stats',
    no_sessions:'Aucune séance.',
    next_up_title:'Prochaine',next_up_title2:'Séance',
    schedule_link:'Planifier une date →',start_workout:'Commencer',
    recent_pre:'Séances',recent_post:'Récentes',
    edit:'Modifier',use_as_template:'Utiliser comme modèle',delete:'Supprimer',
    date:'Date',focus:'Séance',exercise_ph:'Exercice…',reps_ph:'Rép.',
    add_set:'+ Série',add_exercise:'+ Exercice',cancel:'Annuler',save_changes:'Enregistrer',
    gains:'PROGRÈS',select_body_part:'Sélectionner un muscle',
    muscles_lbl:'muscles',exercises_lbl:'exercices',exercise_lbl:'exercice',
    not_logged_yet:'Pas encore enregistré',
    no_logged_ex:'Aucun exercice enregistré pour',yet:'encore.',
    not_enough_pre:'Pas assez de données pour',not_enough_post:'encore — enregistre au moins 2 séances.',
    est_1rm:'1RM Estimé',since_start:'depuis le début',max_weight:'Poids Max',
    session_volume:'Volume de Séance',kg_reps:'kg·rép.',
    exercises_section:'Exercices',
    subtab_exercises:'Exercices',subtab_gains:'Progrès',
    muscles_title:'MUSCLES',logged_lbl:'enregistrés',in_library:'en bibliothèque',
    tap_day:'Appuie sur un jour pour planifier',
    add_to_plan:'+ Ajouter au planning',sched_sessions_pre:'Séances',sched_sessions_post:'Planifiées',today_lbl:"Aujourd'hui",
    my_tmpl_pre:'Mes',my_tmpl_post:'Modèles',
    no_ex_yet:"Pas encore d'exercices.",done:'Terminé',
    tmpl_name_ph:'Nom du modèle…',add_ex_below:'Ajoutez des exercices ci-dessous.',
    ex_name_ph:"Nom de l'exercice…",add_btn:'+ Ajouter',
    save_template:'Enregistrer le modèle',create_template:'+ Créer un modèle',
    plan_pre:'MON',plan_gold:'PLANNING',sched_future:'Planifier des séances',
    overview_title:'APERÇU',total_lbl:'total',
    session_split:'Répartition des séances',vol_per_session:'Volume par séance',ex_freq:'Fréquence des exercices',
    library:'Bibliothèque',
    primary:'Principal',secondary:'Secondaire',instructions:'Instructions',
    no_details:'Aucun détail disponible pour cet exercice.',
    log_workout:'ENREGISTRER UNE SÉANCE',tmpl_from:'Modèle du',clear:'Effacer',
    no_prev_pre:'Aucune séance',no_prev_post:'précédente — nouveau départ',
    no_ex_tap:'Aucun exercice — appuie sur + Exercice pour ouvrir la bibliothèque',
    close_library:'✕ Fermer la bibliothèque',manual_ex:'+ Exercice manuel',save_session:'Enregistrer →',
    session_updated:'Séance mise à jour ✓',session_saved:'Séance enregistrée ✓',
    add_at_least:'Ajoutez au moins un exercice',delete_confirm:'Supprimer cette séance ?',
    deleted:'Supprimé',failed_load:'Erreur de chargement',
    update_banner:'⬆ Mise à jour disponible',reload:'Recharger',
    select_day:'Sélectionne d\'abord un jour',session_planned:'Séance planifiée',
    enter_tmpl_name:'Entrer un nom de modèle',tmpl_exists:'Ce modèle existe déjà',tmpl_created:'Modèle créé',
    similar:'similaire',apply:'Appliquer',alt_lbl:'Alt',
    logs_lbl:'séances',log_lbl:'séance',no_logs:'non enregistré',ex_lbl:'ex',sessions_lbl:'séances',today_meta:"Aujourd'hui",
    eq_body:'Corps',eq_dbs:'Halt.',eq_barbell:'Barre',eq_cable:'Poulie',eq_machine:'Machine',eq_plate:'Disques',
    cat_chest:'Pectoraux',cat_shoulders:'Épaules',cat_back:'Dos',cat_legs:'Jambes & Fessiers',cat_arms:'Bras',cat_core:'Abdos',
    m1:'Janvier',m2:'Février',m3:'Mars',m4:'Avril',m5:'Mai',m6:'Juin',
    m7:'Juillet',m8:'Août',m9:'Septembre',m10:'Octobre',m11:'Novembre',m12:'Décembre',
    d_mo:'Lu',d_tu:'Ma',d_we:'Me',d_th:'Je',d_fr:'Ve',d_sa:'Sa',d_su:'Di',
    settings:'Paramètres',language:'Langue',
    f_Push:'Poussée',f_Pull:'Tirage',f_Legs:'Jambes',f_Upper:'Haut',f_Core:'Tronc',f_Other:'Autre',
    not_logged_short:'non enregistré',
  }
};
function t(key){return(STRINGS[lang]||STRINGS.en)[key]||STRINGS.en[key]||key;}
function tFocus(f){const k='f_'+f;const s=(STRINGS[lang]||STRINGS.en)[k];return s||f;}
function tMuscle(m){
  if(lang!=='fr')return m;
  const M={'Chest':'Pectoraux','Back':'Dos','Shoulders':'Épaules','Arms':'Bras','Core':'Abdominaux','Legs & Glutes':'Jambes & Fessiers','Lats':'Dorsaux','Upper Back':'Haut du dos','Mid Back':'Dos moyen','Traps':'Trapèzes','Spinal Erectors':'Érecteurs spinaux','Front Delts':'Deltoïdes ant.','Side Delts':'Deltoïdes lat.','Rear Delts':'Deltoïdes post.','Rotator Cuff':'Coiffe rotateurs','Biceps':'Biceps','Triceps':'Triceps','Forearms':'Avant-bras','Brachialis':'Brachial','Brachioradialis':'Brachio-radial','Abs':'Abdominaux','Obliques':'Obliques','Deep Core':'Profond','Hip Flexors':'Fléch. hanche','Serratus':'Serratus','Quads':'Quadriceps','Hamstrings':'Ischio-jamb.','Glutes':'Fessiers','Adductors':'Adducteurs','Calves':'Mollets','Gastrocnemius':'Gastrocnémien','Soleus':'Soléaire','Upper Traps':'Trapèzes sup.','Mid Traps':'Trapèzes moy.','Mid/Lower Traps':'Trap. moy./inf.','Rhomboids':'Rhomboïdes','Lower Chest':'Pec inf.','Upper Chest':'Pec sup.','Triceps Long Head':'Chef long tri.','Other Triceps Heads':'Autres chefs','Shoulders':'Épaules'};
  return M[m]||m;
}
function tTag(v){
  if(lang!=='fr'||!v)return v;
  const T={beginner:'débutant',intermediate:'intermédiaire',expert:'expert',compound:'composé',isolation:'isolation'};
  return T[v.toLowerCase()]||v;
}

function setLang(l){lang=l;localStorage.setItem('lifttrack_lang',l);showSettings=false;render();}

function defaultForm(){return{date:new Date().toISOString().split('T')[0],focus:'Push',exercises:[],templateFrom:null};}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
const FCHEX={Push:'#c96b4a',Pull:'#4a90b8',Legs:'#5a9e62',Upper:'#8860b8',Other:'#6a6050'};
const TMPL_COLORS=['#c96b4a','#4a90b8','#5a9e62','#8860b8','#c89830','#4aabab','#b85a90','#7b715f'];
function getFocusColor(focus){
  const ct=customTemplates.find(tc=>tc.name===focus);
  if(ct&&ct.color)return ct.color;
  if(builtinTemplateColors[focus])return builtinTemplateColors[focus];
  return FCHEX[focus]||'#888';
}
function fmtDate(ds){const d=new Date(ds+'T12:00:00');return d.toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{day:'numeric',month:'short'});}
function fmtMonth(ds){const d=new Date(ds+'T12:00:00');return d.toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{month:'long',year:'numeric'});}
function daysSince(ds){return Math.floor((Date.now()-new Date(ds+'T12:00:00'))/86400000);}
function sVol(s){return s.exercises.reduce((t,ex)=>t+ex.sets.reduce((st,set)=>st+set.r*Math.max(set.w,0),0),0);}
function allExNames(){const c={};sessions.forEach(s=>s.exercises.forEach(e=>{c[e.name]=(c[e.name]||0)+1;}));return Object.entries(c).filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]).map(([n])=>n);}
function nextSugg(){if(!sessions.length)return{focus:'Push',reason:'First session'};const last=sessions[sessions.length-1];const rot=['Push','Pull','Legs'];const da=daysSince(last.date);if(rot.includes(last.focus)){const next=rot[(rot.indexOf(last.focus)+1)%3];return{focus:next,reason:`${last.focus} was ${da}d ago`};}const ld={};sessions.forEach(s=>{if(rot.includes(s.focus))ld[s.focus]=s.date;});const next=rot.sort((a,b)=>(ld[a]||'0')<(ld[b]||'0')?-1:1)[0];return{focus:next,reason:'Least recently trained'};}
function lastByFocus(focus){return[...sessions].reverse().find(s=>s.focus===focus)||null;}
function isNewPR(session,exName){const ex=session.exercises.find(e=>e.name===exName);if(!ex)return false;const mw=Math.max(...ex.sets.map(s=>s.w));const prev=sessions.filter(s=>s.date<session.date||(s.date===session.date&&s.id!==session.id)).flatMap(s=>s.exercises.filter(e=>e.name===exName)).flatMap(e=>e.sets.map(s=>s.w));if(!prev.length)return false;return mw>Math.max(...prev);}
function countPRs(){let n=0;sessions.forEach(s=>s.exercises.forEach(ex=>{if(isNewPR(s,ex.name))n++;}));return n;}

function weekMonday(date){
  const d=new Date(date+'T12:00:00');
  const dow=d.getDay();
  d.setDate(d.getDate()-(dow===0?6:dow-1));
  return d.toISOString().split('T')[0];
}
function thisWeekCount(){
  const wk=weekMonday(new Date().toISOString().split('T')[0]);
  const sun=new Date(wk+'T12:00:00');sun.setDate(sun.getDate()+6);
  const sunStr=sun.toISOString().split('T')[0];
  return sessions.filter(s=>s.date>=wk&&s.date<=sunStr).length;
}
function thisWeekTarget(){
  const days=new Set(recurringSchedules.map(r=>r.dow));
  return days.size||3;
}
function calcStreak(){
  if(!sessions.length)return 0;
  const sessionWeeks=new Set(sessions.map(s=>weekMonday(s.date)));
  const todayStr=new Date().toISOString().split('T')[0];
  const curWk=weekMonday(todayStr);
  let streak=0;
  for(let i=0;i<104;i++){
    const d=new Date(curWk+'T12:00:00');d.setDate(d.getDate()-i*7);
    const wkStr=d.toISOString().split('T')[0];
    if(sessionWeeks.has(wkStr)){streak++;}
    else if(i===0){continue;} // current week not done yet — don't break
    else{break;}
  }
  return streak;
}
function progressFor(name){return sessions.filter(s=>s.exercises.some(e=>e.name===name)).map(s=>{const ex=s.exercises.find(e=>e.name===name);const vs=ex.sets.filter(s=>s.w>0&&s.r>0);const e1rm=vs.length?+(Math.max(...vs.map(s=>s.w*(1+s.r/30))).toFixed(1)):0;return{date:fmtDate(s.date),mw:Math.max(...ex.sets.map(s=>s.w)),vol:Math.round(ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0)),e1rm};});}

// Groups logged exercises by database family; returns [{label, exName}] sorted by total family log count.
// The representative exName is the most-logged variant within the family.
function allFamilyChips(){
  const counts={};
  sessions.forEach(s=>s.exercises.forEach(e=>{if(e.name)counts[e.name]=(counts[e.name]||0)+1;}));
  const byFamily={},standalone={};
  for(const[exName,count]of Object.entries(counts)){
    if(count<2)continue;
    const fam=getDbFamilyFor(exName);
    if(fam){const fn=fam.familyName;if(!byFamily[fn])byFamily[fn]=[];byFamily[fn].push({exName,count});}
    else standalone[exName]=count;
  }
  const chips=[];
  for(const[familyName,variants]of Object.entries(byFamily)){
    variants.sort((a,b)=>b.count-a.count);
    const total=variants.reduce((t,v)=>t+v.count,0);
    chips.push({label:familyName,exName:variants[0].exName,total});
  }
  for(const[exName,count]of Object.entries(standalone)){chips.push({label:exName,exName,total:count});}
  chips.sort((a,b)=>b.total-a.total);
  return chips;
}
// Returns [{name, count}] of logged exercises that target `muscle`, sorted by log count desc.
function getLoggedExercisesForMuscle(muscle){
  const families=getDbFamiliesForMuscle(muscle);
  const exNames=new Set();
  families.forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);}));
  const counts={};
  sessions.forEach(s=>s.exercises.forEach(e=>{if(exNames.has(e.name))counts[e.name]=(counts[e.name]||0)+1;}));
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
}
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
// SCHEDULE
// ═══════════════════════════════════════════════
function loadSchedules(){schedules=JSON.parse(localStorage.getItem(uKey('schedules'))||'[]');}
function saveSchedules(){localStorage.setItem(uKey('schedules'),JSON.stringify(schedules));}
function saveDraft(){localStorage.setItem(uKey('draft'),JSON.stringify(addForm));}
function loadDraft(){return JSON.parse(localStorage.getItem(uKey('draft'))||'null');}
function clearDraft(){localStorage.removeItem(uKey('draft'));}
function loadRecurringSchedules(){recurringSchedules=JSON.parse(localStorage.getItem(uKey('recurring'))||'[]');}
function saveRecurringSchedules(){localStorage.setItem(uKey('recurring'),JSON.stringify(recurringSchedules));}
function loadCustomTemplates(){customTemplates=JSON.parse(localStorage.getItem(uKey('templates'))||'[]');}
function saveCustomTemplates(){localStorage.setItem(uKey('templates'),JSON.stringify(customTemplates));}

const BOXING_TEMPLATES=[
  {
    name:'Boxing A — Power + Lower',
    color:'#c0392b',
    exercises:[
      'Trap Bar Deadlift',
      'Barbell Back Squat',
      'Barbell Romanian Deadlift',
      'Rear-Foot Elevated Split Squat',
      'Pallof Press',
      'Barbell Hip Thrust',
      'Barbell Standing Calf Raise'
    ]
  },
  {
    name:'Boxing B — Push + Core',
    color:'#2980b9',
    exercises:[
      'Med Ball Rotational Throw',
      'Neutral-Grip Dumbbell Bench Press',
      'Landmine Press',
      'Dumbbell Overhead Press',
      'Dead Bug',
      'Hanging Knee Raise',
      'Ab Wheel Rollout',
      'Isometric Neck Hold'
    ]
  },
  {
    name:'Boxing C — Pull + Conditioning',
    color:'#27ae60',
    exercises:[
      'Weighted Pull-Up',
      'Pendlay Row',
      'One-Arm Dumbbell Row',
      'Dumbbell Step-Up',
      'Cable Face Pull',
      'Dumbbell Hammer Curl',
      'Wrist Roller',
      'Conditioning Circuit',
      'Isometric Neck Hold'
    ]
  }
];
function seedBoxingTemplates(){
  let changed=false;
  for(const tmpl of BOXING_TEMPLATES){
    if(!customTemplates.some(t=>t.name===tmpl.name)){
      customTemplates.push({id:crypto.randomUUID(),name:tmpl.name,exercises:[...tmpl.exercises],color:tmpl.color});
      changed=true;
    }
  }
  if(changed)saveCustomTemplates();
}

const DEFAULT_TEMPLATES=[
  {name:'Push',color:'#cf7451',exercises:['Dumbbell Bench Press','Dumbbell Incline Press','Dumbbell Overhead Press','Cable Lateral Raise','Cable Overhead Triceps Extension']},
  {name:'Pull',color:'#4ea0c8',exercises:['Lat Pulldown Machine','Seated Row Machine','Cable Face Pull','Dumbbell Curl']},
  {name:'Legs',color:'#67b06f',exercises:['Leg Press Machine','Leg Extension Machine','Leg Curl Machine','Dumbbell Bulgarian Split Squat','Standing Calf Raise Machine']},
];
function seedDefaultTemplates(){
  let changed=false;
  for(const tmpl of DEFAULT_TEMPLATES){
    if(!customTemplates.some(t=>t.name===tmpl.name)){
      customTemplates.push({id:crypto.randomUUID(),name:tmpl.name,exercises:[...tmpl.exercises],color:tmpl.color});
      changed=true;
    }
  }
  if(changed)saveCustomTemplates();
}
const BUILTIN_TEMPLATE_DEFAULTS={
  Push:['Barbell Bench Press','Dumbbell Incline Press','Dumbbell Overhead Press','Cable Lateral Raise','Pec Deck','Cable Overhead Triceps Extension'],
  Pull:['Lat Pulldown Machine','Seated Row Machine','Rear Delt Machine','Cable Face Pull','Biceps Curl Machine','Dumbbell Curl'],
  Legs:['Leg Press Machine','Leg Extension Machine','Leg Curl Machine','Dumbbell Bulgarian Split Squat','Standing Calf Raise Machine'],
  Upper:['Barbell Bench Press','Dumbbell Incline Press','Dumbbell Overhead Press','Lat Pulldown Machine','Seated Row Machine','Barbell Curl','Cable Triceps Pushdown']
};
function loadBuiltinTemplates(){
  const stored=localStorage.getItem(uKey('builtin_tmpl'));
  builtinTemplateExercises=stored?JSON.parse(stored):Object.fromEntries(Object.entries(BUILTIN_TEMPLATE_DEFAULTS).map(([k,v])=>[k,[...v]]));
  if(!stored)saveBuiltinTemplates();
}
function saveBuiltinTemplates(){localStorage.setItem(uKey('builtin_tmpl'),JSON.stringify(builtinTemplateExercises));}
function loadBuiltinColors(){builtinTemplateColors=JSON.parse(localStorage.getItem(uKey('builtin_colors'))||'{}');}
function saveBuiltinColors(){localStorage.setItem(uKey('builtin_colors'),JSON.stringify(builtinTemplateColors));}
function loadHiddenBuiltins(){hiddenBuiltins=JSON.parse(localStorage.getItem(uKey('hidden_builtins'))||'[]');}
function saveHiddenBuiltins(){localStorage.setItem(uKey('hidden_builtins'),JSON.stringify(hiddenBuiltins));}
function setTemplateColor(key,color,isBuiltin){
  if(isBuiltin){builtinTemplateColors[key]=color;saveBuiltinColors();}
  else{const tc=customTemplates.find(tc=>tc.id===key);if(tc){tc.color=color;saveCustomTemplates();}}
  render();
}
function deleteBuiltinTemplate(key){
  if(!hiddenBuiltins.includes(key))hiddenBuiltins.push(key);
  saveHiddenBuiltins();expandedTemplateKey=null;editingTemplateKey=null;render();
}
// dow: 0=Mon … 6=Sun (matches calendar convention)
const DOW_NAMES_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DOW_NAMES_FR=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
function dowName(dow){return(lang==='fr'?DOW_NAMES_FR:DOW_NAMES_EN)[dow]||'';}
function dateDow(dateStr){const d=new Date(dateStr+'T12:00:00');return(d.getDay()+6)%7;}// Mon=0
function nextDateForDow(dow){
  const today=new Date();today.setHours(12,0,0,0);
  const todayDow=(today.getDay()+6)%7;
  const diff=(dow-todayDow+7)%7||7;// at least 1 day ahead
  const d=new Date(today);d.setDate(d.getDate()+diff);
  return d.toISOString().split('T')[0];
}
function addRecurring(dow,focus){
  recurringSchedules.push({id:crypto.randomUUID(),dow,focus});
  saveRecurringSchedules();render();toast('Recurring session added');
}
function deleteRecurring(id){recurringSchedules=recurringSchedules.filter(r=>r.id!==id);saveRecurringSchedules();render();}
function getNextScheduled(){
  const today=new Date().toISOString().split('T')[0];
  const oneOff=schedules.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
  const recurring=recurringSchedules.map(r=>({date:nextDateForDow(r.dow),focus:r.focus,recurring:true})).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
  if(!oneOff&&!recurring)return null;
  if(!oneOff)return recurring;
  if(!recurring)return oneOff;
  return oneOff.date<=recurring.date?oneOff:recurring;
}
function getAllFocuses(){return['Push','Pull','Legs','Upper',...customTemplates.map(t=>t.name)];}
function confirmAddSchedule(){
  if(!schedSelectedDay)return toast(t('select_day'),true);
  schedules.push({id:crypto.randomUUID(),date:schedSelectedDay,focus:schedFocus});
  schedules.sort((a,b)=>a.date.localeCompare(b.date));
  saveSchedules();render();toast(t('session_planned'));
}
function confirmAddRecurring(){
  if(!schedSelectedDay)return toast(t('select_day'),true);
  const dow=dateDow(schedSelectedDay);
  addRecurring(dow,schedFocus);
}
function deleteSchedule(id){schedules=schedules.filter(s=>s.id!==id);saveSchedules();render();}
function addCustomTemplate(){
  const name=newTemplateName.trim();
  if(!name)return toast(t('enter_tmpl_name'),true);
  if(getAllFocuses().some(f=>f.toLowerCase()===name.toLowerCase()))return toast(t('tmpl_exists'),true);
  const id=crypto.randomUUID();
  const color=newTemplateColor||TMPL_COLORS[customTemplates.length%TMPL_COLORS.length];
  customTemplates.push({id,name,exercises:[...newTemplateExercises],color});
  saveCustomTemplates();creatingTemplate=false;newTemplateName='';newTemplateExercises=[];newTemplateColor='';expandedTemplateKey=id;editingTemplateKey=null;render();toast(t('tmpl_created'));
}
function startCreatingTemplate(){creatingTemplate=true;newTemplateName='';newTemplateExercises=[];newTmplExInput='';newTemplateColor='';expandedTemplateKey=null;editingTemplateKey=null;render();}
function cancelCreatingTemplate(){creatingTemplate=false;newTemplateName='';newTemplateExercises=[];render();}
function getTmplExSuggestions(query){
  const logged=allExNames();
  const db=getDbExerciseNames();
  const pool=[...new Set([...logged,...db])];
  if(!query||!query.trim())return logged.slice(0,24);
  const q=query.toLowerCase();
  return pool.filter(n=>n.toLowerCase().includes(q)).slice(0,24);
}
function addToNewTemplate(){
  const el=document.getElementById('newTmplExInput');
  const name=(el?el.value:newTmplExInput).trim();if(!name)return;
  newTemplateExercises.push(name);newTmplExInput='';render();
  setTimeout(()=>{const inp=document.getElementById('newTmplExInput');if(inp)inp.focus();},30);
}
function addToNewTemplateByName(name){
  if(!name)return;
  newTemplateExercises.push(name);newTmplExInput='';render();
  setTimeout(()=>{const inp=document.getElementById('newTmplExInput');if(inp){inp.value='';inp.focus();}},0);
}
function addTemplateExByName(id,name){
  if(!name)return;
  const tc=customTemplates.find(tc=>tc.id===id);if(!tc)return;
  tc.exercises.push(name);saveCustomTemplates();tmplExInput='';render();
  setTimeout(()=>{const inp=document.getElementById('tmplExInput_'+id);if(inp){inp.value='';inp.focus();}},0);
}
function addBuiltinExByName(focus,name){
  if(!name)return;
  if(!builtinTemplateExercises[focus])builtinTemplateExercises[focus]=[];
  builtinTemplateExercises[focus].push(name);saveBuiltinTemplates();tmplExInput='';render();
  setTimeout(()=>{const inp=document.getElementById('tmplExInput_'+focus);if(inp){inp.value='';inp.focus();}},0);
}
function addToCurrentTemplate(name){
  if(!name)return;
  if(creatingTemplate){addToNewTemplateByName(name);return;}
  if(!editingTemplateKey)return;
  const BUILTIN=['Push','Pull','Legs','Upper'];
  if(BUILTIN.includes(editingTemplateKey))addBuiltinExByName(editingTemplateKey,name);
  else addTemplateExByName(editingTemplateKey,name);
}
function removeFromNewTemplate(idx){newTemplateExercises.splice(idx,1);render();}
function deleteCustomTemplate(id){
  const removed=customTemplates.find(t=>t.id===id);
  customTemplates=customTemplates.filter(t=>t.id!==id);
  if(removed&&schedFocus===removed.name)schedFocus='Push';
  if(expandedTemplateKey===id)expandedTemplateKey=null;
  if(editingTemplateKey===id)editingTemplateKey=null;
  saveCustomTemplates();render();
}
function addTemplateEx(id){
  const el=document.getElementById('tmplExInput_'+id);
  const name=(el?el.value:tmplExInput).trim();
  if(!name)return;
  const t=customTemplates.find(t=>t.id===id);if(!t)return;
  t.exercises.push(name);
  saveCustomTemplates();tmplExInput='';render();
}
function removeTemplateEx(id,idx){
  const t=customTemplates.find(t=>t.id===id);if(!t)return;
  t.exercises.splice(idx,1);
  saveCustomTemplates();render();
}
function moveTemplateEx(id,idx,dir){
  const t=customTemplates.find(t=>t.id===id);if(!t)return;
  const ni=idx+dir;if(ni<0||ni>=t.exercises.length)return;
  [t.exercises[idx],t.exercises[ni]]=[t.exercises[ni],t.exercises[idx]];
  saveCustomTemplates();render();
}
function addBuiltinEx(focus){
  const el=document.getElementById('tmplExInput_'+focus);
  const name=(el?el.value:tmplExInput).trim();if(!name)return;
  if(!builtinTemplateExercises[focus])builtinTemplateExercises[focus]=[];
  builtinTemplateExercises[focus].push(name);
  saveBuiltinTemplates();tmplExInput='';render();
}
function removeBuiltinEx(focus,idx){builtinTemplateExercises[focus].splice(idx,1);saveBuiltinTemplates();render();}
function moveBuiltinEx(focus,idx,dir){
  const arr=builtinTemplateExercises[focus];
  const ni=idx+dir;if(ni<0||ni>=arr.length)return;
  [arr[idx],arr[ni]]=[arr[ni],arr[idx]];
  saveBuiltinTemplates();render();
}
function prevSchedMonth(){schedViewMonth--;if(schedViewMonth<0){schedViewMonth=11;schedViewYear--;}schedSelectedDay=null;render();}
function nextSchedMonth(){schedViewMonth++;if(schedViewMonth>11){schedViewMonth=0;schedViewYear++;}schedSelectedDay=null;render();}

// ═══════════════════════════════════════════════
// INDEXEDDB
// ═══════════════════════════════════════════════
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(currentUser?'lifttrack_'+currentUser.id:'lifttrack',1);req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('sessions')){const store=d.createObjectStore('sessions',{keyPath:'id'});store.createIndex('date','date',{unique:false});}};req.onsuccess=e=>resolve(e.target.result);req.onerror=e=>reject(e.target.error);});}
async function initDb(){db=await openDb();}
async function loadSessions(){return new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readonly');const req=tx.objectStore('sessions').getAll();req.onsuccess=e=>{sessions=(e.target.result||[]).map(r=>({...r,exercises:r.exercises||[]})).sort((a,b)=>a.date.localeCompare(b.date));if(!sessions.length&&currentUser&&currentUser.hasSeed)seedData().then(resolve).catch(reject);else resolve();};req.onerror=e=>reject(e.target.error);});}
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
  b.innerHTML=`<span>${t('update_banner')}</span><span style="background:linear-gradient(135deg,#f5d47a,#c89830);color:#0b0b0a;border-radius:999px;padding:6px 10px;font-weight:900;font-size:10px;letter-spacing:.08em;text-transform:uppercase">${t('reload')}</span>`;
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
  const savedScroll=document.getElementById('content')?.scrollTop||0;
  // Show user picker if no user selected
  if(!currentUser){
    const pickerHtml=renderUserPicker();
    if(pickerHtml){document.getElementById('app').innerHTML=pickerHtml;setTimeout(()=>{const inp=document.getElementById('newUserNameInput');if(inp)inp.focus();},50);return;}
    // renderUserPicker() returned null = auto-selected, fall through
  }
  const totalVol=Math.round(sessions.reduce((t,s)=>t+sVol(s),0));
  const last=sessions[sessions.length-1];
  const da=last?daysSince(last.date):0;
  const exList=allExNames();
  if(!selEx&&exList.length)selEx=exList[0];

  document.getElementById('app').innerHTML=`
    ${loading?'<div class="loading-overlay"><div class="spinner"></div></div>':''}

    <div class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="logo">LIFT<em>TRACK</em></div>
          <div class="pill">
            <div class="rest-badge ${da>4?'warn':''}">${da}${t('rest')}</div>
          </div>
        </div>
        <button class="settings-btn" onclick="showSettings=!showSettings;render()" title="${t('settings')}">⚙</button>
      </div>
    </div>

    <div class="stat-strip">
      <div class="stat-cell">
        <div class="stat-cell-label">${t('sessions')}</div>
        <div class="stat-cell-val" style="color:var(--gold)">${sessions.length}</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-label">${t('volume')}</div>
        <div class="stat-cell-val" style="color:var(--pull)">${(totalVol/1000).toFixed(1)}<span style="font-size:11px;color:var(--muted)">t</span></div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-label">${t('this_week')}</div>
        <div class="stat-cell-val" style="color:var(--accent)">${thisWeekCount()}<span style="font-size:13px;color:var(--muted);font-family:'DM Sans',sans-serif;font-weight:600"> / ${thisWeekTarget()}</span></div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-label">${t('streak')}</div>
        <div class="stat-cell-val" style="color:var(--gold2)">${calcStreak()}<span style="font-size:11px;color:var(--muted)"> ${t('streak_unit')}</span></div>
      </div>
    </div>

    <div class="content" id="content">
      ${tab==='sessions'?renderSessions():tab==='schedule'?renderScheduleTab():tab==='muscles'?renderMusclesTab():tab==='overview'?renderOverview():renderAdd()}
    </div>

    ${tab==='add'&&!selectingTemplate?`
    <div class="dock" style="background:transparent;border:none;box-shadow:none">
      <div style="pointer-events:auto;padding:10px 14px;">
        ${showTimerDock
          ?`<div style="display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#f5d47a,#c89830);border-radius:999px;padding:10px 12px;width:100%;box-sizing:border-box">
              ${[60,90,120,150,180].map(s=>`<button onclick="showTimerDock=false;startRestTimer(${s})" style="background:rgba(0,0,0,.15);border:none;border-radius:999px;padding:6px 0;color:#0b0b0a;font-size:12px;font-weight:800;font-family:'IBM Plex Mono',monospace;cursor:pointer;letter-spacing:.02em;flex:1;text-align:center">${fmtTimer(s)}</button>`).join('')}
              <button onclick="showTimerDock=false;render()" style="background:none;border:none;color:#0b0b0a;font-size:18px;cursor:pointer;opacity:.6;padding:0 4px;flex-shrink:0">×</button>
            </div>`
          :`<button onclick="${restTimerEnd?'cancelRestTimer()':'showTimerDock=true;render()'}" style="background:linear-gradient(135deg,#f5d47a,#c89830);border:none;border-radius:999px;padding:13px 0;cursor:pointer;box-shadow:0 4px 20px rgba(245,212,122,.4);display:flex;align-items:center;justify-content:center;width:100%">
              ${restTimerEnd
                ?`<span style="font-size:14px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:#0b0b0a" id="rest-timer-num">${fmtTimer(Math.max(0,Math.ceil((restTimerEnd-Date.now())/1000)))}</span>`
                :`<span style="font-size:13px;font-weight:900;font-family:'DM Sans',sans-serif;color:#0b0b0a;letter-spacing:.08em">TIMER</span>`}
            </button>`
        }
      </div>
    </div>`:`
    <div class="dock">
      <div class="dock-inner">
        ${[['sessions','📋',t('tab_log')],['schedule','📅',t('tab_plan')]].map(([tb,ic,lb])=>`
          <button class="tab ${tab===tb?'active':''}" onclick="switchTab('${tb}')">
            <span class="tab-icon">${ic}</span><span class="tab-label">${lb}</span><span class="tab-dot"></span>
          </button>`).join('')}
        <button class="tab tab-add ${tab==='add'?'active':''}" onclick="switchTab('add')">
          <span class="tab-icon">＋</span>
        </button>
        ${[['muscles','💪',t('tab_muscles')],['overview','◎',t('tab_stats')]].map(([tb,ic,lb])=>`
          <button class="tab ${tab===tb?'active':''}" onclick="switchTab('${tb}')">
            <span class="tab-icon">${ic}</span><span class="tab-label">${lb}</span><span class="tab-dot"></span>
          </button>`).join('')}
      </div>
    </div>`}
    ${renderExDetailModal()}
    ${renderSettingsModal()}
  `;

  const c=document.getElementById('content');
  if(c)c.scrollTop=savedScroll;
  if(tab==='muscles'&&muscleSubTab==='gains')renderCharts();
}

// ═══════════════════════════════════════════════
// SESSIONS TAB
// ═══════════════════════════════════════════════
function renderSessions(){
  if(!sessions.length)return`
    <div style="padding:48px 24px 32px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
      <div style="font-size:40px;line-height:1">🏋️</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:.08em;color:var(--text)">${t('onboard_title')}</div>
      <div style="font-size:14px;color:var(--dim);max-width:260px;line-height:1.5">${t('onboard_sub')}</div>
      <button onclick="switchTab('add')" style="margin-top:8px;background:var(--accent);color:#0b0b0a;border:none;border-radius:12px;padding:14px 28px;font-size:14px;font-weight:800;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:.04em">${t('onboard_cta')}</button>
    </div>`;
  const sorted=[...sessions].reverse();
  const groups=groupByMonth(sorted);
  const maxExVol={};
  sessions.forEach(s=>s.exercises.forEach(ex=>{const v=ex.sets.reduce((t,set)=>t+set.r*Math.max(set.w,0),0);if(!maxExVol[ex.name]||v>maxExVol[ex.name])maxExVol[ex.name]=v;}));

  const next=nextSugg();
  const sc=getNextScheduled();
  const heroFocus=(sc||next).focus;
  const nc=getFocusColor(heroFocus);
  const todayStr=new Date().toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{weekday:'short',day:'numeric',month:'short'});
  const today=new Date().toISOString().split('T')[0];
  const heroMeta=sc?(sc.date===today?`${t('today_meta')} · ${todayStr} · ${t('scheduled')}`:`${fmtDate(sc.date)} · ${t('scheduled')}`):`${t('today_meta')} · ${todayStr}`;

  return`
    <div class="log-next-section">
      <div class="log-section-hdr"><span class="log-section-title"><span style="color:var(--text)">${t('next_up_title')}</span> ${t('next_up_title2')}</span></div>
      <div class="next-hero-date-row">${heroMeta}</div>
      <div class="next-hero-card" onclick="switchTab('add')">
        <div class="next-hero-bg" style="background:radial-gradient(ellipse at 78% 40%,${nc}38 0%,transparent 62%),radial-gradient(ellipse at 18% 90%,${nc}18 0%,transparent 55%)"></div>
        <div class="next-hero-content">
          <div class="next-hero-top-row">
            <div class="next-hero-name" style="color:${nc}">${tFocus(heroFocus)}</div>
            ${!sc?`<button class="next-hero-schedule-link" onclick="event.stopPropagation();switchTab('schedule')">${t('schedule_link')}</button>`:''}
          </div>
        </div>
        <button class="next-hero-cta" onclick="event.stopPropagation();switchTab('add')">${t('start_workout')}</button>
      </div>
    </div>

    <div class="log-section-hdr log-recent-hdr">
      <span class="log-section-title"><span style="color:var(--text)">${t('recent_pre')}</span> ${t('recent_post')}</span>
    </div>

    ${Object.entries(groups).map(([month,ss])=>`
      <div class="month-header">
        <div class="month-label">${month.toUpperCase()}</div>
        <div class="month-line"></div>
        <div class="month-count">${ss.length}</div>
      </div>
      ${ss.map(s=>{
        const fc=getFocusColor(s.focus);
        const vol=Math.round(sVol(s));
        const volStr=vol>=1000?(vol/1000).toFixed(1)+'k':String(vol);
        const open=expandedId===s.id;
        const prExNames=s.exercises.filter(ex=>isNewPR(s,ex.name)).map(e=>e.name);
        const hasPR=prExNames.length>0;
        const isEditing=editId===s.id;
        return`
          <div class="rw-card ${open?'open':''}">
            <div class="rw-card-top" onclick="toggleSession('${s.id}')">
              <div class="rw-stripe" style="background:linear-gradient(180deg,${fc},${fc}44)"></div>
              <div class="rw-main">
                <div class="rw-name" style="color:${fc}">${tFocus(s.focus)}</div>
                <div class="rw-sub">${s.exercises.length} ${t('exercises_lbl')}${hasPR?` · <span style="color:var(--gold)">★ PR</span>`:''}</div>
              </div>
              <div class="rw-right">
                <div class="rw-date">${fmtDate(s.date)}</div>
                <div class="rw-vol">${volStr}</div>
              </div>
              <span class="rw-chevron ${open?'open':''}">▼</span>
            </div>

            ${open?`
              <div class="s-body">
                ${isEditing?renderEditForm():`
                  <div class="s-body-inner">
                    ${s.exercises.map(ex=>{
                      const isPR=prExNames.includes(ex.name);
                      const mw=Math.max(...ex.sets.map(st=>st.w));
                      return`
                        <div class="ex-row">
                          <div class="ex-name-row">
                            ${ex.ss?'<span class="ss-pill">SS</span>':''}
                            <span class="ex-name-lbl ${isPR?'pr':''}">${ex.name}${isPR?` <span class="ex-pr-lbl">★${mw}kg</span>`:''}</span>
                            <button class="ex-info-btn" onclick="event.stopPropagation();openExDetail('${ex.name.replace(/'/g,"\\'")}')">ⓘ</button>
                          </div>
                          <div class="sets-row">
                            ${ex.sets.map(set=>`<span class="set-pill ${set.w===mw&&isPR?'top':''}">${set.r}×${set.w}</span>`).join('')}
                          </div>
                        </div>`;
                    }).join('')}
                    <div class="s-actions">
                      <button class="s-act-btn" onclick="event.stopPropagation();startEdit('${s.id}')">${t('edit')}</button>
                      <button class="s-act-btn" onclick="event.stopPropagation();useAsTemplate('${s.id}')">${t('use_as_template')}</button>
                      <button class="s-act-btn" onclick="event.stopPropagation();saveSessionAsTemplate('${s.id}')">Save as template</button>
                      <button class="s-act-btn danger" onclick="event.stopPropagation();confirmDelete('${s.id}')">${t('delete')}</button>
                    </div>
                  </div>`}
              </div>`:''}
          </div>`;
      }).join('')}
    `).join('')}
  `;
}

function renderEditForm(){
  const f=editForm;
  return`
    <div class="edit-form" onclick="event.stopPropagation()">
      <div class="form-row" style="margin-bottom:10px">
        <div class="form-group">
          <label class="form-label">${t('date')}</label>
          <input class="form-input" type="date" value="${f.date}" onchange="editForm.date=this.value" style="color-scheme:dark">
        </div>
        <div class="form-group">
          <label class="form-label">${t('focus')}</label>
          <select class="form-input" onchange="editForm.focus=this.value">
            ${getAllFocuses().map(foc=>`<option value="${foc}" ${f.focus===foc?'selected':''}>${tFocus(foc)}</option>`).join('')}
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
            <input class="ex-name-input" style="flex:1;margin:0 6px" placeholder="${t('exercise_ph')}" value="${ex.name}" oninput="editForm.exercises[${ei}].name=this.value">
            <button class="rm-ex-btn-add" style="width:42px;height:46px" onclick="eRemoveEx(${ei})">×</button>
          </div>

          ${ex.sets.map((set,si)=>`
            <div class="set-form-row">
              <span class="set-num">${si+1}</span>
              <input class="set-input" type="number" placeholder="${t('reps_ph')}" value="${set.r}" oninput="editForm.exercises[${ei}].sets[${si}].r=this.value">
              <span class="set-sep">×</span>
              <input class="set-input" type="number" placeholder="kg" step="0.5" value="${set.w}" oninput="editForm.exercises[${ei}].sets[${si}].w=this.value">
              ${ex.sets.length>1?`<button class="rm-set-btn" onclick="eRemoveSet(${ei},${si})">×</button>`:''}
            </div>`).join('')}
          <button class="add-set-btn" onclick="eAddSet(${ei})">${t('add_set')}</button>
        </div>`).join('')}

      <button class="ghost-btn" style="margin-top:4px" onclick="eAddEx()">${t('add_exercise')}</button>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="s-act-btn" style="flex:1" onclick="cancelEdit()">${t('cancel')}</button>
        <button class="s-act-btn primary" style="flex:2" onclick="saveEdit()">${t('save_changes')}</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════
// PROGRESS TAB
// ═══════════════════════════════════════════════
function renderProgress(){
  if(progressMuscle)return renderProgressForMuscle(progressMuscle);
  if(progressGroup){const g=MUSCLE_GROUPS.find(g=>g.id===progressGroup);if(g)return renderProgressGroup(g);}
  // Level 1 — body-part groups
  return`
    <div class="section-header">
      <div class="section-title">${t('gains')}</div>
      <div style="font-size:11px;color:var(--muted)">${t('select_body_part')}</div>
    </div>
    <div class="muscle-group-grid">
      ${MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const logCount=sessions.reduce((t,s)=>t+s.exercises.filter(e=>exNames.has(e.name)).length,0);
        return`<div class="muscle-group-card" onclick="progressGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${tMuscle(g.label)}</div>
          <div class="muscle-group-sub">${g.muscles.length} ${t('muscles_lbl')}</div>
          ${logCount?`<div class="muscle-group-vol">${logCount} log${logCount!==1?'s':''}</div>`:''}
        </div>`;
      }).join('')}
    </div>`;
}

function renderProgressGroup(group){
  return`
    <div class="muscle-detail-header">
      <button class="back-btn" onclick="progressGroup=null;render()">←</button>
      <div>
        <div class="section-title" style="color:${group.color};margin-bottom:0">${tMuscle(group.label).toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${group.muscles.length} ${t('muscles_lbl')}</div>
      </div>
    </div>
    <div class="muscle-grid" style="padding-top:14px">
      ${group.muscles.map(muscle=>{
        const c=MUSCLE_COLORS[muscle]||group.color;
        const exs=getLoggedExercisesForMuscle(muscle);
        const libCount=getDbFamiliesForMuscle(muscle).reduce((t,f)=>t+DB_EQUIPMENT_KEYS.filter(k=>f[k]).length,0);
        const logCount=exs.reduce((t,e)=>t+e.count,0);
        return`<div class="muscle-cell" onclick="progressMuscle='${muscle}';selEx=null;render()">
          <div class="muscle-cell-name" style="color:${c}">${tMuscle(muscle)}</div>
          <div class="muscle-cell-sub">${exs.length?`${exs.length} ${t('ex_lbl')} · ${logCount} ${t('logs_lbl')}`:`${libCount} ${t('ex_lbl')} · ${t('no_logs')}`}</div>
          <div class="muscle-cell-bar"><div class="muscle-cell-fill" style="width:${exs.length?'60':'0'}%;background:${c}"></div></div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderProgressForMuscle(muscle){
  const group=MUSCLE_GROUPS.find(g=>g.muscles.includes(muscle));
  const c=MUSCLE_COLORS[muscle]||group?.color||'#888';
  const exs=getLoggedExercisesForMuscle(muscle);
  const header=`
    <div class="muscle-detail-header">
      <button class="back-btn" onclick="progressMuscle=null;render()">←</button>
      <div>
        <div class="section-title" style="color:${c};margin-bottom:0">${muscle.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${exs.length} ${exs.length!==1?t('exercises_lbl'):t('exercise_lbl')} ${t('logged_lbl')}</div>
      </div>
    </div>`;
  if(!exs.length)return header+`<div style="padding:40px 16px;text-align:center;color:var(--muted);font-size:13px">${t('no_logged_ex')} ${tMuscle(muscle)} ${t('yet')}</div>`;
  if(!selEx||!exs.some(e=>e.name===selEx))selEx=exs[0].name;
  const pd=progressFor(selEx);
  const cur=pd[pd.length-1],first=pd[0];
  const wDelta=cur&&first?+(cur.mw-first.mw).toFixed(1):0;
  const eDelta=cur&&first?+(cur.e1rm-first.e1rm).toFixed(1):0;
  return header+`
    <div class="progress-ex-header">
      <div class="progress-ex-name">${selEx}</div>
    </div>
    ${pd.length<2?`<div style="padding:20px 16px;color:var(--muted);font-size:12px">${t('not_enough_pre')} ${selEx} ${t('not_enough_post')}</div>`:`
      <div class="chart-block">
        <div class="chart-block-title">${t('est_1rm')}</div>
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div class="chart-big" style="color:#6bbd7f">${cur.e1rm}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg</span></div>
          <span class="chart-delta" style="color:${eDelta>=0?'var(--green)':'var(--red)'}">${eDelta>=0?'▲':'▼'} ${Math.abs(eDelta)} ${t('since_start')}</span>
        </div>
        <div class="chart-wrap"><canvas id="eChart"></canvas></div>
      </div>
      <div class="chart-block">
        <div class="chart-block-title">${t('max_weight')}</div>
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div class="chart-big" style="color:var(--gold)">${cur.mw}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg</span></div>
          <span class="chart-delta" style="color:${wDelta>=0?'var(--green)':'var(--red)'}">${wDelta>=0?'▲':'▼'} ${Math.abs(wDelta)} ${t('since_start')}</span>
        </div>
        <div class="chart-wrap"><canvas id="wChart"></canvas></div>
      </div>
      <div class="chart-block">
        <div class="chart-block-title">${t('session_volume')}</div>
        <div class="chart-big" style="color:var(--pull)">${cur.vol}<span style="font-size:12px;color:var(--muted);margin-left:4px">${t('kg_reps')}</span></div>
        <div class="chart-wrap"><canvas id="vChart"></canvas></div>
      </div>`}
    <div style="padding:10px 14px 16px">
      <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px">${t('exercises_section')}</div>
      ${exs.map(e=>`<div class="progress-ex-row ${selEx===e.name?'active':''}" onclick="selectEx('${e.name.replace(/'/g,"\\'")}')">
        <span class="progress-ex-row-name">${e.name}</span>
        <span class="progress-ex-row-count">${e.count}×</span>
      </div>`).join('')}
    </div>`;
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
  cfg('eChart','e1rm','#6bbd7f');
  cfg('wChart','mw','#e8b84b');
  cfg('vChart','vol','#4a90b8');
}

// ═══════════════════════════════════════════════
// MUSCLES TAB
// ═══════════════════════════════════════════════
function renderMusclesTab(){
  if(muscleSubTab==='gains'){
    if(progressMuscle)return renderProgressForMuscle(progressMuscle);
    if(progressGroup){const g=MUSCLE_GROUPS.find(g=>g.id===progressGroup);if(g)return renderProgressGroup(g);}
  } else {
    if(selMuscle){const stats=getMuscleStats();return renderMuscleDetail(selMuscle,stats[selMuscle]||null);}
    if(selGroup){const g=MUSCLE_GROUPS.find(g=>g.id===selGroup);if(g)return renderMuscleGroup(g);}
  }
  // Level 1 — body-part groups with sub-tab picker
  const subTabPicker=`<div class="muscle-subtab-bar">
    <button class="muscle-subtab ${muscleSubTab==='exercises'?'active':''}" onclick="muscleSubTab='exercises';selGroup=null;selMuscle=null;render()">${t('subtab_exercises')}</button>
    <button class="muscle-subtab ${muscleSubTab==='gains'?'active':''}" onclick="muscleSubTab='gains';progressGroup=null;progressMuscle=null;render()">${t('subtab_gains')}</button>
  </div>`;
  const cards=muscleSubTab==='gains'
    ?MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const logCount=sessions.reduce((t,s)=>t+s.exercises.filter(e=>exNames.has(e.name)).length,0);
        return`<div class="muscle-group-card" onclick="progressGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${tMuscle(g.label)}</div>
          <div class="muscle-group-sub">${g.muscles.length} ${t('muscles_lbl')}</div>
          <div class="muscle-group-vol">${logCount} ${logCount!==1?t('logs_lbl'):t('log_lbl')}</div>
        </div>`;
      }).join('')
    :MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const exCount=exNames.size;
        return`<div class="muscle-group-card" onclick="selGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${tMuscle(g.label)}</div>
          <div class="muscle-group-sub">${g.muscles.length} ${t('muscles_lbl')}</div>
          <div class="muscle-group-vol">${exCount} ${exCount!==1?t('exercises_lbl'):t('exercise_lbl')}</div>
        </div>`;
      }).join('');
  return`
    <div class="section-header">
      <div class="section-title">${t('muscles_title')}</div>
      ${subTabPicker}
    </div>
    <div class="muscle-group-grid">${cards}</div>`;
}

function renderMuscleGroup(group){
  const stats=getMuscleStats();
  const vols=group.muscles.map(m=>stats[m]?.totalVol||0);
  const maxVol=Math.max(...vols,1);
  return`
    <div class="muscle-detail-header">
      <button class="back-btn" onclick="selGroup=null;render()">←</button>
      <div>
        <div class="section-title" style="color:${group.color};margin-bottom:0">${tMuscle(group.label).toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${group.muscles.length} ${t('muscles_lbl')}</div>
      </div>
    </div>
    <div class="muscle-grid" style="padding-top:14px">
      ${group.muscles.map((muscle,i)=>{
        const c=MUSCLE_COLORS[muscle]||group.color;
        const pct=Math.round((vols[i]/maxVol)*100);
        const exCount=getDbFamiliesForMuscle(muscle).length;
        return`<div class="muscle-cell" onclick="selMuscle='${muscle}';render()">
          <div class="muscle-cell-name" style="color:${c}">${tMuscle(muscle)}</div>
          <div class="muscle-cell-sub">${exCount} ${exCount!==1?t('exercises_lbl'):t('exercise_lbl')}</div>
          <div class="muscle-cell-bar"><div class="muscle-cell-fill" style="width:${pct}%;background:${c}"></div></div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderMuscleDetail(muscle,stat){
  const c=MUSCLE_COLORS[muscle]||'#888';
  const loggedData=stat?stat.exercises:{};
  const families=getDbFamiliesForMuscle(muscle);
  const matches=families.map(f=>{
    const exName=f[dbEquipment];if(!exName)return null;
    const targetM=f.muscles.find(m=>m.name===muscle||m.name.startsWith(muscle+' '));
    const displayM=targetM||f.muscles.find(m=>m.role==='primary');
    return{name:exName,family:f,targetM,displayM,score:displayM?.score||0};
  }).filter(Boolean).sort((a,b)=>b.score-a.score);
  return`
    <div class="muscle-detail-header">
      <button class="back-btn" onclick="selMuscle=null;render()">←</button>
      <div>
        <div class="section-title" style="color:${c};margin-bottom:0">${tMuscle(muscle).toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${Object.keys(loggedData).length} ${t('logged_lbl')} · ${families.length} ${t('in_library')}</div>
      </div>
    </div>
    <div style="padding:10px 14px 6px">
      <div class="db-eq-bar">
        ${Object.entries(getEqLabels()).map(([key,label])=>`<button class="db-eq-tab ${dbEquipment===key?'active':''}" onclick="dbEquipment='${key}';render()">${label}</button>`).join('')}
      </div>
    </div>
    <div style="padding:8px 14px 12px">
      ${matches.length?matches.map(({name,family,displayM,score})=>{
        const isPrimary=displayM?.role==='primary';
        const dots=Array.from({length:5},(_,i)=>`<span class="score-dot ${i<score?'on'+(isPrimary?'':' sec'):''}"></span>`).join('');
        const data=loggedData[name];
        const lastSession=data?[...sessions].reverse().find(s=>s.exercises.some(e=>e.name===name)):null;
        return`
          <div class="muscle-ex-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
              <div class="muscle-ex-name" style="margin-bottom:0">${name}</div>
              <button class="ex-info-btn" onclick="event.stopPropagation();openExDetail('${name.replace(/'/g,"\\'")}')">ⓘ</button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="font-size:9px;color:var(--muted);font-family:'IBM Plex Mono',monospace">${family.familyName}</span>
              ${(()=>{const r=getRepRangeConfig(family.repRangeCategory);return r?`<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--card3);color:var(--text2);font-family:'IBM Plex Mono',monospace;white-space:nowrap">${r.label} · ${r.minReps}–${r.maxReps}</span>`:'';})()}
            </div>
            <div class="score-row">
              <span class="score-label">${displayM?.name||'—'}</span>
              <div class="score-dots">${dots}</div>
            </div>
            <div class="muscle-ex-stats">${data?`${data.sessions} ${t('sessions_lbl')} · max ${data.maxW}kg · last ${lastSession?fmtDate(lastSession.date):'—'}`:t('not_logged_yet')}</div>
          </div>`;
      }).join(''):`<div style="padding:24px 0;text-align:center;color:var(--muted);font-size:12px">No ${(getEqLabels()[dbEquipment]||dbEquipment).toLowerCase()} option for ${muscle}.</div>`}
    </div>`;
}

// ═══════════════════════════════════════════════
// SCHEDULE TAB
// ═══════════════════════════════════════════════
function renderScheduleTab(){
  const today=new Date().toISOString().split('T')[0];
  const MONTH_NAMES=[t('m1'),t('m2'),t('m3'),t('m4'),t('m5'),t('m6'),t('m7'),t('m8'),t('m9'),t('m10'),t('m11'),t('m12')];
  const daysInMonth=new Date(schedViewYear,schedViewMonth+1,0).getDate();
  const firstDow=new Date(schedViewYear,schedViewMonth,1).getDay();
  const startCol=(firstDow+6)%7; // Mon=0, Sun=6

  // Map this month's scheduled dates → focus colors (one-off + recurring)
  const dotMap={};
  const addDot=(ds,focus)=>{if(!dotMap[ds])dotMap[ds]=[];const fc=getFocusColor(focus);if(!dotMap[ds].includes(fc))dotMap[ds].push(fc);};
  schedules.forEach(s=>{
    const [sy,sm]=s.date.split('-').map(Number);
    if(sy===schedViewYear&&sm-1===schedViewMonth) addDot(s.date,s.focus);
  });
  // Add recurring dots only for future/today matching weekdays in the month
  const daysInMonthR=new Date(schedViewYear,schedViewMonth+1,0).getDate();
  for(let d=1;d<=daysInMonthR;d++){
    const ds=`${schedViewYear}-${String(schedViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(ds<today)continue;
    const dow=dateDow(ds);
    recurringSchedules.forEach(r=>{if(r.dow===dow)addDot(ds,r.focus);});
  }

  const cells=[];
  for(let i=0;i<startCol;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);
  while(cells.length%7!==0)cells.push(null);

  const calGrid=`
    <div class="cal-nav">
      <button class="cal-nav-btn" onclick="prevSchedMonth()">‹</button>
      <span class="cal-month-label">${MONTH_NAMES[schedViewMonth]} ${schedViewYear}</span>
      <button class="cal-nav-btn" onclick="nextSchedMonth()">›</button>
    </div>
    <div class="cal-grid">
      ${[t('d_mo'),t('d_tu'),t('d_we'),t('d_th'),t('d_fr'),t('d_sa'),t('d_su')].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
      ${cells.map(d=>{
        if(!d)return`<div></div>`;
        const ds=`${schedViewYear}-${String(schedViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday=ds===today,isPast=ds<today,isSel=ds===schedSelectedDay;
        const dots=(dotMap[ds]||[]).map(c=>`<span class="cal-dot" style="background:${c}"></span>`).join('');
        return`<div class="cal-day${isToday?' cal-today':''}${isPast?' cal-past':''}${isSel?' cal-selected':''}" onclick="schedSelectedDay='${ds}';render()">
          <span class="cal-day-num">${d}</span>
          ${dots?`<div class="cal-dots">${dots}</div>`:''}
        </div>`;
      }).join('')}
    </div>`;

  const allFocuses=getAllFocuses();
  const focusPills=allFocuses.map(f=>`<button class="muscle-subtab ${schedFocus===f?'active':''}" onclick="schedFocus='${f.replace(/'/g,"\\'")}';render()">${tFocus(f)}</button>`).join('');

  const selDow=schedSelectedDay?dateDow(schedSelectedDay):null;
  const addPanel=schedSelectedDay?`
    <div class="sched-add-panel">
      <div class="sched-add-panel-date">${fmtDate(schedSelectedDay)}</div>
      <div class="muscle-subtab-bar" style="flex-wrap:wrap;margin-bottom:14px">${focusPills}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="sched-add-btn" onclick="confirmAddSchedule()">${t('add_to_plan')}</button>
        <button class="sched-add-btn" style="background:var(--card2);color:var(--text2);border:1px solid var(--border)" onclick="confirmAddRecurring()">↻ Every ${dowName(selDow)}</button>
      </div>
    </div>`:`
    <div style="padding:8px 16px 14px;text-align:center;font-size:12px;color:var(--dim)">${t('tap_day')}</div>`;

  const upcoming=schedules.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date));

  const schedList=upcoming.length?`
    <div class="log-section-hdr log-recent-hdr">
      <span class="log-section-title"><span style="color:var(--text)">${t('sched_sessions_pre')}</span> ${t('sched_sessions_post')}</span>
    </div>
    ${upcoming.map(s=>{
      const fc=getFocusColor(s.focus);
      const isToday=s.date===today;
      return`<div class="sched-card${isToday?' today':''}">
        <div class="sched-card-stripe" style="background:linear-gradient(180deg,${fc},${fc}55)"></div>
        <div class="sched-card-main">
          <div class="sched-card-focus" style="color:${fc}">${tFocus(s.focus)}</div>
          <div class="sched-card-date">${fmtDate(s.date)}${isToday?` · ${t('today_lbl')}`:''}</div>
        </div>
        <button class="sched-del-btn" onclick="deleteSchedule('${s.id}')">×</button>
      </div>`;
    }).join('')}`:'';

  const recurringList=recurringSchedules.length?`
    <div class="log-section-hdr log-recent-hdr" style="margin-top:8px">
      <span class="log-section-title"><span style="color:var(--text)">↻</span> Weekly</span>
    </div>
    ${recurringSchedules.map(r=>{
      const fc=getFocusColor(r.focus);
      return`<div class="sched-card">
        <div class="sched-card-stripe" style="background:linear-gradient(180deg,${fc},${fc}55)"></div>
        <div class="sched-card-main">
          <div class="sched-card-focus" style="color:${fc}">${tFocus(r.focus)}</div>
          <div class="sched-card-date">Every ${dowName(r.dow)}</div>
        </div>
        <button class="sched-del-btn" onclick="deleteRecurring('${r.id}')">×</button>
      </div>`;
    }).join('')}`:'';

  const BUILTIN_FOCUSES=['Push','Pull','Legs','Upper'];
  const allTmplEntries=[
    ...BUILTIN_FOCUSES.filter(f=>!hiddenBuiltins.includes(f)).map(f=>({key:f,name:tFocus(f),rawKey:f,focusId:f,exercises:builtinTemplateExercises[f]||[],builtin:true,color:getFocusColor(f)})),
    ...customTemplates.map(tc=>({key:tc.id,name:tc.name,rawKey:tc.id,focusId:tc.name,exercises:tc.exercises,builtin:false,color:tc.color||TMPL_COLORS[0]}))
  ];
  const renderTmplCard=({key,name,rawKey,focusId,exercises,builtin,color})=>{
    const isExpanded=expandedTemplateKey===key;
    const isEditing=editingTemplateKey===key;
    const nameColor=color||'var(--text2)';
    const builtinKey=rawKey||key;
    return`<div class="tmpl-editor-card ${isExpanded?'tmpl-expanded':''}">
      <div class="tmpl-editor-header" style="cursor:pointer" onclick="${isExpanded?`expandedTemplateKey=null;editingTemplateKey=null;render()`:`expandedTemplateKey='${key}';editingTemplateKey=null;schedFocus='${focusId.replace(/'/g,"\\'")}';render()`}">
        <span class="tmpl-editor-name" style="color:${nameColor}">${name}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--dim);font-family:'IBM Plex Mono',monospace">${exercises.length} ${t('ex_lbl')}</span>
          <span class="tmpl-chevron ${isExpanded?'open':''}">▼</span>
        </div>
      </div>
      ${isExpanded?`
        <div class="tmpl-ex-list" style="margin-top:6px">
          ${exercises.length?exercises.map((ex,i)=>`
            <div class="tmpl-ex-row">
              ${isEditing?`<div class="tmpl-ex-reorder">
                <button class="tmpl-reorder-btn" ${i===0?'disabled':''} onclick="event.stopPropagation();${builtin?`moveBuiltinEx('${builtinKey}',${i},-1)`:`moveTemplateEx('${key}',${i},-1)`}">▲</button>
                <button class="tmpl-reorder-btn" ${i===exercises.length-1?'disabled':''} onclick="event.stopPropagation();${builtin?`moveBuiltinEx('${builtinKey}',${i},1)`:`moveTemplateEx('${key}',${i},1)`}">▼</button>
              </div>`:''}
              <span class="tmpl-ex-name">${ex}</span>
              ${isEditing?`<button class="tmpl-ex-del" onclick="event.stopPropagation();${builtin?`removeBuiltinEx('${builtinKey}',${i})`:`removeTemplateEx('${key}',${i})`}">×</button>`:''}
            </div>`).join(''):`<div style="font-size:12px;color:var(--dim);padding:4px 0 8px">${t('no_ex_yet')}</div>`}
        </div>
        ${isEditing?renderExerciseBrowser('addToCurrentTemplate'):''}
        ${isEditing?`
          <div class="tmpl-color-row">
            ${TMPL_COLORS.map(c=>`<button class="tmpl-color-swatch${(color||'')==c?' active':''}" style="background:${c}" onclick="event.stopPropagation();setTemplateColor('${builtin?builtinKey:key}','${c}',${builtin})"></button>`).join('')}
          </div>`:''}
        <div style="display:flex;gap:6px;margin-top:${isEditing?'8px':'10px'};padding-top:${isEditing?'8px':'0'};${isEditing?'border-top:1px solid rgba(255,255,255,.06)':''}">
          <button class="tmpl-editor-btn" onclick="event.stopPropagation();editingTemplateKey=${isEditing?'null':`'${key}'`};render()">${isEditing?t('done'):t('edit')}</button>
          ${builtin
            ?`<button class="tmpl-editor-btn del" onclick="event.stopPropagation();if(confirm('${t('delete')} ${name}?'))deleteBuiltinTemplate('${builtinKey}')">${t('delete')}</button>`
            :`<button class="tmpl-editor-btn del" onclick="event.stopPropagation();if(confirm('${t('delete')} ${name}?'))deleteCustomTemplate('${key}')">${t('delete')}</button>`}
        </div>`:''}
    </div>`;
  };
  const createFormHtml=creatingTemplate?`
    <div class="tmpl-editor-card" style="border-color:rgba(232,184,75,.25)">
      <div class="tmpl-editor-header">
        <input type="text" class="tmpl-name-input" placeholder="${t('tmpl_name_ph')}" oninput="newTemplateName=this.value" value="${newTemplateName.replace(/"/g,'&quot;')}" autofocus>
        <button class="tmpl-editor-btn del" onclick="cancelCreatingTemplate()" style="flex-shrink:0">✕</button>
      </div>
      <div class="tmpl-ex-list" style="margin-top:8px;min-height:24px">
        ${newTemplateExercises.length?newTemplateExercises.map((ex,i)=>`
          <div class="tmpl-ex-row">
            <span class="tmpl-ex-name">${ex}</span>
            <button class="tmpl-ex-del" onclick="removeFromNewTemplate(${i})">×</button>
          </div>`).join(''):`<div style="font-size:12px;color:var(--dim);padding:4px 0">${t('add_ex_below')}</div>`}
      </div>
      ${renderExerciseBrowser('addToCurrentTemplate')}
      <div class="tmpl-color-row" style="margin-top:10px">
        ${TMPL_COLORS.map(c=>`<button class="tmpl-color-swatch${newTemplateColor===c?' active':''}" style="background:${c}" onclick="newTemplateColor='${c}';render()"></button>`).join('')}
      </div>
      <button class="tmpl-save-btn" onclick="addCustomTemplate()">${t('save_template')}</button>
    </div>`
    :`<button class="tmpl-create-btn" onclick="startCreatingTemplate()">${t('create_template')}</button>`;
  const templatesSection=`
    <div class="log-section-hdr log-recent-hdr" style="margin-top:4px">
      <span class="log-section-title"><span style="color:var(--text)">${t('my_tmpl_pre')}</span> ${t('my_tmpl_post')}</span>
    </div>
    <div style="padding:0 12px 16px">
      ${allTmplEntries.map(renderTmplCard).join('')}
      <div style="margin-top:10px">${createFormHtml}</div>
    </div>`;

  return`
    <div class="section-header">
      <div class="section-title">${t('plan_pre')} <span style="color:var(--gold)">${t('plan_gold')}</span></div>
      <div style="font-size:11px;color:var(--muted)">${t('sched_future')}</div>
    </div>
    <div style="padding:14px 16px 0">${calGrid}</div>
    ${addPanel}
    ${schedList}
    ${recurringList}
    ${templatesSection}`;
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
      <div class="section-title">${t('overview_title')}</div>
      <div style="font-size:11px;color:var(--muted)">${sessions.length} ${t('sessions_lbl')} · ${(totVol/1000).toFixed(1)}t ${t('total_lbl')}</div>
    </div>

    <div class="ov-section">
      <div class="ov-title">${t('session_split')}</div>
      ${Object.entries(fc).sort((a,b)=>b[1]-a[1]).map(([focus,count])=>`
        <div class="focus-row">
          <div class="focus-row-top">
            <span class="focus-row-name" style="color:${getFocusColor(focus)}">${tFocus(focus)}</span>
            <span class="focus-row-count">${count}/${sessions.length}</span>
          </div>
          <div class="focus-track"><div class="focus-fill" style="width:${(count/sessions.length)*100}%;background:${getFocusColor(focus)}"></div></div>
        </div>`).join('')}
    </div>

    <div class="ov-section">
      <div class="ov-title">${t('vol_per_session')}</div>
      <div class="vol-bars">${vols.map(s=>`<div class="vol-bar" style="height:${Math.round((s.vol/maxVol)*56)+6}px;background:${getFocusColor(s.focus)}"></div>`).join('')}</div>
    </div>

    <div class="ov-section">
      <div class="ov-title">${t('ex_freq')}</div>
      <div class="freq-grid">${Object.entries(exFreq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>`
        <div class="freq-item"><span class="freq-name">${name}</span><span class="freq-n">${count}×</span></div>
      `).join('')}</div>
    </div>`;
}

// ═══════════════════════════════════════════════
// EXERCISE LIBRARY BROWSER
// ═══════════════════════════════════════════════
const DB_EQ_KEYS={bodyweight:'eq_body',dumbbells:'eq_dbs',barbell:'eq_barbell',cable:'eq_cable',machine:'eq_machine',plateLoaded:'eq_plate'};
const DB_CAT_KEYS={chest:'cat_chest',shoulders:'cat_shoulders',back:'cat_back',legs_glutes:'cat_legs',arms:'cat_arms',core:'cat_core'};
function getEqLabels(){const o={};Object.entries(DB_EQ_KEYS).forEach(([k,v])=>{o[k]=t(v);});return o;}
function getCatLabels(){const o={};Object.entries(DB_CAT_KEYS).forEach(([k,v])=>{o[k]=t(v);});return o;}
const DB_CAT_COLORS={chest:'#c96b4a',shoulders:'#b85a90',back:'#4a90b8',legs_glutes:'#5a9e62',arms:'#4aabab',core:'#8860b8'};
const DB_CAT_ORDER=['chest','shoulders','back','legs_glutes','arms','core'];

function renderExerciseBrowser(addFn){
  addFn=addFn||'addExerciseFromLibrary';
  const byCategory={};
  for(const family of exerciseDatabase){
    const name=family[dbEquipment];
    if(!name)continue;
    if(!byCategory[family.category])byCategory[family.category]=[];
    byCategory[family.category].push(name);
  }
  return`
    <div class="db-browser">
      <div class="db-browser-header">
        <div class="db-browser-title">${t('library')}</div>
        <div class="db-eq-bar">
          ${Object.entries(getEqLabels()).map(([key,label])=>`<button class="db-eq-tab ${dbEquipment===key?'active':''}" onclick="dbEquipment='${key}';render()">${label}</button>`).join('')}
        </div>
      </div>
      <div class="db-exercise-list">
        ${DB_CAT_ORDER.map(cat=>{
          const exs=byCategory[cat];
          if(!exs||!exs.length)return'';
          const c=DB_CAT_COLORS[cat];
          return`
            <div class="db-cat-group">
              <div class="db-cat-label" style="color:${c}">${(getCatLabels()[cat]||cat).toUpperCase()}</div>
              <div class="db-cat-exercises">
                ${exs.map(name=>`<button class="db-ex-btn" onclick="${addFn}('${name.replace(/'/g,"\\'")}')">${name}</button>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════
function renderSettingsModal(){
  if(!showSettings)return'';
  return`
    <div class="settings-backdrop" onclick="showSettings=false;render()"></div>
    <div class="settings-sheet">
      <div class="settings-handle"></div>
      <div class="settings-title">${t('settings')}</div>
      <div class="settings-row">
        <span class="settings-label">${t('language')}</span>
        <div class="settings-lang-btns">
          <button class="lang-btn ${lang==='en'?'active':''}" onclick="setLang('en')">EN</button>
          <button class="lang-btn ${lang==='fr'?'active':''}" onclick="setLang('fr')">FR</button>
        </div>
      </div>
      <div class="settings-row" style="margin-top:8px;padding-top:12px;border-top:1px solid var(--border)">
        <span class="settings-label" style="font-weight:700">${currentUser?currentUser.name:'—'}</span>
        <div style="display:flex;gap:6px">
          <button class="lang-btn" onclick="renameUser()">${t('rename_user')}</button>
          <button class="lang-btn" onclick="showSettings=false;switchUser()">Switch</button>
          <button class="lang-btn" style="color:#e05555" onclick="showSettings=false;deleteUser('${currentUser?currentUser.id:''}')">Delete</button>
        </div>
      </div>
      ${sessions.length===0?`<button onclick="handleMigrate()" style="width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--dim);font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer">↓ Import from previous version</button>`:''}
    </div>`;
}

// ═══════════════════════════════════════════════
// ADD FORM
// ═══════════════════════════════════════════════
function renderExDetailModal(){
  if(!exDetailName)return'';
  const e=lookupMergedEx(exDetailName);
  const imgs=(e&&e.images&&e.images.length)?e.images.slice(0,2):[];
  const primary=(e&&e.primaryMuscles&&e.primaryMuscles.length)?e.primaryMuscles:[];
  const secondary=(e&&e.secondaryMuscles&&e.secondaryMuscles.length)?e.secondaryMuscles:[];
  const rawSteps=(e&&e.instructions&&e.instructions.length)?e.instructions:[];
  const frSteps=(lang==='fr'&&e&&window.FR_EXERCISE_INSTRUCTIONS&&window.FR_EXERCISE_INSTRUCTIONS[e.id])||null;
  const steps=frSteps||rawSteps;
  const level=e?e.level:null;
  const mechanic=e?e.mechanic:null;
  return`
    <div class="ex-detail-backdrop" onclick="closeExDetail()"></div>
    <div class="ex-detail-sheet">
      <div class="ex-detail-handle"></div>
      <div class="ex-detail-header">
        <div class="ex-detail-title">${exDetailName}</div>
        <button class="ex-detail-close" onclick="closeExDetail()">✕</button>
      </div>
      ${(level||mechanic)?`<div class="ex-detail-meta">${[level,mechanic].filter(Boolean).map(tag=>`<span class="ex-detail-tag">${tTag(tag)}</span>`).join('')}</div>`:''}
      ${imgs.length?`
        <div class="ex-detail-imgs">
          ${imgs.map(img=>`<img class="ex-detail-img" src="exercise-assets/exercises/${img}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}
        </div>`:''}
      ${primary.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">${t('primary')}</div>
          <div class="ex-detail-chips">${primary.map(m=>`<span class="ex-detail-chip primary">${tMuscle(m)}</span>`).join('')}</div>
        </div>`:''}
      ${secondary.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">${t('secondary')}</div>
          <div class="ex-detail-chips">${secondary.map(m=>`<span class="ex-detail-chip">${tMuscle(m)}</span>`).join('')}</div>
        </div>`:''}
      ${steps.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">${t('instructions')}</div>
          <ol class="ex-detail-steps">
            ${steps.map(s=>`<li class="ex-detail-step">${s}</li>`).join('')}
          </ol>
        </div>`:(!e?`<div class="ex-detail-empty">${t('no_details')}</div>`:'')}
    </div>`;
}

function renderAdd(){
  if(selectingTemplate){
    const allF=getAllFocuses();
    return`
      <div class="add-header"><div class="add-title">${t('log_workout')}</div></div>
      <div class="add-body">
        <div class="form-label" style="margin-bottom:12px;font-size:13px">Choose a template</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${allF.map(f=>{
            const color=getFocusColor(f);
            return`<button onclick="pickTemplate('${f.replace(/'/g,"\\'")}') "style="background:var(--card);border:1px solid var(--border);border-left:3px solid ${color};border-radius:14px;padding:14px 16px;text-align:left;cursor:pointer;color:${color};font-size:15px;font-weight:700;font-family:'DM Sans',sans-serif">${tFocus(f)}</button>`;
          }).join('')}
          <button onclick="pickTemplate('') " style="background:none;border:1px dashed var(--border);border-radius:14px;padding:14px 16px;text-align:left;cursor:pointer;color:var(--dim);font-size:14px;font-family:'DM Sans',sans-serif">No template — blank session</button>
        </div>
      </div>`;
  }

  const f=addForm;
  const last=f.templateFrom?sessions.find(s=>s.id===f.templateFrom.id):null;
  const lastByEx={};
  if(last)last.exercises.forEach(ex=>{lastByEx[ex.name]=ex.sets;});
  const existingNames=sessions.flatMap(s=>s.exercises.map(e=>e.name)).filter((n,i,a)=>a.indexOf(n)===i);
  const allCandidates=[...new Set([...existingNames,...getDbExerciseNames()])];
  const currentNames=f.exercises.map(e=>e.name).filter(Boolean);

  return`
    <div class="add-header"><div class="add-title">${t('log_workout')}</div></div>
    <div class="add-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('date')}</label>
          <input class="form-input" type="date" value="${f.date}" onchange="addForm.date=this.value">
        </div>
        <div class="form-group">
          <label class="form-label">Template</label>
          <select class="form-input" onchange="changeFocus(this.value)">
            ${getAllFocuses().map(foc=>`<option value="${foc}" ${f.focus===foc?'selected':''}>${tFocus(foc)}</option>`).join('')}
          </select>
        </div>
      </div>

      ${last?`
        <div class="tmpl-banner">
          <div>
            <div class="tmpl-lbl">${t('tmpl_from')}</div>
            <div class="tmpl-date">${fmtDate(last.date)} · ${last.exercises.length} ${t('ex_lbl')}</div>
          </div>
          <button class="tmpl-clear" onclick="clearTemplate()">${t('clear')}</button>
        </div>`:`
        <div class="no-tmpl">${t('no_prev_pre')} ${tFocus(f.focus)} ${t('no_prev_post')}</div>`}

      <div id="ex-list">
        ${f.exercises.map((ex,ei)=>{
          const lastSets=lastByEx[ex.name]||null;
          const sugg=ex.name?getProgSugg(ex.name,lastSets):null;
          const alts=ex.name?getAlts(ex.name,currentNames):[];
          const fuzzy=ex.name?fuzzyMatch(ex.name,allCandidates,0.5):[];
          const isAcOpen=acActive===ei&&fuzzy.length>0;
          const isCollapsed=collapsedExercises.has(ei);
          // Summary for collapsed view
          const filledSets=ex.sets.filter(s=>s.r||s.w);
          const summary=filledSets.length?filledSets.map(s=>`${s.r||'?'}×${s.w||'?'}`).join(', '):`${ex.sets.length} set${ex.sets.length>1?'s':''}`;
          return`
            <div class="ex-card${isCollapsed?' ex-card-collapsed':''}">
              <div class="ex-card-header">
                <button class="ex-collapse-btn" onclick="toggleExCollapse(${ei})" title="${isCollapsed?'Expand':'Collapse'}">${isCollapsed?'▶':'▼'}</button>
                <div class="ex-name-wrap" style="flex:1;margin:0 4px">
                  ${isCollapsed
                    ? `<div class="ex-collapsed-row"><span class="ex-name-lbl" style="font-size:13px;font-weight:700;color:var(--text)">${ex.name||t('exercise_ph')}</span><span style="font-size:11px;color:var(--dim);margin-left:8px">${summary}</span></div>`
                    : `<input id="ex-name-${ei}" class="ex-name-input" placeholder="${t('exercise_ph')}" value="${ex.name}" oninput="onExIn(${ei},this.value)" onfocus="onExFocus(${ei})" onblur="onExBlur()" autocomplete="off">
                       ${isAcOpen?`<div class="autocomplete">${fuzzy.map(name=>`<div class="ac-item" onmousedown="pickAc(${ei},'${name.replace(/'/g,"\\'")}')"><span>${name}</span><span class="ac-match">${t('similar')}</span></div>`).join('')}</div>`:''}`
                  }
                </div>
                ${!isCollapsed&&ex.name?`<button class="ex-info-btn" onclick="openExDetail('${ex.name.replace(/'/g,"\\'")}')">ⓘ</button>`:''}
                <button class="rm-ex-btn-add" onclick="removeEx(${ei})">×</button>
              </div>

              ${isCollapsed?'':`
                ${sugg?`<div class="overload-hint"><span class="oh-icon">${sugg.type==='increase'?'🔼':sugg.type==='progress'?'💪':'🔄'}</span><div class="oh-text">${sugg.text}<br><strong>${sugg.suggestion}</strong></div><button class="oh-apply" onclick="applySugg(${ei},${sugg.sets},${sugg.reps},${sugg.weight})">${t('apply')}</button></div>`:''}
                ${alts.length?`<div class="alt-row"><button class="alt-toggle" onclick="toggleAlts(${ei})" aria-expanded="false" id="alt-toggle-${ei}"><span class="alt-label">${t('alt_lbl')}</span><span class="alt-arrow">▶</span></button><div class="alt-chips" id="alt-chips-${ei}" style="display:none">${alts.map(a=>`<button class="alt-chip" onclick="addAlt('${a.replace(/'/g,"\\'")}',${ei})">${a}</button>`).join('')}</div></div>`:''}

                ${ex.sets.map((set,si)=>{
                  const prevSet=lastSets&&lastSets[si];
                  const wNum=parseFloat(set.w)||0;
                  const wd=wNum&&prevSet?wNum-prevSet.w:null;
                  return`
                    <div class="set-form-row">
                      <span class="set-num">${si+1}</span>
                      <input class="set-input" type="number" placeholder="${t('reps_ph')}" value="${set.r}" oninput="addForm.exercises[${ei}].sets[${si}].r=this.value">
                      <span class="set-sep">×</span>
                      <input class="set-input" type="number" placeholder="kg" step="0.5" value="${set.w}" oninput="addForm.exercises[${ei}].sets[${si}].w=this.value">
                      ${prevSet?`<span class="prev-ref ${wd===null?'':wd>0?'prev-up':wd<0?'prev-dn':''}">${prevSet.r}×${prevSet.w}</span>`:''}
                      ${ex.sets.length>1?`<button class="rm-set-btn" onclick="removeSet(${ei},${si})">×</button>`:''}
                    </div>`;
                }).join('')}

                <button class="add-set-btn" onclick="addSet(${ei})">${t('add_set')}</button>
              `}
            </div>`;
        }).join('')}
      </div>

      ${!f.exercises.length&&!showExerciseLibrary?`<div style="padding:20px 0 8px;text-align:center;color:var(--muted);font-size:12px">${t('no_ex_tap')}</div>`:''}
      <button class="ghost-btn" onclick="addEx()">${showExerciseLibrary?t('close_library'):t('add_exercise')}</button>
      ${showExerciseLibrary?renderExerciseBrowser():''}
      <button class="ghost-btn" style="margin-top:-4px;font-size:9px;opacity:.55" onclick="addBlankExercise()">${t('manual_ex')}</button>
      <button class="save-btn" id="save-btn" onclick="saveSession()">${t('save_session')}</button>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button onclick="leaveAndSaveDraft()" style="flex:1;background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px;color:var(--dim);font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer">Leave & save draft</button>
        <button onclick="leaveAndDiscard()" style="flex:1;background:none;border:1px solid var(--border);border-radius:12px;padding:12px;color:var(--dim);font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer">Leave & discard</button>
      </div>
      <div style="height:80px"></div>
    </div>`;
}

// ═══════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════
function switchTab(tb){
  acActive=null;
  if(tb==='add'){
    const draft=loadDraft();
    if(draft){addForm=draft;tab='add';selectingTemplate=false;}
    else{tab='add';selectingTemplate=true;addForm=defaultForm();}
    showExerciseLibrary=false;collapsedExercises=new Set();showTimerDock=false;
  } else {
    tab=tb;
    if(tb!=='muscles'){selMuscle=null;selGroup=null;progressGroup=null;progressMuscle=null;}
  }
  render();
  setTimeout(()=>{const c=document.getElementById('content');if(c)c.scrollTop=0;},0);
}
function pickTemplate(focus){
  selectingTemplate=false;
  addForm=defaultForm();
  addForm.focus=focus;
  loadTemplate(focus);
}
function leaveAndDiscard(){
  const hasWork=addForm.exercises.some(e=>e.name||e.sets.some(s=>s.r||s.w));
  if(hasWork&&!confirm(t('discard_confirm')))return;
  clearDraft();tab='sessions';addForm=defaultForm();selectingTemplate=false;render();
}
function leaveAndSaveDraft(){saveDraft();tab='sessions';render();}
function selectEx(name){selEx=name;render();}
function openExDetail(name){exDetailName=name;render();document.body.classList.add('ex-detail-open');}
function closeExDetail(){exDetailName=null;render();document.body.classList.remove('ex-detail-open');}
function toggleSession(id){if(editId===id){cancelEdit();return;}expandedId=expandedId===id?null:id;render();}
function changeFocus(focus){addForm.focus=focus;loadTemplate(focus);}
function loadTemplate(focus){
  const last=lastByFocus(focus);
  if(last){
    addForm.exercises=last.exercises.map(ex=>({name:ex.name,ss:ex.ss||false,sets:ex.sets.map(s=>({r:String(s.r),w:String(s.w)}))}));
    addForm.templateFrom={date:last.date,id:last.id};
  } else {
    const tmpl=customTemplates.find(t=>t.name===focus);
    const exercises=tmpl&&tmpl.exercises.length?tmpl.exercises:(builtinTemplateExercises[focus]||[]);
    addForm.exercises=exercises.map(name=>({name,ss:false,sets:[{r:'',w:''}]}));
    addForm.templateFrom=null;showExerciseLibrary=false;
  }
  acActive=null;render();
}
function clearTemplate(){addForm.exercises=[];addForm.templateFrom=null;showExerciseLibrary=false;render();}
function useAsTemplate(id){
  const s=sessions.find(x=>x.id===id); if(!s)return;
  addForm={
    date:new Date().toISOString().split('T')[0],
    focus:s.focus,
    exercises:s.exercises.map(ex=>({name:ex.name,ss:ex.ss||false,sets:ex.sets.map(set=>({r:String(set.r),w:String(set.w)}))})),
    templateFrom:{date:s.date,id:s.id}
  };
  tab='add';selectingTemplate=false;acActive=null;render();
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
function eMoveEx(ei,dir){const exs=editForm.exercises;const tmp=ei+dir;if(tmp<0||tmp>=exs.length)return;[exs[ei],exs[tmp]]=[exs[tmp],exs[ei]];render();}
async function saveEdit(){
  const exs=editForm.exercises.filter(e=>e.name.trim()).map(e=>({name:e.name.trim(),ss:e.ss||false,sets:e.sets.filter(s=>s.r&&s.w).map(s=>({r:+s.r,w:+s.w}))})).filter(e=>e.sets.length);
  if(!exs.length){toast(t('add_at_least'),true);return;}
  loading=true;render();
  try{await updateSession(editId,{date:editForm.date,focus:editForm.focus,exercises:exs});toast(t('session_updated'));editId=null;editForm=null;}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}

// Add form
// Rest timer
function fmtTimer(s){const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:`${s}s`;}
function startRestTimer(seconds){
  if(restTimerInterval)clearInterval(restTimerInterval);
  restTimerEnd=Date.now()+seconds*1000;
  render();
  restTimerInterval=setInterval(()=>{
    const rem=Math.ceil((restTimerEnd-Date.now())/1000);
    const el=document.getElementById('rest-timer-num');
    if(el)el.textContent=fmtTimer(Math.max(0,rem));
    if(rem<=0){
      clearInterval(restTimerInterval);restTimerInterval=null;restTimerEnd=null;
      if(navigator.vibrate)navigator.vibrate([200,100,200,100,200]);
      render();
    }
  },250);
}
function cancelRestTimer(){clearInterval(restTimerInterval);restTimerInterval=null;restTimerEnd=null;render();}
function toggleExCollapse(ei){if(collapsedExercises.has(ei))collapsedExercises.delete(ei);else collapsedExercises.add(ei);render();}
// Save session as template
function saveSessionAsTemplate(id){
  const s=sessions.find(x=>x.id===id);if(!s)return;
  const base=s.focus||'Session';
  let name=base;let n=2;
  while(getAllFocuses().some(f=>f.toLowerCase()===name.toLowerCase()))name=`${base} ${n++}`;
  const prompted=window.prompt('Template name:',name);
  if(!prompted||!prompted.trim())return;
  const finalName=prompted.trim();
  if(getAllFocuses().some(f=>f.toLowerCase()===finalName.toLowerCase())){toast('A template with that name already exists',true);return;}
  const color=TMPL_COLORS[customTemplates.length%TMPL_COLORS.length];
  customTemplates.push({id:crypto.randomUUID(),name:finalName,exercises:s.exercises.map(e=>e.name),color});
  saveCustomTemplates();toast('Template saved');render();
}
function onExIn(ei,val){
  addForm.exercises[ei].name=val;acActive=val.length>=2?ei:null;
  const inp=document.getElementById('ex-name-'+ei);
  const pos=inp?inp.selectionStart:null;
  render();
  const restored=document.getElementById('ex-name-'+ei);
  if(restored){restored.focus();if(pos!==null)restored.setSelectionRange(pos,pos);}
}
function onExFocus(ei){if(addForm.exercises[ei].name.length>=2)acActive=ei;}
function onExBlur(){setTimeout(()=>{acActive=null;render();},150);}
function pickAc(ei,name){addForm.exercises[ei].name=name;acActive=null;render();}
function moveEx(ei,dir){const exs=addForm.exercises;const tmp=ei+dir;if(tmp<0||tmp>=exs.length)return;[exs[ei],exs[tmp]]=[exs[tmp],exs[ei]];render();}
function scrollContentToBottom(){setTimeout(()=>{const c=document.getElementById('content');if(c)c.scrollTop=c.scrollHeight;},60);}
function addEx(){showExerciseLibrary=!showExerciseLibrary;acActive=null;render();if(showExerciseLibrary)scrollContentToBottom();}
function addExerciseFromLibrary(name){addForm.exercises.push({name,sets:[{r:'',w:''}]});showExerciseLibrary=false;acActive=null;render();scrollContentToBottom();}
function addBlankExercise(){addForm.exercises.push({name:'',sets:[{r:'',w:''}]});showExerciseLibrary=false;acActive=null;render();scrollContentToBottom();}
function removeEx(i){addForm.exercises.splice(i,1);acActive=null;render();}
function addSet(ei){addForm.exercises[ei].sets.push({r:'',w:''});render();}
function removeSet(ei,si){addForm.exercises[ei].sets.splice(si,1);render();}
function applySugg(ei,sets,reps,weight){addForm.exercises[ei].sets=Array.from({length:sets},()=>({r:String(reps),w:String(weight)}));render();}
function toggleAlts(ei){
  const chips=document.getElementById('alt-chips-'+ei);
  const btn=document.getElementById('alt-toggle-'+ei);
  if(!chips||!btn)return;
  const open=chips.style.display==='none';
  chips.style.display=open?'flex':'none';
  btn.querySelector('.alt-arrow').textContent=open?'▼':'▶';
  btn.setAttribute('aria-expanded',open);
}
function addAlt(name,idx){
  const ls=[...sessions].reverse().find(s=>s.exercises.some(e=>e.name===name));
  const sets=ls?ls.exercises.find(e=>e.name===name).sets.map(s=>({r:String(s.r),w:String(s.w)})):[{r:'',w:''}];
  addForm.exercises.splice(idx,1,{name,sets});
  render();
}
function addDbExercise(name){
  const exs=addForm.exercises;
  const last=exs[exs.length-1];
  if(last&&!last.name)last.name=name;
  else exs.push({name,sets:[{r:'',w:''}]});
  acActive=null;render();
  setTimeout(()=>{const el=document.getElementById('ex-list');if(el)el.scrollIntoView({behavior:'smooth',block:'end'});},60);
}

async function saveSession(){
  const btn=document.getElementById('save-btn'); if(btn)btn.disabled=true;
  const exs=addForm.exercises.filter(e=>e.name.trim()).map(e=>({name:e.name.trim(),sets:e.sets.filter(s=>s.r&&s.w).map(s=>({r:+s.r,w:+s.w}))})).filter(e=>e.sets.length);
  if(!exs.length){toast(t('add_at_least'),true);if(btn)btn.disabled=false;return;}
  loading=true;render();
  try{await addSession({date:addForm.date,focus:addForm.focus,exercises:exs});clearDraft();toast(t('session_saved'));tab='sessions';selectingTemplate=false;addForm=defaultForm();}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}
async function confirmDelete(id){
  if(!confirm(t('delete_confirm')))return;
  loading=true;render();
  try{await deleteSession(id);toast(t('deleted'));}
  catch(e){toast('Error: '+e.message,true);}
  loading=false;render();
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
function showDebug(){
  // Toggle: remove if already shown
  if(document.getElementById('_dbg')){
    ['_dbg','_dbg_top','_dbg_bot'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
    return;
  }
  // Measure env() safe area values by making a 0×0 element with height=env(...)
  function readEnv(prop){
    const el=document.createElement('div');
    el.style.cssText=`position:fixed;top:0;left:0;width:0;height:${prop};visibility:hidden;pointer-events:none`;
    document.documentElement.appendChild(el);
    const val=el.offsetHeight;
    el.remove();
    return val;
  }
  const sat=readEnv('env(safe-area-inset-top,0px)');
  const sab=readEnv('env(safe-area-inset-bottom,0px)');
  const sal=readEnv('env(safe-area-inset-left,0px)');
  const sar=readEnv('env(safe-area-inset-right,0px)');
  // Red line at top:0 (viewport top edge)
  const top=document.createElement('div');
  top.id='_dbg_top';
  top.style.cssText='position:fixed;top:0;left:0;right:0;height:4px;background:#ff3b30;z-index:99999;pointer-events:none';
  // Red line at bottom:0 (viewport bottom edge)
  const bot=document.createElement('div');
  bot.id='_dbg_bot';
  bot.style.cssText='position:fixed;bottom:0;left:0;right:0;height:4px;background:#ff3b30;z-index:99999;pointer-events:none';
  // Info panel
  const d=document.createElement('div');
  d.id='_dbg';
  d.style.cssText='position:fixed;top:80px;left:12px;right:12px;background:rgba(0,0,0,.97);color:#f7d98a;font-size:13px;font-family:monospace;padding:12px 14px;z-index:99999;line-height:2;border-radius:10px;border:1px solid #f7d98a55';
  const app=document.getElementById('app');
  const appRect=app?app.getBoundingClientRect():{};
  d.innerHTML=`
    <b>Screen</b><br>
    screen.height: ${screen.height}px<br>
    window.innerHeight: ${window.innerHeight}px<br>
    gap: ${screen.height-window.innerHeight}px<br>
    devicePixelRatio: ${window.devicePixelRatio}<br>
    <br>
    <b>Safe area (measured via element)</b><br>
    inset-top: ${sat}px<br>
    inset-bottom: ${sab}px<br>
    inset-left: ${sal}px &nbsp; inset-right: ${sar}px<br>
    <br>
    <b>#app</b><br>
    offsetHeight: ${app?app.offsetHeight:'?'}px<br>
    rect.top: ${appRect.top||0}px &nbsp; rect.bottom: ${Math.round(appRect.bottom)||0}px<br>
    <br>
    <span style="color:#ff3b30">Red line = viewport bottom (bottom:0)</span><br>
    <span style="color:#aaa;font-size:11px">Tap to dismiss</span>
  `;
  d.onclick=()=>['_dbg','_dbg_top','_dbg_bot'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
  document.body.appendChild(top);
  document.body.appendChild(bot);
  document.body.appendChild(d);
}

async function init(){
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/lifttrack/sw.js', { scope: '/lifttrack/' }).then(reg => reg.update()).catch(()=>{});
  // Try to restore saved user
  const savedId=localStorage.getItem('lifttrack_current_user');
  if(savedId&&allUsers.find(u=>u.id===savedId)){
    selectUser(savedId);
    await initUserData();
  } else {
    render(); // shows user picker
  }
  // Set bottom gap variable for iOS PWA safe area below viewport
  const gap = Math.max(0, screen.height - window.innerHeight);
  document.documentElement.style.setProperty('--bottom-gap', gap + 'px');
}
init();
