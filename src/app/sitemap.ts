import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com'
  const now = new Date().toISOString()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/tickets`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/profile`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/bio`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/email`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/worklog`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/settings`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}


