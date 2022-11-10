const fs = require('fs');
const request = require('postman-request');
const config = require('../config/config');
const getAuthToken = require('./getAuthToken');
const { version: packageVersion } = require('../package.json');
const USER_AGENT = `polarity-threatq-ioc-submission-integration-v${packageVersion}`;

const { checkForInternalServiceError } = require('./handleError');

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

const createRequestWithDefaults = (Logger) => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = config;

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    json: true,
    headers: {
      'User-Agent': USER_AGENT
    }
  };

  const requestWithDefaults = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefault = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      try {
        const result = await _requestWithDefault(_requestOptions);
        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(result);
      } catch (error) {
        postRequestFunctionResults = await postRequestFailureFunction(
          error,
          _requestOptions
        );
      }
      return postRequestFunctionResults;
    };
  };

  const handleAuth = async ({ options, ...requestOptions }) => {
    const isAuthRequest = requestOptions.authRequest;
    if (!isAuthRequest) {
      const token = await getAuthToken(options, requestDefaultsWithInterceptors).catch(
        (error) => {
          Logger.error({ error }, 'Unable to retrieve Auth Token');
          throw error;
        }
      );

      Logger.trace({ token }, 'Token');

      return {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          Authorization: `Bearer ${token}`
        }
      };
    }

    return requestOptions;
  };

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    Logger.trace({ statusCode, body, requestOptions });
    checkForInternalServiceError(statusCode, body);
    const roundedStatus = Math.round(statusCode / 100) * 100;
    if (![200].includes(roundedStatus)) {
      const requestError = Error('Request Error');
      requestError.status = statusCode;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = requestOptions;
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaults(handleAuth);

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
