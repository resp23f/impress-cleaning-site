export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-gray-100">
        <div className="flex flex-col flex-grow pt-8 px-6">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              className="h-16 w-auto"
            />
          </div>
          
          {/* Nav skeleton */}
          <div className="space-y-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Header Skeleton */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100">
        <img
          src="/ImpressLogoNoBackgroundBlue.png"
          alt="Impress Cleaning Services"
          className="h-10 w-auto"
        />
        <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="lg:pl-72 pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-32 bg-gray-100 rounded-lg animate-pulse mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-white rounded-2xl animate-pulse" />
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}