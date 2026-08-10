export default {
  // --- Navigation ---
  tab_log: 'Journal', tab_plan: 'Planning', tab_muscles: 'Muscles', tab_stats: 'Stats',

  // --- Core metrics ---
  sessions: 'Séances', volume: 'Volume', prs: 'Records',
  this_week: 'Cette semaine', streak: 'Série', streak_unit: 'sem',
  // Short form for the narrow metric tiles.
  week_short: 'Sem.',
  rest: 'j repos', total_lbl: 'total',

  // --- Workout / set entry ---
  reps: 'Répétitions', reps_short: 'rép', weight: 'Charge',
  sets: 'séries', set_done: 'Série terminée', mark_set_done: 'Marquer la série terminée',
  add_set: 'Ajouter une série', remove_set: 'Retirer la série',
  add_exercise: 'Ajouter un exercice',
  remove_exercise: "Retirer l'exercice",
  collapse_exercise: "Réduire l'exercice", expand_exercise: "Développer l'exercice",
  exercise_info: "Détails de l'exercice", unnamed_exercise: 'Exercice sans nom',
  no_exercises_yet: "Pas encore d'exercices",
  no_exercises_body: 'Ajoute ton premier exercice pour commencer à enregistrer des séries.',
  finish: 'Terminer', apply: 'Appliquer', skip: 'Passer', last_time: 'Dernière fois',
  rest_timer: 'Minuteur de repos', start_workout: 'Commencer',
  workout_in_progress: 'Séance en cours',
  resume: 'Reprendre', discard: 'Abandonner',
  discard_confirm: 'Abandonner cette séance ? Les séries enregistrées seront perdues.',

  // --- Log screen ---
  next_up: 'Prochaine', recent_workouts: 'Séances récentes',
  no_sessions: 'Aucune séance.',
  onboard_title: 'Bienvenue sur LiftTrack',
  onboard_sub: 'Choisis un modèle et enregistre ta première séance.',
  onboard_cta: 'Commencer ta première séance',
  schedule_link: 'Planifier une date',
  edit: 'Modifier', use_as_template: 'Utiliser comme modèle', delete: 'Supprimer',
  save_as_template: 'Enregistrer comme modèle', rename: 'Renommer',
  muscle_breakdown: 'Détail par muscle', view_exercises: 'Voir les exercices',
  start_focus: 'Commencer {focus}',
  colour: 'Couleur', colour_auto: 'Automatique',
  build_session: 'Créer une séance', equipment: 'Matériel',
  build_session_hint: 'Choisit des exercices pour les muscles les plus en retard cette semaine, et assez frais pour travailler.',
  plan_nothing_due: 'Aucun muscle en retard — repos, ou choisis un modèle.',
  alternatives: 'Alternatives', swap: 'Remplacer', same_movement: 'même mouvement',
  alternatives_hint: "Travaille la même chose — utile si le matériel est pris.",
  swapped_for: 'Remplacé par {name}', reorder_exercise: "Déplacer l'exercice",
  edit_session: 'Modifier la séance', date: 'Date', session_focus: 'Type',
  invalid_date: 'Choisis une date valide', tmpl_renamed: 'Modèle renommé',
  session_saved: 'Séance enregistrée', session_updated: 'Séance mise à jour',
  deleted: 'Supprimé', delete_confirm: 'Supprimer cette séance ?',
  add_at_least: 'Ajoute au moins un exercice',
  new_pr: 'RECORD',

  // --- Templates ---
  choose_template: 'Choisir un modèle', templates: 'Modèles',
  blank_workout: 'Séance vierge', ex_lbl: 'ex',
  create_template: 'Créer un modèle', save_template: 'Enregistrer le modèle',
  tmpl_name_ph: 'Nom du modèle…', tmpl_created: 'Modèle créé',
  tmpl_exists: 'Ce modèle existe déjà', enter_tmpl_name: 'Entre un nom de modèle',
  tmpl_from: 'Depuis le modèle', clear: 'Effacer',

  // --- Library ---
  library: 'Bibliothèque', search_exercises: 'Rechercher un exercice…',
  no_results: 'Aucun exercice correspondant', primary: 'Principal', secondary: 'Secondaire',
  instructions: 'Instructions', no_details: 'Aucun détail disponible pour le moment.',
  manual_ex: 'Ajouter manuellement', similar: 'similaire', alt_lbl: 'Alternatives',

  // --- Muscles / stats ---
  muscles_title: 'Muscles', overview_title: 'Aperçu',
  subtab_exercises: 'Exercices', subtab_gains: 'Progrès',
  select_body_part: 'Sélectionne un groupe musculaire',
  muscles_lbl: 'muscles', exercises_lbl: 'exercices', exercise_lbl: 'exercice',
  logged_lbl: 'enregistrés', in_library: 'en bibliothèque',
  not_logged_yet: 'Pas encore enregistré', not_logged_short: 'non enregistré',
  est_1rm: '1RM estimé', max_weight: 'Charge max', session_volume: 'Volume de séance',
  since_start: 'depuis le début', kg_reps: 'kg·rép',
  session_split: 'Répartition des séances', vol_per_session: 'Volume par séance',
  ex_freq: 'Fréquence des exercices',
  not_enough_data: 'Pas assez de données — enregistre au moins 2 séances.',
  logs_lbl: 'séances', log_lbl: 'séance', no_logs: 'non enregistré', sessions_lbl: 'séances',

  // --- Settings extras ---
  feedback: 'Retour', data: 'Données',
  layout_diagnostic: 'Diagnostic de mise en page',
  data_local_notice:
    "Tes données d'entraînement sont stockées uniquement sur cet appareil. Exporte régulièrement — supprimer l'app les efface.",

  // --- Stats ---
  progression: 'Progression', personal_records: 'Records personnels', current: 'Actuel',

  // --- Recovery & volume model ---
  sub_recovery: 'Récupération', sub_volume: 'Volume', sub_library: 'Bibliothèque',
  recovery_status: 'État de récupération', train_next: 'À travailler', recovered: 'récupéré',
  recovery_fresh: 'Frais', recovery_ready: 'Prêt', recovery_recovering: 'En récupération',
  recovery_fatigued: 'Fatigué', recovery_cooked: 'Épuisé',
  recovery_explainer:
    "La récupération est estimée à partir des séries enregistrées, pondérées par l'implication de chaque muscle dans l'exercice, puis décroît avec le temps. Les grands groupes musculaires disposent de plus de temps pour récupérer.",
  of: 'sur',
  target: 'Cible',
  sets_week: 'séries/sem', total_sets: 'Séries totales', groups_optimal: 'Dans la cible',
  last_7_days: '7 derniers jours',
  volume_none: 'Pas travaillé cette semaine', volume_low: 'Sous la cible',
  volume_optimal: 'Dans la zone productive', volume_high: 'Au-dessus de la cible — attention à la fatigue',
  volume_behind: 'en retard sur le volume', volume_on_track: 'volume dans la cible',
  volume_empty_body: 'Enregistre quelques séances et ton volume hebdomadaire par groupe musculaire apparaîtra ici.',
  no_data_yet: 'Pas encore de données',
  all: 'Tous', showing_first: 'Affichage des {n} premiers',

  // --- Plan ---
  plan_title: 'Planning', sched_future: 'Planifier des séances',
  tap_day: 'Appuie sur un jour pour planifier une séance', add_to_plan: 'Ajouter au planning',
  scheduled: 'Planifié', today_lbl: "Aujourd'hui", select_day: "Sélectionne d'abord un jour",
  session_planned: 'Séance planifiée',

  // --- Settings / profile ---
  settings: 'Paramètres', language: 'Langue', profile: 'Profil',
  rename_user: 'Renommer', rename_user_prompt: 'Nouveau nom :',
  switch_user: 'Changer de profil', delete_user: 'Supprimer le profil',
  haptics: 'Vibrations', sound: 'Son', units: 'Unités',
  backup_due: 'Sauvegarde tes données',
  backup_due_body: "Tes séances n'existent que sur ce téléphone. Enregistre une copie dans Fichiers.",
  back_up: 'Sauvegarder',
  backup_saved: 'Sauvegarde enregistrée',
  export_data: 'Exporter les données', import_data: 'Importer des données',
  new_profile: 'Nouveau profil', get_started: 'Commencer',
  create_profile: 'Crée ton profil', whos_training: "Qui s'entraîne ?",
  your_name: 'Ton prénom…', continue_: 'Appuie pour continuer',
  enter_name: 'Entre un prénom', name_taken: 'Un profil porte déjà ce nom',

  // --- System ---
  cancel: 'Annuler', save_changes: 'Enregistrer', done: 'Terminé', close: 'Fermer',
  failed_load: 'Erreur de chargement',
  update_banner: 'Mise à jour disponible', reload: 'Recharger',
  offline_ready: 'Prêt pour le mode hors ligne',

  // --- Focus names ---
  f_Push: 'Poussée', f_Pull: 'Tirage', f_Legs: 'Jambes', f_Mixed: 'Mixte',
  f_Upper: 'Haut du corps', f_Core: 'Tronc', f_Other: 'Autre',

  // --- Equipment / categories ---
  eq_body: 'Poids du corps', eq_dbs: 'Haltères', eq_barbell: 'Barre',
  eq_cable: 'Poulie', eq_machine: 'Machine', eq_plate: 'Disques',
  cat_chest: 'Pectoraux', cat_shoulders: 'Épaules', cat_back: 'Dos',
  cat_legs: 'Jambes & Fessiers', cat_arms: 'Bras', cat_core: 'Abdominaux',

  // --- Calendar ---
  m1: 'Janvier', m2: 'Février', m3: 'Mars', m4: 'Avril',
  m5: 'Mai', m6: 'Juin', m7: 'Juillet', m8: 'Août',
  m9: 'Septembre', m10: 'Octobre', m11: 'Novembre', m12: 'Décembre',
  d_mo: 'Lu', d_tu: 'Ma', d_we: 'Me', d_th: 'Je', d_fr: 'Ve', d_sa: 'Sa', d_su: 'Di',
};
