# Strava OAuth for [Scriptable](https://scriptable.app)

> Scriptable (iOS) script for obtaining a Strava API token

## Setup

1. [Register a new Strava API application](https://developers.strava.com/docs/getting-started/#account). Set the _Authorization Callback Domain_ to `open.scriptable.app`.
2. Add the [script](strava-oauth.js) to Scriptable.
3. Run the script and input your client ID and secret.
4. Authenticate in the presented Safari window and authorize your API application to access your account data.

Upon successful authorization, Strava will redirect to a Scriptable URL, re-triggering the script and passing an authorization code in a query parameter. The script will use your client secret and the code to obtain a token object, which will be saved as JSON to the keychain (key: `strava`).

## Usage

From other scripts, you can load the `strava` authentication data from the keychain and include it in requests to the Strava API:

```js
const token = JSON.parse(Keychain.get('strava'))

const req = new Request('https://www.strava.com/api/v3/athlete/activities')
req.headers.authorization = `Bearer ${token.access_token}`

const activities = await req.loadJSON()
// ...
```

Note that access tokens expire frequently so you will likely want to use the refresh token to obtain a new access token first.

## License

[MIT](LICENSE)
