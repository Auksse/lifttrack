export default {
  // --- Navigation ---
  tab_log: 'Log', tab_plan: 'Plan', tab_muscles: 'Muscles', tab_stats: 'Stats',

  // --- Core metrics ---
  sessions: 'Sessions', volume: 'Volume', prs: 'PRs',
  this_week: 'This week', streak: 'Streak', streak_unit: 'wk',
  // Short form for the narrow metric tiles, where "This week" truncates.
  week_short: 'Week',
  rest: 'd rest', total_lbl: 'total',

  // --- Workout / set entry ---
  reps: 'Reps', reps_short: 'reps', weight: 'Weight',
  sets: 'sets', set_done: 'Set complete', mark_set_done: 'Mark set complete',
  add_set: 'Add set', remove_set: 'Remove set',
  add_exercise: 'Add exercise', remove_exercise: 'Remove exercise',
  collapse_exercise: 'Collapse exercise', expand_exercise: 'Expand exercise',
  exercise_info: 'Exercise details', unnamed_exercise: 'Untitled exercise',
  no_exercises_yet: 'No exercises yet',
  no_exercises_body: 'Add your first exercise to start logging sets.',
  finish: 'Finish', apply: 'Apply', skip: 'Skip', last_time: 'Last time',
  rest_timer: 'Rest timer', start_workout: 'Start workout',
  workout_in_progress: 'Workout in progress',
  resume: 'Resume', discard: 'Discard',
  discard_confirm: 'Discard this workout? Logged sets will be lost.',

  // --- Log screen ---
  next_up: 'Next up', recent_workouts: 'Recent workouts',
  no_sessions: 'No sessions yet.',
  onboard_title: 'Welcome to LiftTrack',
  onboard_sub: 'Pick a template and log your first session.',
  onboard_cta: 'Start your first workout',
  schedule_link: 'Schedule a date',
  edit: 'Edit', use_as_template: 'Use as template', delete: 'Delete',
  save_as_template: 'Save as template', rename: 'Rename',
  muscle_breakdown: 'Muscle breakdown', view_exercises: 'View exercises',
  alternatives: 'Alternatives', swap: 'Swap', same_movement: 'same movement',
  alternatives_hint: 'Trains the same thing — useful when the kit is taken.',
  swapped_for: 'Swapped for {name}', reorder_exercise: 'Reorder exercise',
  edit_session: 'Edit workout', date: 'Date', session_focus: 'Focus',
  invalid_date: 'Pick a valid date', tmpl_renamed: 'Template renamed',
  session_saved: 'Workout saved', session_updated: 'Workout updated',
  deleted: 'Deleted', delete_confirm: 'Delete this session?',
  add_at_least: 'Add at least one exercise',
  new_pr: 'PR',

  // --- Templates ---
  choose_template: 'Choose a template', templates: 'Templates',
  blank_workout: 'Blank workout', ex_lbl: 'ex',
  create_template: 'Create template', save_template: 'Save template',
  tmpl_name_ph: 'Template name…', tmpl_created: 'Template created',
  tmpl_exists: 'Template already exists', enter_tmpl_name: 'Enter a template name',
  tmpl_from: 'From template', clear: 'Clear',

  // --- Library ---
  library: 'Library', search_exercises: 'Search exercises…',
  no_results: 'No exercises match', primary: 'Primary', secondary: 'Secondary',
  instructions: 'Instructions', no_details: 'No details available yet.',
  manual_ex: 'Add manually', similar: 'similar', alt_lbl: 'Alternatives',

  // --- Muscles / stats ---
  muscles_title: 'Muscles', overview_title: 'Overview',
  subtab_exercises: 'Exercises', subtab_gains: 'Gains',
  select_body_part: 'Select a body part',
  muscles_lbl: 'muscles', exercises_lbl: 'exercises', exercise_lbl: 'exercise',
  logged_lbl: 'logged', in_library: 'in library',
  not_logged_yet: 'Not logged yet', not_logged_short: 'not logged',
  est_1rm: 'Estimated 1RM', max_weight: 'Max weight', session_volume: 'Session volume',
  since_start: 'since start', kg_reps: 'kg·reps',
  session_split: 'Session split', vol_per_session: 'Volume per session',
  ex_freq: 'Exercise frequency',
  not_enough_data: 'Not enough data yet — log at least 2 sessions.',
  logs_lbl: 'logs', log_lbl: 'log', no_logs: 'no logs', sessions_lbl: 'sessions',

  // --- Settings extras ---
  feedback: 'Feedback', data: 'Data',
  layout_diagnostic: 'Layout diagnostic',
  data_local_notice:
    'Your training data is stored only on this device. Export regularly — deleting the app removes it.',

  // --- Stats ---
  progression: 'Progression', personal_records: 'Personal records', current: 'Current',

  // --- Recovery & volume model ---
  sub_recovery: 'Recovery', sub_volume: 'Volume', sub_library: 'Library',
  recovery_status: 'Recovery status', train_next: 'Train next', recovered: 'recovered',
  recovery_fresh: 'Fresh', recovery_ready: 'Ready', recovery_recovering: 'Recovering',
  recovery_fatigued: 'Fatigued', recovery_cooked: 'Cooked',
  recovery_explainer:
    'Recovery is estimated from the sets you logged, weighted by how much each exercise involves the muscle, decaying over time. Larger muscle groups are given longer to recover.',
  of: 'of',
  target: 'Target',
  sets_week: 'sets/wk', total_sets: 'Total sets', groups_optimal: 'In range',
  last_7_days: 'Last 7 days',
  volume_none: 'Not trained this week', volume_low: 'Below target',
  volume_optimal: 'In the productive range', volume_high: 'Above target — watch fatigue',
  volume_behind: 'behind on volume', volume_on_track: 'volume on track',
  volume_empty_body: 'Log a few sessions and your weekly volume per muscle group appears here.',
  no_data_yet: 'No data yet',
  all: 'All', showing_first: 'Showing the first {n}',

  // --- Plan ---
  plan_title: 'Plan', sched_future: 'Schedule future sessions',
  tap_day: 'Tap a day to schedule a session', add_to_plan: 'Add to plan',
  scheduled: 'Scheduled', today_lbl: 'Today', select_day: 'Select a day first',
  session_planned: 'Session planned',

  // --- Settings / profile ---
  settings: 'Settings', language: 'Language', profile: 'Profile',
  rename_user: 'Rename', rename_user_prompt: 'New name:',
  switch_user: 'Switch user', delete_user: 'Delete profile',
  haptics: 'Haptics', sound: 'Sound', units: 'Units',
  backup_due: 'Back up your data',
  backup_due_body: 'Your logs exist only on this phone. Save a copy to Files.',
  back_up: 'Back up',
  backup_saved: 'Backup saved',
  export_data: 'Export data', import_data: 'Import data',
  new_profile: 'New profile', get_started: 'Get started',
  create_profile: 'Create your profile', whos_training: "Who's training?",
  your_name: 'Your name…', continue_: 'Tap to continue',
  enter_name: 'Enter a name', name_taken: 'A profile with that name already exists',

  // --- System ---
  cancel: 'Cancel', save_changes: 'Save changes', done: 'Done', close: 'Close',
  failed_load: 'Failed to load data',
  update_banner: 'Update available', reload: 'Reload',
  offline_ready: 'Ready to work offline',

  // --- Focus names ---
  f_Push: 'Push', f_Pull: 'Pull', f_Legs: 'Legs',
  f_Upper: 'Upper', f_Core: 'Core', f_Other: 'Other',

  // --- Equipment / categories ---
  eq_body: 'Body', eq_dbs: 'Dumbbell', eq_barbell: 'Barbell',
  eq_cable: 'Cable', eq_machine: 'Machine', eq_plate: 'Plate',
  cat_chest: 'Chest', cat_shoulders: 'Shoulders', cat_back: 'Back',
  cat_legs: 'Legs & Glutes', cat_arms: 'Arms', cat_core: 'Core',

  // --- Calendar ---
  m1: 'January', m2: 'February', m3: 'March', m4: 'April',
  m5: 'May', m6: 'June', m7: 'July', m8: 'August',
  m9: 'September', m10: 'October', m11: 'November', m12: 'December',
  d_mo: 'Mo', d_tu: 'Tu', d_we: 'We', d_th: 'Th', d_fr: 'Fr', d_sa: 'Sa', d_su: 'Su',
};
