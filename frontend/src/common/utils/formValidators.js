import validateEmail from './validate-email';

const getEmailValidationState = x => (
  (validateEmail(x) === true) ? 'success' : null
);

const getPasswordValidationState = x => (
  (x.length >= 8) ? 'success' : null
);

const getFullNameValidationState = x => (
  (x.length >= 3) ? 'success' : null
);

const getPhoneValidationState = x => (
  (x.length >= 7) ? 'success' : null
);

export {
  getEmailValidationState,
  getPasswordValidationState,
  getFullNameValidationState,
  getPhoneValidationState
};
