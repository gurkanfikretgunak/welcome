interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

import Footer from './Footer';

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-4xl">
      {title && (
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl emphasis mb-2 tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <div className="muted text-sm">
              {subtitle}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
      
      <Footer />
    </div>
  )
}
