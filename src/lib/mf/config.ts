export const getGraphqlUrl = () =>
  process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim() || 'http://localhost:8080/graphql'

export const getAppApiKey = () =>
  process.env.NEXT_PUBLIC_MF_APP_API_KEY?.trim() || ''

export const getOrganizationId = () =>
  process.env.NEXT_PUBLIC_WELCOME_ORGANIZATION_ID?.trim() || ''

export const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'

export const MF_BUNDLE_ID = 'co.masterfabric.welcome.web'
