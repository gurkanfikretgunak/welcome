import { getAppApiKey, getGraphqlUrl, getOrganizationId, MF_BUNDLE_ID } from './config'
import { readSession, writeSession } from './session'

type GraphQLError = { message: string }
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] }

const ENVELOPE_QUERY = `
  query ParticularGraphqlEnvelope($input: ParticularGraphqlInput!) {
    particularGraphqlEnvelope(input: $input) { dataJson errorsJson }
  }
`

async function request<T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string | null
): Promise<{ response: Response; json: GraphQLResponse<T> }> {
  const apiKey = getAppApiKey()
  if (!apiKey) throw new Error('NEXT_PUBLIC_MF_APP_API_KEY is missing')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Bundle-ID': MF_BUNDLE_ID,
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  const response = await fetch(getGraphqlUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  let json: GraphQLResponse<T> = {}
  try {
    json = await response.json()
  } catch {
    // Preserve the HTTP error below.
  }
  return { response, json }
}

async function refreshBrowserSession() {
  const session = readSession()
  if (!session) return null
  const query = `
    mutation RefreshTokens($input: RefreshInput!) {
      refreshTokens(input: $input) {
        accessToken refreshToken
        user { id email displayName avatarURL role }
      }
    }
  `
  const { response, json } = await request<{
    refreshTokens: {
      accessToken: string
      refreshToken: string
      user: typeof session.user
    }
  }>(query, { input: { userID: session.user.id, refreshToken: session.refreshToken, platform: 'web' } })
  if (!response.ok || json.errors?.length || !json.data?.refreshTokens) return null
  const next = json.data.refreshTokens
  writeSession(next)
  return next.accessToken
}

export async function gqlRequest<T>(args: {
  query: string
  variables?: Record<string, unknown>
  accessToken?: string | null
}): Promise<T> {
  let token = args.accessToken
  let result = await request<T>(args.query, args.variables ?? {}, token)
  if (result.response.status === 401 && typeof window !== 'undefined') {
    token = await refreshBrowserSession()
    if (token) result = await request<T>(args.query, args.variables ?? {}, token)
  }
  if (!result.response.ok) throw new Error(`mf-go HTTP ${result.response.status}`)
  if (result.json.errors?.length) {
    throw new Error(result.json.errors.map((error) => error.message).join('; '))
  }
  if (!result.json.data) throw new Error('Empty GraphQL response')
  return result.json.data
}

export async function forwardParticular<T>(args: {
  requiredCapability: string
  query: string
  variables?: Record<string, unknown>
  accessToken?: string | null
}): Promise<T> {
  const organizationId = getOrganizationId()
  if (!organizationId) throw new Error('NEXT_PUBLIC_WELCOME_ORGANIZATION_ID is missing')
  const data = await gqlRequest<{
    particularGraphqlEnvelope: { dataJson?: string | null; errorsJson?: string | null }
  }>({
    query: ENVELOPE_QUERY,
    variables: {
      input: {
        particularKey: 'welcome',
        requiredCapability: args.requiredCapability,
        query: args.query,
        variablesJson: JSON.stringify(args.variables ?? {}),
        organizationId,
      },
    },
    accessToken: args.accessToken ?? readSession()?.accessToken,
  })
  const envelope = data.particularGraphqlEnvelope
  if (!envelope) throw new Error('Empty particularGraphqlEnvelope')
  if (envelope.errorsJson && envelope.errorsJson !== 'null' && envelope.errorsJson !== '[]') {
    throw new Error(envelope.errorsJson)
  }
  const parsed = envelope.dataJson ? JSON.parse(envelope.dataJson) : null
  if (!parsed || typeof parsed !== 'object') throw new Error('Empty Particular response')
  const inner = parsed as { data?: T; errors?: GraphQLError[] }
  if (inner.errors?.length) throw new Error(inner.errors.map((error) => error.message).join('; '))
  return ('data' in inner ? inner.data : parsed) as T
}

export function getRequestAccessToken(request: Request) {
  const header = request.headers.get('authorization')
  if (header?.startsWith('Bearer ')) return header.slice(7)
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)mf_welcome_access=([^;]+)/)
  return cookie ? decodeURIComponent(cookie[1]) : null
}
