// Ministry forms are rendered by hardcoded React components (components/ministry-forms/),
// not the dynamic form builder. Their fields are code-defined, so only their settings
// (publish state, share link, success message, payment) are editable in the builder.
export const MINISTRY_FORM_CODES = [
  'POWER_BIBLE_SCHOOL',
  'ABEL_DAMINA_MENTORING_ACADEMY',
  'DISCIPLESHIP_PROGRAM',
  'NEW_COORDINATORS_REGISTRATION',
  'JOIN_CAMPUS',
];

export const isMinistryForm = (form) =>
  !!form && MINISTRY_FORM_CODES.includes(form.eventCode);
