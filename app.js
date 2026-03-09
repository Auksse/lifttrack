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
function getMuscleMap(name){return MUSCLE_MAP[name]||getDbMuscleMap(name)||null;}

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
  return getDbFamily(name)||(()=>{const fn=LEGACY_FAMILY_MAP[normName(name)];return fn?exerciseDatabase.find(f=>f.familyName===fn)||null:null;})();
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
// STATE
// ═══════════════════════════════════════════════
let sessions=[],tab='sessions',expandedId=null,selEx=null,loading=false;
let progressGroup=null,progressMuscle=null;
let muscleSubTab='exercises';
let schedules=[],schedFocus='Push',schedSelectedDay=null;
let schedViewYear=new Date().getFullYear(),schedViewMonth=new Date().getMonth();
let customTemplates=[],newTemplateName='',tmplExInput='';
let builtinTemplateExercises={};
let expandedTemplateKey=null,editingTemplateKey=null;
let creatingTemplate=false,newTemplateExercises=[],newTmplExInput='';
let addForm=defaultForm(),editId=null,editForm=null,acActive=null,selMuscle=null,selGroup=null,charts={};
let dbEquipment='dumbbells';
let showExerciseLibrary=false;
let exDetailName=null;

function defaultForm(){return{date:new Date().toISOString().split('T')[0],focus:'Push',exercises:[],templateFrom:null};}

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
function loadSchedules(){schedules=JSON.parse(localStorage.getItem('lifttrack_schedules')||'[]');}
function saveSchedules(){localStorage.setItem('lifttrack_schedules',JSON.stringify(schedules));}
function loadCustomTemplates(){customTemplates=JSON.parse(localStorage.getItem('lifttrack_templates')||'[]');}
function saveCustomTemplates(){localStorage.setItem('lifttrack_templates',JSON.stringify(customTemplates));}
const BUILTIN_TEMPLATE_DEFAULTS={
  Push:['Barbell Bench Press','Dumbbell Incline Press','Dumbbell Overhead Press','Cable Lateral Raise','Pec Deck','Cable Overhead Triceps Extension'],
  Pull:['Lat Pulldown Machine','Seated Row Machine','Rear Delt Machine','Cable Face Pull','Biceps Curl Machine','Dumbbell Curl'],
  Legs:['Leg Press Machine','Leg Extension Machine','Leg Curl Machine','Dumbbell Bulgarian Split Squat','Standing Calf Raise Machine'],
  Upper:['Barbell Bench Press','Dumbbell Incline Press','Dumbbell Overhead Press','Lat Pulldown Machine','Seated Row Machine','Barbell Curl','Cable Triceps Pushdown']
};
function loadBuiltinTemplates(){
  const stored=localStorage.getItem('lifttrack_builtin_tmpl');
  builtinTemplateExercises=stored?JSON.parse(stored):Object.fromEntries(Object.entries(BUILTIN_TEMPLATE_DEFAULTS).map(([k,v])=>[k,[...v]]));
  if(!stored)saveBuiltinTemplates();
}
function saveBuiltinTemplates(){localStorage.setItem('lifttrack_builtin_tmpl',JSON.stringify(builtinTemplateExercises));}
function getNextScheduled(){const today=new Date().toISOString().split('T')[0];return schedules.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;}
function getAllFocuses(){return['Push','Pull','Legs','Upper',...customTemplates.map(t=>t.name)];}
function confirmAddSchedule(){
  if(!schedSelectedDay)return toast('Select a day first',true);
  schedules.push({id:crypto.randomUUID(),date:schedSelectedDay,focus:schedFocus});
  schedules.sort((a,b)=>a.date.localeCompare(b.date));
  saveSchedules();render();toast('Session planned');
}
function deleteSchedule(id){schedules=schedules.filter(s=>s.id!==id);saveSchedules();render();}
function addCustomTemplate(){
  const name=newTemplateName.trim();
  if(!name)return toast('Enter a template name',true);
  if(getAllFocuses().some(f=>f.toLowerCase()===name.toLowerCase()))return toast('Template already exists',true);
  const id=crypto.randomUUID();
  customTemplates.push({id,name,exercises:[...newTemplateExercises]});
  saveCustomTemplates();creatingTemplate=false;newTemplateName='';newTemplateExercises=[];expandedTemplateKey=id;editingTemplateKey=null;render();toast('Template created');
}
function startCreatingTemplate(){creatingTemplate=true;newTemplateName='';newTemplateExercises=[];newTmplExInput='';expandedTemplateKey=null;editingTemplateKey=null;render();}
function cancelCreatingTemplate(){creatingTemplate=false;newTemplateName='';newTemplateExercises=[];render();}
function addToNewTemplate(){
  const el=document.getElementById('newTmplExInput');
  const name=(el?el.value:newTmplExInput).trim();if(!name)return;
  newTemplateExercises.push(name);newTmplExInput='';render();
  setTimeout(()=>{const inp=document.getElementById('newTmplExInput');if(inp)inp.focus();},30);
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
  const savedScroll=document.getElementById('content')?.scrollTop||0;
  const totalVol=Math.round(sessions.reduce((t,s)=>t+sVol(s),0));
  const last=sessions[sessions.length-1];
  const da=last?daysSince(last.date):0;
  const next=nextSugg();
  const sched=getNextScheduled();
  const nc=FCHEX[(sched||next).focus]||'#888';
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
      <div class="stat-cell next" onclick="switchTab('schedule')">
        <div class="stat-cell-label" style="color:${nc}aa">${sched?'Scheduled':'Next up'}</div>
        <div class="stat-cell-val" style="color:${nc};font-size:18px">${(sched||next).focus}</div>
        ${sched?`<div class="stat-cell-sub">${fmtDate(sched.date)}</div>`:''}
      </div>
    </div>

    <div class="content" id="content">
      ${tab==='sessions'?renderSessions():tab==='schedule'?renderScheduleTab():tab==='muscles'?renderMusclesTab():tab==='overview'?renderOverview():renderAdd()}
    </div>

    <div class="dock">
      <div class="dock-inner">
        ${[['sessions','📋','Log'],['schedule','📅','Plan']].map(([t,ic,lb])=>`
          <button class="tab ${tab===t?'active':''}" onclick="switchTab('${t}')">
            <span class="tab-icon">${ic}</span><span class="tab-label">${lb}</span><span class="tab-dot"></span>
          </button>`).join('')}
        <button class="tab tab-add ${tab==='add'?'active':''}" onclick="switchTab('add')">
          <span class="tab-icon">＋</span>
        </button>
        ${[['muscles','💪','Muscles'],['overview','◎','Stats']].map(([t,ic,lb])=>`
          <button class="tab ${tab===t?'active':''}" onclick="switchTab('${t}')">
            <span class="tab-icon">${ic}</span><span class="tab-label">${lb}</span><span class="tab-dot"></span>
          </button>`).join('')}
      </div>
    </div>
    ${renderExDetailModal()}
  `;

  const c=document.getElementById('content');
  if(c)c.scrollTop=savedScroll;
  if(tab==='muscles'&&muscleSubTab==='gains')renderCharts();
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

  const next=nextSugg();
  const sc=getNextScheduled();
  const heroFocus=(sc||next).focus;
  const nc=FCHEX[heroFocus]||'#888';
  const todayStr=new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
  const today=new Date().toISOString().split('T')[0];
  const heroMeta=sc?(sc.date===today?`Today · ${todayStr} · Scheduled`:`${fmtDate(sc.date)} · Scheduled`):`Today · ${todayStr}`;

  return`
    <div class="log-next-section">
      <div class="log-section-hdr"><span class="log-section-title"><span style="color:var(--text)">Next</span> Up</span></div>
      <div class="next-hero-date-row">${heroMeta}</div>
      <div class="next-hero-card" onclick="switchTab('add')">
        <div class="next-hero-bg" style="background:radial-gradient(ellipse at 78% 40%,${nc}38 0%,transparent 62%),radial-gradient(ellipse at 18% 90%,${nc}18 0%,transparent 55%)"></div>
        <div class="next-hero-content">
          <div class="next-hero-top-row">
            <div class="next-hero-name" style="color:${nc}">${heroFocus}</div>
            ${!sc?`<button class="next-hero-schedule-link" onclick="event.stopPropagation();switchTab('schedule')">Schedule a date →</button>`:''}
          </div>
        </div>
        <button class="next-hero-cta" onclick="event.stopPropagation();switchTab('add')">Start Workout</button>
      </div>
    </div>

    <div class="log-section-hdr log-recent-hdr">
      <span class="log-section-title"><span style="color:var(--text)">Recent</span> Workouts</span>
    </div>

    ${Object.entries(groups).map(([month,ss])=>`
      <div class="month-header">
        <div class="month-label">${month.toUpperCase()}</div>
        <div class="month-line"></div>
        <div class="month-count">${ss.length}</div>
      </div>
      ${ss.map(s=>{
        const fc=FCHEX[s.focus]||'#888';
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
                <div class="rw-name" style="color:${fc}">${s.focus}</div>
                <div class="rw-sub">${s.exercises.length} exercises${hasPR?` · <span style="color:var(--gold)">★ PR</span>`:''}</div>
              </div>
              <div class="rw-right">
                <div class="rw-date">${fmtDate(s.date)}</div>
                <div class="rw-vol">${volStr}</div>
              </div>
              <span class="rw-chevron ${open?'open':''}">▼</span>
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
                            <button class="ex-info-btn" onclick="event.stopPropagation();openExDetail('${ex.name.replace(/'/g,"\\'")}')">ⓘ</button>
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
    `).join('')}
  `;
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
            ${getAllFocuses().map(foc=>`<option ${f.focus===foc?'selected':''}>${foc}</option>`).join('')}
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
  if(progressMuscle)return renderProgressForMuscle(progressMuscle);
  if(progressGroup){const g=MUSCLE_GROUPS.find(g=>g.id===progressGroup);if(g)return renderProgressGroup(g);}
  // Level 1 — body-part groups
  return`
    <div class="section-header">
      <div class="section-title">GAINS</div>
      <div style="font-size:11px;color:var(--muted)">Select a body part</div>
    </div>
    <div class="muscle-group-grid">
      ${MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const logCount=sessions.reduce((t,s)=>t+s.exercises.filter(e=>exNames.has(e.name)).length,0);
        return`<div class="muscle-group-card" onclick="progressGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${g.label}</div>
          <div class="muscle-group-sub">${g.muscles.length} muscles</div>
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
        <div class="section-title" style="color:${group.color};margin-bottom:0">${group.label.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${group.muscles.length} muscles</div>
      </div>
    </div>
    <div class="muscle-grid" style="padding-top:14px">
      ${group.muscles.map(muscle=>{
        const c=MUSCLE_COLORS[muscle]||group.color;
        const exs=getLoggedExercisesForMuscle(muscle);
        const libCount=getDbFamiliesForMuscle(muscle).reduce((t,f)=>t+DB_EQUIPMENT_KEYS.filter(k=>f[k]).length,0);
        const logCount=exs.reduce((t,e)=>t+e.count,0);
        return`<div class="muscle-cell" onclick="progressMuscle='${muscle}';selEx=null;render()">
          <div class="muscle-cell-name" style="color:${c}">${muscle}</div>
          <div class="muscle-cell-sub">${exs.length?`${exs.length} ex · ${logCount} logs`:`${libCount} ex · no logs`}</div>
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
        <div style="font-size:11px;color:var(--muted)">${exs.length} exercise${exs.length!==1?'s':''} logged</div>
      </div>
    </div>`;
  if(!exs.length)return header+`<div style="padding:40px 16px;text-align:center;color:var(--muted);font-size:13px">No logged exercises for ${muscle} yet.</div>`;
  if(!selEx||!exs.some(e=>e.name===selEx))selEx=exs[0].name;
  const pd=progressFor(selEx);
  const cur=pd[pd.length-1],first=pd[0];
  const wDelta=cur&&first?+(cur.mw-first.mw).toFixed(1):0;
  const eDelta=cur&&first?+(cur.e1rm-first.e1rm).toFixed(1):0;
  return header+`
    <div class="progress-ex-header">
      <div class="progress-ex-name">${selEx}</div>
    </div>
    ${pd.length<2?`<div style="padding:20px 16px;color:var(--muted);font-size:12px">Not enough data for ${selEx} yet — log at least 2 sessions.</div>`:`
      <div class="chart-block">
        <div class="chart-block-title">Estimated 1RM</div>
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div class="chart-big" style="color:#6bbd7f">${cur.e1rm}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg</span></div>
          <span class="chart-delta" style="color:${eDelta>=0?'var(--green)':'var(--red)'}">${eDelta>=0?'▲':'▼'} ${Math.abs(eDelta)} since start</span>
        </div>
        <div class="chart-wrap"><canvas id="eChart"></canvas></div>
      </div>
      <div class="chart-block">
        <div class="chart-block-title">Max Weight</div>
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <div class="chart-big" style="color:var(--gold)">${cur.mw}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg</span></div>
          <span class="chart-delta" style="color:${wDelta>=0?'var(--green)':'var(--red)'}">${wDelta>=0?'▲':'▼'} ${Math.abs(wDelta)} since start</span>
        </div>
        <div class="chart-wrap"><canvas id="wChart"></canvas></div>
      </div>
      <div class="chart-block">
        <div class="chart-block-title">Session Volume</div>
        <div class="chart-big" style="color:var(--pull)">${cur.vol}<span style="font-size:12px;color:var(--muted);margin-left:4px">kg·reps</span></div>
        <div class="chart-wrap"><canvas id="vChart"></canvas></div>
      </div>`}
    <div style="padding:10px 14px 16px">
      <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px">Exercises</div>
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
    <button class="muscle-subtab ${muscleSubTab==='exercises'?'active':''}" onclick="muscleSubTab='exercises';selGroup=null;selMuscle=null;render()">Exercises</button>
    <button class="muscle-subtab ${muscleSubTab==='gains'?'active':''}" onclick="muscleSubTab='gains';progressGroup=null;progressMuscle=null;render()">Gains</button>
  </div>`;
  const cards=muscleSubTab==='gains'
    ?MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const logCount=sessions.reduce((t,s)=>t+s.exercises.filter(e=>exNames.has(e.name)).length,0);
        return`<div class="muscle-group-card" onclick="progressGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${g.label}</div>
          <div class="muscle-group-sub">${g.muscles.length} muscle${g.muscles.length!==1?'s':''}</div>
          <div class="muscle-group-vol">${logCount} log${logCount!==1?'s':''}</div>
        </div>`;
      }).join('')
    :MUSCLE_GROUPS.map(g=>{
        const exNames=new Set();
        g.muscles.forEach(m=>getDbFamiliesForMuscle(m).forEach(f=>DB_EQUIPMENT_KEYS.forEach(k=>{if(f[k])exNames.add(f[k]);})));
        const exCount=exNames.size;
        return`<div class="muscle-group-card" onclick="selGroup='${g.id}';render()" style="--gc:${g.color}">
          <div class="muscle-group-name">${g.label}</div>
          <div class="muscle-group-sub">${g.muscles.length} muscle${g.muscles.length!==1?'s':''}</div>
          <div class="muscle-group-vol">${exCount} exercise${exCount!==1?'s':''}</div>
        </div>`;
      }).join('');
  return`
    <div class="section-header">
      <div class="section-title">MUSCLES</div>
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
        <div class="section-title" style="color:${group.color};margin-bottom:0">${group.label.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${group.muscles.length} muscles</div>
      </div>
    </div>
    <div class="muscle-grid" style="padding-top:14px">
      ${group.muscles.map((muscle,i)=>{
        const c=MUSCLE_COLORS[muscle]||group.color;
        const pct=Math.round((vols[i]/maxVol)*100);
        const exCount=getDbFamiliesForMuscle(muscle).length;
        return`<div class="muscle-cell" onclick="selMuscle='${muscle}';render()">
          <div class="muscle-cell-name" style="color:${c}">${muscle}</div>
          <div class="muscle-cell-sub">${exCount} exercise${exCount!==1?'s':''}</div>
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
        <div class="section-title" style="color:${c};margin-bottom:0">${muscle.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted)">${Object.keys(loggedData).length} logged · ${families.length} in library</div>
      </div>
    </div>
    <div style="padding:10px 14px 6px">
      <div class="db-eq-bar">
        ${Object.entries(DB_EQ_LABELS).map(([key,label])=>`<button class="db-eq-tab ${dbEquipment===key?'active':''}" onclick="dbEquipment='${key}';render()">${label}</button>`).join('')}
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
            <div class="muscle-ex-stats">${data?`${data.sessions} sessions · max ${data.maxW}kg · last ${lastSession?fmtDate(lastSession.date):'—'}`:'Not logged yet'}</div>
          </div>`;
      }).join(''):`<div style="padding:24px 0;text-align:center;color:var(--muted);font-size:12px">No ${DB_EQ_LABELS[dbEquipment].toLowerCase()} option for ${muscle}.</div>`}
    </div>`;
}

// ═══════════════════════════════════════════════
// SCHEDULE TAB
// ═══════════════════════════════════════════════
function renderScheduleTab(){
  const today=new Date().toISOString().split('T')[0];
  const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysInMonth=new Date(schedViewYear,schedViewMonth+1,0).getDate();
  const firstDow=new Date(schedViewYear,schedViewMonth,1).getDay();
  const startCol=(firstDow+6)%7; // Mon=0, Sun=6

  // Map this month's scheduled dates → focus colors
  const dotMap={};
  schedules.forEach(s=>{
    const [sy,sm]=s.date.split('-').map(Number);
    if(sy===schedViewYear&&sm-1===schedViewMonth){
      if(!dotMap[s.date])dotMap[s.date]=[];
      const fc=FCHEX[s.focus]||'#888';
      if(!dotMap[s.date].includes(fc))dotMap[s.date].push(fc);
    }
  });

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
      ${['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
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
  const focusPills=allFocuses.map(f=>`<button class="muscle-subtab ${schedFocus===f?'active':''}" onclick="schedFocus=${JSON.stringify(f)};render()">${f}</button>`).join('');

  const addPanel=schedSelectedDay?`
    <div class="sched-add-panel">
      <div class="sched-add-panel-date">${fmtDate(schedSelectedDay)}</div>
      <div class="muscle-subtab-bar" style="flex-wrap:wrap;margin-bottom:14px">${focusPills}</div>
      <button class="sched-add-btn" onclick="confirmAddSchedule()">+ Add to plan</button>
    </div>`:`
    <div style="padding:8px 16px 14px;text-align:center;font-size:12px;color:var(--dim)">Tap a day to schedule a session</div>`;

  const upcoming=schedules.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const past=[...schedules.filter(s=>s.date<today)].sort((a,b)=>b.date.localeCompare(a.date));

  const schedList=(upcoming.length||past.length)?`
    <div class="log-section-hdr log-recent-hdr">
      <span class="log-section-title"><span style="color:var(--text)">Scheduled</span> Sessions</span>
    </div>
    ${upcoming.map(s=>{
      const fc=FCHEX[s.focus]||'#888';
      const isToday=s.date===today;
      return`<div class="sched-card${isToday?' today':''}">
        <div class="sched-card-stripe" style="background:linear-gradient(180deg,${fc},${fc}55)"></div>
        <div class="sched-card-main">
          <div class="sched-card-focus" style="color:${fc}">${s.focus}</div>
          <div class="sched-card-date">${fmtDate(s.date)}${isToday?' · Today':''}</div>
        </div>
        <button class="sched-del-btn" onclick="deleteSchedule('${s.id}')">×</button>
      </div>`;
    }).join('')}
    ${past.map(s=>{
      const fc=FCHEX[s.focus]||'#888';
      return`<div class="sched-card cal-past" style="opacity:.45">
        <div class="sched-card-stripe" style="background:${fc}44"></div>
        <div class="sched-card-main">
          <div class="sched-card-focus" style="color:${fc}88">${s.focus}</div>
          <div class="sched-card-date" style="color:var(--dim)">${fmtDate(s.date)}</div>
        </div>
        <button class="sched-del-btn" onclick="deleteSchedule('${s.id}')">×</button>
      </div>`;
    }).join('')}`:'';

  const BUILTIN_FOCUSES=['Push','Pull','Legs','Upper'];
  const allTmplEntries=[
    ...BUILTIN_FOCUSES.map(f=>({key:f,name:f,exercises:builtinTemplateExercises[f]||[],builtin:true})),
    ...customTemplates.map(t=>({key:t.id,name:t.name,exercises:t.exercises,builtin:false}))
  ];
  const renderTmplCard=({key,name,exercises,builtin})=>{
    const isExpanded=expandedTemplateKey===key;
    const isEditing=editingTemplateKey===key;
    const nameColor=builtin?'var(--text2)':'var(--gold2)';
    return`<div class="tmpl-editor-card ${isExpanded?'tmpl-expanded':''}">
      <div class="tmpl-editor-header" style="cursor:pointer" onclick="${isExpanded?`expandedTemplateKey=null;editingTemplateKey=null;render()`:`expandedTemplateKey='${key}';editingTemplateKey=null;render()`}">
        <span class="tmpl-editor-name" style="color:${nameColor}">${name}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--dim);font-family:'IBM Plex Mono',monospace">${exercises.length} ex</span>
          <span class="tmpl-chevron ${isExpanded?'open':''}">▼</span>
        </div>
      </div>
      ${isExpanded?`
        <div class="tmpl-ex-list" style="margin-top:6px">
          ${exercises.length?exercises.map((ex,i)=>`
            <div class="tmpl-ex-row">
              ${isEditing?`<div class="tmpl-ex-reorder">
                <button class="tmpl-reorder-btn" ${i===0?'disabled':''} onclick="event.stopPropagation();${builtin?`moveBuiltinEx('${key}',${i},-1)`:`moveTemplateEx('${key}',${i},-1)`}">▲</button>
                <button class="tmpl-reorder-btn" ${i===exercises.length-1?'disabled':''} onclick="event.stopPropagation();${builtin?`moveBuiltinEx('${key}',${i},1)`:`moveTemplateEx('${key}',${i},1)`}">▼</button>
              </div>`:''}
              <span class="tmpl-ex-name">${ex}</span>
              ${isEditing?`<button class="tmpl-ex-del" onclick="event.stopPropagation();${builtin?`removeBuiltinEx('${key}',${i})`:`removeTemplateEx('${key}',${i})`}">×</button>`:''}
            </div>`).join(''):`<div style="font-size:12px;color:var(--dim);padding:4px 0 8px">No exercises yet.</div>`}
        </div>
        ${isEditing?`
          <div style="display:flex;gap:6px;margin-top:10px">
            <input type="text" id="tmplExInput_${key}" placeholder="Exercise name…" class="form-input" style="font-size:13px;padding:8px 10px" oninput="tmplExInput=this.value" value="">
            <button class="sched-add-btn" style="width:auto;padding:8px 14px;flex-shrink:0;font-size:12px" onclick="event.stopPropagation();${builtin?`addBuiltinEx('${key}')`:`addTemplateEx('${key}')`}">+ Add</button>
          </div>`:''}
        <div style="display:flex;gap:6px;margin-top:${isEditing?'8px':'10px'};padding-top:${isEditing?'8px':'0'};${isEditing?'border-top:1px solid rgba(255,255,255,.06)':''}">
          <button class="tmpl-editor-btn" onclick="event.stopPropagation();editingTemplateKey=${isEditing?'null':`'${key}'`};render()">${isEditing?'Done':'Edit'}</button>
          ${builtin?'':`<button class="tmpl-editor-btn del" onclick="event.stopPropagation();if(confirm('Delete ${name}?'))deleteCustomTemplate('${key}')">Delete</button>`}
        </div>`:''}
    </div>`;
  };
  const createFormHtml=creatingTemplate?`
    <div class="tmpl-editor-card" style="border-color:rgba(232,184,75,.25)">
      <div class="tmpl-editor-header">
        <input type="text" class="tmpl-name-input" placeholder="Template name…" oninput="newTemplateName=this.value" value="${newTemplateName.replace(/"/g,'&quot;')}" autofocus>
        <button class="tmpl-editor-btn del" onclick="cancelCreatingTemplate()" style="flex-shrink:0">✕</button>
      </div>
      <div class="tmpl-ex-list" style="margin-top:8px;min-height:24px">
        ${newTemplateExercises.length?newTemplateExercises.map((ex,i)=>`
          <div class="tmpl-ex-row">
            <span class="tmpl-ex-name">${ex}</span>
            <button class="tmpl-ex-del" onclick="removeFromNewTemplate(${i})">×</button>
          </div>`).join(''):`<div style="font-size:12px;color:var(--dim);padding:4px 0">Add exercises below.</div>`}
      </div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <input type="text" id="newTmplExInput" placeholder="Exercise name…" class="form-input" style="font-size:13px;padding:8px 10px" oninput="newTmplExInput=this.value" value="">
        <button class="sched-add-btn" style="width:auto;padding:8px 14px;flex-shrink:0;font-size:12px" onclick="addToNewTemplate()">+ Add</button>
      </div>
      <button class="tmpl-save-btn" onclick="addCustomTemplate()">Save Template</button>
    </div>`
    :`<button class="tmpl-create-btn" onclick="startCreatingTemplate()">+ Create Template</button>`;
  const templatesSection=`
    <div class="log-section-hdr log-recent-hdr" style="margin-top:4px">
      <span class="log-section-title"><span style="color:var(--text)">My</span> Templates</span>
    </div>
    <div style="padding:0 12px 16px">
      ${allTmplEntries.map(renderTmplCard).join('')}
      <div style="margin-top:10px">${createFormHtml}</div>
    </div>`;

  return`
    <div class="section-header">
      <div class="section-title">PLAN</div>
      <div style="font-size:11px;color:var(--muted)">Schedule future sessions</div>
    </div>
    <div style="padding:14px 16px 0">${calGrid}</div>
    ${addPanel}
    ${schedList}
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
      <div class="freq-grid">${Object.entries(exFreq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>`
        <div class="freq-item"><span class="freq-name">${name}</span><span class="freq-n">${count}×</span></div>
      `).join('')}</div>
    </div>`;
}

// ═══════════════════════════════════════════════
// EXERCISE LIBRARY BROWSER
// ═══════════════════════════════════════════════
const DB_EQ_LABELS={bodyweight:'Body',dumbbells:'DBs',barbell:'Barbell',cable:'Cable',machine:'Machine',plateLoaded:'Plate'};
const DB_CAT_LABELS={chest:'Chest',shoulders:'Shoulders',back:'Back',legs_glutes:'Legs & Glutes',arms:'Arms',core:'Core'};
const DB_CAT_COLORS={chest:'#c96b4a',shoulders:'#b85a90',back:'#4a90b8',legs_glutes:'#5a9e62',arms:'#4aabab',core:'#8860b8'};
const DB_CAT_ORDER=['chest','shoulders','back','legs_glutes','arms','core'];

function renderExerciseBrowser(){
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
        <div class="db-browser-title">Library</div>
        <div class="db-eq-bar">
          ${Object.entries(DB_EQ_LABELS).map(([key,label])=>`<button class="db-eq-tab ${dbEquipment===key?'active':''}" onclick="dbEquipment='${key}';render()">${label}</button>`).join('')}
        </div>
      </div>
      <div class="db-exercise-list">
        ${DB_CAT_ORDER.map(cat=>{
          const exs=byCategory[cat];
          if(!exs||!exs.length)return'';
          const c=DB_CAT_COLORS[cat];
          return`
            <div class="db-cat-group">
              <div class="db-cat-label" style="color:${c}">${DB_CAT_LABELS[cat].toUpperCase()}</div>
              <div class="db-cat-exercises">
                ${exs.map(name=>`<button class="db-ex-btn" onclick="addExerciseFromLibrary('${name.replace(/'/g,"\\'")}')">${name}</button>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
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
  const steps=(e&&e.instructions&&e.instructions.length)?e.instructions:[];
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
      ${(level||mechanic)?`<div class="ex-detail-meta">${[level,mechanic].filter(Boolean).map(t=>`<span class="ex-detail-tag">${t}</span>`).join('')}</div>`:''}
      ${imgs.length?`
        <div class="ex-detail-imgs">
          ${imgs.map(img=>`<img class="ex-detail-img" src="exercise-assets/exercises/${img}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}
        </div>`:''}
      ${primary.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">Primary</div>
          <div class="ex-detail-chips">${primary.map(m=>`<span class="ex-detail-chip primary">${m}</span>`).join('')}</div>
        </div>`:''}
      ${secondary.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">Secondary</div>
          <div class="ex-detail-chips">${secondary.map(m=>`<span class="ex-detail-chip">${m}</span>`).join('')}</div>
        </div>`:''}
      ${steps.length?`
        <div class="ex-detail-section">
          <div class="ex-detail-section-lbl">Instructions</div>
          <ol class="ex-detail-steps">
            ${steps.map(s=>`<li class="ex-detail-step">${s}</li>`).join('')}
          </ol>
        </div>`:(!e?`<div class="ex-detail-empty">No details available for this exercise yet.</div>`:'')}
    </div>`;
}

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
            ${getAllFocuses().map(foc=>`<option ${f.focus===foc?'selected':''}>${foc}</option>`).join('')}
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
                ${ex.name?`<button class="ex-info-btn" onclick="openExDetail('${ex.name.replace(/'/g,"\\'")}')">ⓘ</button>`:''}
                <button class="rm-ex-btn-add" onclick="removeEx(${ei})">×</button>
              </div>

              ${sugg?`<div class="overload-hint"><span class="oh-icon">${sugg.type==='increase'?'🔼':sugg.type==='progress'?'💪':'🔄'}</span><div class="oh-text">${sugg.text}<br><strong>${sugg.suggestion}</strong></div><button class="oh-apply" onclick="applySugg(${ei},${sugg.sets},${sugg.reps},${sugg.weight})">Apply</button></div>`:''}
              ${alts.length?`<div class="alt-row"><button class="alt-toggle" onclick="toggleAlts(${ei})" aria-expanded="false" id="alt-toggle-${ei}"><span class="alt-label">Alt</span><span class="alt-arrow">▶</span></button><div class="alt-chips" id="alt-chips-${ei}" style="display:none">${alts.map(a=>`<button class="alt-chip" onclick="addAlt('${a.replace(/'/g,"\\'")}',${ei})">${a}</button>`).join('')}</div></div>`:''}

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

      ${!f.exercises.length&&!showExerciseLibrary?`<div style="padding:20px 0 8px;text-align:center;color:var(--muted);font-size:12px">No exercises yet — tap + Exercise to open the library</div>`:''}
      <button class="ghost-btn" onclick="addEx()">${showExerciseLibrary?'✕ Close library':'+ Exercise'}</button>
      ${showExerciseLibrary?renderExerciseBrowser():''}
      <button class="ghost-btn" style="margin-top:-4px;font-size:9px;opacity:.55" onclick="addBlankExercise()">+ Manual exercise</button>
      <button class="save-btn" id="save-btn" onclick="saveSession()">Save Session →</button>
      <div style="height:10px"></div>
    </div>`;
}

// ═══════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════
function switchTab(t){
  tab=t; acActive=null;
  if(t==='add'){addForm=defaultForm();showExerciseLibrary=false;loadTemplate(addForm.focus);}
  else{if(t!=='muscles'){selMuscle=null;selGroup=null;progressGroup=null;progressMuscle=null;}render();}
  setTimeout(()=>{const c=document.getElementById('content');if(c)c.scrollTop=0;},0);
}
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
function addAlt(name,afterIdx){
  const ls=[...sessions].reverse().find(s=>s.exercises.some(e=>e.name===name));
  const sets=ls?ls.exercises.find(e=>e.name===name).sets.map(s=>({r:String(s.r),w:String(s.w)})):[{r:'',w:''}];
  addForm.exercises.splice(afterIdx+1,0,{name,sets});
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
  loading=true;loadSchedules();loadCustomTemplates();loadBuiltinTemplates();render();
  try{await initDb();await loadSessions();}
  catch(e){toast('Failed to load data',true);}
  loading=false;render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/lifttrack/sw.js', { scope: '/lifttrack/' }).catch(()=>{});
}
init();
