const fp = require('lodash/fp');
const reduce = require('lodash/fp/reduce').convert({ cap: false });

const validateOptions = (options, callback) => {
  const stringOptionsErrorMessages = {
    url: 'You must provide a valid URL from your ThreatQuotient Account',
    username: 'You must provide a valid Username from your ThreatQuotient Account',
    password: 'You must provide a valid Password from your ThreatQuotient Account',
    client: 'You must provide a valid Client ID from your ThreatQuotient Account'
  };

  const stringValidationErrors = _validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  const urlValidationError = _validateUrlOption(options.url);
  const noSubmissionStatusesError = !options.possibleSubmissionStatuses.value.length
    ? [
        {
          key: 'possibleSubmissionStatuses',
          message: 'You must Select one or more Possible Submission Statuses'
        }
      ]
    : [];

  callback(
    null,
    stringValidationErrors.concat(urlValidationError).concat(noSubmissionStatusesError)
  );
};

const _validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && fp.isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

const _validateUrlOption = ({ value: url }, otherErrors = []) =>
  url && url.endsWith('//')
    ? otherErrors.concat({
        key: 'url',
        message: 'Your Url must not end with a //'
      })
    : otherErrors;

module.exports = validateOptions;
