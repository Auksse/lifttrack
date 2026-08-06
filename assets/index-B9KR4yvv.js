import{E as ce}from"./exercise-db-4Jwm1GWN.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function s(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(a){if(a.ep)return;a.ep=!0;const r=s(a);fetch(a.href,r)}})();const ne=new Set;let ee=null;const o={ready:!1,loading:!1,tab:"log",user:null,users:[],sessions:[],templates:[],workout:null,restEndsAt:null,restDuration:0,expandedSessionId:null,sheet:null,lang:"en",settings:{haptics:!0,sound:!0,units:"kg"}};function it(e){return ne.add(e),()=>ne.delete(e)}function $(){ee===null&&(ee=requestAnimationFrame(()=>{ee=null,ne.forEach(e=>e(o))}))}function g(e){Object.assign(o,e),$()}function R(e){e(o),$()}function f(e,t){return e?`lifttrack_${e}_${t}`:`lifttrack_${t}`}function Y(e,t){try{const s=localStorage.getItem(e);return s===null?t:JSON.parse(s)}catch{return t}}function J(e,t){try{return localStorage.setItem(e,JSON.stringify(t)),!0}catch(s){return console.error("[storage] write failed",e,s),!1}}const Ae="lifttrack_users",ae="lifttrack_current_user";function ot(){const e=Y(Ae,[]);return Array.isArray(e)?e:[]}function lt(e){J(Ae,e)}function ut(){return localStorage.getItem(ae)}function de(e){e?localStorage.setItem(ae,e):localStorage.removeItem(ae)}function ct(e,t){t?J(f(e,"draft"),t):localStorage.removeItem(f(e,"draft"))}function dt(e){return Y(f(e,"draft"),null)}function pt(e){return{haptics:!0,sound:!0,units:"kg",...Y(f(e,"settings"),{})}}function qe(e,t){J(f(e,"settings"),t)}const mt=2,C="sessions";function bt(e){return e?`lifttrack_${e}`:"lifttrack"}function gt(e){return new Promise((t,s)=>{const n=indexedDB.open(bt(e),mt);n.onupgradeneeded=a=>{const r=a.target.result,l=a.target.transaction;let u;r.objectStoreNames.contains(C)?u=l.objectStore(C):(u=r.createObjectStore(C,{keyPath:"id"}),u.createIndex("date","date",{unique:!1})),u.indexNames.contains("updatedAt")||(u.createIndex("updatedAt","updatedAt",{unique:!1}),u.openCursor().onsuccess=c=>{const b=c.target.result;if(!b)return;const h=b.value;h.updatedAt||(h.updatedAt=new Date(`${h.date}T12:00:00`).getTime()||Date.now(),b.update(h)),b.continue()})},n.onsuccess=a=>t(a.target.result),n.onerror=a=>s(a.target.error)})}function B(e,t,s){return new Promise((n,a)=>{const r=e.transaction(C,t),l=r.objectStore(C);let u;try{u=s(l)}catch(c){a(c);return}r.oncomplete=()=>n(u),r.onerror=()=>a(r.error),r.onabort=()=>a(r.error)})}function ht(e){return new Promise((t,s)=>{const n=e.getAll();n.onsuccess=a=>t(a.target.result||[]),n.onerror=a=>s(a.target.error)})}class vt{constructor(t){this.userId=t,this._db=null}async _open(){return this._db||(this._db=await gt(this.userId)),this._db}async list(){const s=(await this._open()).transaction(C,"readonly");return(await ht(s.objectStore(C))).map(a=>({...a,exercises:a.exercises||[]})).sort((a,r)=>a.date.localeCompare(r.date))}async add(t){const s=await this._open(),n={...t,id:t.id||crypto.randomUUID(),updatedAt:Date.now()};return await B(s,"readwrite",a=>a.put(n)),n}async update(t,s){const n=await this._open(),a=await new Promise((l,u)=>{const b=n.transaction(C,"readonly").objectStore(C).get(t);b.onsuccess=h=>l(h.target.result),b.onerror=h=>u(h.target.error)});if(!a)throw new Error(`Session ${t} not found`);const r={...a,...s,id:t,updatedAt:Date.now()};return await B(n,"readwrite",l=>l.put(r)),r}async remove(t){const s=await this._open();await B(s,"readwrite",n=>n.delete(t))}async bulkPut(t){const s=await this._open();await B(s,"readwrite",n=>{t.forEach(a=>n.put({...a,id:a.id||crypto.randomUUID(),updatedAt:a.updatedAt||Date.now()}))})}async clear(){const t=await this._open();await B(t,"readwrite",s=>s.clear())}close(){this._db&&(this._db.close(),this._db=null)}}let A=null;function K(e){return A&&A.userId===e||(A&&A.close(),A=new vt(e)),A}const re=[{name:"Push",focus:"Push",exercises:["Dumbbell Flat Press","Dumbbell Incline Press","Dumbbell Overhead Press","Cable Lateral Raise","Cable Overhead Triceps Extension"]},{name:"Pull",focus:"Pull",exercises:["Lat Pulldown Machine","Seated Row Machine","Rear Delt Machine","Cable Face Pull","Dumbbell Curl"]},{name:"Legs",focus:"Legs",exercises:["Leg Press Machine","Dumbbell Bulgarian Split Squat","Leg Curl Machine","Leg Extension Machine","Standing Calf Raise Machine"]},{name:"Upper",focus:"Upper",exercises:["Barbell Bench Press","Dumbbell Incline Press","Dumbbell Overhead Press","Lat Pulldown Machine","Seated Row Machine","Barbell Curl","Cable Triceps Pushdown"]}],ve="templates_seeded";function ft(e){const t=localStorage.getItem(f(e,"builtin_tmpl"));if(!t)return null;const s=fe(t,{}),n=fe(localStorage.getItem(f(e,"builtin_colors")),{}),a=new Set(Me(localStorage.getItem(f(e,"hidden_builtins")),[])),r=[];return new Set([...Object.keys(s),...re.map(u=>u.name)]).forEach(u=>{if(a.has(u))return;const c=Array.isArray(s[u])?s[u]:re.find(b=>b.name===u)?.exercises;c?.length&&r.push({id:crypto.randomUUID(),name:u,focus:u,exercises:[...c],...n[u]?{color:n[u]}:{}})}),r.length?r:null}function xt(e){const t=localStorage.getItem(f(e,"templates")),s=t?Me(t,[]):[];if(!localStorage.getItem(f(e,ve))){const n=new Set(s.map(r=>r.name.toLowerCase()));(ft(e)||re).forEach(r=>{n.has(r.name.toLowerCase())||(n.add(r.name.toLowerCase()),s.push({id:r.id||crypto.randomUUID(),name:r.name,focus:r.focus||r.name,exercises:[...r.exercises],...r.color?{color:r.color}:{}}))}),localStorage.setItem(f(e,ve),"1"),P(e,s)}return s}function P(e,t){localStorage.setItem(f(e,"templates"),JSON.stringify(t))}function _t(e,t=[],s=null){return{id:crypto.randomUUID(),name:e.trim(),focus:s||e.trim(),exercises:[...t]}}function Me(e,t){try{const s=JSON.parse(e);return Array.isArray(s)?s:t}catch{return t}}function fe(e,t){try{const s=JSON.parse(e);return s&&typeof s=="object"&&!Array.isArray(s)?s:t}catch{return t}}const H={tab_log:"Log",tab_plan:"Plan",tab_muscles:"Muscles",tab_stats:"Stats",sessions:"Sessions",volume:"Volume",prs:"PRs",this_week:"This week",streak:"Streak",streak_unit:"wk",week_short:"Week",rest:"d rest",total_lbl:"total",reps:"Reps",reps_short:"reps",weight:"Weight",sets:"sets",set_done:"Set complete",mark_set_done:"Mark set complete",add_set:"Add set",add_exercise:"Add exercise",remove_exercise:"Remove exercise",exercise_info:"Exercise details",unnamed_exercise:"Untitled exercise",no_exercises_yet:"No exercises yet",no_exercises_body:"Add your first exercise to start logging sets.",finish:"Finish",apply:"Apply",skip:"Skip",last_time:"Last time",rest_timer:"Rest timer",start_workout:"Start workout",workout_in_progress:"Workout in progress",resume:"Resume",discard:"Discard",discard_confirm:"Discard this workout? Logged sets will be lost.",next_up:"Next up",recent_workouts:"Recent workouts",no_sessions:"No sessions yet.",onboard_title:"Welcome to LiftTrack",onboard_sub:"Pick a template and log your first session.",onboard_cta:"Start your first workout",schedule_link:"Schedule a date",edit:"Edit",use_as_template:"Use as template",delete:"Delete",save_as_template:"Save as template",session_saved:"Workout saved",session_updated:"Workout updated",deleted:"Deleted",delete_confirm:"Delete this session?",add_at_least:"Add at least one exercise",new_pr:"PR",choose_template:"Choose a template",templates:"Templates",blank_workout:"Blank workout",ex_lbl:"ex",create_template:"Create template",save_template:"Save template",tmpl_name_ph:"Template name…",tmpl_created:"Template created",tmpl_exists:"Template already exists",enter_tmpl_name:"Enter a template name",tmpl_from:"From template",clear:"Clear",library:"Library",search_exercises:"Search exercises…",no_results:"No exercises match",primary:"Primary",secondary:"Secondary",instructions:"Instructions",no_details:"No details available yet.",manual_ex:"Add manually",similar:"similar",alt_lbl:"Alternatives",muscles_title:"Muscles",overview_title:"Overview",subtab_exercises:"Exercises",subtab_gains:"Gains",select_body_part:"Select a body part",muscles_lbl:"muscles",exercises_lbl:"exercises",exercise_lbl:"exercise",logged_lbl:"logged",in_library:"in library",not_logged_yet:"Not logged yet",not_logged_short:"not logged",est_1rm:"Estimated 1RM",max_weight:"Max weight",session_volume:"Session volume",since_start:"since start",kg_reps:"kg·reps",session_split:"Session split",vol_per_session:"Volume per session",ex_freq:"Exercise frequency",not_enough_data:"Not enough data yet — log at least 2 sessions.",logs_lbl:"logs",log_lbl:"log",no_logs:"no logs",sessions_lbl:"sessions",feedback:"Feedback",data:"Data",layout_diagnostic:"Layout diagnostic",data_local_notice:"Your training data is stored only on this device. Export regularly — deleting the app removes it.",progression:"Progression",personal_records:"Personal records",current:"Current",sub_recovery:"Recovery",sub_volume:"Volume",sub_library:"Library",recovery_status:"Recovery status",train_next:"Train next",recovered:"recovered",recovery_fresh:"Fresh",recovery_ready:"Ready",recovery_recovering:"Recovering",recovery_fatigued:"Fatigued",recovery_cooked:"Cooked",recovery_explainer:"Recovery is estimated from the sets you logged, weighted by how much each exercise involves the muscle, decaying over time. Larger muscle groups are given longer to recover.",of:"of",target:"Target",sets_week:"sets/wk",total_sets:"Total sets",groups_optimal:"In range",last_7_days:"Last 7 days",volume_none:"Not trained this week",volume_low:"Below target",volume_optimal:"In the productive range",volume_high:"Above target — watch fatigue",volume_behind:"behind on volume",volume_on_track:"volume on track",volume_empty_body:"Log a few sessions and your weekly volume per muscle group appears here.",no_data_yet:"No data yet",all:"All",showing_first:"Showing the first {n}",plan_title:"Plan",sched_future:"Schedule future sessions",tap_day:"Tap a day to schedule a session",add_to_plan:"Add to plan",scheduled:"Scheduled",today_lbl:"Today",select_day:"Select a day first",session_planned:"Session planned",settings:"Settings",language:"Language",profile:"Profile",rename_user:"Rename",rename_user_prompt:"New name:",switch_user:"Switch user",delete_user:"Delete profile",haptics:"Haptics",sound:"Sound",units:"Units",backup_due:"Back up your data",backup_due_body:"Your logs exist only on this phone. Save a copy to Files.",back_up:"Back up",backup_saved:"Backup saved",export_data:"Export data",import_data:"Import data",new_profile:"New profile",get_started:"Get started",create_profile:"Create your profile",whos_training:"Who's training?",your_name:"Your name…",continue_:"Tap to continue",enter_name:"Enter a name",name_taken:"A profile with that name already exists",cancel:"Cancel",save_changes:"Save changes",done:"Done",close:"Close",failed_load:"Failed to load data",update_banner:"Update available",reload:"Reload",offline_ready:"Ready to work offline",f_Push:"Push",f_Pull:"Pull",f_Legs:"Legs",f_Upper:"Upper",f_Core:"Core",f_Other:"Other",eq_body:"Body",eq_dbs:"Dumbbell",eq_barbell:"Barbell",eq_cable:"Cable",eq_machine:"Machine",eq_plate:"Plate",cat_chest:"Chest",cat_shoulders:"Shoulders",cat_back:"Back",cat_legs:"Legs & Glutes",cat_arms:"Arms",cat_core:"Core",m1:"January",m2:"February",m3:"March",m4:"April",m5:"May",m6:"June",m7:"July",m8:"August",m9:"September",m10:"October",m11:"November",m12:"December",d_mo:"Mo",d_tu:"Tu",d_we:"We",d_th:"Th",d_fr:"Fr",d_sa:"Sa",d_su:"Su"},yt={tab_log:"Journal",tab_plan:"Planning",tab_muscles:"Muscles",tab_stats:"Stats",sessions:"Séances",volume:"Volume",prs:"Records",this_week:"Cette semaine",streak:"Série",streak_unit:"sem",week_short:"Sem.",rest:"j repos",total_lbl:"total",reps:"Répétitions",reps_short:"rép",weight:"Charge",sets:"séries",set_done:"Série terminée",mark_set_done:"Marquer la série terminée",add_set:"Ajouter une série",add_exercise:"Ajouter un exercice",remove_exercise:"Retirer l'exercice",exercise_info:"Détails de l'exercice",unnamed_exercise:"Exercice sans nom",no_exercises_yet:"Pas encore d'exercices",no_exercises_body:"Ajoute ton premier exercice pour commencer à enregistrer des séries.",finish:"Terminer",apply:"Appliquer",skip:"Passer",last_time:"Dernière fois",rest_timer:"Minuteur de repos",start_workout:"Commencer",workout_in_progress:"Séance en cours",resume:"Reprendre",discard:"Abandonner",discard_confirm:"Abandonner cette séance ? Les séries enregistrées seront perdues.",next_up:"Prochaine",recent_workouts:"Séances récentes",no_sessions:"Aucune séance.",onboard_title:"Bienvenue sur LiftTrack",onboard_sub:"Choisis un modèle et enregistre ta première séance.",onboard_cta:"Commencer ta première séance",schedule_link:"Planifier une date",edit:"Modifier",use_as_template:"Utiliser comme modèle",delete:"Supprimer",save_as_template:"Enregistrer comme modèle",session_saved:"Séance enregistrée",session_updated:"Séance mise à jour",deleted:"Supprimé",delete_confirm:"Supprimer cette séance ?",add_at_least:"Ajoute au moins un exercice",new_pr:"RECORD",choose_template:"Choisir un modèle",templates:"Modèles",blank_workout:"Séance vierge",ex_lbl:"ex",create_template:"Créer un modèle",save_template:"Enregistrer le modèle",tmpl_name_ph:"Nom du modèle…",tmpl_created:"Modèle créé",tmpl_exists:"Ce modèle existe déjà",enter_tmpl_name:"Entre un nom de modèle",tmpl_from:"Depuis le modèle",clear:"Effacer",library:"Bibliothèque",search_exercises:"Rechercher un exercice…",no_results:"Aucun exercice correspondant",primary:"Principal",secondary:"Secondaire",instructions:"Instructions",no_details:"Aucun détail disponible pour le moment.",manual_ex:"Ajouter manuellement",similar:"similaire",alt_lbl:"Alternatives",muscles_title:"Muscles",overview_title:"Aperçu",subtab_exercises:"Exercices",subtab_gains:"Progrès",select_body_part:"Sélectionne un groupe musculaire",muscles_lbl:"muscles",exercises_lbl:"exercices",exercise_lbl:"exercice",logged_lbl:"enregistrés",in_library:"en bibliothèque",not_logged_yet:"Pas encore enregistré",not_logged_short:"non enregistré",est_1rm:"1RM estimé",max_weight:"Charge max",session_volume:"Volume de séance",since_start:"depuis le début",kg_reps:"kg·rép",session_split:"Répartition des séances",vol_per_session:"Volume par séance",ex_freq:"Fréquence des exercices",not_enough_data:"Pas assez de données — enregistre au moins 2 séances.",logs_lbl:"séances",log_lbl:"séance",no_logs:"non enregistré",sessions_lbl:"séances",feedback:"Retour",data:"Données",layout_diagnostic:"Diagnostic de mise en page",data_local_notice:"Tes données d'entraînement sont stockées uniquement sur cet appareil. Exporte régulièrement — supprimer l'app les efface.",progression:"Progression",personal_records:"Records personnels",current:"Actuel",sub_recovery:"Récupération",sub_volume:"Volume",sub_library:"Bibliothèque",recovery_status:"État de récupération",train_next:"À travailler",recovered:"récupéré",recovery_fresh:"Frais",recovery_ready:"Prêt",recovery_recovering:"En récupération",recovery_fatigued:"Fatigué",recovery_cooked:"Épuisé",recovery_explainer:"La récupération est estimée à partir des séries enregistrées, pondérées par l'implication de chaque muscle dans l'exercice, puis décroît avec le temps. Les grands groupes musculaires disposent de plus de temps pour récupérer.",of:"sur",target:"Cible",sets_week:"séries/sem",total_sets:"Séries totales",groups_optimal:"Dans la cible",last_7_days:"7 derniers jours",volume_none:"Pas travaillé cette semaine",volume_low:"Sous la cible",volume_optimal:"Dans la zone productive",volume_high:"Au-dessus de la cible — attention à la fatigue",volume_behind:"en retard sur le volume",volume_on_track:"volume dans la cible",volume_empty_body:"Enregistre quelques séances et ton volume hebdomadaire par groupe musculaire apparaîtra ici.",no_data_yet:"Pas encore de données",all:"Tous",showing_first:"Affichage des {n} premiers",plan_title:"Planning",sched_future:"Planifier des séances",tap_day:"Appuie sur un jour pour planifier une séance",add_to_plan:"Ajouter au planning",scheduled:"Planifié",today_lbl:"Aujourd'hui",select_day:"Sélectionne d'abord un jour",session_planned:"Séance planifiée",settings:"Paramètres",language:"Langue",profile:"Profil",rename_user:"Renommer",rename_user_prompt:"Nouveau nom :",switch_user:"Changer de profil",delete_user:"Supprimer le profil",haptics:"Vibrations",sound:"Son",units:"Unités",backup_due:"Sauvegarde tes données",backup_due_body:"Tes séances n'existent que sur ce téléphone. Enregistre une copie dans Fichiers.",back_up:"Sauvegarder",backup_saved:"Sauvegarde enregistrée",export_data:"Exporter les données",import_data:"Importer des données",new_profile:"Nouveau profil",get_started:"Commencer",create_profile:"Crée ton profil",whos_training:"Qui s'entraîne ?",your_name:"Ton prénom…",continue_:"Appuie pour continuer",enter_name:"Entre un prénom",name_taken:"Un profil porte déjà ce nom",cancel:"Annuler",save_changes:"Enregistrer",done:"Terminé",close:"Fermer",failed_load:"Erreur de chargement",update_banner:"Mise à jour disponible",reload:"Recharger",offline_ready:"Prêt pour le mode hors ligne",f_Push:"Poussée",f_Pull:"Tirage",f_Legs:"Jambes",f_Upper:"Haut du corps",f_Core:"Tronc",f_Other:"Autre",eq_body:"Poids du corps",eq_dbs:"Haltères",eq_barbell:"Barre",eq_cable:"Poulie",eq_machine:"Machine",eq_plate:"Disques",cat_chest:"Pectoraux",cat_shoulders:"Épaules",cat_back:"Dos",cat_legs:"Jambes & Fessiers",cat_arms:"Bras",cat_core:"Abdominaux",m1:"Janvier",m2:"Février",m3:"Mars",m4:"Avril",m5:"Mai",m6:"Juin",m7:"Juillet",m8:"Août",m9:"Septembre",m10:"Octobre",m11:"Novembre",m12:"Décembre",d_mo:"Lu",d_tu:"Ma",d_we:"Me",d_th:"Je",d_fr:"Ve",d_sa:"Sa",d_su:"Di"},j={en:H,fr:yt},wt=Object.keys(j);let E="en";function ie(e){return E=j[e]?e:"en",localStorage.setItem("lifttrack_lang",E),document.documentElement.lang=E,E}function Te(){return E}function $t(){const e=localStorage.getItem("lifttrack_lang");if(e&&j[e])return ie(e);const t=(navigator.language||"en").slice(0,2);return ie(j[t]?t:"en")}function i(e,t){let n=(j[E]||H)[e];return n===void 0&&(n=H[e]),n===void 0?e:t?n.replace(/\{(\w+)\}/g,(a,r)=>r in t?String(t[r]):a):n}function pe(e){return(j[E]||H)[`f_${e}`]||e}function q(e){return new Date(`${e}T12:00:00`).toLocaleDateString(E==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"})}function je(e){return new Date(`${e}-01T12:00:00`).toLocaleDateString(E==="fr"?"fr-FR":"en-GB",{month:"long",year:"numeric"})}const xe={tap:8,select:12,success:[14,40,22],warning:[22,60,22],error:[40,70,40],complete:[10,30,10,30,40]};let De=!0,T=!0,I=null;function Pe(e){De=!!e}function Le(e){T=!!e}function kt(){return typeof navigator<"u"&&typeof navigator.vibrate=="function"}function _(e="tap"){if(!De||!kt())return;const t=xe[e]??xe.tap;try{navigator.vibrate(t)}catch{}}function Fe(){if(!T)return null;const e=window.AudioContext||window.webkitAudioContext;return e?(I||(I=new e),I.state==="suspended"&&I.resume().catch(()=>{}),I):null}function M(e,t=.12,{type:s="sine",gain:n=.14,delay:a=0}={}){const r=Fe();if(!r)return;const l=r.createOscillator(),u=r.createGain(),c=r.currentTime+a;l.type=s,l.frequency.setValueAtTime(e,c),u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(n,c+.012),u.gain.exponentialRampToValueAtTime(1e-4,c+t),l.connect(u).connect(r.destination),l.start(c),l.stop(c+t+.02)}const U={setComplete(){T&&M(880,.09,{gain:.1})},restOver(){T&&(M(660,.16,{type:"triangle",gain:.18}),M(990,.22,{type:"triangle",gain:.18,delay:.18}))},personalRecord(){T&&[523.25,659.25,783.99,1046.5].forEach((e,t)=>M(e,.18,{type:"triangle",gain:.15,delay:t*.085}))},saved(){T&&(M(587.33,.11,{gain:.12}),M(880,.16,{gain:.12,delay:.1}))}};function z(e){switch(e){case"setComplete":_("success"),U.setComplete();break;case"restOver":_("complete"),U.restOver();break;case"pr":_("complete"),U.personalRecord();break;case"saved":_("success"),U.saved();break;case"error":_("error");break;default:_("tap")}}function St(){const e=()=>{Fe(),window.removeEventListener("pointerdown",e),window.removeEventListener("keydown",e)};window.addEventListener("pointerdown",e,{once:!0}),window.addEventListener("keydown",e,{once:!0})}const oe=new Map,Be=new Map,Ct=new Map;function p(e,t){oe.set(e,t)}function Z(e,t){Be.set(e,t)}const Et=new Set(["set:toggle","set:input","workout:save"]);function Rt(e=document){e.addEventListener("click",t=>{const s=t.target.closest("[data-action]");if(!s)return;const n=s.dataset.action,a=oe.get(n);a&&(t.preventDefault(),Et.has(n)||_("tap"),a(s.dataset,t,s))},!1),e.addEventListener("input",t=>{const s=t.target.closest("[data-input]");if(!s)return;const n=Be.get(s.dataset.input);n&&n(s.value,s.dataset,s)}),e.addEventListener("change",t=>{const s=t.target.closest("[data-change]");if(!s)return;const n=Ct.get(s.dataset.change);n&&n(s.value,s.dataset,s)}),e.addEventListener("keydown",t=>{if(t.key!=="Enter")return;const s=t.target.closest("[data-enter]");if(!s)return;const n=oe.get(s.dataset.enter);n&&(t.preventDefault(),n(s.dataset,t,s))})}function m(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const At={log:'<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z"/><path d="M9.5 9h5"/>',plan:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none"/>',muscles:'<path d="M4 9.5v5M7 7.5v9M17 7.5v9M20 9.5v5"/><path d="M7 12h10"/>',stats:'<path d="M4 19.5h16"/><path d="M7 19.5v-6M12 19.5V7M17 19.5v-9"/>',plus:'<path d="M12 5.5v13M5.5 12h13"/>',settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',close:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',chevronRight:'<path d="M9.5 5.5 16 12l-6.5 6.5"/>',chevronLeft:'<path d="M14.5 5.5 8 12l6.5 6.5"/>',chevronDown:'<path d="M5.5 9.5 12 16l6.5-6.5"/>',chevronUp:'<path d="M5.5 14.5 12 8l6.5 6.5"/>',trash:'<path d="M4.5 7h15M9.5 7V4.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V7"/><path d="M6.5 7l.9 12.3a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/><path d="M10.5 11v6M13.5 11v6"/>',edit:'<path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z"/><path d="M14.5 6.5l3 3"/>',copy:'<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r="1.05" fill="currentColor" stroke="none"/>',timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.8M9.5 2.5h5"/>',flame:'<path d="M12 3s5.5 4.2 5.5 9.2a5.5 5.5 0 1 1-11 0C6.5 9.6 8 8 8 8s.6 2 2 2.6C10.6 8.4 12 6.4 12 3Z"/>',trophy:'<path d="M7.5 4.5h9v4.2a4.5 4.5 0 1 1-9 0V4.5Z"/><path d="M7.5 6H5.2a2.2 2.2 0 0 0 2.3 3M16.5 6h2.3a2.2 2.2 0 0 1-2.3 3"/><path d="M12 13.2v3.3M9 20h6M10 16.5h4l.6 3.5h-5.2l.6-3.5Z"/>',arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',drag:'<circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none"/>',swap:'<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>',user:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0"/>',download:'<path d="M12 4v10M7.5 10l4.5 4.5 4.5-4.5M4.5 19.5h15"/>',upload:'<path d="M12 15.5v-10M7.5 9.5 12 5l4.5 4.5M4.5 19.5h15"/>',bolt:'<path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.5h-5L13.5 3Z"/>'};function d(e,t={}){const s=At[e];if(!s)return"";const{size:n=24,stroke:a=1.75,className:r=""}=t;return`<svg class="icon ${r}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${s}</svg>`}const qt={Push:"--focus-push",Pull:"--focus-pull",Legs:"--focus-legs",Upper:"--focus-upper"};function Mt(e){let t=0;for(let s=0;s<e.length;s+=1)t=t*31+e.charCodeAt(s)|0;return Math.abs(t)%360}function k(e){const t=qt[e];return t?`var(${t})`:`hsl(${Mt(String(e||""))} 62% 66%)`}const Tt={"barbell bench press":{min:5,max:8,inc:2.5,sets:4},"dumbbell flat press":{min:8,max:12,inc:2,sets:4},"dumbbell incline press":{min:8,max:12,inc:2,sets:3},"dumbbell overhead press":{min:6,max:10,inc:2,sets:3},"barbell overhead press":{min:6,max:10,inc:2.5,sets:3},"lat pulldown machine":{min:8,max:12,inc:2.5,sets:4},"seated row machine":{min:8,max:12,inc:2.5,sets:4},"assisted dip machine":{min:10,max:15,inc:5,sets:3},"leg press machine":{min:10,max:15,inc:5,sets:4},"plate-loaded leg press":{min:10,max:15,inc:5,sets:4},"leg curl machine":{min:10,max:15,inc:2.5,sets:3},"leg extension machine":{min:10,max:15,inc:2.5,sets:3},"dumbbell bulgarian split squat":{min:8,max:12,inc:2,sets:3},"barbell back squat":{min:5,max:8,inc:2.5,sets:4},"plate-loaded hip thrust":{min:12,max:20,inc:5,sets:3},"barbell romanian deadlift":{min:8,max:12,inc:2.5,sets:3},"barbell curl":{min:10,max:15,inc:1.25,sets:3},"biceps curl machine":{min:10,max:15,inc:2.5,sets:3},"dumbbell curl":{min:10,max:15,inc:1,sets:3},"dumbbell hammer curl":{min:10,max:15,inc:1,sets:3},"cable triceps pushdown":{min:12,max:15,inc:1,sets:3},"cable overhead triceps extension":{min:12,max:15,inc:1,sets:3},"dumbbell overhead triceps extension":{min:12,max:15,inc:1,sets:3},"cable lateral raise":{min:12,max:20,inc:.5,sets:3},"dumbbell lateral raise":{min:12,max:20,inc:.5,sets:3},"rear delt machine":{min:15,max:20,inc:2.5,sets:3},"cable face pull":{min:15,max:20,inc:1,sets:3},"pec deck":{min:10,max:14,inc:3.5,sets:3},"dumbbell fly":{min:10,max:14,inc:2,sets:3},"cable straight-arm pulldown":{min:10,max:15,inc:1,sets:3},"standing calf raise machine":{min:15,max:25,inc:5,sets:3},"standing calf raise":{min:15,max:25,inc:5,sets:3}},jt={min:8,max:12,inc:2.5,sets:3};function Ie(e){return Tt[String(e||"").toLowerCase()]||jt}function Oe(e,t){if(!t?.length)return null;const s=Ie(e),n=t.map(u=>({r:Number(u.r),w:Number(u.w)})).filter(u=>u.r>0&&Number.isFinite(u.w)&&u.w>0);if(!n.length)return null;const a=Math.max(...n.map(u=>u.w)),r=n.reduce((u,c)=>u+c.r,0)/n.length,l=n.length;return n.every(u=>u.r>=s.max)?{type:"increase",reason:`Hit ${s.max}+ on every set`,sets:l,reps:s.min,weight:Dt(a+s.inc)}:n.every(u=>u.r>=s.min)?{type:"progress",reason:`Averaged ${Math.round(r)} reps`,sets:l,reps:Math.min(Math.round(r)+1,s.max),weight:a}:{type:"consolidate",reason:`Averaged ${Math.round(r)}, target ${s.min}+`,sets:l,reps:s.min,weight:a}}function Dt(e){return Math.round(e*100)/100}function Pt(e,t){const s=Number(e),n=Number(t);return!(s>0)||!(n>0)?0:Math.round(s*(1+n/30)*10)/10}const le=864e5;function me(e){return new Date(`${e}T12:00:00`)}function ze(e){return Math.floor((Date.now()-me(e).getTime())/le)}function L(e){return e.exercises.reduce((t,s)=>t+s.sets.reduce((n,a)=>n+Number(a.r||0)*Math.max(Number(a.w||0),0),0),0)}function Ne(e){return e.reduce((t,s)=>t+L(s),0)}function V(e){const t=new Date(e);return t.setHours(12,0,0,0),t.setDate(t.getDate()-(t.getDay()+6)%7),t}function Lt(e){const t=V(new Date).getTime();return e.filter(s=>me(s.date).getTime()>=t).length}function Ue(e){if(!e.length)return 0;const t=new Set(e.map(r=>V(me(r.date)).getTime())),s=V(new Date).getTime();let n=t.has(s)?s:s-7*le;if(!t.has(n))return 0;let a=0;for(;t.has(n);)a+=1,n-=7*le;return a}function Q(e,t,s){const n=t.exercises.find(l=>l.name===s);if(!n?.sets?.length)return!1;const a=Math.max(...n.sets.map(l=>Number(l.w)||0));if(!(a>0))return!1;const r=e.filter(l=>l.date<t.date||l.date===t.date&&l.id!==t.id).flatMap(l=>l.exercises.filter(u=>u.name===s)).flatMap(l=>l.sets.map(u=>Number(u.w)||0));return r.length?a>Math.max(...r):!1}function Ft(e){let t=0;return e.forEach(s=>{s.exercises.forEach(n=>{Q(e,s,n.name)&&(t+=1)})}),t}function Bt(e,t=2){const s=new Map;return e.forEach(n=>n.exercises.forEach(a=>s.set(a.name,(s.get(a.name)||0)+1))),[...s.entries()].filter(([,n])=>n>=t).sort((n,a)=>a[1]-n[1]).map(([n])=>n)}function It(e,t){return e.filter(s=>s.exercises.some(n=>n.name===t)).map(s=>{const n=s.exercises.find(r=>r.name===t),a=n.sets.filter(r=>Number(r.w)>0&&Number(r.r)>0);return{date:s.date,topWeight:Math.max(...n.sets.map(r=>Number(r.w)||0)),volume:Math.round(n.sets.reduce((r,l)=>r+Number(l.r||0)*Math.max(Number(l.w||0),0),0)),best1RM:a.length?Math.max(...a.map(r=>Pt(r.w,r.r))):0}})}function Ot(e){const t=["Push","Pull","Legs"];if(!e.length)return{focus:"Push",reason:"First session"};const s=e[e.length-1],n=ze(s.date);if(t.includes(s.focus))return{focus:t[(t.indexOf(s.focus)+1)%t.length],reason:`${s.focus} was ${n}d ago`};const a={};return e.forEach(l=>{t.includes(l.focus)&&(a[l.focus]=l.date)}),{focus:[...t].sort((l,u)=>(a[l]||"0").localeCompare(a[u]||"0"))[0],reason:"Least recently trained"}}function zt(e){const t=new Map;return e.forEach(s=>{const n=s.date.slice(0,7);t.has(n)||t.set(n,[]),t.get(n).push(s)}),t}const Nt=36e5,Ut=864e5,y=[{id:"chest",label:"Chest",short:"Chest",color:"var(--focus-push)",muscles:["Chest","Upper Chest","Lower Chest"]},{id:"back",label:"Back",short:"Back",color:"var(--focus-pull)",muscles:["Lats","Upper Back","Mid Back","Rhomboids","Upper Traps","Mid Traps","Mid/Lower Traps","Spinal Erectors"]},{id:"shoulders",label:"Shoulders",short:"Delts",color:"var(--gold)",muscles:["Front Delts","Side Delts","Rear Delts","Rotator Cuff"]},{id:"arms",label:"Arms",short:"Arms",color:"var(--focus-upper)",muscles:["Biceps","Brachialis","Triceps","Triceps Long Head","Other Triceps Heads","Forearms","Brachioradialis"]},{id:"core",label:"Core",short:"Core",color:"var(--warning)",muscles:["Abs","Obliques","Deep Core","Hip Flexors","Serratus"]},{id:"legs",label:"Legs & Glutes",short:"Legs",color:"var(--focus-legs)",muscles:["Quads","Hamstrings","Glutes","Adductors","Calves","Gastrocnemius","Soleus"]}],Gt={chest:48,back:54,shoulders:40,arms:36,core:30,legs:60},Ge={chest:{maintenance:6,min:10,max:20},back:{maintenance:8,min:12,max:22},shoulders:{maintenance:6,min:10,max:20},arms:{maintenance:4,min:8,max:18},core:{maintenance:4,min:6,max:16},legs:{maintenance:6,min:10,max:20}},He=new Map;y.forEach(e=>{e.muscles.forEach(t=>He.set(t.toLowerCase(),e.id))});const Ve=new Map,We=new Map;ce.forEach(e=>{Ve.set(e.name.toLowerCase(),e),(e.aliases||[]).forEach(t=>We.set(t.toLowerCase(),e))});function Ye(e){if(!e)return null;const t=String(e).toLowerCase().trim();return Ve.get(t)||We.get(t)||null}function Ht(e){const t=Ye(e);return t?.muscles?.length?Object.fromEntries(t.muscles.map(s=>[s.name,s.score])):{}}function Je(e){const t={};return e.exercises.forEach(s=>{const n=Ht(s.name),a=s.sets.length;a&&Object.entries(n).forEach(([r,l])=>{const u=He.get(r.toLowerCase());u&&(t[u]=(t[u]||0)+a*(l/5))})}),t}function Ke(e,t=7){const s=Date.now()-t*Ut,n=Object.fromEntries(y.map(a=>[a.id,0]));return e.forEach(a=>{new Date(`${a.date}T12:00:00`).getTime()<s||Object.entries(Je(a)).forEach(([r,l])=>{n[r]+=l})}),n}function be(e,t){const s=Ge[e];return!s||t<=0?"none":t<s.maintenance||t<s.min?"low":t<=s.max?"optimal":"high"}function ge(e){return Ge[e]||{maintenance:6,min:10,max:20}}function Vt(e,t=Date.now()){const s=Object.fromEntries(y.map(n=>[n.id,0]));return e.forEach(n=>{const a=new Date(`${n.date}T18:00:00`).getTime(),r=(t-a)/Nt;r<0||r>336||Object.entries(Je(n)).forEach(([l,u])=>{const c=Gt[l]||48,b=Math.pow(.5,r/c),h=ge(l).max/3;s[l]+=u/h*b})}),Object.keys(s).forEach(n=>{s[n]=1-Math.exp(-s[n])}),s}function Ze(e,t=Date.now()){const s=Vt(e,t);return Object.fromEntries(Object.entries(s).map(([n,a])=>[n,1-a]))}function Wt(e,t=Date.now()){const s=Ze(e,t),n=Ke(e,7);return y.map(a=>{const r=s[a.id],l=n[a.id],u=ge(a.id),c=Math.max(0,Math.min(1,(u.min-l)/u.min)),b=r*.65+c*.35;return{...a,readiness:r,sets:Math.round(l*10)/10,target:u,status:be(a.id,l),score:b}}).sort((a,r)=>r.score-a.score)}function Yt(e){return e>=.9?"fresh":e>=.7?"ready":e>=.45?"recovering":e>=.2?"fatigued":"cooked"}function _e(e){const t=e/1e3;return t>=100?String(Math.round(t)):(t>=10,t.toFixed(1))}function G(e,t,s="",n=""){return`
    <div class="metric ${n}">
      <div class="metric-label">${e}</div>
      <div class="metric-value">${t}${s?`<span class="metric-unit">${s}</span>`:""}</div>
    </div>`}function Jt(){return o.backupDue?`
    <div class="ledger-row" style="--spine-color:var(--warning);border-top:1px solid
         color-mix(in srgb, var(--warning) 35%, transparent);
         border-bottom-color:color-mix(in srgb, var(--warning) 35%, transparent);
         background:color-mix(in srgb, var(--warning) 8%, transparent)">
      <span class="ledger-spine"></span>
      <span class="ledger-main">
        <span class="eyebrow" style="display:block;color:var(--warning)">${i("backup_due")}</span>
        <span class="ledger-sub" style="white-space:normal">${i("backup_due_body")}</span>
      </span>
      <button class="btn btn--sm btn--secondary" data-action="data:export">${i("back_up")}</button>
      <button class="icon-btn" data-action="backup:dismiss" aria-label="${i("close")}"
              style="width:34px;height:34px">
        ${d("close",{size:16})}
      </button>
    </div>`:""}function Kt(){const e=o.workout;if(!e)return"";const t=e.exercises.reduce((n,a)=>n+a.sets.filter(r=>r.done).length,0),s=e.exercises.reduce((n,a)=>n+a.sets.length,0);return`
    <button class="ledger-row" data-action="workout:resume"
            style="--spine-color:var(--gold);border-top:1px solid var(--line-gold);
                   border-bottom-color:var(--line-gold);background:var(--gold-wash)">
      <span class="ledger-spine"></span>
      <span class="ledger-main">
        <span class="eyebrow" style="display:block">${i("workout_in_progress")}</span>
        <span class="ledger-title" style="color:var(--gold);margin-top:2px">
          ${m(pe(e.focus))} · ${t}/${s} ${i("sets")}
        </span>
      </span>
      <span style="color:var(--gold)">${d("chevronRight",{size:20})}</span>
    </button>`}function Zt(){if(o.workout)return"";const e=Ot(o.sessions),t=k(e.focus),s=o.sessions.at(-1);return`
    <section class="hero bleed" style="--hero-color:${t}">
      <p class="eyebrow">${i("next_up")}</p>
      <h2 class="hero-title">${m(pe(e.focus))}</h2>
      <div class="hero-meta">
        <span>${m(e.reason)}</span>
        ${s?`<span style="color:var(--text-faint)">·</span>
                  <span style="color:var(--text-tertiary)">${ze(s.date)}${i("rest")}</span>`:""}
      </div>
      <button class="btn btn--primary btn--block" data-action="workout:start"
              data-focus="${m(e.focus)}" style="margin-top:var(--space-4)">
        ${d("bolt",{size:17})} ${i("start_workout")}
      </button>
    </section>`}function Qt(){const e=["d_mo","d_tu","d_we","d_th","d_fr","d_sa","d_su"],t=V(new Date),s=new Date().toISOString().slice(0,10),n=new Map;return o.sessions.forEach(r=>n.set(r.date,r)),`
    <div class="week-strip">
      ${Array.from({length:7},(r,l)=>{const u=new Date(t);u.setDate(u.getDate()+l);const c=`${u.getFullYear()}-${String(u.getMonth()+1).padStart(2,"0")}-${String(u.getDate()).padStart(2,"0")}`;return{iso:c,day:u.getDate(),session:n.get(c),isToday:c===s}}).map((r,l)=>`
        <div class="week-day">
          <span class="week-day-label">${i(e[l])}</span>
          <span class="week-day-cell ${r.session?"is-trained":""} ${r.isToday&&!r.session?"is-today":""}"
                ${r.session?`style="--day-color:${k(r.session.focus)}"`:""}>
            ${r.session?d("check",{size:14,stroke:3}):r.day}
          </span>
        </div>`).join("")}
    </div>`}function Xt(){const e=o.sessions.slice(-14);if(e.length<3)return"";const t=e.map(L),s=Math.max(...t,1),n=100,a=30,r=t.map((h,v)=>[v/(t.length-1)*n,a-2-h/s*(a-4)]),l=r.map(([h,v],S)=>`${S?"L":"M"}${h.toFixed(2)},${v.toFixed(2)}`).join(" "),u=`${l} L${n},${a} L0,${a} Z`,[c,b]=r.at(-1);return`
    <svg class="spark" viewBox="0 0 ${n} ${a}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${u}" fill="url(#spark-fade)"/>
      <path d="${l}" fill="none" stroke="var(--gold)" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${c.toFixed(2)}" cy="${b.toFixed(2)}" r="2" fill="var(--gold)"
              vector-effect="non-scaling-stroke"/>
    </svg>`}function es(){if(o.sessions.length<2)return"";const e=Ze(o.sessions);return`
    <button class="readiness-rail" data-action="nav:tab" data-tab="muscles"
            style="width:100%;text-align:inherit">
      ${y.map(s=>({...s,readiness:e[s.id]??1})).map(s=>{const n=Math.round(s.readiness*100);return`
          <span class="readiness-col" style="--gauge-color:${s.readiness>=.7?"var(--plate-green)":s.readiness>=.45?"var(--plate-yellow)":"var(--plate-red)"}">
            <span class="readiness-pct">${n}</span>
            <span class="readiness-gauge">
              <span class="readiness-fill" style="height:${n}%"></span>
            </span>
            <span class="readiness-name">${m(s.short||s.label)}</span>
          </span>`}).join("")}
    </button>`}function ts(e){const t=k(e.focus),s=o.expandedSessionId===e.id,n=Math.round(L(e)),a=e.exercises.some(r=>Q(o.sessions,e,r.name));return`
    <article>
      <button class="ledger-row ledger-row--tall" data-action="session:toggle" data-id="${e.id}"
              style="--spine-color:${t}">
        <span class="ledger-spine"></span>
        <span class="ledger-main">
          <span style="display:flex;align-items:center;gap:var(--space-2)">
            <span class="figure figure--sm" style="color:${t}">
              ${m(pe(e.focus))}
            </span>
            ${a?`<span class="pr-badge">${d("trophy",{size:10,stroke:2.4})} ${i("new_pr")}</span>`:""}
          </span>
          <span class="ledger-sub">${e.exercises.length} ${i("exercises_lbl")}</span>
        </span>
        <span class="ledger-trail">
          <span class="eyebrow" style="display:block">${q(e.date)}</span>
          <span class="figure figure--sm" style="color:var(--text-secondary);margin-top:3px;display:block">
            ${(n/1e3).toFixed(1)}<span class="figure-unit">k</span>
          </span>
        </span>
        <span style="color:var(--text-faint);flex:none;
                     transition:transform var(--duration-fast) var(--ease-out);
                     ${s?"transform:rotate(180deg)":""}">
          ${d("chevronDown",{size:18})}
        </span>
      </button>

      ${s?ss(e):""}
    </article>`}function ss(e){return`
    <div style="padding:0 0 var(--space-4) var(--space-5);
                border-bottom:1px solid var(--line-subtle);background:var(--surface-sunken)">
      <div style="padding-top:var(--space-3)">
        ${e.exercises.map(t=>{const s=Q(o.sessions,e,t.name);return`
              <div class="row gap-2" style="padding:var(--space-2) 0;border-bottom:1px solid var(--line-subtle)">
                <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:600;
                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${m(t.name)}
                  ${s?`<span style="color:var(--gold);margin-left:4px">${d("trophy",{size:12,stroke:2.2})}</span>`:""}
                </span>
                <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-tertiary)">
                  ${t.sets.map(n=>`${n.r}×${n.w}`).join("  ")}
                </span>
              </div>`}).join("")}
      </div>

      <div class="row gap-2" style="margin-top:var(--space-3);flex-wrap:wrap">
        <button class="btn btn--sm btn--secondary" data-action="session:repeat" data-id="${e.id}">
          ${d("copy",{size:15})} ${i("use_as_template")}
        </button>
        <button class="btn btn--sm btn--secondary" data-action="session:edit" data-id="${e.id}">
          ${d("edit",{size:15})} ${i("edit")}
        </button>
        <button class="btn btn--sm btn--danger" data-action="session:delete" data-id="${e.id}">
          ${d("trash",{size:15})} ${i("delete")}
        </button>
      </div>
    </div>`}function ns(){const{sessions:e}=o;e.at(-1);const t=`
    <h1 class="screen-title">LIFT<em>TRACK</em></h1>
    <div class="header-spacer"></div>
    <button class="icon-btn" data-action="settings:open" aria-label="${i("settings")}">
      ${d("settings",{size:21})}
    </button>`;if(!e.length&&!o.workout)return{header:t,body:`
        <div class="empty">
          <div class="empty-icon">${d("muscles",{size:32})}</div>
          <h2 class="empty-title">${i("onboard_title")}</h2>
          <p class="empty-body">${i("onboard_sub")}</p>
          <button class="btn btn--primary" data-action="workout:start" data-focus="Push">
            ${d("bolt",{size:18})} ${i("onboard_cta")}
          </button>
        </div>`};const s=zt(e),n=[...s.keys()].sort().reverse();return{header:t,body:`
      ${Jt()}
      ${Kt()}
      ${Zt()}

      <div class="metric-strip">
        ${G(i("sessions"),e.length,"","metric--gold")}
        ${G(i("volume"),_e(Ne(e)),"t","metric--info")}
        ${G(i("week_short"),Lt(e))}
        ${G(i("streak"),Ue(e),i("streak_unit"),"metric--positive")}
      </div>

      <h2 class="section-label">${i("this_week")}</h2>
      ${Qt()}

      ${e.length>=3?`<h2 class="section-label">
             ${i("vol_per_session")}
             <span class="count">${_e(L(e.at(-1)))}t</span>
           </h2>
           ${Xt()}`:""}

      ${e.length>=2?`<h2 class="section-label">${i("recovery_status")}</h2>
           ${es()}`:""}

      <section>
        ${n.map(a=>`
              <h2 class="section-label">
                ${je(a)}
                <span class="count">${s.get(a).length}</span>
              </h2>
              ${[...s.get(a)].reverse().map(ts).join("")}`).join("")}
      </section>`}}const W=e=>!!e.done,as=e=>Number(e.r)>0&&e.w!==""&&e.w!=null;function rs(e){return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function is(e){const t=Math.max(0,Math.floor((Date.now()-e)/1e3)),s=Math.floor(t/60),n=Math.floor(s/60);return n>0?`${n}:${String(s%60).padStart(2,"0")}`:`${s}:${String(t%60).padStart(2,"0")}`}function os(e,t){const n=2*Math.PI*12,a=t?e/t:0,r=n*(1-a);return`
    <div class="exercise-progress">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle class="exercise-progress-track" cx="15" cy="15" r="12" fill="none" stroke-width="2.5"/>
        <circle class="exercise-progress-fill" cx="15" cy="15" r="12" fill="none" stroke-width="2.5"
                stroke-linecap="round"
                stroke-dasharray="${n.toFixed(2)}"
                stroke-dashoffset="${r.toFixed(2)}"/>
      </svg>
      <div class="exercise-progress-text">${e}/${t}</div>
    </div>`}function ls(e,t,s){const n=W(s);return`
    <div class="set-row ${n?"is-done":""}">
      <div class="set-index">${t+1}</div>

      <div class="set-field">
        <input class="set-input"
               type="text"
               inputmode="numeric"
               pattern="[0-9]*"
               value="${m(s.r??"")}"
               placeholder="—"
               aria-label="${i("reps")} ${t+1}"
               data-input="set:reps" data-ex="${e}" data-set="${t}">
        <span class="set-unit">${i("reps_short")}</span>
      </div>

      <div class="set-field">
        <input class="set-input"
               type="text"
               inputmode="decimal"
               value="${m(s.w??"")}"
               placeholder="—"
               aria-label="${i("weight")} ${t+1}"
               data-input="set:weight" data-ex="${e}" data-set="${t}">
        <span class="set-unit">${o.settings.units}</span>
      </div>

      <button class="set-check ${n?"is-done":""}"
              data-action="set:toggle" data-ex="${e}" data-set="${t}"
              aria-pressed="${n}"
              aria-label="${i(n?"set_done":"mark_set_done")}">
        ${d("check",{size:20,stroke:2.4})}
      </button>
    </div>`}function us(e,t){const s=[...o.sessions].reverse().find(u=>u.exercises.some(c=>c.name===e));if(!s)return"";const n=s.exercises.find(u=>u.name===e)?.sets||[];if(!n.length)return"";const a=Oe(e,n),r=o.settings.units,l=n.map(u=>`${u.r}×${u.w}`).join("  ");return`
    <div class="suggestion">
      <span class="suggestion-icon">
        ${d(a?.type==="increase"?"arrowUp":"timer",{size:20})}
      </span>
      <div class="suggestion-text">
        <div class="suggestion-label">${i("last_time")} · ${q(s.date)}</div>
        <div class="suggestion-value">${m(l)}</div>
      </div>
      ${a?`<button class="btn btn--sm btn--secondary"
                   data-action="suggestion:apply" data-ex="${t}"
                   data-sets="${a.sets}" data-reps="${a.reps}" data-weight="${a.weight}"
                   title="${a.sets}×${a.reps} @ ${a.weight}${r}">
             ${a.sets}×${a.reps}
           </button>`:""}
    </div>`}function cs(e,t){const s=e.sets.length,n=e.sets.filter(W).length;return`
    <article class="exercise-card ${s>0&&n===s?"is-complete":""}">
      <header class="exercise-head">
        ${os(n,s)}
        <h3 class="exercise-name">${m(e.name||i("unnamed_exercise"))}</h3>
        <button class="icon-btn" data-action="exercise:info" data-name="${m(e.name)}"
                aria-label="${i("exercise_info")}">
          ${d("info",{size:20})}
        </button>
        <button class="icon-btn icon-btn--danger" data-action="exercise:remove" data-ex="${t}"
                aria-label="${i("remove_exercise")}">
          ${d("close",{size:20})}
        </button>
      </header>

      <div class="exercise-body">
        ${us(e.name,t)}
        ${e.sets.map((r,l)=>ls(t,l,r)).join("")}
        <button class="btn btn--sm btn--ghost btn--block" data-action="set:add" data-ex="${t}"
                style="margin-top:var(--space-2)">
          ${d("plus",{size:16})} ${i("add_set")}
        </button>
      </div>
    </article>`}function ds(){const{restEndsAt:e,restDuration:t}=o;if(!e)return`
      <div class="rest-bar">
        <span class="suggestion-icon">${d("timer",{size:20})}</span>
        <span class="metric-label" style="flex:1">${i("rest_timer")}</span>
        <div class="rest-presets">
          ${[60,90,120,180].map(a=>`<button class="rest-preset" data-action="rest:start" data-seconds="${a}">
                        ${rs(a)}
                      </button>`).join("")}
        </div>
      </div>`;const s=Math.max(0,Math.ceil((e-Date.now())/1e3)),n=t?s/t*100:0;return`
    <div class="rest-bar">
      <span class="rest-time" id="rest-remaining">
        ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}
      </span>
      <div class="rest-track">
        <div class="rest-fill" id="rest-fill" style="width:${n}%"></div>
      </div>
      <button class="btn btn--sm btn--ghost" data-action="rest:cancel">${i("skip")}</button>
    </div>`}function ps(){const e=o.workout,t=k(e.focus),s=e.exercises.reduce((r,l)=>r+l.sets.length,0),n=e.exercises.reduce((r,l)=>r+l.sets.filter(W).length,0),a=e.exercises.reduce((r,l)=>r+l.sets.filter(u=>W(u)&&as(u)).reduce((u,c)=>u+Number(c.r)*Math.max(Number(c.w),0),0),0);return{header:`
      <button class="icon-btn" data-action="workout:leave" aria-label="${i("close")}">
        ${d("chevronDown",{size:22})}
      </button>
      <div style="flex:1;min-width:0">
        <h1 class="screen-title" style="font-size:var(--text-xl)">
          <span style="color:${t}">${m(e.focus)}</span>
        </h1>
        <div class="metric-label" style="margin-top:2px">
          <span id="workout-elapsed">${is(e.startedAt)}</span> ·
          ${n}/${s} ${i("sets")} · ${Math.round(a)}${o.settings.units}
        </div>
      </div>
      <button class="btn btn--sm btn--primary" data-action="workout:save">${i("finish")}</button>
    `,body:`
      ${e.exercises.length?e.exercises.map(cs).join(""):`<div class="empty">
             <div class="empty-icon">${d("muscles",{size:30})}</div>
             <h2 class="empty-title">${i("no_exercises_yet")}</h2>
             <p class="empty-body">${i("no_exercises_body")}</p>
           </div>`}

      <button class="btn btn--secondary btn--block" data-action="exercise:browse"
              style="margin-top:var(--space-4)">
        ${d("plus",{size:18})} ${i("add_exercise")}
      </button>
    `,footer:ds()}}const ye=["var(--gold)","var(--focus-pull)","var(--focus-legs)","var(--focus-upper)","var(--focus-push)"];function ms(e){const t=[...e].reduce((s,n)=>s+n.charCodeAt(0),0);return ye[t%ye.length]}function bs(e){return e.trim().split(/\s+/).map(t=>t[0]).join("").toUpperCase().slice(0,2)}function gs(){const{users:e}=o;return`
    <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
                padding:calc(var(--safe-top) + var(--space-16)) var(--space-5)
                        calc(var(--safe-bottom) + var(--space-10))">

      <div style="text-align:center;margin-bottom:var(--space-12)">
        <div style="font-family:var(--font-display);font-size:var(--text-4xl);line-height:1;
                    letter-spacing:var(--tracking-wider);color:var(--text-primary)">
          LIFT<span style="color:var(--gold)">TRACK</span>
        </div>
        <div style="margin-top:var(--space-3);font-size:var(--text-xs);font-weight:700;
                    letter-spacing:var(--tracking-widest);text-transform:uppercase;
                    color:var(--text-tertiary)">
          Track · Progress · Repeat
        </div>
      </div>

      <div style="width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;gap:var(--space-2)">
        ${e.length?`<h2 class="section-label">${i("whos_training")}</h2>
             ${e.map(hs).join("")}
             <div style="height:1px;background:var(--line-subtle);margin:var(--space-4) 0"></div>`:""}

        <h2 class="section-label">${e.length?i("new_profile"):i("create_profile")}</h2>

        <input class="text-input"
               id="profile-name"
               placeholder="${i("your_name")}"
               autocomplete="given-name"
               data-input="profile:name"
               data-enter="profile:create"
               aria-label="${i("your_name")}">

        <button class="btn btn--primary btn--block" data-action="profile:create"
                style="margin-top:var(--space-2)">
          ${i("get_started")} ${d("arrowRight",{size:18})}
        </button>
      </div>
    </div>`}function hs(e){const t=ms(e.id);return`
    <button class="card card--interactive" data-action="profile:select" data-id="${e.id}"
            style="display:flex;align-items:center;gap:var(--space-4);width:100%;text-align:left">
      <span style="width:44px;height:44px;border-radius:var(--radius-pill);flex:none;
                   display:grid;place-items:center;
                   background:color-mix(in srgb, ${t} 18%, transparent);
                   border:1.5px solid color-mix(in srgb, ${t} 55%, transparent);
                   font-family:var(--font-display);font-size:var(--text-md);
                   letter-spacing:0.04em;color:${t}">
        ${m(bs(e.name))}
      </span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:var(--text-md);font-weight:700;
                     overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${m(e.name)}
        </span>
        <span class="metric-label" style="display:block;margin-top:1px">${i("continue_")}</span>
      </span>
      <span style="color:var(--text-faint)">${d("chevronRight",{size:20})}</span>
    </button>`}const we=["recovery","volume","library"];function Qe(e){return e>=.9||e>=.7?"var(--plate-green)":e>=.45?"var(--plate-yellow)":(e>=.2,"var(--plate-red)")}function vs(e){const t=Math.round(e.readiness*100),s=Qe(e.readiness),n=Yt(e.readiness);return`
    <button class="ledger-row" data-action="muscle:open" data-group="${e.id}"
            style="--spine-color:${e.color};align-items:stretch">
      <span class="ledger-spine"></span>
      <span class="ledger-main" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-2)">
        <span style="display:flex;align-items:baseline;gap:var(--space-2)">
          <span class="ledger-title" style="flex:1">${m(e.label)}</span>
          <span class="eyebrow" style="color:${s}">${i(`recovery_${n}`)}</span>
        </span>

        <span class="load-bar" style="display:block">
          <span class="load-bar-fill" style="width:${t}%;--bar-color:${s}"></span>
        </span>

        <span class="ledger-sub">
          ${e.sets} ${i("of")} ${e.target.min}–${e.target.max} ${i("sets_week")}
        </span>
      </span>
      <span class="figure figure--md" style="color:${s};flex:none;align-self:center">
        ${t}<span class="figure-unit">%</span>
      </span>
    </button>`}function fs(){const e=Wt(o.sessions),t=e[0];return`
    ${o.sessions.length?`<section class="hero bleed" style="--hero-color:${t.color}">
           <p class="eyebrow">${i("train_next")}</p>
           <h2 class="hero-title">${m(t.label)}</h2>
           <div class="hero-meta">
             <span style="color:${Qe(t.readiness)}">
               ${Math.round(t.readiness*100)}% ${i("recovered")}
             </span>
             <span style="color:var(--text-faint)">·</span>
             <span>${t.status==="low"||t.status==="none"?i("volume_behind"):i("volume_on_track")}</span>
           </div>
         </section>`:""}

    <h2 class="section-label">${i("recovery_status")}</h2>
    ${e.map(vs).join("")}

    <p style="margin-top:var(--space-6);font-size:var(--text-xs);color:var(--text-faint);line-height:1.65">
      ${i("recovery_explainer")}
    </p>`}const xs={none:"var(--text-faint)",low:"var(--warning)",optimal:"var(--positive)",high:"var(--negative)"};function _s(e,t){const s=ge(e.id),n=be(e.id,t),a=xs[n],r=s.max*1.4,l=Math.min(100,t/r*100),u=s.min/r*100,c=s.max/r*100;return`
    <div class="ledger-row" style="--spine-color:${e.color};align-items:stretch">
      <span class="ledger-spine"></span>
      <span class="ledger-main" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-2)">
        <span style="display:flex;align-items:baseline;gap:var(--space-2)">
          <span class="ledger-title" style="flex:1">${m(e.label)}</span>
          <span class="eyebrow" style="color:${a}">${i(`volume_${n}`)}</span>
        </span>

        <span class="load-bar" style="display:block">
          <!-- the productive band, marked out on the bar itself -->
          <span class="load-bar-band"
                style="left:${u}%;width:${c-u}%"></span>
          <span class="load-bar-fill" style="width:${l}%;--bar-color:${a}"></span>
        </span>

        <span class="ledger-sub">
          ${i("target")} ${s.min}–${s.max} ${i("sets_week")}
        </span>
      </span>
      <span class="figure figure--md" style="color:${a};flex:none;align-self:center">
        ${Math.round(t*10)/10}
      </span>
    </div>`}function ys(){const e=Ke(o.sessions,7),t=Object.values(e).reduce((s,n)=>s+n,0);return o.sessions.length?`
    <div class="metric-strip" style="margin-bottom:var(--space-6)">
      <div class="metric metric--gold">
        <div class="metric-label">${i("total_sets")}</div>
        <div class="metric-value">${Math.round(t)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">${i("groups_optimal")}</div>
        <div class="metric-value">
          ${y.filter(s=>be(s.id,e[s.id])==="optimal").length}
          <span class="metric-unit">/ ${y.length}</span>
        </div>
      </div>
    </div>

    <h2 class="section-label">${i("last_7_days")}</h2>
    ${y.map(s=>_s(s,e[s.id])).join("")}`:`
      <div class="empty">
        <div class="empty-icon">${d("stats",{size:30})}</div>
        <h2 class="empty-title">${i("no_data_yet")}</h2>
        <p class="empty-body">${i("volume_empty_body")}</p>
      </div>`}function ws(){const e=(o.libraryQuery||"").toLowerCase().trim(),t=o.libraryGroup||null;let s=ce;if(t){const n=y.find(r=>r.id===t),a=new Set(n.muscles.map(r=>r.toLowerCase()));s=s.filter(r=>(r.muscles||[]).some(l=>a.has(l.name.toLowerCase())))}return e&&(s=s.filter(n=>n.name.toLowerCase().includes(e)||(n.aliases||[]).some(a=>a.toLowerCase().includes(e)))),`
    <input class="text-input" placeholder="${i("search_exercises")}"
           value="${m(o.libraryQuery||"")}"
           data-input="library:search" aria-label="${i("search_exercises")}"
           style="margin-bottom:var(--space-3)">

    <div class="chip-rail">
      <button class="chip" data-action="library:filter" data-group=""
              style="--chip-color:${t?"var(--text-tertiary)":"var(--gold)"};flex:none">
        ${i("all")}
      </button>
      ${y.map(n=>`
        <button class="chip" data-action="library:filter" data-group="${n.id}"
                style="--chip-color:${t===n.id?n.color:"var(--text-tertiary)"};flex:none">
          ${m(n.label)}
        </button>`).join("")}
    </div>

    <div class="metric-label" style="margin-bottom:var(--space-3)">
      ${s.length} ${i("exercises_lbl")}
    </div>

    ${s.length?s.slice(0,80).map(ks).join(""):`<div class="empty"><p class="empty-body">${i("no_results")}</p></div>`}

    ${s.length>80?`<p class="metric-label" style="text-align:center;margin-top:var(--space-4)">
           ${i("showing_first",{n:80})}
         </p>`:""}`}function $s(e){const t={dumbbells:"dbs",plateLoaded:"plate",bodyweight:"body"}[e]||e;return i(`eq_${t}`)}function ks(e){const t=(e.muscles||[]).filter(s=>s.role==="primary").map(s=>s.name);return`
    <button class="ledger-row" data-action="exercise:info" data-name="${m(e.name)}">
      <span class="ledger-main">
        <span class="ledger-title">${m(e.name)}</span>
        <span class="ledger-sub">${m(t.join(" · ")||e.category)}</span>
      </span>
      <span class="eyebrow" style="flex:none">${$s(e.equipment)}</span>
      <span style="color:var(--text-faint);flex:none">${d("chevronRight",{size:17})}</span>
    </button>`}function Ss(){const e=we.includes(o.muscleSubtab)?o.muscleSubtab:"recovery";return{header:`
      <h1 class="screen-title">${i("muscles_title")}</h1>
      <div class="header-spacer"></div>
      <button class="icon-btn" data-action="settings:open" aria-label="${i("settings")}">
        ${d("settings",{size:21})}
      </button>`,body:`
      <div class="segmented segmented--subnav">
        ${we.map(t=>`
          <button class="segmented-option ${e===t?"is-active":""}"
                  data-action="muscle:subtab" data-sub="${t}">
            ${i(`sub_${t}`)}
          </button>`).join("")}
      </div>

      ${e==="recovery"?fs():e==="volume"?ys():ws()}`}}function Cs(e){if(e.length<2)return"";const t=e.slice(-16),s=t.map(L),n=Math.max(...s,1),a=100,r=42,l=1.4,u=(a-l*(t.length-1))/t.length;return`
    <svg viewBox="0 0 ${a} ${r}" preserveAspectRatio="none"
         style="width:100%;height:120px;display:block" role="img"
         aria-label="${i("vol_per_session")}">
      ${t.map((c,b)=>{const h=Math.max(1.5,s[b]/n*(r-2));return`<rect x="${(b*(u+l)).toFixed(2)}" y="${(r-h).toFixed(2)}"
                        width="${u.toFixed(2)}" height="${h.toFixed(2)}"
                        rx="${Math.min(1.2,u/2).toFixed(2)}"
                        fill="${k(c.focus)}" opacity="0.9"/>`}).join("")}
    </svg>`}function Es(e,t="var(--gold)"){if(e.length<2)return"";const s=100,n=40,a=e.map(v=>v.value),r=Math.min(...a),u=Math.max(...a)-r||1,c=e.map((v,S)=>{const F=S/(e.length-1)*s,rt=n-3-(v.value-r)/u*(n-6);return[F,rt]}),b=c.map(([v,S],F)=>`${F?"L":"M"}${v.toFixed(2)},${S.toFixed(2)}`).join(" "),h=`${b} L${s},${n} L0,${n} Z`;return`
    <svg viewBox="0 0 ${s} ${n}" preserveAspectRatio="none"
         style="width:100%;height:110px;display:block">
      <defs>
        <linearGradient id="lc-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${t}" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="${t}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${h}" fill="url(#lc-fade)"/>
      <path d="${b}" fill="none" stroke="${t}" stroke-width="1.2"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${c.map(([v,S],F)=>F===c.length-1?`<circle cx="${v.toFixed(2)}" cy="${S.toFixed(2)}" r="1.8" fill="${t}"/>`:"").join("")}
    </svg>`}function Rs(e){const t=new Map;return e.forEach(n=>t.set(n.focus,(t.get(n.focus)||0)+1)),[...t.entries()].sort((n,a)=>a[1]-n[1]).map(([n,a])=>{const r=Math.round(a/e.length*100),l=k(n);return`
        <div style="margin-bottom:var(--space-3)">
          <div class="row gap-2" style="margin-bottom:var(--space-1)">
            <span style="flex:1;font-size:var(--text-sm);font-weight:700;color:${l}">
              ${m(n)}
            </span>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-secondary)">
              ${a}
            </span>
            <span class="metric-label">${r}%</span>
          </div>
          <div style="height:5px;border-radius:var(--radius-pill);background:var(--surface-sunken);overflow:hidden">
            <div style="height:100%;width:${r}%;background:${l};border-radius:var(--radius-pill)"></div>
          </div>
        </div>`}).join("")}function As(e,t){return`
    <div class="chip-rail">
      ${e.slice(0,20).map(s=>`
          <button class="chip" data-action="stats:exercise" data-name="${m(s)}"
                  style="--chip-color:${s===t?"var(--gold)":"var(--text-tertiary)"};flex:none">
            ${m(s)}
          </button>`).join("")}
    </div>`}function qs(e){const t=It(o.sessions,e);if(t.length<2)return`<p class="empty-body" style="margin:var(--space-6) auto">${i("not_enough_data")}</p>`;const s=o.statsMetric||"best1RM",n=t.map(b=>({value:b[s]||0})),a=n[0].value,r=n.at(-1).value,l=a?Math.round((r-a)/a*100):0,u=l>=0;return`
    <div class="segmented" style="width:100%;display:flex;margin-bottom:var(--space-4)">
      ${[["best1RM",i("est_1rm")],["topWeight",i("max_weight")],["volume",i("session_volume")]].map(([b,h])=>`
        <button class="segmented-option ${s===b?"is-active":""}"
                data-action="stats:metric" data-metric="${b}" style="flex:1;font-size:var(--text-xs)">
          ${h}
        </button>`).join("")}
    </div>

    <div class="card">
      <div class="row gap-3" style="margin-bottom:var(--space-3)">
        <div>
          <div class="metric-label">${i("current")}</div>
          <div class="metric-value" style="font-size:var(--text-2xl)">
            ${r}<span class="metric-unit">${s==="volume"?"":o.settings.units}</span>
          </div>
        </div>
        <div style="flex:1"></div>
        <div style="text-align:right">
          <div class="metric-label">${i("since_start")}</div>
          <div style="font-family:var(--font-mono);font-size:var(--text-lg);font-weight:600;
                      color:${u?"var(--positive)":"var(--negative)"}">
            ${u?"+":""}${l}%
          </div>
        </div>
      </div>

      ${Es(n,u?"var(--positive)":"var(--negative)")}

      <div class="row" style="margin-top:var(--space-2)">
        <span class="metric-label">${q(t[0].date)}</span>
        <span style="flex:1"></span>
        <span class="metric-label">${q(t.at(-1).date)}</span>
      </div>
    </div>`}function Ms(e){const t=new Map;e.forEach(n=>{n.exercises.forEach(a=>{const r=Math.max(...a.sets.map(c=>Number(c.w)||0)),l=a.sets.find(c=>Number(c.w)===r)?.r??0;if(!(r>0))return;const u=t.get(a.name);(!u||r>u.weight)&&t.set(a.name,{weight:r,reps:l,date:n.date})})});const s=[...t.entries()].sort((n,a)=>a[1].weight-n[1].weight).slice(0,12);return s.length?`
    <h2 class="section-label" style="margin-top:var(--space-6)">${i("personal_records")}</h2>
    ${s.map(([n,a])=>`
        <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
          <span style="color:var(--gold);flex:none">${d("trophy",{size:16})}</span>
          <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:600;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${m(n)}
          </span>
          <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-primary);font-weight:600">
            ${a.weight}${o.settings.units}
          </span>
          <span class="metric-label" style="min-width:52px;text-align:right">
            ${q(a.date)}
          </span>
        </div>`).join("")}`:""}function Ts(){const{sessions:e}=o,t=`
    <h1 class="screen-title">${i("overview_title")}</h1>
    <div class="header-spacer"></div>
    <button class="icon-btn" data-action="settings:open" aria-label="${i("settings")}">
      ${d("settings",{size:21})}
    </button>`;if(e.length<2)return{header:t,body:`
        <div class="empty">
          <div class="empty-icon">${d("stats",{size:30})}</div>
          <h2 class="empty-title">${i("no_data_yet")}</h2>
          <p class="empty-body">${i("not_enough_data")}</p>
        </div>`};const s=Bt(e,2),n=s.includes(o.statsExercise)?o.statsExercise:s[0];return{header:t,body:`
      <div class="metric-strip" style="margin-bottom:var(--space-6)">
        <div class="metric metric--gold">
          <div class="metric-label">${i("sessions")}</div>
          <div class="metric-value">${e.length}</div>
        </div>
        <div class="metric metric--info">
          <div class="metric-label">${i("volume")}</div>
          <div class="metric-value">${(Ne(e)/1e3).toFixed(1)}<span class="metric-unit">t</span></div>
        </div>
        <div class="metric">
          <div class="metric-label">${i("prs")}</div>
          <div class="metric-value">${Ft(e)}</div>
        </div>
        <div class="metric metric--positive">
          <div class="metric-label">${i("streak")}</div>
          <div class="metric-value">${Ue(e)}<span class="metric-unit">${i("streak_unit")}</span></div>
        </div>
      </div>

      <h2 class="section-label">${i("vol_per_session")}</h2>
      <div class="card" style="margin-bottom:var(--space-6)">
        ${Cs(e)}
        <div class="row" style="margin-top:var(--space-2)">
          <span class="metric-label">${q(e.slice(-16)[0].date)}</span>
          <span style="flex:1"></span>
          <span class="metric-label">${q(e.at(-1).date)}</span>
        </div>
      </div>

      <h2 class="section-label">${i("session_split")}</h2>
      <div style="margin-bottom:var(--space-6)">${Rs(e)}</div>

      ${n?`<h2 class="section-label">${i("progression")}</h2>
           ${As(s,n)}
           ${qs(n)}`:""}

      ${Ms(e)}`}}const js=["d_mo","d_tu","d_we","d_th","d_fr","d_sa","d_su"];function $e(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ds(){const e=new Date,t=o.planYear??e.getFullYear(),s=o.planMonth??e.getMonth(),n=new Date(t,s,1),a=new Date(t,s+1,0).getDate(),r=(n.getDay()+6)%7,l=new Map;o.sessions.forEach(c=>{l.has(c.date)||l.set(c.date,[]),l.get(c.date).push(c)});const u=[];for(let c=0;c<r;c+=1)u.push("<div></div>");for(let c=1;c<=a;c+=1){const b=$e(new Date(t,s,c)),h=l.get(b)||[],v=b===$e(e);u.push(`
      <button data-action="plan:day" data-date="${b}"
              style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;
                     justify-content:center;gap:3px;border-radius:var(--radius-md);
                     background:${v?"var(--gold-wash)":"transparent"};
                     border:1px solid ${v?"var(--line-gold)":"transparent"}">
        <span style="font-family:var(--font-mono);font-size:var(--text-sm);
                     color:${h.length?"var(--text-primary)":"var(--text-faint)"};
                     font-weight:${h.length?600:400}">${c}</span>
        <span style="display:flex;gap:2px;height:5px">
          ${h.slice(0,3).map(S=>`<span style="width:5px;height:5px;border-radius:50%;
                                   background:${k(S.focus)}"></span>`).join("")}
        </span>
      </button>`)}return`
    <div class="card" style="margin-bottom:var(--space-6)">
      <div class="row gap-2" style="margin-bottom:var(--space-4)">
        <button class="icon-btn" data-action="plan:prev" aria-label="Previous month">
          ${d("chevronLeft",{size:20})}
        </button>
        <span style="flex:1;text-align:center;font-family:var(--font-display);
                     font-size:var(--text-lg);letter-spacing:var(--tracking-wide);
                     text-transform:uppercase">
          ${je(`${t}-${String(s+1).padStart(2,"0")}`)}
        </span>
        <button class="icon-btn" data-action="plan:next" aria-label="Next month">
          ${d("chevronRight",{size:20})}
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:var(--space-2)">
        ${js.map(c=>`<div class="metric-label" style="text-align:center">${i(c)}</div>`).join("")}
      </div>

      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
        ${u.join("")}
      </div>
    </div>`}function Ps(){const e=o.planSelectedDate;if(!e)return"";const t=o.sessions.filter(s=>s.date===e);return t.length?`
    <h2 class="section-label">${e}</h2>
    ${t.map(s=>{const n=k(s.focus);return`
        <div class="card" style="margin-bottom:var(--space-2);border-left:3px solid ${n}">
          <div class="row gap-2">
            <strong style="flex:1;color:${n};font-family:var(--font-display);
                           font-size:var(--text-lg);letter-spacing:var(--tracking-wide);
                           text-transform:uppercase">${m(s.focus)}</strong>
            <span class="metric-label">${s.exercises.length} ${i("ex_lbl")}</span>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm)">
              ${(L(s)/1e3).toFixed(1)}k
            </span>
          </div>
        </div>`}).join("")}`:`
      <div class="card" style="margin-bottom:var(--space-6);text-align:center">
        <p class="empty-body" style="margin:0 auto">${i("no_sessions_on_day")}</p>
      </div>`}function Ls(){const e=o.templates||[];return`
    <h2 class="section-label">${i("templates")}</h2>
    ${e.map(t=>{const s=k(t.focus||t.name),n=o.expandedTemplateId===t.id;return`
        <article class="card card--flush" style="margin-bottom:var(--space-2)">
          <button data-action="template:toggle" data-id="${t.id}"
                  style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                         padding:var(--space-4);text-align:left;border-left:3px solid ${s}">
            <span style="flex:1;min-width:0">
              <span style="display:block;font-family:var(--font-display);font-size:var(--text-lg);
                           letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${s}">
                ${m(t.name)}
              </span>
              <span class="metric-label" style="display:block;margin-top:2px">
                ${t.exercises.length} ${i("ex_lbl")}
              </span>
            </span>
            <span style="color:var(--text-faint);${n?"transform:rotate(180deg)":""}">
              ${d("chevronDown",{size:18})}
            </span>
          </button>

          ${n?`<div style="padding:0 var(--space-4) var(--space-4);border-top:1px solid var(--line-subtle)">
                 <div style="padding-top:var(--space-3)">
                   ${t.exercises.map((a,r)=>`
                       <div class="row gap-2" style="padding:var(--space-2) 0;
                            border-bottom:1px solid var(--line-subtle)">
                         <span class="metric-label" style="min-width:18px">${r+1}</span>
                         <span style="flex:1;font-size:var(--text-sm)">${m(a)}</span>
                         <button class="icon-btn" data-action="template:remove-ex"
                                 data-id="${t.id}" data-index="${r}"
                                 style="width:32px;height:32px" aria-label="${i("delete")}">
                           ${d("close",{size:16})}
                         </button>
                       </div>`).join("")}
                 </div>
                 <div class="row gap-2" style="margin-top:var(--space-3);flex-wrap:wrap">
                   <button class="btn btn--sm btn--primary" data-action="template:use" data-id="${t.id}">
                     ${d("bolt",{size:15})} ${i("start_workout")}
                   </button>
                   <button class="btn btn--sm btn--secondary" data-action="template:add-ex" data-id="${t.id}">
                     ${d("plus",{size:15})} ${i("add_exercise")}
                   </button>
                   <button class="btn btn--sm btn--danger" data-action="template:delete" data-id="${t.id}">
                     ${d("trash",{size:15})}
                   </button>
                 </div>
               </div>`:""}
        </article>`}).join("")}

    <button class="btn btn--secondary btn--block" data-action="template:create"
            style="margin-top:var(--space-3)">
      ${d("plus",{size:18})} ${i("create_template")}
    </button>`}function Fs(){return{header:`
      <h1 class="screen-title">${i("plan_title")}</h1>
      <div class="header-spacer"></div>
      <button class="icon-btn" data-action="settings:open" aria-label="${i("settings")}">
        ${d("settings",{size:21})}
      </button>`,body:`
      ${Ds()}
      ${Ps()}
      ${Ls()}`}}const Bs={Pushups:["Allonge-toi face contre sol et place tes mains à environ 90 cm d'écart en maintenant ton torse soulevé à bout de bras.","Ensuite, descends lentement jusqu'à ce que ta poitrine frôle presque le sol en inspirant.","Expire et repousse ton corps vers le haut jusqu'à la position de départ en contractant les pectoraux.","Après une brève pause en position haute contractée, recommence à descendre pour autant de répétitions que nécessaire."],Dumbbell_Bench_Press:["Allonge-toi sur un banc plat avec un haltère dans chaque main posé sur tes cuisses, les paumes se faisant face.","Utilise tes cuisses pour t'aider à soulever les haltères l'un après l'autre jusqu'à les tenir devant toi à la largeur des épaules.","Une fois à la largeur des épaules, tourne tes poignets vers l'avant de sorte que les paumes soient orientées vers l'avant. Les haltères doivent se trouver de chaque côté de ta poitrine, avec un angle de 90 degrés entre l'avant-bras et le bras. Maintiens en permanence le contrôle des haltères. C'est ta position de départ.","En expirant, utilise tes pectoraux pour pousser les haltères vers le haut. Verrouille les bras en haut, contracte la poitrine, tiens une seconde, puis redescends lentement. Conseil : la descente doit idéalement prendre deux fois plus de temps que la montée.","Répète le mouvement pour le nombre de répétitions prescrit par ton programme d'entraînement."],"Barbell_Bench_Press_-_Medium_Grip":["Allonge-toi sur un banc plat. Avec une prise de largeur moyenne (qui crée un angle de 90 degrés au milieu du mouvement entre les avant-bras et les bras), décroche la barre du rack et tiens-la au-dessus de toi les bras verrouillés. C'est ta position de départ.","Depuis la position de départ, inspire et descends lentement la barre jusqu'à ce qu'elle touche le milieu de ta poitrine.","Après une courte pause, remonte la barre en expirant et en poussant avec ta poitrine. Verrouille les bras et contracte la poitrine en position haute. C'est ta position de départ.","Redescends lentement (la phase de descente doit prendre environ deux fois plus de temps que la montée) vers la position de départ.","Répète le mouvement pour le nombre de répétitions prescrit."],"Push-Ups_With_Feet_Elevated":["Place tes pieds sur un banc ou une surface surélevée et mets-toi en position de pompe, les mains à plat sur le sol à la largeur des épaules. C'est ta position de départ.","En gardant le dos droit et le corps aligné de la tête aux pieds, descends en fléchissant les coudes.","Descends jusqu'à ce que ta poitrine touche presque le sol.","Expire en remontant à la position de départ en poussant sur les bras.","Répète pour le nombre de répétitions souhaité."],Incline_Cable_Chest_Press:["Règle le dossier d'un banc à environ 30-45 degrés et place-le entre deux poulies basses. Prends les poignées et assieds-toi sur le banc, les mains au niveau des épaules. C'est ta position de départ.","En expirant, pousse les poignées vers le haut et vers l'intérieur jusqu'à ce que les bras soient tendus devant toi.","Inspire et redescends lentement à la position de départ. Répète pour le nombre de répétitions voulu."],Machine_Bench_Press:["Assieds-toi à la machine à développé couché et sélectionne le poids.","Monte sur le levier fourni par la machine — il te permet d'amener les poignées vers l'avant afin de les saisir et d'étendre complètement les bras.","Saisis les poignées avec une prise pronation (paumes vers le bas) et lève les coudes de sorte que tes bras soient parallèles au sol de chaque côté du buste. Tes avant-bras pointent vers l'avant. Une fois les poignées avancées et les bras tendus, tu es en position de départ.","Ramène les poignées vers toi en inspirant.","Pousse les poignées vers l'avant en contractant les pectoraux et en expirant. Tiens la contraction une seconde avant de revenir à la position de départ.","Répète pour le nombre de répétitions prescrit.","À la fin, remonte sur le levier et replace doucement les poignées en position initiale."],Leverage_Incline_Chest_Press:["Règle le siège pour que les poignées soient au niveau des épaules. Assieds-toi sur la machine en appuyant le dos contre le dossier. Saisis les poignées. C'est ta position de départ.","En expirant, pousse les leviers vers le haut et vers l'avant jusqu'à extension complète des bras.","Inspire et redescends lentement à la position de départ. Répète pour le nombre de répétitions voulu."],Incline_Dumbbell_Press:["Règle un banc incliné à 30-45 degrés. Prends un haltère dans chaque main et assieds-toi sur le banc en posant les haltères sur tes cuisses.","Allonge-toi sur le banc incliné et, avec l'aide de tes cuisses, monte les haltères l'un après l'autre à la hauteur des épaules, les paumes tournées vers l'avant. C'est ta position de départ.","En expirant, pousse les haltères vers le haut jusqu'à ce que les bras soient tendus et que les haltères se touchent presque.","Inspire et redescends lentement à la position de départ.","Répète le mouvement pour le nombre de répétitions prescrit.","Attention : si tu n'as pas de partenaire, soulève les haltères en plaçant les poignets sur les cuisses. Utilise le mouvement des cuisses pour amener les haltères en position.","Repose les haltères sur tes cuisses en terminant l'exercice avant de les poser au sol."],"Barbell_Incline_Bench_Press_-_Medium_Grip":["Allonge-toi sur un banc incliné à 45 degrés avec une barre chargée sur le rack. Avec une prise légèrement plus large que la largeur des épaules, décroche la barre et tiens-la au-dessus de toi les bras tendus. C'est ta position de départ.","En inspirant, descends la barre lentement jusqu'au haut de ta poitrine.","Après une brève pause, remonte la barre à la position de départ en expirant et en utilisant tes pectoraux.","Verrouille les bras et contracte les pectoraux au sommet, tiens une seconde, puis redescends.","Répète pour le nombre de répétitions prescrit."],Dumbbell_Flyes:["Tiens un haltère dans chaque main et allonge-toi sur un banc plat. Étends les bras au-dessus de toi, les paumes se faisant face. Garde une légère flexion des coudes pour ne pas les mettre en hyperextension. C'est ta position de départ.","En inspirant, écarte les bras sur les côtés en gardant les coudes légèrement fléchis. Descends jusqu'à ressentir un bon étirement des pectoraux.","En expirant, remonte les haltères en arc de cercle vers la position de départ. Contracte les pectoraux en haut. Le mouvement doit ressembler à une accolade.","Tiens une seconde au sommet, puis répète pour le nombre de répétitions prescrit.","Attention : ne descends pas trop bas pour éviter de blesser les épaules."],Flat_Bench_Cable_Flyes:["Place un banc plat au centre d'une station de câbles. Fixe les poignées aux poulies basses. Prends une poignée dans chaque main.","Allonge-toi sur le banc et tiens les poignées en tendant les bras sur les côtés, légèrement en dessous du niveau des épaules, les coudes légèrement fléchis. C'est ta position de départ.","En expirant, ramène les poignées vers le haut et vers le centre en arc de cercle jusqu'à ce qu'elles se touchent au-dessus de ta poitrine.","Tiens la position contractée une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : pendant tout le mouvement, garde les coudes légèrement fléchis. N'utilise pas de poids trop lourds qui t'obligeraient à modifier la forme.","Variante : cet exercice peut également être réalisé en incliné ou en décliné."],Butterfly:["Assieds-toi sur la machine et règle les bras de façon à ce que tes coudes soient alignés avec les poignées au niveau des épaules. Saisis les poignées, les paumes tournées vers l'avant. C'est ta position de départ.","En expirant, resserre les bras de la machine vers le centre jusqu'à ce qu'ils se rejoignent. Contracte les pectoraux.","Tiens la position contractée une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : si tu te penches en avant, tu travailleras plus les deltoïdes que les pectoraux."],"Dips_-_Chest_Version":["Pour cet exercice, tu auras besoin de barres parallèles. Place-toi en position de départ en te soutenant à bout de bras (coudes verrouillés) au-dessus des barres.","En inspirant, descends lentement avec le buste penché vers l'avant d'environ 30 degrés et les coudes légèrement écartés, jusqu'à ressentir un léger étirement dans les pectoraux.","Dès que tu ressens l'étirement, remonte à la position de départ en utilisant tes pectoraux et en expirant. Serre les pectoraux en haut du mouvement une seconde.","Répète pour le nombre de répétitions prescrit."],Parallel_Bar_Dip:["Pour cet exercice, tu auras besoin de barres parallèles. Monte sur les barres et tiens-toi en position haute, le corps droit, les bras tendus.","Inspire et descends en fléchissant les coudes jusqu'à ce que tes épaules soient au niveau de tes coudes ou légèrement en dessous.","Expire et remonte à la position de départ.","Répète pour le nombre de répétitions prescrit."],Dip_Machine:["Règle le siège et les poignées de la machine. Assieds-toi et saisis les poignées, les paumes tournées vers l'intérieur. C'est ta position de départ.","En expirant, pousse les poignées vers le bas jusqu'à extension complète des bras. Contracte les triceps en bas.","Inspire et remonte lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : certaines machines permettent de cibler soit les triceps (corps droit) soit les pectoraux (corps penché en avant)."],"Straight-Arm_Dumbbell_Pullover":["Place un haltère debout à une extrémité d'un banc plat. Allonge-toi perpendiculairement au banc en appuyant le haut du dos dessus. Les hanches doivent être en dessous du banc et les jambes fléchies à 90 degrés, pieds à plat au sol.","Avec tes deux paumes, saisis l'haltère au-dessus de ta tête, les bras tendus. C'est ta position de départ.","En inspirant, descends l'haltère en arc de cercle derrière ta tête en gardant les bras tendus (légère flexion des coudes tolérée).","Retiens-toi à l'étirement et, en expirant, remonte l'haltère à la position de départ en arc de cercle.","Tiens la position un moment, puis recommence.","Attention : utilise uniquement la charge que tu peux contrôler. Cet exercice peut aussi être réalisé avec une barre ou un câble."],"Bent-Arm_Barbell_Pullover":["Allonge-toi sur un banc plat, les épaules au niveau de l'extrémité du banc. Garde les pieds à plat au sol. Saisis une barre tenue à bout de bras au-dessus de ta tête, les bras tendus. C'est ta position de départ.","En inspirant, descends la barre derrière ta tête en fléchissant les coudes jusqu'à sentir un étirement dans les dorsaux.","En expirant, remonte la barre à la position de départ. Tiens la position un instant.","Répète pour le nombre de répétitions prescrit.","Attention : cet exercice doit être réalisé avec une charge modérée et un bon contrôle."],"Straight-Arm_Pulldown":["Fixe une barre droite (ou une corde) à une poulie haute. Saisis la barre avec une prise pronation (paumes vers le bas), les mains à la largeur des épaules.","Recule d'un pas et penche légèrement le buste en avant. Garde les bras tendus avec une légère flexion des coudes. C'est ta position de départ.","En expirant, tire la barre vers le bas et vers toi jusqu'à ce qu'elle touche tes cuisses. Garde les bras tendus tout au long du mouvement.","Inspire et remonte lentement la barre à la position de départ.","Répète pour le nombre de répétitions prescrit."],Dumbbell_Shoulder_Press:["Assieds-toi sur un banc avec dossier ou sur un banc militaire. Prends un haltère dans chaque main et pose-les sur tes cuisses, les paumes se faisant face.","Utilise tes cuisses pour t'aider à soulever les haltères à la hauteur des épaules. Tourne les poignets de sorte que les paumes soient tournées vers l'avant. C'est ta position de départ.","En expirant, pousse les haltères vers le haut jusqu'à ce qu'ils se touchent presque au-dessus de ta tête.","Après une pause d'une seconde, inspire et redescends lentement les haltères à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : tu peux aussi réaliser cet exercice en alternant les bras ou debout."],Standing_Military_Press:["Saisir une barre avec une prise pronation (paumes vers l'avant), les mains légèrement plus larges que la largeur des épaules. Depuis un rack ou en la soulevant depuis le sol, place la barre au niveau des clavicules, appuyée contre le haut de la poitrine. C'est ta position de départ.","En expirant, pousse la barre vers le haut jusqu'à extension complète des bras.","Tiens la position un instant, puis inspire et redescends lentement la barre à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : pour une version plus avancée, tu peux soulever la barre depuis le sol à l'aide d'un arraché.","Variante assise : cet exercice peut également être réalisé assis sur un banc avec dossier."],Machine_Shoulder_Military_Press:["Règle le siège de la machine pour que les poignées soient au niveau des épaules. Assieds-toi et saisis les poignées avec une prise pronation (paumes vers l'avant). C'est ta position de départ.","En expirant, pousse les poignées vers le haut jusqu'à extension complète des bras.","Tiens la position une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : évite de verrouiller les coudes brusquement en haut du mouvement."],Side_Lateral_Raise:["Debout ou assis, tiens un haltère dans chaque main le long du corps, les paumes tournées vers toi. C'est ta position de départ.","En gardant le buste droit et les coudes légèrement fléchis, lève les bras sur les côtés jusqu'à la hauteur des épaules en expirant. Tourne légèrement les pouces vers le bas comme si tu versais un verre.","Tiens la position une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Seated_Lateral_Raise:["Assieds-toi sur un banc placé à côté d'une poulie basse. Fixe une poignée à la poulie et saisis-la avec la main la plus éloignée de la machine.","Tiens-toi droit, le bras le long du corps avec une légère flexion du coude. C'est ta position de départ.","En expirant, lève le bras à l'opposé de la machine jusqu'à la hauteur de l'épaule.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de côté.","Attention : ne prends pas trop de charge ; concentre-toi sur la contraction du deltoïde médian.","Variante : cet exercice peut aussi être réalisé debout."],Seated_Side_Lateral_Raise:["Assieds-toi sur un banc avec un haltère dans chaque main le long du corps, les paumes tournées vers toi. C'est ta position de départ.","En gardant le buste droit et les coudes légèrement fléchis, lève les bras sur les côtés jusqu'à la hauteur des épaules en expirant.","Tiens la position une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Front_Dumbbell_Raise:["Debout ou assis, tiens un haltère dans chaque main devant tes cuisses, les paumes tournées vers toi (prise pronation). C'est ta position de départ.","En gardant les coudes légèrement fléchis, lève un bras vers l'avant jusqu'à la hauteur des épaules en expirant. Tiens une seconde.","Inspire et redescends lentement à la position de départ, puis répète avec l'autre bras. C'est une répétition.","Répète pour le nombre de répétitions prescrit."],Front_Cable_Raise:["Fixe une barre droite à une poulie basse. Saisis la barre avec une prise pronation (paumes vers le bas), les mains à la largeur des épaules.","Recule d'un pas et tiens-toi droit, les bras tendus devant toi vers le bas. C'est ta position de départ.","En expirant, lève la barre vers le haut jusqu'à la hauteur des épaules en gardant les coudes légèrement fléchis.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench:["Tiens un haltère dans chaque main et penche-toi en avant jusqu'à ce que le buste soit parallèle au sol, en appuyant le front sur un banc incliné ou similaire pour te stabiliser.","Tes bras doivent être étendus vers le bas, les coudes légèrement fléchis, les paumes se faisant face. C'est ta position de départ.","En expirant, lève les haltères sur les côtés jusqu'à la hauteur des épaules en gardant les bras presque tendus. Pince les omoplates au sommet.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Rear_Delt_Fly:["Place-toi entre deux poulies hautes. Croise les bras et saisis la poignée gauche avec la main droite et la poignée droite avec la main gauche. C'est ta position de départ.","En expirant, écarte les bras jusqu'à la hauteur des épaules en gardant les coudes légèrement fléchis.","Tiens une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Reverse_Machine_Flyes:["Assieds-toi à la machine à écartés pectoraux en te plaçant face au dossier. Règle les bras de sorte que tes coudes soient alignés avec les poignées au niveau des épaules.","Saisis les poignées, les coudes légèrement fléchis. C'est ta position de départ.","En expirant, écarte les bras vers l'arrière jusqu'à ressentir une contraction dans les deltoïdes postérieurs.","Tiens une seconde, puis inspire et reviens lentement à la position de départ. Répète pour le nombre de répétitions prescrit."],Face_Pull:["Fixe une corde à une poulie haute. Saisis la corde avec les deux mains et recule jusqu'à avoir les bras tendus. Tire la corde vers ton visage en écartant les mains et en ramenant les coudes vers l'arrière, jusqu'à sentir une forte contraction dans les deltoïdes postérieurs et les trapèzes. Reviens lentement à la position de départ et répète."],"Scapular_Pull-Up":["Suspends-toi à une barre de traction les bras complètement tendus, prise pronation (paumes vers l'avant) à la largeur des épaules.","Sans fléchir les coudes, élève le corps en tirant les omoplates vers le bas et l'arrière. Tu ne te hisses que de quelques centimètres.","Reviens lentement à la position de départ et répète pour le nombre de répétitions prescrit."],Dumbbell_Shrug:["Tiens un haltère dans chaque main, les bras le long du corps, les paumes tournées vers toi. C'est ta position de départ.","Haussez les épaules aussi haut que possible en expirant. Tiens la position contractée une seconde.","Inspire et redescends lentement les épaules à la position de départ.","Répète pour le nombre de répétitions prescrit."],Barbell_Shrug:["Tiens une barre devant toi avec une prise pronation (paumes vers toi) légèrement plus large que la largeur des épaules. C'est ta position de départ.","Hausse les épaules aussi haut que possible en expirant. Tiens la position contractée une seconde.","Inspire et redescends lentement les épaules à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Shrugs:["Fixe une barre courte à une poulie basse. Saisis la barre avec une prise pronation (paumes vers toi) à la largeur des épaules.","Tiens-toi droit, les bras tendus. C'est ta position de départ.","Hausse les épaules aussi haut que possible en expirant. Tiens la position contractée une seconde.","Inspire et redescends lentement les épaules à la position de départ.","Répète pour le nombre de répétitions prescrit."],Leverage_Shrug:["Charge la machine et règle-la à la hauteur de tes hanches. Saisis les poignées, les bras tendus. C'est ta position de départ.","Hausse les épaules aussi haut que possible en expirant, en gardant les bras tendus.","Tiens la position contractée une seconde, puis inspire et redescends lentement les épaules.","Répète pour le nombre de répétitions prescrit.","Attention : ne tourne pas les épaules pendant le mouvement."],Pullups:["Saisis une barre de traction avec une prise pronation (paumes vers l'avant) légèrement plus large que la largeur des épaules. Suspends-toi à bout de bras. C'est ta position de départ.","En expirant, tire-toi vers le haut en contractant les dorsaux jusqu'à ce que ton menton dépasse la barre. Garde le buste droit en tirant les épaules et la partie supérieure des bras vers le bas et vers l'arrière.","Tiens la position contractée une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : pour ajouter de la résistance, tu peux fixer des poids à ta ceinture."],"Wide-Grip_Lat_Pulldown":["Assieds-toi à la machine de tirage vertical et fixe tes cuisses sous le rembourrage. Saisis la barre avec une prise pronation (paumes vers l'avant) bien plus large que la largeur des épaules. C'est ta position de départ.","En expirant, ramène la barre vers le bas vers le haut de ta poitrine en tirant les coudes vers le bas et vers l'arrière.","Serre les dorsaux une seconde en bas du mouvement, puis inspire et remonte lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne te penche pas trop en arrière ; le buste doit rester presque droit (légère inclinaison vers l'arrière acceptable).","Variante : tu peux aussi tirer la barre derrière la tête, mais cela n'est pas recommandé en cas de problèmes d'épaules."],"Full_Range-Of-Motion_Lat_Pulldown":["Assieds-toi à la machine de tirage vertical, les cuisses sous le rembourrage. Lève-toi légèrement pour saisir la barre avec une prise pronation à la largeur des épaules. En gardant le buste droit, tire la barre vers le bas jusqu'au menton ou en dessous, puis remonte lentement jusqu'à extension complète des bras en laissant les omoplates monter au maximum.","Répète pour le nombre de répétitions prescrit en maintenant un mouvement contrôlé tout au long."],"Chin-Up":["Saisis une barre de traction avec une prise supination (paumes vers toi) à la largeur des épaules. Suspends-toi à bout de bras. C'est ta position de départ.","En expirant, tire-toi vers le haut jusqu'à ce que ta tête soit au niveau de la barre. Concentre-toi sur la contraction des biceps.","Tiens la position contractée une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : cet exercice peut être réalisé avec un lest pour plus de résistance ou avec assistance (bande élastique, machine) si nécessaire."],"Close-Grip_Front_Lat_Pulldown":["Assieds-toi à la machine de tirage vertical et fixe tes cuisses sous le rembourrage. Saisis la barre triangulaire ou la barre à prise serrée avec les paumes se faisant face. C'est ta position de départ.","En expirant, tire la poignée vers ta poitrine supérieure en rapprochant les coudes des côtés du corps. Penche légèrement le buste en arrière.","Serre les dorsaux en bas du mouvement, puis inspire et remonte lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne te penche pas trop en arrière pour ne pas transformer l'exercice en rowing.","Variante : cet exercice peut aussi être réalisé avec une prise neutre plus large."],Inverted_Row:["Règle une barre de rack ou un TRX à hauteur de taille. Allonge-toi sous la barre et saisis-la avec une prise pronation à la largeur des épaules, les bras tendus. Garde le corps gainé, droit de la tête aux pieds. C'est ta position de départ.","En expirant, tire ta poitrine vers la barre en ramenant les coudes vers l'arrière.","Tiens la position contractée une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : pour augmenter la difficulté, surélève les pieds ou ajoute un gilet lesté."],"One-Arm_Dumbbell_Row":["Choisis un haltère et place-toi à côté d'un banc. Pose le genou et la main du même côté sur le banc pour te soutenir, l'autre pied à plat au sol.","Avec l'autre main, saisis l'haltère, le bras pendant vers le sol, les paumes tournées vers toi. C'est ta position de départ.","En gardant le buste parallèle au sol et en maintenant le dos droit, tire l'haltère vers le haut en ramenant le coude au-dessus du niveau du dos. Expire pendant la montée.","Tiens la position contractée une seconde, puis inspire et redescends lentement l'haltère à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de côté.","Attention : assure-toi de garder le dos droit tout au long du mouvement.","Variante : cet exercice peut aussi être réalisé avec une barre ou un câble."],Bent_Over_Barbell_Row:["Tiens une barre avec une prise pronation (paumes vers le bas) à la largeur des épaules. Penche-toi en avant jusqu'à ce que le buste soit presque parallèle au sol, les genoux légèrement fléchis. C'est ta position de départ.","En expirant, tire la barre vers le bas de ton ventre en ramenant les coudes vers l'arrière. Garde le dos plat.","Tiens la position contractée une seconde, puis inspire et redescends lentement la barre à la position de départ.","Répète pour le nombre de répétitions prescrit."],Seated_Cable_Rows:["Assieds-toi à la machine de rowing assis et place tes pieds sur les repose-pieds. Saisis la poignée en V (ou la barre) avec les deux mains et recule jusqu'à avoir les bras tendus devant toi, le dos droit. C'est ta position de départ.","En expirant, tire la poignée vers ton ventre en ramenant les coudes vers l'arrière. Pince les omoplates.","Tiens la position contractée une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne te penche pas trop en avant pendant la phase de retour ; garde le dos droit."],Dumbbell_Incline_Row:["Règle un banc à environ 30-45 degrés. Allonge-toi face contre le banc avec un haltère dans chaque main, les bras pendants vers le sol, les paumes se faisant face. C'est ta position de départ.","En expirant, tire les haltères vers le haut en ramenant les coudes au-dessus du niveau du dos. Pince les omoplates.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Superman:["Allonge-toi face contre sol, les bras tendus devant toi. C'est ta position de départ.","En expirant, lève simultanément les bras, les jambes et la poitrine aussi haut que possible. Tiens la position contractée deux secondes.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Hyperextensions_Back_Extensions:["Règle le banc à hyperextensions pour que tes hanches soient légèrement au-dessus du bord supérieur. Place tes pieds sous les rouleaux. Croise les bras sur la poitrine ou place les mains derrière la tête. C'est ta position de départ.","En inspirant, abaisse lentement le buste vers le bas en gardant le dos droit.","En expirant, remonte jusqu'à ce que ton corps forme une ligne droite. Ne te cambre pas en arrière.","Tiens une seconde, puis redescends. Répète pour le nombre de répétitions prescrit.","Attention : pour augmenter la difficulté, tiens un disque ou une barre sur la poitrine.","Variante : tu peux aussi réaliser cet exercice en rotation pour cibler les obliques."],Good_Morning:["Place une barre sur le haut du dos, comme pour un squat. Garde les pieds à la largeur des épaules, les genoux légèrement fléchis. C'est ta position de départ.","En inspirant, penche-toi en avant depuis les hanches (non pas depuis la taille) jusqu'à ce que le buste soit presque parallèle au sol. Garde le dos plat.","En expirant, remonte à la position de départ en poussant les hanches vers l'avant. Répète pour le nombre de répétitions prescrit."],Pull_Through:["Fixe une corde à une poulie basse. Tourne le dos à la machine, enjambe le câble et saisis la corde entre tes jambes. Fléchis les hanches et les genoux légèrement. C'est ta position de départ.","En expirant, pousse les hanches vers l'avant et redresse-toi, en tirant la corde vers l'avant. Contracte les fessiers en haut. Reviens lentement à la position de départ et répète pour le nombre de répétitions prescrit."],Romanian_Deadlift:["Saisis une barre chargée avec une prise pronation à la largeur des hanches. Tiens-toi droit avec la barre devant tes cuisses. C'est ta position de départ.","En inspirant, fais glisser la barre le long des jambes en poussant les hanches vers l'arrière (inclinaison de la hanche), genoux légèrement fléchis. Descends jusqu'à sentir un étirement dans les ischio-jambiers.","En expirant, remonte à la position de départ en poussant les hanches vers l'avant.","Répète pour le nombre de répétitions prescrit.","Attention : garde le dos plat tout au long du mouvement et ne laisse pas la barre s'éloigner de tes jambes."],"Stiff-Legged_Dumbbell_Deadlift":["Tiens un haltère dans chaque main devant tes cuisses, les paumes tournées vers toi. C'est ta position de départ.","En inspirant, descends les haltères le long des jambes en inclinant le buste en avant depuis les hanches, les jambes presque tendues (légère flexion du genou). Descends jusqu'à ressentir un étirement dans les ischio-jambiers.","En expirant, remonte à la position de départ en poussant les hanches vers l'avant.","Répète pour le nombre de répétitions prescrit.","Attention : garde le dos plat tout au long du mouvement."],"Smith_Machine_Stiff-Legged_Deadlift":["Place une barre au niveau des hanches sur la Smith machine. Saisis la barre avec une prise pronation à la largeur des hanches. Déverrouille la barre et tiens-toi droit. C'est ta position de départ.","En inspirant, descends la barre le long des jambes en inclinant le buste depuis les hanches, jambes presque tendues.","Descends jusqu'à ressentir un étirement dans les ischio-jambiers.","En expirant, remonte à la position de départ en poussant les hanches vers l'avant.","Répète pour le nombre de répétitions prescrit."],Barbell_Deadlift:["Place une barre chargée sur le sol. Approche-toi de la barre, pieds à la largeur des hanches, les orteils légèrement vers l'extérieur. Fléchis les hanches et les genoux pour attraper la barre avec une prise pronation (ou alternée) à la largeur des épaules. Garde la poitrine haute, le dos plat. C'est ta position de départ.","En expirant, pousse sur les talons et redresse les genoux et les hanches simultanément pour te lever. Garde la barre proche du corps.","Arrive en position debout, les hanches vers l'avant, les épaules en arrière.","En inspirant, redescends la barre en inversant le mouvement : hanches en arrière, puis genoux fléchis jusqu'au sol.","Répète pour le nombre de répétitions prescrit."],Bodyweight_Squat:["Tiens-toi debout, les pieds à la largeur des épaules, les bras tendus devant toi ou les mains derrière la tête. C'est ta position de départ.","En inspirant, abaisse-toi en fléchissant les genoux et les hanches jusqu'à ce que les cuisses soient parallèles au sol. Garde les genoux dans l'axe des pieds et le dos droit.","En expirant, remonte à la position de départ. Répète pour le nombre de répétitions prescrit."],Goblet_Squat:["Tiens un haltère verticalement contre ta poitrine, les deux mains sous la partie supérieure. Pieds à la largeur des épaules, légèrement orientés vers l'extérieur. C'est ta position de départ.","En inspirant, descends en squat en gardant la poitrine haute et les coudes à l'intérieur des genoux jusqu'à ce que les cuisses soient parallèles au sol.","En expirant, remonte à la position de départ. Répète pour le nombre de répétitions prescrit."],Barbell_Squat:["Ce mouvement commence avec une barre posée sur les trapèzes. Avance sous la barre et place-la confortablement sur la nuque (haut du dos). Saisis la barre avec les deux mains de chaque côté. Soulève la barre du rack en poussant les jambes et en redressant le corps. Recule de deux pas. Pieds à la largeur des épaules, légèrement orientés vers l'extérieur. C'est ta position de départ.","En inspirant, descends lentement en fléchissant les genoux et les hanches. Garde la tête droite, le dos plat.","Descends jusqu'à ce que les cuisses soient parallèles au sol ou légèrement en dessous.","En expirant, remonte à la position de départ en poussant sur les talons.","Répète pour le nombre de répétitions prescrit.","Attention : ne laisse pas les genoux rentrer vers l'intérieur pendant le mouvement."],Front_Barbell_Squat:["Ce mouvement commence dans un rack. Place la barre sur l'avant des épaules. Croise les bras sur la barre ou tiens-la avec une prise pronation les doigts sous la barre. Soulève la barre et recule. Pieds à la largeur des épaules, légèrement vers l'extérieur. C'est ta position de départ.","En inspirant, descends lentement en fléchissant les genoux et les hanches. Garde la poitrine haute et les coudes relevés.","Descends jusqu'à ce que les cuisses soient parallèles au sol ou en dessous.","En expirant, remonte à la position de départ en poussant sur les talons.","Répète pour le nombre de répétitions prescrit.","Attention : garder les coudes hauts est essentiel pour maintenir la barre en place."],Barbell_Hack_Squat:["Tiens-toi droit avec une barre derrière toi, les bras tendus. Saisie la barre avec une prise pronation à la largeur des épaules. Pieds à la largeur des épaules. C'est ta position de départ.","En inspirant, descends en squat en fléchissant les genoux et les hanches, en gardant le dos droit.","Descends jusqu'à ce que les cuisses soient parallèles au sol.","En expirant, remonte à la position de départ. Répète pour le nombre de répétitions prescrit."],Hack_Squat:["Place les épaules et le dos contre les coussins de la machine. Positionne les pieds à la largeur des épaules sur la plateforme. Saisis les poignées latérales et déverrouille la machine. C'est ta position de départ.","En inspirant, descends lentement en fléchissant les genoux jusqu'à ce que les cuisses soient parallèles à la plateforme.","En expirant, remonte à la position de départ en poussant sur les talons.","Répète pour le nombre de répétitions prescrit.","Attention : ne laisse pas les talons se soulever de la plateforme.","Variante avancée : tu peux croiser les bras sur la poitrine pour augmenter la difficulté.","Note : cet exercice peut aussi être réalisé avec une barre (hack squat barre)."],Split_Squats:["Tiens-toi debout avec un pied avancé et l'autre en arrière, les deux pieds à environ un mètre de distance. Garde le buste droit. C'est ta position de départ.","En inspirant, descends en fléchissant les deux genoux jusqu'à ce que le genou arrière frôle presque le sol. En expirant, remonte à la position de départ. Répète pour le nombre de répétitions prescrit, puis change de jambe."],Split_Squat_with_Dumbbells:["Tiens un haltère dans chaque main le long du corps. Avance un pied et recule l'autre pour prendre la position de fente. C'est ta position de départ.","En inspirant, descends lentement en fléchissant les deux genoux jusqu'à ce que le genou arrière frôle presque le sol.","En expirant, remonte à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de jambe."],Barbell_Side_Split_Squat:["Tiens-toi debout avec les pieds deux fois plus larges que la largeur des épaules, les orteils vers l'extérieur. Place une barre sur les trapèzes. C'est ta position de départ.","En inspirant, descends d'un côté en fléchissant le genou correspondant, en gardant l'autre jambe tendue.","En expirant, remonte à la position de départ.","Répète de l'autre côté. C'est une répétition."],Bodyweight_Walking_Lunge:["Tiens-toi debout, les pieds à la largeur des épaules, les mains sur les hanches. C'est ta position de départ.","Avance avec un grand pas et descends en fléchissant les deux genoux jusqu'à ce que le genou arrière frôle presque le sol. Le genou avant ne doit pas dépasser la pointe du pied.","En expirant, pousse sur le pied avant et avance l'autre jambe pour faire la prochaine fente.","Continue d'avancer pour le nombre de répétitions ou la distance prescrit."],Dumbbell_Lunges:["Tiens un haltère dans chaque main le long du corps. Tiens-toi droit. C'est ta position de départ.","Avance avec un grand pas et descends en fléchissant les deux genoux jusqu'à ce que le genou arrière frôle presque le sol.","En expirant, remonte en poussant sur le pied avant, ramène le pied arrière à côté et répète de l'autre côté.","Répète pour le nombre de répétitions prescrit."],Barbell_Walking_Lunge:["Place une barre sur les trapèzes, comme pour un squat. Tiens-toi droit, les pieds à la largeur des épaules. C'est ta position de départ.","Avance avec un grand pas et descends en fléchissant les deux genoux, le genou arrière frôlant le sol.","En expirant, pousse sur le pied avant et avance l'autre jambe pour continuer.","Continue pour le nombre de répétitions prescrit."],"Step-up_with_Knee_Raise":["Tiens-toi debout devant une boîte ou un banc stable. Les mains sur les hanches ou tenant des haltères. C'est ta position de départ.","Monte sur la boîte avec le pied droit en poussant depuis le talon, puis lève le genou gauche jusqu'à la hauteur des hanches.","Redescends avec le pied gauche puis le droit. Répète de l'autre côté. C'est une répétition."],Dumbbell_Step_Ups:["Tiens un haltère dans chaque main le long du corps. Tiens-toi face à une boîte ou un banc. C'est ta position de départ.","Monte sur la boîte avec le pied droit en poussant depuis le talon, puis pose le pied gauche à côté.","Redescends avec le pied droit puis le gauche, à la position de départ.","Répète pour le nombre de répétitions prescrit, en alternant les jambes."],Barbell_Step_Ups:["Place une barre sur les trapèzes et tiens-toi face à une boîte ou un banc stable. C'est ta position de départ.","Monte sur la boîte avec le pied droit en poussant depuis le talon, puis pose le pied gauche à côté.","Redescends avec le pied droit puis le gauche.","Répète pour le nombre de répétitions prescrit en alternant les jambes."],Single_Leg_Glute_Bridge:["Allonge-toi sur le dos, les genoux fléchis, les pieds à plat au sol. Étends une jambe vers le plafond. C'est ta position de départ.","En expirant, pousse sur le pied au sol et soulève les hanches jusqu'à former une ligne droite entre les épaules et le genou fléchi. Contracte les fessiers au sommet.","Tiens deux secondes, puis inspire et redescends les hanches.","Répète pour le nombre de répétitions prescrit, puis change de jambe."],Barbell_Hip_Thrust:["Assieds-toi sur le sol, le haut du dos appuyé contre un banc. Place une barre chargée sur tes hanches (utilise un coussin de protection). Pieds à plat au sol, à la largeur des épaules. C'est ta position de départ.","En expirant, pousse les hanches vers le plafond en contractant les fessiers jusqu'à ce que les cuisses soient parallèles au sol. Garde le menton rentré.","Tiens la position haute une seconde, puis inspire et redescends. Répète pour le nombre de répétitions prescrit."],Glute_Kickback:["Mets-toi à quatre pattes sur un tapis, les mains à la largeur des épaules, les genoux sous les hanches. C'est ta position de départ.","En expirant, pousse un talon vers le plafond en contractant les fessiers, la jambe formant un angle de 90 degrés. Le pied est fléchi.","Tiens une seconde, puis inspire et reviens à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de jambe."],"One-Legged_Cable_Kickback":["Fixe une cheville à une poulie basse. Accroche la cheville à ta cheville et tiens-toi face à la machine, les mains sur le cadre pour te stabiliser.","Garde la jambe d'appui légèrement fléchie. C'est ta position de départ.","En expirant, pousse la jambe avec le câble vers l'arrière jusqu'à ce que la hanche soit en extension complète. Contracte les fessiers.","Tiens une seconde, puis inspire et reviens à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de jambe.","Attention : garde le buste droit et évite de te pencher en avant."],Natural_Glute_Ham_Raise:["Règle le banc à hyperextensions ou utilise un partenaire pour fixer les chevilles. Commence en position agenouillée. C'est ta position de départ.","En contractant les ischio-jambiers, descends ton corps vers le sol le plus lentement possible, les bras prêts à amortir si nécessaire.","Pousse avec les mains pour remonter légèrement, puis contracte les ischio-jambiers pour revenir à la position de départ.","Répète pour le nombre de répétitions prescrit."],Lying_Leg_Curls:["Allonge-toi face contre le banc à leg curl et place tes talons sous les rouleaux. Les genoux sont juste au bord du banc. C'est ta position de départ.","En expirant, fléchis les genoux pour ramener les talons vers les fessiers autant que possible.","Tiens la position contractée une seconde, puis inspire et redescends lentement les jambes à la position de départ.","Répète pour le nombre de répétitions prescrit."],Standing_Leg_Curl:["Règle la machine pour que le coussin soit au niveau de ta cheville arrière. Tiens-toi debout sur une jambe et place l'autre derrière le rouleau. Tiens la machine pour te stabiliser. C'est ta position de départ.","En expirant, fléchis le genou pour ramener le talon vers les fessiers.","Tiens la position contractée une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de jambe.","Attention : garde le buste droit et évite de laisser la hanche se soulever pendant le mouvement."],Weighted_Sissy_Squat:["Tiens-toi debout, les pieds à la largeur des épaules. Tu peux tenir un disque contre ta poitrine. Saisir un support fixe de l'autre main pour l'équilibre. C'est ta position de départ.","En inspirant, penche-toi en arrière en montant sur les orteils et en fléchissant les genoux, en gardant le corps en ligne droite des genoux aux épaules.","Descends jusqu'à ce que les genoux soient presque au sol, puis en expirant, remonte à la position de départ.","Répète pour le nombre de répétitions prescrit."],Leg_Extensions:["Assieds-toi sur la machine et place tes pieds sous les rouleaux. Règle le dossier pour que tes genoux soient au bord du siège. Saisis les poignées latérales. C'est ta position de départ.","En expirant, étends les jambes jusqu'à extension complète des genoux. Contracte les quadriceps.","Tiens une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Standing_Calf_Raises:["Règle la machine debout pour extensions des mollets de sorte que les épaules soient sous les coussinets. Place les pointes de pieds sur la plateforme, les talons dans le vide. C'est ta position de départ.","Soulève les talons le plus haut possible en expirant, en montant sur la pointe des pieds.","Tiens la position contractée une seconde, puis inspire et redescends les talons jusqu'à sentir un étirement des mollets.","Répète pour le nombre de répétitions prescrit.","Attention : pour cibler les deux têtes du mollet, effectue également cet exercice avec les orteils tournés vers l'intérieur et vers l'extérieur."],Standing_Dumbbell_Calf_Raise:["Tiens un haltère dans chaque main le long du corps. Place les pointes de pieds sur le bord d'une marche ou d'une plateforme, les talons dans le vide. C'est ta position de départ.","En expirant, soulève les talons le plus haut possible en montant sur la pointe des pieds.","Tiens une seconde, puis inspire et redescends les talons en dessous du niveau de la plateforme.","Répète pour le nombre de répétitions prescrit."],Standing_Barbell_Calf_Raise:["Place une barre sur les trapèzes. Positionne les pointes de pieds sur le bord d'une marche ou d'une plateforme, les talons dans le vide. C'est ta position de départ.","En expirant, soulève les talons le plus haut possible en montant sur la pointe des pieds.","Tiens une seconde, puis inspire et redescends les talons en dessous du niveau de la plateforme.","Répète pour le nombre de répétitions prescrit.","Attention : tu peux varier l'angle des pieds pour cibler différentes parties du mollet.","Variante : cet exercice peut aussi être réalisé à la machine ou avec des haltères."],"Dumbbell_Seated_One-Leg_Calf_Raise":["Assieds-toi sur un banc. Place la pointe d'un pied sur le bord d'une marche ou d'une plateforme. Pose un haltère sur le genou correspondant. C'est ta position de départ.","En expirant, soulève le talon le plus haut possible en montant sur la pointe du pied.","Tiens une seconde, puis inspire et redescends le talon en dessous du niveau de la plateforme.","Répète pour le nombre de répétitions prescrit, puis change de pied.","Attention : pour varier le travail musculaire, effectue l'exercice avec les orteils orientés vers l'intérieur puis vers l'extérieur.","Variante : tu peux aussi réaliser cet exercice avec les deux jambes en même temps."],Barbell_Seated_Calf_Raise:["Assieds-toi sur un banc. Place les pointes de pieds sur le bord d'une marche ou d'une plateforme, les talons dans le vide. Pose une barre sur tes genoux (utilise un coussin de protection). C'est ta position de départ.","En expirant, soulève les talons le plus haut possible en montant sur la pointe des pieds.","Tiens une seconde, puis inspire et redescends les talons en dessous du niveau de la plateforme.","Répète pour le nombre de répétitions prescrit.","Attention : tu peux varier l'angle des pieds pour cibler différentes parties du mollet.","Variante : cet exercice peut aussi être réalisé avec des haltères ou à la machine."],Seated_Calf_Raise:["Assieds-toi à la machine à mollets assis et place les pointes de pieds sur la plateforme, les talons dans le vide. Place les genoux sous les coussins. C'est ta position de départ.","En expirant, soulève les talons le plus haut possible en montant sur la pointe des pieds.","Tiens une seconde, puis inspire et redescends les talons en dessous du niveau de la plateforme.","Répète pour le nombre de répétitions prescrit.","Attention : garde les genoux sous les coussins pendant tout le mouvement.","Variante : tu peux aussi réaliser cet exercice avec une jambe à la fois."],Dumbbell_Alternate_Bicep_Curl:["Assieds-toi ou tiens-toi debout avec un haltère dans chaque main le long du corps, les paumes tournées vers l'avant. C'est ta position de départ.","En gardant le coude contre le corps, fléchis un coude pour amener l'haltère vers l'épaule en expirant.","Tiens une seconde au sommet, puis inspire et redescends lentement à la position de départ.","Répète de l'autre côté. C'est une répétition.","Répète pour le nombre de répétitions prescrit."],Barbell_Curl:["Tiens une barre avec une prise supination (paumes vers l'avant) à la largeur des épaules. Tiens-toi droit, les bras tendus. C'est ta position de départ.","En gardant les coudes fixes contre les côtés, fléchis les coudes pour amener la barre vers les épaules en expirant.","Contracte les biceps au sommet, tiens une seconde.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Standing_Biceps_Cable_Curl:["Fixe une barre droite à une poulie basse. Saisis la barre avec une prise supination (paumes vers le haut) à la largeur des épaules.","Tiens-toi droit, les bras tendus. C'est ta position de départ.","En gardant les coudes contre les côtés, fléchis les coudes pour amener la barre vers les épaules en expirant.","Tiens une seconde au sommet, puis inspire et redescends lentement à la position de départ. Répète pour le nombre de répétitions prescrit."],Machine_Bicep_Curl:["Assieds-toi à la machine à biceps et saisis les poignées avec une prise supination (paumes vers le haut). Règle le siège pour que tes coudes soient alignés avec l'axe de rotation de la machine. C'est ta position de départ.","En expirant, fléchis les coudes pour amener les poignées vers les épaules.","Tiens une seconde au sommet, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Alternate_Hammer_Curl:["Tiens-toi debout avec un haltère dans chaque main le long du corps, les paumes se faisant face (prise neutre). C'est ta position de départ.","En gardant le coude contre le corps, fléchis un coude pour amener l'haltère vers l'épaule en expirant (sans tourner le poignet).","Tiens une seconde au sommet, puis inspire et redescends lentement à la position de départ.","Répète de l'autre côté. C'est une répétition.","Répète pour le nombre de répétitions prescrit.","Attention : ne balance pas le corps pour aider à soulever ; garde un buste stable."],"Cable_Hammer_Curls_-_Rope_Attachment":["Fixe une corde à une poulie basse. Saisis les deux extrémités de la corde, les paumes se faisant face (prise neutre). Tiens-toi droit, les bras tendus. C'est ta position de départ.","En gardant les coudes contre les côtés, fléchis les coudes pour amener les poignées vers les épaules en expirant.","Tiens une seconde au sommet et contracte les biceps.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne balance pas le corps pendant le mouvement."],One_Arm_Dumbbell_Preacher_Curl:["Tiens un haltère d'une main avec une prise supination (paume vers le haut). Place l'arrière du bras sur le coussin du pupitre à biceps. C'est ta position de départ.","En expirant, fléchis le coude pour amener l'haltère vers l'épaule jusqu'à la contraction maximale.","Tiens une seconde au sommet, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de bras.","Attention : ne verrouille pas le coude en bas pour éviter les blessures."],Preacher_Curl:["Assieds-toi au pupitre à biceps et place l'arrière des bras sur le coussin. Saisis une barre EZ (ou droite) avec une prise supination à la largeur des épaules. C'est ta position de départ.","En expirant, fléchis les coudes pour amener la barre vers les épaules.","Tiens une seconde au sommet et contracte les biceps.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Preacher_Curl:["Fixe une barre droite (ou poignée) à une poulie basse. Installe un pupitre à biceps juste devant la poulie.","Assieds-toi et place l'arrière des bras sur le coussin. Saisis la barre/poignée avec une prise supination. C'est ta position de départ.","En expirant, fléchis les coudes pour amener la barre vers les épaules.","Tiens une seconde au sommet et contracte les biceps.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde l'arrière des bras bien appuyé sur le coussin pendant tout le mouvement."],Machine_Preacher_Curls:["Assieds-toi à la machine à curls de pupitre. Place l'arrière des bras sur le coussin et saisis les poignées avec une prise supination. C'est ta position de départ.","En expirant, fléchis les coudes pour amener les poignées vers les épaules.","Tiens une seconde au sommet et contracte les biceps.","Inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],"Triceps_Pushdown_-_Rope_Attachment":["Fixe une corde à une poulie haute. Saisis les deux extrémités de la corde avec une prise neutre (paumes se faisant face). Recule légèrement et penche le buste en avant. Amène les coudes près des côtés. C'est ta position de départ.","En expirant, pousse la corde vers le bas et vers l'extérieur en étendant les coudes jusqu'à extension complète. Contracte les triceps.","Tiens une seconde au bas du mouvement, puis inspire et remonte lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde les coudes fixes contre les côtés pendant tout le mouvement."],Triceps_Pushdown:["Fixe une barre droite (ou en V) à une poulie haute. Saisis la barre avec une prise pronation (paumes vers le bas) à la largeur des épaules. Amène les coudes près des côtés. C'est ta position de départ.","En expirant, pousse la barre vers le bas jusqu'à extension complète des coudes. Contracte les triceps.","Tiens une seconde au bas du mouvement, puis inspire et remonte lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde les coudes fixes contre les côtés pendant tout le mouvement."],Body_Tricep_Press:["Place tes mains sur une barre fixe, un rebord ou un rack à la hauteur de la taille, légèrement plus larges que la largeur des épaules. Recule les pieds de sorte que ton corps soit en diagonale. C'est ta position de départ.","En inspirant, fléchis les coudes pour amener ta tête vers la barre en gardant les coudes proches du corps.","Descends jusqu'à ce que ta tête soit juste en dessous de la barre.","En expirant, étends les coudes pour repousser ton corps à la position de départ.","Répète pour le nombre de répétitions prescrit."],Standing_Dumbbell_Triceps_Extension:["Tiens-toi debout et saisit un haltère à deux mains au-dessus de ta tête, les bras tendus. C'est ta position de départ.","En inspirant, descends l'haltère derrière ta tête en fléchissant les coudes. Garde les coudes près de la tête et immobiles.","En expirant, étends les coudes pour revenir à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne laisse pas les coudes s'écarter pendant le mouvement."],Standing_Overhead_Barbell_Triceps_Extension:["Tiens une barre à deux mains au-dessus de ta tête avec une prise pronation à la largeur des épaules. C'est ta position de départ.","En inspirant, descends la barre derrière ta tête en fléchissant les coudes. Garde les coudes près de la tête.","En expirant, étends les coudes pour remonter la barre à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde les coudes fixes et proches des oreilles tout au long du mouvement."],Cable_Rope_Overhead_Triceps_Extension:["Fixe une corde à une poulie basse. Tourne le dos à la machine, saisis les deux extrémités de la corde et lève les bras au-dessus de la tête, les coudes fléchis. C'est ta position de départ.","En expirant, étends les coudes pour pousser la corde vers le haut jusqu'à extension complète des bras.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde les coudes proches des oreilles et immobiles pendant le mouvement."],Machine_Triceps_Extension:["Assieds-toi à la machine à triceps et saisis les poignées. Aligne les coudes avec l'axe de rotation de la machine. C'est ta position de départ.","En expirant, étends les coudes jusqu'à extension complète. Contracte les triceps.","Tiens une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Lying_Dumbbell_Tricep_Extension:["Allonge-toi sur un banc plat et tiens un haltère dans chaque main au-dessus de ta poitrine, les bras tendus. C'est ta position de départ.","En inspirant, fléchis les coudes pour descendre les haltères vers les tempes. Garde les coudes immobiles.","En expirant, étends les coudes pour revenir à la position de départ.","Répète pour le nombre de répétitions prescrit."],"EZ-Bar_Skullcrusher":["Allonge-toi sur un banc plat et tiens une barre EZ au-dessus de ta poitrine avec une prise pronation légèrement plus serrée que la largeur des épaules. C'est ta position de départ.","En inspirant, fléchis les coudes pour descendre la barre vers ton front (ou juste derrière ta tête). Garde les coudes pointés vers le plafond et immobiles.","En expirant, étends les coudes pour revenir à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Lying_Triceps_Extension:["Fixe une barre à une poulie basse. Allonge-toi sur un banc en face de la poulie, la tête au bord. Saisis la barre avec une prise pronation et ramène-la au-dessus de ta tête, les bras tendus. C'est ta position de départ.","En inspirant, fléchis les coudes pour descendre la barre vers ton front ou derrière ta tête. Garde les coudes immobiles.","En expirant, étends les coudes pour revenir à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : la tension du câble maintient une résistance constante tout au long du mouvement, contrairement aux haltères."],Crunches:["Allonge-toi sur le dos, les genoux fléchis, les pieds à plat au sol à environ 50 cm de tes fessiers. Place les mains derrière la tête ou croise-les sur la poitrine. C'est ta position de départ.","En expirant, contracte les abdominaux pour soulever les épaules du sol d'environ 10 cm. Ne tire pas sur le cou avec les mains.","Tiens la contraction une seconde au sommet.","Inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : ne tire pas sur ta nuque pour t'aider à monter ; l'effort doit venir des abdominaux."],Cable_Crunch:["Fixe une corde à une poulie haute. Mets-toi à genoux face à la machine et saisis la corde au-dessus de la tête. C'est ta position de départ.","En expirant, contracte les abdominaux pour fléchir le buste vers les cuisses. Le bas du dos doit s'arrondir. Ne tire pas avec les bras.","Tiens la contraction une seconde au bas du mouvement.","Inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : garde les hanches immobiles ; seul le buste doit se fléchir."],Ab_Crunch_Machine:["Règle la machine selon ta taille. Assieds-toi et place les pieds sous les rouleaux (si disponibles). Saisis les poignées au-dessus de la tête. C'est ta position de départ.","En expirant, contracte les abdominaux et fléchis le buste vers les cuisses.","Tiens la contraction une seconde, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Hanging_Leg_Raise:["Suspends-toi à une barre de traction, les bras tendus, prise pronation à la largeur des épaules. C'est ta position de départ.","En expirant, lève les jambes tendues (ou fléchies pour faciliter) jusqu'à ce qu'elles soient parallèles au sol ou plus haut.","Tiens la position une seconde au sommet, puis inspire et redescends lentement les jambes à la position de départ.","Répète pour le nombre de répétitions prescrit."],Knee_Hip_Raise_On_Parallel_Bars:["Monte sur les barres parallèles en te soutenant sur les avant-bras. Garde les épaules vers le bas. C'est ta position de départ.","En expirant, remonte les genoux vers la poitrine en fléchissant les hanches et les genoux.","Tiens la contraction une seconde au sommet.","Inspire et redescends lentement les jambes à la position de départ.","Répète pour le nombre de répétitions prescrit."],Russian_Twist:["Assieds-toi sur le sol, les genoux fléchis, les pieds légèrement décollés du sol (ou au sol pour faciliter). Penche le buste en arrière à environ 45 degrés. Tends les bras devant toi ou tiens un poids. C'est ta position de départ.","En expirant, tourne le buste vers la droite autant que possible. Tiens une seconde.","Reviens au centre, puis tourne vers la gauche. C'est une répétition.","Répète pour le nombre de répétitions prescrit.","Attention : garde le dos droit (légèrement arrondi est toléré) et les épaules loin des oreilles."],Standing_Cable_Wood_Chop:["Fixe une poignée à une poulie haute. Tiens-toi de côté par rapport à la machine, les pieds à la largeur des épaules. Saisis la poignée à deux mains, les bras tendus. C'est ta position de départ.","En expirant, tire la poignée vers le bas et en travers du corps jusqu'à la hauteur du genou opposé, en faisant pivoter le buste.","Garde les bras tendus pendant tout le mouvement.","Tiens une seconde au bas du mouvement.","Inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit, puis change de côté.","Attention : le mouvement doit provenir de la rotation du buste, pas seulement des bras.","Variante : cet exercice peut aussi être réalisé depuis une poulie basse (dans ce cas, le mouvement va du bas vers le haut)."],Landmine_180s:["Place une barre dans un landmine ou coince une extrémité dans un coin. Charge l'autre extrémité. Saisis l'extrémité chargée à deux mains, les bras tendus devant toi. Pieds à la largeur des épaules. C'est ta position de départ.","En expirant, pivote le buste et amène la barre d'un côté à l'autre en arc de cercle (de gauche à droite ou l'inverse).","Amène la barre jusqu'à la hauteur de la hanche de chaque côté.","Reviens au centre, puis pivote de l'autre côté. C'est une répétition.","Répète pour le nombre de répétitions prescrit."],Torso_Rotation:["Assieds-toi sur la machine à rotation du tronc et fixe tes pieds. Saisis les poignées et tourne le buste dans la direction prescrite par la machine. C'est ta position de départ.","Tourne lentement dans l'autre direction autant que possible en expirant, puis reviens lentement à la position de départ. Répète pour le nombre de répétitions prescrit, puis change de sens."],Plank:["Allonge-toi face contre sol. Appuie-toi sur les avant-bras et les orteils. Garde le corps bien gainé, aligné de la tête aux pieds. C'est ta position de départ.","Maintiens cette position aussi longtemps que prescrit, en respirant normalement. Ne laisse pas les hanches monter ou descendre."],Barbell_Ab_Rollout:["Charge légèrement une barre et pose-la sur le sol. Mets-toi à genoux derrière la barre et saisis-la avec une prise pronation à la largeur des épaules. C'est ta position de départ.","En inspirant, fais rouler la barre vers l'avant en étendant les bras et le corps le plus loin possible sans que les hanches ne touchent le sol.","En expirant, contracte les abdominaux pour revenir à la position de départ en faisant rouler la barre vers toi.","Répète pour le nombre de répétitions prescrit."],Leg_Press:["Assieds-toi à la presse à cuisses et place les pieds à la largeur des épaules sur la plateforme. Règle le dossier pour que les genoux forment un angle de 90 degrés. Déverrouille la machine. C'est ta position de départ.","En inspirant, descends la plateforme lentement vers toi en fléchissant les genoux jusqu'à 90 degrés. Garde le dos plat contre le siège.","En expirant, pousse la plateforme vers le haut jusqu'à l'extension presque complète des jambes. Ne verrouille pas les genoux en haut.","Répète pour le nombre de répétitions prescrit.","Attention : ne laisse pas les genoux rentrer vers l'intérieur et n'arrondis pas le bas du dos."],Cable_Chest_Press:["Règle deux poulies à la hauteur des épaules. Saisis une poignée dans chaque main et tiens-toi au centre, un pied avancé pour l'équilibre. Les bras sont fléchis, coudes légèrement vers le bas. C'est ta position de départ.","En expirant, pousse les deux poignées vers l'avant jusqu'à extension presque complète des bras en les rapprochant légèrement au centre.","Tiens une seconde et contracte les pectoraux, puis inspire et reviens lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Shoulder_Press:["Règle deux poulies au niveau des épaules ou un peu en dessous. Saisis une poignée dans chaque main et tiens-toi au centre, les coudes fléchis et les paumes vers l'avant. C'est ta position de départ.","En expirant, pousse les deux poignées vers le haut jusqu'à extension complète des bras.","Tiens une seconde, puis inspire et redescends lentement à la position de départ.","Répète pour le nombre de répétitions prescrit."],Cable_Reverse_Crunch:["Attache une corde ou des sangles de cheville à une poulie basse. Allonge-toi sur le dos face à la machine et fixe les sangles à tes chevilles. Étends les jambes vers la machine. C'est ta position de départ.","En expirant, ramène les genoux vers la poitrine en fléchissant les hanches et les genoux, en soulevant légèrement le bassin du sol.","Tiens la contraction une seconde.","Inspire et redescends lentement les jambes à la position de départ.","Répète pour le nombre de répétitions prescrit.","Attention : concentre-toi sur la contraction des abdominaux inférieurs plutôt que de te balancer pour prendre de l'élan."]};let te=null;function Is(){if(!document.body)return 0;const e=document.createElement("div");e.style.cssText="position:fixed;inset:0;visibility:hidden;pointer-events:none;",document.body.appendChild(e);const t=Math.round(e.getBoundingClientRect().height);return e.remove(),t}function ue(){const e=window.visualViewport,t=Math.round(e?.height??window.innerHeight),s=Is(),n=Math.max(t,s);return n>0&&document.documentElement.style.setProperty("--app-height",`${n}px`),Os(n),n}function Os(e){const t=window.screen?.height??0,n=(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0)&&t>0&&e<t-24;document.documentElement.style.setProperty("--safe-bottom-eff",n?"0px":"env(safe-area-inset-bottom, 0px)")}function O(){te===null&&(te=requestAnimationFrame(()=>{te=null,ue()}))}function zs(){ue(),window.addEventListener("resize",O),window.addEventListener("orientationchange",()=>{O(),setTimeout(ue,350)}),window.visualViewport?.addEventListener("resize",O),window.addEventListener("pageshow",O),document.readyState!=="complete"&&window.addEventListener("load",O,{once:!0})}function Ns(){const e=document.createElement("div");e.style.cssText=`
    position: fixed; visibility: hidden; pointer-events: none;
    top: env(safe-area-inset-top, 0px);
    right: env(safe-area-inset-right, 0px);
    bottom: env(safe-area-inset-bottom, 0px);
    left: env(safe-area-inset-left, 0px);
  `,document.body.appendChild(e);const t=getComputedStyle(e),s={top:t.top,right:t.right,bottom:t.bottom,left:t.left};e.remove();const n=document.getElementById("app"),a=document.querySelector(".dock"),r=document.createElement("div");r.style.cssText="position:fixed;inset:0;visibility:hidden;pointer-events:none;",document.body.appendChild(r);const l=Math.round(r.getBoundingClientRect().height);return r.remove(),{screenY:window.screenY??null,availHeight:window.screen?.availHeight??null,innerHeight:window.innerHeight,visualViewport:window.visualViewport?Math.round(window.visualViewport.height):null,icbHeight:l,clientHeight:document.documentElement.clientHeight,screenHeight:window.screen?.height??null,appHeight:n?Math.round(n.getBoundingClientRect().height):null,dockBottom:a?Math.round(a.getBoundingClientRect().bottom):null,appHeightVar:getComputedStyle(document.documentElement).getPropertyValue("--app-height").trim()||"(unset)",insets:s,standalone:window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0,dpr:window.devicePixelRatio}}function N(e,t,{action:s=""}={}){return`
    <div class="sheet-backdrop" data-action="sheet:close"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="${m(e)}">
      <div class="sheet-grip"></div>
      <header class="sheet-head">
        <h2 class="sheet-title">${m(e)}</h2>
        ${s}
        <button class="icon-btn" data-action="sheet:close" aria-label="${i("close")}">
          ${d("close",{size:20})}
        </button>
      </header>
      <div class="sheet-body">${t}</div>
    </section>`}function Us(){const e=o.templates||[];return N(i("choose_template"),`
    ${e.map(t=>{const s=k(t.focus||t.name);return`
        <button class="card card--interactive" data-action="template:use" data-id="${t.id}"
                style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                       text-align:left;margin-bottom:var(--space-2);border-left:3px solid ${s}">
          <span style="flex:1;min-width:0">
            <span style="display:block;font-family:var(--font-display);font-size:var(--text-lg);
                         letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${s}">
              ${m(t.name)}
            </span>
            <span class="metric-label" style="display:block;margin-top:2px">
              ${t.exercises.length} ${i("ex_lbl")} · ${m(t.exercises.slice(0,3).join(", "))}${t.exercises.length>3?"…":""}
            </span>
          </span>
          <span style="color:var(--text-faint)">${d("chevronRight",{size:18})}</span>
        </button>`}).join("")}

    <button class="btn btn--secondary btn--block" data-action="template:blank"
            style="margin-top:var(--space-3)">
      ${d("plus",{size:18})} ${i("blank_workout")}
    </button>`)}function Gs(){const e=(o.libraryQuery||"").toLowerCase().trim(),t=o.libraryGroup||null;let s=ce;if(t){const n=y.find(r=>r.id===t),a=new Set(n.muscles.map(r=>r.toLowerCase()));s=s.filter(r=>(r.muscles||[]).some(l=>a.has(l.name.toLowerCase())))}return e&&(s=s.filter(n=>n.name.toLowerCase().includes(e)||(n.aliases||[]).some(a=>a.toLowerCase().includes(e)))),N(i("library"),`
    <input class="text-input" placeholder="${i("search_exercises")}"
           value="${m(o.libraryQuery||"")}"
           data-input="library:search" autofocus
           style="margin-bottom:var(--space-3)">

    <div class="chip-rail">
      <button class="chip" data-action="library:filter" data-group=""
              style="--chip-color:${t?"var(--text-tertiary)":"var(--gold)"};flex:none">
        ${i("all")}
      </button>
      ${y.map(n=>`
        <button class="chip" data-action="library:filter" data-group="${n.id}"
                style="--chip-color:${t===n.id?n.color:"var(--text-tertiary)"};flex:none">
          ${m(n.label)}
        </button>`).join("")}
    </div>

    ${s.length?s.slice(0,60).map(n=>{const a=(n.muscles||[]).filter(r=>r.role==="primary").map(r=>r.name);return`
            <button class="card card--interactive" data-action="library:add" data-name="${m(n.name)}"
                    style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                           text-align:left;margin-bottom:var(--space-2)">
              <span style="flex:1;min-width:0">
                <span style="display:block;font-size:var(--text-base);font-weight:700;
                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${m(n.name)}
                </span>
                <span class="metric-label" style="display:block;margin-top:2px">
                  ${m(a.join(" · ")||n.category)}
                </span>
              </span>
              <span style="color:var(--gold)">${d("plus",{size:18})}</span>
            </button>`}).join(""):`<p class="empty-body" style="margin:var(--space-8) auto">${i("no_results")}</p>`}

    <button class="btn btn--ghost btn--block" data-action="library:manual" style="margin-top:var(--space-3)">
      ${i("manual_ex")}
    </button>`)}function Hs(){const e=o.sheet.props?.name,t=Ye(e);if(!t)return N(e||i("exercise_info"),`<p class="empty-body">${i("no_details")}</p>`);const s=(t.muscles||[]).filter(l=>l.role==="primary"),n=(t.muscles||[]).filter(l=>l.role==="secondary"),a=Te()==="fr"&&Bs[t.id]||t.instructions||[],r=l=>l.map(u=>`
        <div class="row gap-2" style="padding:var(--space-2) 0">
          <span style="flex:1;font-size:var(--text-sm)">${m(u.name)}</span>
          <span style="display:flex;gap:2px">
            ${Array.from({length:5},(c,b)=>`<span style="width:6px;height:6px;border-radius:50%;
                            background:${b<u.score?"var(--gold)":"var(--line-default)"}"></span>`).join("")}
          </span>
        </div>`).join("");return N(t.name,`
    <div class="row gap-2" style="flex-wrap:wrap;margin-bottom:var(--space-4)">
      ${[t.level,t.mechanic,t.force,t.equipment].filter(Boolean).map(l=>`<span class="chip" style="--chip-color:var(--text-tertiary)">${m(l)}</span>`).join("")}
    </div>

    ${s.length?`<h3 class="section-label">${i("primary")}</h3>${r(s)}`:""}
    ${n.length?`<h3 class="section-label" style="margin-top:var(--space-4)">${i("secondary")}</h3>${r(n)}`:""}

    ${a.length?`<h3 class="section-label" style="margin-top:var(--space-5)">${i("instructions")}</h3>
         <ol style="margin:0;padding-left:var(--space-5);color:var(--text-secondary);
                    font-size:var(--text-sm);line-height:1.65">
           ${a.map(l=>`<li style="margin-bottom:var(--space-2)">${m(l)}</li>`).join("")}
         </ol>`:""}`)}function ke(e,t,s){return`
    <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
      <span style="flex:1;font-size:var(--text-base);font-weight:600">${e}</span>
      <button data-action="settings:toggle" data-key="${t}"
              role="switch" aria-checked="${s}" aria-label="${e}"
              style="width:50px;height:30px;border-radius:var(--radius-pill);flex:none;
                     background:${s?"var(--gold)":"var(--surface-elevated)"};
                     border:1px solid ${s?"transparent":"var(--line-default)"};
                     position:relative;transition:background var(--duration-fast) var(--ease-out)">
        <span style="position:absolute;top:3px;left:${s?"23px":"3px"};
                     width:22px;height:22px;border-radius:50%;
                     background:${s?"var(--gold-ink)":"var(--text-tertiary)"};
                     transition:left var(--duration-fast) var(--ease-spring)"></span>
      </button>
    </div>`}function Vs(){const{settings:e,user:t}=o,s=Te();return N(i("settings"),`
    <h3 class="section-label">${i("profile")}</h3>
    <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
      <span style="color:var(--gold)">${d("user",{size:20})}</span>
      <span style="flex:1;font-size:var(--text-base);font-weight:700">${m(t?.name||"")}</span>
      <button class="btn btn--sm btn--secondary" data-action="profile:switch">${i("switch_user")}</button>
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${i("language")}</h3>
    <div class="segmented" style="width:100%;display:flex">
      ${wt.map(n=>`
        <button class="segmented-option ${s===n?"is-active":""}"
                data-action="settings:lang" data-lang="${n}" style="flex:1">
          ${n.toUpperCase()}
        </button>`).join("")}
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${i("feedback")}</h3>
    ${ke(i("haptics"),"haptics",e.haptics)}
    ${ke(i("sound"),"sound",e.sound)}

    <h3 class="section-label" style="margin-top:var(--space-5)">${i("units")}</h3>
    <div class="segmented" style="width:100%;display:flex">
      ${["kg","lb"].map(n=>`
        <button class="segmented-option ${e.units===n?"is-active":""}"
                data-action="settings:units" data-units="${n}" style="flex:1">
          ${n.toUpperCase()}
        </button>`).join("")}
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${i("data")}</h3>
    <div class="row gap-2">
      <button class="btn btn--secondary" data-action="data:export" style="flex:1">
        ${d("download",{size:17})} ${i("export_data")}
      </button>
      <button class="btn btn--secondary" data-action="data:import" style="flex:1">
        ${d("upload",{size:17})} ${i("import_data")}
      </button>
    </div>
    <p style="margin-top:var(--space-3);font-size:var(--text-xs);color:var(--text-faint);line-height:1.6">
      ${i("data_local_notice")}
    </p>

    ${Ws()}`)}function Ws(){const e=Ns(),t=[["window.innerHeight",`${e.innerHeight}px`],["visualViewport",e.visualViewport===null?"unsupported":`${e.visualViewport}px`],["containing block",`${e.icbHeight}px`],["documentElement",`${e.clientHeight}px`],["--app-height",e.appHeightVar],["#app height",`${e.appHeight}px`],["dock bottom edge",`${e.dockBottom}px`],["screen height",`${e.screenHeight}px`],["avail height",e.availHeight===null?"unknown":`${e.availHeight}px`],["view top on screen",e.screenY===null?"unknown":`${e.screenY}px`],["safe top / bottom",`${e.insets.top} / ${e.insets.bottom}`],["standalone",e.standalone?"yes":"no (browser)"]];return`
    <details style="margin-top:var(--space-6);border-top:1px solid var(--line-subtle);
                    padding-top:var(--space-4)">
      <summary style="font-size:var(--text-2xs);font-weight:700;
                      letter-spacing:var(--tracking-widest);text-transform:uppercase;
                      color:var(--text-faint);cursor:pointer;list-style:none">
        ${i("layout_diagnostic")}
      </summary>
      <div style="margin-top:var(--space-3);font-family:var(--font-mono);
                  font-size:var(--text-xs);color:var(--text-tertiary)">
        ${t.map(([s,n])=>`
            <div style="display:flex;gap:var(--space-3);padding:3px 0">
              <span style="flex:1;min-width:0">${s}</span>
              <span style="color:var(--text-secondary)">${m(n)}</span>
            </div>`).join("")}
      </div>
    </details>`}function Ys(){if(!o.sheet)return"";switch(o.sheet.type){case"template-picker":return Us();case"library":return Gs();case"exercise-detail":return Hs();case"settings":return Vs();default:return""}}const Js="lifttrack-";async function Ks(){if("caches"in window){try{const t=(await caches.keys()).filter(s=>s.startsWith(Js));t.length&&(await Promise.all(t.map(s=>caches.delete(s))),console.info(`[migration] removed ${t.length} legacy cache(s):`,t.join(", ")))}catch(e){console.warn("[migration] cache cleanup failed",e)}if("serviceWorker"in navigator)try{const e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(async t=>{const s=t.active?.scriptURL||t.installing?.scriptURL||t.waiting?.scriptURL||"";!/\/sw\.js(\?|$)/.test(s)&&s&&(await t.unregister(),console.info("[migration] unregistered legacy worker:",s))}))}catch(e){console.warn("[migration] worker cleanup failed",e)}}}function Zs(){if(!("serviceWorker"in navigator))return;let e=!1;navigator.serviceWorker.addEventListener("controllerchange",()=>{e||(e=!0,window.location.reload())})}const Se=4,Qs=21,Xs=864e5;function Xe(e){return f(e,"backup_state")}function en(e){return Y(Xe(e),{lastExportAt:null,sessionsAtExport:0})}function tn(e,t){J(Xe(e),{lastExportAt:Date.now(),sessionsAtExport:t})}function et(e,t){if(t===0)return{due:!1,reason:null,newSessions:0};const{lastExportAt:s,sessionsAtExport:n}=en(e),a=Math.max(0,t-(n||0));return s?a>=Se?{due:!0,reason:"sessions",newSessions:a}:Date.now()-s>Qs*Xs&&a>0?{due:!0,reason:"age",newSessions:a}:{due:!1,reason:null,newSessions:a}:{due:t>=Se,reason:"never",newSessions:t}}async function sn(e,t){const s=JSON.stringify(e,null,2),n=new File([s],t,{type:"application/json"});if(navigator.canShare?.({files:[n]}))try{return await navigator.share({files:[n],title:t}),!0}catch(u){if(u?.name==="AbortError")return!1}const a=new Blob([s],{type:"application/json"}),r=URL.createObjectURL(a),l=document.createElement("a");return l.href=r,l.download=t,l.click(),URL.revokeObjectURL(r),!0}const Ce=document.getElementById("app"),se=document.getElementById("toast");let Ee=null;function w(e,t=""){se.textContent=e,se.className=`toast is-visible ${t?`is-${t}`:""}`,clearTimeout(Ee),Ee=setTimeout(()=>{se.className="toast"},2600)}const Re=[{id:"log",icon:"log",label:"tab_log"},{id:"plan",icon:"plan",label:"tab_plan"},{id:"muscles",icon:"muscles",label:"tab_muscles"},{id:"stats",icon:"stats",label:"tab_stats"}];function nn(){const e=!!o.workout&&o.tab==="workout",t=Re.slice(0,2),s=Re.slice(2),n=a=>`
    <button class="dock-tab ${o.tab===a.id?"is-active":""}"
            data-action="nav:tab" data-tab="${a.id}"
            aria-label="${i(a.label)}" aria-current="${o.tab===a.id}">
      ${d(a.icon,{size:22})}
      <span class="dock-tab-label">${i(a.label)}</span>
    </button>`;return`
    <nav class="dock" aria-label="Main">
      ${t.map(n).join("")}
      <div class="dock-action">
        <button class="dock-action-btn ${e?"is-active":""}"
                data-action="${e?"workout:leave":"workout:quickstart"}"
                aria-label="${i(e?"close":"start_workout")}">
          ${d("plus",{size:26,stroke:2.4})}
        </button>
      </div>
      ${s.map(n).join("")}
    </nav>`}function an(e){switch(e){case"workout":return ps();case"plan":return Fs();case"muscles":return Ss();case"stats":return Ts();default:return ns()}}function rn(){if(!o.ready)return;if(!o.user){Ce.innerHTML=gs();return}const e=document.getElementById("content")?.scrollTop??0,t=an(o.tab);Ce.innerHTML=`
    <header class="screen-header">${t.header}</header>
    <main class="content" id="content">
      <div class="content-inner">${t.body}</div>
    </main>
    ${t.footer||""}
    ${o.tab==="workout"?"":nn()}
    ${Ys()}
  `;const s=document.getElementById("content");s&&(s.scrollTop=e)}it(rn);function tt(e){const s=[...o.sessions].reverse().find(c=>c.exercises.some(b=>b.name===e))?.exercises.find(c=>c.name===e)?.sets,n=Oe(e,s),a=Ie(e),r=n?.sets||a.sets,l=n?String(n.reps):"",u=n?String(n.weight):"";return Array.from({length:r},()=>({r:l,w:u,done:!1}))}function X(e,t=[]){return{date:new Date().toISOString().slice(0,10),focus:e,startedAt:Date.now(),templateFrom:null,exercises:t.map(s=>({name:s,sets:tt(s)}))}}function x(){ct(o.user?.id,o.workout)}p("nav:tab",({tab:e})=>g({tab:e,expandedSessionId:null}));p("workout:quickstart",()=>{if(o.workout){g({tab:"workout"});return}g({sheet:{type:"template-picker"}})});p("workout:start",({focus:e})=>{const t=o.templates.find(s=>s.name===e||s.focus===e);R(s=>{s.workout=X(e,t?.exercises||[]),s.tab="workout"}),x(),_("select")});p("workout:resume",()=>g({tab:"workout"}));p("workout:leave",()=>{g({tab:"log"})});p("workout:save",async()=>{const e=o.workout;if(!e)return;const s=e.exercises.some(c=>c.sets.some(b=>b.done))?c=>c.done&&Number(c.r)>0:c=>Number(c.r)>0,n=e.exercises.map(c=>({name:c.name,sets:c.sets.filter(s).map(b=>({r:Number(b.r),w:Number(b.w)||0}))})).filter(c=>c.name&&c.sets.length);if(!n.length){w(i("add_at_least"),"error"),z("error");return}const a=K(o.user.id),r=await a.add({date:e.date,focus:e.focus,exercises:n}),l=await a.list(),u=r.exercises.some(c=>Q(l,r,c.name));R(c=>{c.sessions=l,c.workout=null,c.restEndsAt=null,c.tab="log"}),x(),g({backupDue:et(o.user.id,l.length).due}),z(u?"pr":"saved"),w(u?`${i("session_saved")} · ${i("new_pr")}!`:i("session_saved"),"success")});Z("set:reps",(e,{ex:t,set:s})=>{o.workout.exercises[+t].sets[+s].r=e.replace(/[^\d]/g,""),x()});Z("set:weight",(e,{ex:t,set:s})=>{o.workout.exercises[+t].sets[+s].w=e.replace(/[^\d.,]/g,"").replace(",","."),x()});p("set:toggle",({ex:e,set:t})=>{const s=o.workout.exercises[+e].sets[+t];s.done=!s.done,s.done?(z("setComplete"),o.restEndsAt||st(90)):_("tap"),x(),$()});p("set:add",({ex:e})=>{const t=o.workout.exercises[+e].sets,s=t.at(-1);t.push({r:s?.r??"",w:s?.w??"",done:!1}),x(),$()});p("exercise:remove",({ex:e})=>{o.workout.exercises.splice(+e,1),x(),$()});p("suggestion:apply",({ex:e,sets:t,reps:s,weight:n})=>{o.workout.exercises[+e].sets=Array.from({length:+t},()=>({r:String(s),w:String(n),done:!1})),x(),_("select"),$()});let D=null;function st(e){R(t=>{t.restEndsAt=Date.now()+e*1e3,t.restDuration=e}),clearInterval(D),D=setInterval(on,250)}function on(){if(!o.restEndsAt)return;const e=Math.max(0,Math.ceil((o.restEndsAt-Date.now())/1e3)),t=document.getElementById("rest-remaining"),s=document.getElementById("rest-fill");t&&(t.textContent=`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`),s&&(s.style.width=`${e/o.restDuration*100}%`),e<=0&&(clearInterval(D),D=null,z("restOver"),g({restEndsAt:null,restDuration:0}))}p("rest:start",({seconds:e})=>st(+e));p("rest:cancel",()=>{clearInterval(D),D=null,g({restEndsAt:null,restDuration:0})});p("session:toggle",({id:e})=>g({expandedSessionId:o.expandedSessionId===e?null:e}));p("session:delete",async({id:e})=>{if(!confirm(i("delete_confirm")))return;const t=K(o.user.id);await t.remove(e),g({sessions:await t.list(),expandedSessionId:null}),w(i("deleted"))});p("session:repeat",({id:e})=>{const t=o.sessions.find(s=>s.id===e);t&&(R(s=>{s.workout={date:new Date().toISOString().slice(0,10),focus:t.focus,startedAt:Date.now(),templateFrom:t.date,exercises:t.exercises.map(n=>({name:n.name,sets:n.sets.map(a=>({r:String(a.r),w:String(a.w),done:!1}))}))},s.tab="workout"}),x())});Z("profile:name",e=>{nt=e});let nt="";p("profile:create",async()=>{const e=nt.trim();if(!e){w(i("enter_name"),"error");return}if(o.users.some(n=>n.name.toLowerCase()===e.toLowerCase())){w(i("name_taken"),"error");return}const t={id:crypto.randomUUID(),name:e},s=[...o.users,t];lt(s),de(t.id),g({users:s}),await he(t)});p("profile:select",async({id:e})=>{const t=o.users.find(s=>s.id===e);t&&(de(e),await he(t))});p("profile:switch",()=>{de(null),R(e=>{e.user=null,e.sessions=[],e.workout=null,e.sheet=null})});p("sheet:close",()=>g({sheet:null}));p("settings:open",()=>g({sheet:{type:"settings"}}));p("exercise:browse",()=>g({sheet:{type:"library"},libraryQuery:""}));p("exercise:info",({name:e})=>g({sheet:{type:"exercise-detail",props:{name:e}}}));Z("library:search",e=>{o.libraryQuery=e,$()});p("library:filter",({group:e})=>g({libraryGroup:e||null}));p("library:add",({name:e})=>{o.workout?(o.workout.exercises.push({name:e,sets:tt(e)}),g({sheet:null})):R(t=>{t.workout=X("Other",[e]),t.tab="workout",t.sheet=null}),x(),_("select")});p("library:manual",()=>{const e=prompt(i("ex_name_ph"));e?.trim()&&o.workout&&(o.workout.exercises.push({name:e.trim(),sets:[{r:"",w:"",done:!1}]}),x(),g({sheet:null}))});p("template:use",({id:e})=>{const t=o.templates.find(s=>s.id===e);t&&(R(s=>{s.workout=X(t.focus||t.name,t.exercises),s.tab="workout",s.sheet=null}),x(),_("select"))});p("template:blank",()=>{R(e=>{e.workout=X("Other",[]),e.tab="workout",e.sheet=null}),x()});p("template:toggle",({id:e})=>g({expandedTemplateId:o.expandedTemplateId===e?null:e}));p("template:delete",({id:e})=>{if(!confirm(i("delete_confirm")))return;const t=o.templates.filter(s=>s.id!==e);P(o.user.id,t),g({templates:t,expandedTemplateId:null}),w(i("deleted"))});p("template:remove-ex",({id:e,index:t})=>{const s=o.templates.find(n=>n.id===e);s&&(s.exercises.splice(+t,1),P(o.user.id,o.templates),$())});p("template:add-ex",({id:e})=>{const t=prompt(i("ex_name_ph"));if(!t?.trim())return;const s=o.templates.find(n=>n.id===e);s&&(s.exercises.push(t.trim()),P(o.user.id,o.templates),$())});p("template:create",()=>{const e=prompt(i("tmpl_name_ph"));if(!e?.trim())return;if(o.templates.some(s=>s.name.toLowerCase()===e.trim().toLowerCase())){w(i("tmpl_exists"),"error");return}const t=[...o.templates,_t(e)];P(o.user.id,t),g({templates:t}),w(i("tmpl_created"),"success")});p("muscle:subtab",({sub:e})=>g({muscleSubtab:e}));p("muscle:open",({group:e})=>g({muscleSubtab:"library",libraryGroup:e}));p("stats:exercise",({name:e})=>g({statsExercise:e}));p("stats:metric",({metric:e})=>g({statsMetric:e}));p("plan:prev",()=>at(-1));p("plan:next",()=>at(1));p("plan:day",({date:e})=>g({planSelectedDate:o.planSelectedDate===e?null:e}));function at(e){const t=new Date;let s=o.planYear??t.getFullYear(),n=(o.planMonth??t.getMonth())+e;n<0&&(n=11,s-=1),n>11&&(n=0,s+=1),g({planYear:s,planMonth:n,planSelectedDate:null})}p("settings:lang",({lang:e})=>{ie(e),$()});p("settings:toggle",({key:e})=>{const t={...o.settings,[e]:!o.settings[e]};qe(o.user.id,t),e==="haptics"&&Pe(t.haptics),e==="sound"&&Le(t.sound),g({settings:t}),t[e]&&z("setComplete")});p("settings:units",({units:e})=>{const t={...o.settings,units:e};qe(o.user.id,t),g({settings:t})});p("data:export",async()=>{const e={version:1,exportedAt:new Date().toISOString(),profile:o.user.name,sessions:o.sessions,templates:o.templates,settings:o.settings},t=`lifttrack-${o.user.name}-${new Date().toISOString().slice(0,10)}.json`;await sn(e,t)&&(tn(o.user.id,o.sessions.length),g({backupDue:!1}),w(i("backup_saved"),"success"))});p("backup:dismiss",()=>g({backupDue:!1}));p("data:import",()=>{const e=document.createElement("input");e.type="file",e.accept="application/json",e.onchange=async()=>{const t=e.files?.[0];if(t)try{const s=JSON.parse(await t.text());if(!Array.isArray(s.sessions))throw new Error("no sessions array");const n=K(o.user.id);if(await n.bulkPut(s.sessions.map(a=>({...a,id:crypto.randomUUID()}))),Array.isArray(s.templates)&&s.templates.length){const a=[...o.templates];s.templates.forEach(r=>{a.some(l=>l.name.toLowerCase()===r.name?.toLowerCase())||a.push({...r,id:crypto.randomUUID()})}),P(o.user.id,a),g({templates:a})}g({sessions:await n.list(),sheet:null}),w(`${s.sessions.length} ${i("sessions_lbl")}`,"success")}catch(s){console.error("[import] failed",s),w(i("import_failed"),"error")}},e.click()});function ln(e){return!e||typeof e!="object"?null:typeof e.startedAt=="number"?e:{date:e.date||new Date().toISOString().slice(0,10),focus:e.focus||"Other",startedAt:Date.now(),templateFrom:e.templateFrom??null,exercises:(e.exercises||[]).map(t=>({name:t.name||"",sets:(t.sets||[]).map(s=>({r:s.r??"",w:s.w??"",done:Number(s.r)>0}))}))}}async function he(e){g({loading:!0});const t=pt(e.id);Pe(t.haptics),Le(t.sound);const s=K(e.id);let n=[];try{n=await s.list()}catch(a){console.error("[bootstrap] failed to load sessions",a),w(i("failed_load"),"error")}R(a=>{a.user=e,a.settings=t,a.sessions=n,a.templates=xt(e.id),a.workout=ln(dt(e.id)),a.backupDue=et(e.id,n.length).due,a.loading=!1,a.tab="log"})}async function un(){zs(),Ks(),Zs(),$t(),Rt(),St();const e=ot();g({users:e,ready:!0});const t=ut(),s=e.find(n=>n.id===t);s?await he(s):$(),setInterval(()=>{if(o.tab!=="workout"||!o.workout)return;const n=document.getElementById("workout-elapsed");if(!n)return;const a=Math.floor((Date.now()-o.workout.startedAt)/1e3),r=Math.floor(a/60);n.textContent=`${r}:${String(a%60).padStart(2,"0")}`},1e3)}un();
