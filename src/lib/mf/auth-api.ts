import { gqlRequest } from './client'
import type { MfUser } from './session'

export interface AuthPayload {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  user: MfUser
}

const AUTH_FIELDS = `
  accessToken refreshToken expiresIn
  user { id email displayName avatarURL role }
`

export async function login(email: string, password: string) {
  const data = await gqlRequest<{ login: AuthPayload & { otpRequired: boolean } }>({
    query: `mutation Login($input: LoginInput!) { login(input: $input) { otpRequired ${AUTH_FIELDS} } }`,
    variables: { input: { email, password, bundleId: 'co.masterfabric.welcome.web' } },
  })
  return data.login
}

export async function loginWithGitHub(code: string, redirectUri: string) {
  const data = await gqlRequest<{ loginWithGitHub: AuthPayload & { otpRequired: boolean } }>({
    query: `mutation LoginWithGitHub($input: LoginWithGitHubInput!) {
      loginWithGitHub(input: $input) { otpRequired ${AUTH_FIELDS} }
    }`,
    variables: { input: { code, redirectUri } },
  })
  return data.loginWithGitHub
}

export async function refreshTokens(userID: string, refreshToken: string) {
  const data = await gqlRequest<{ refreshTokens: AuthPayload }>({
    query: `mutation RefreshTokens($input: RefreshInput!) {
      refreshTokens(input: $input) { ${AUTH_FIELDS} }
    }`,
    variables: { input: { userID, refreshToken, platform: 'web' } },
  })
  return data.refreshTokens
}

export async function logout(userID: string, accessToken: string, refreshToken: string) {
  const data = await gqlRequest<{ logout: boolean }>({
    query: `mutation Logout($input: LogoutInput!) { logout(input: $input) }`,
    variables: { input: { userID, accessToken, refreshToken } },
    accessToken,
  })
  return data.logout
}

export async function mfCorePublicAuth() {
  const data = await gqlRequest<{ mfCorePublicAuth: { githubClientId: string | null } }>({
    query: `query MfCorePublicAuth { mfCorePublicAuth { githubClientId } }`,
  })
  return data.mfCorePublicAuth
}
