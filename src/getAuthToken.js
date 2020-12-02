const NodeCache = require('node-cache');
const fp = require('lodash/fp');

const tokenCache = new NodeCache({
  stdTTL: 2 * 60
});

const getAuthToken = async (options, requestWithDefaults) => {
  let sessionToken = tokenCache.get(`${options.username}${options.password}`);

  if (sessionToken) return sessionToken;

  const token = 
    fp.get(
    'body.access_token',
    await requestWithDefaults({
      method: 'POST',
      uri: options.url + '/api/token',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: options.username,
        password: options.password,
        grant_type: 'password',
        client_id: options.client
      }),
      json: true,
      authRequest: true
    })
  );

  if(!token)
    throw Error("No Auth Token Found")

  tokenCache.set(`${options.username}${options.password}`, token);

  return token;
}

module.exports = getAuthToken;