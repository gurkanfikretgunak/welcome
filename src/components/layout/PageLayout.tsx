interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

import Footer from './Footer';

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {title && (
        <div className="mb-8">
          <h1 className="text-2xl emphasis mb-2 tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <div className="muted text-sm">
              {subtitle}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {children}
      </div>
      
      <Footer />
    </div>
  )
}
