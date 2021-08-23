// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: key;

class OAuthClient {
  constructor({id, secret}) {
    if (!id) {
      throw new Error('Client ID and secret are required')
    }

    this.id = id
    this.secret = secret
  }

  static baseURL = 'https://www.strava.com/oauth'
  static keychainClientKey = 'strava-oauth-client'

  toString() {
    return JSON.stringify({id: this.id, secret: this.secret})
  }

  save() {
    Keychain.set(OAuthClient.keychainClientKey, this.toString())
  }

  static async load() {
    if (!Keychain.contains(OAuthClient.keychainClientKey)) {
      throw new Error('Client configuration data not found in keychain')
    }


    return new OAuthClient(JSON.parse(Keychain.get(OAuthClient.keychainClientKey)))
  }

  selfURL() {
    return `https://open.scriptable.app/run?scriptName=${encodeURIComponent(Script.name())}&clientId=${this.id}`
  }

  authorizationURL() {
    return `${OAuthClient.baseURL}/authorize?client_id=${this.id}&response_type=code&redirect_uri=${encodeURIComponent(this.selfURL())}&scope=activity:read_all`
  }

  tokenURL(code) {
    return `${OAuthClient.baseURL}/token?client_id=${this.id}&client_secret=${this.secret}&code=${code}&grant_type=authorization_code`
  }

  async exchange(code) {
    const req = new Request(this.tokenURL(code))
    req.method = 'POST'

    return req.loadJSON()
  }
}

// main function
const {code} = args.queryParameters

if (!code) {
  const client = await promptClient()
  await client.save()
  await promptAuthorization(client)
  
  return
}

const client = await OAuthClient.load()
const token = await client.exchange(code)

const data = JSON.stringify(token)
Keychain.set('strava', data)
await promptSuccess(data)
// end main

async function promptClient() {
  const alert = new Alert()
  
  alert.title = 'Enter Strava OAuth Client Info'
  alert.message = 'You can find this at https://www.strava.com/settings/api'

  alert.addTextField('Client ID')
  alert.addSecureTextField('Client Secret')
  
  alert.addCancelAction('Cancel')
  alert.addAction('Done')

  switch (await alert.present()) {
    case -1:
      throw new Error('Canceled')
    default:
      return new OAuthClient({
        id: alert.textFieldValue(0),
        secret: alert.textFieldValue(1)
      })
  }
}

async function promptAuthorization(client) {
  Safari.openInApp(client.authorizationURL())
}

async function promptSuccess(data) {
  const alert = new Alert()
  
  alert.title = 'Success!'
  alert.message = `Token data saved as JSON to keychain with key "strava".`
  alert.addAction('OK')
  
  await alert.present()
}
