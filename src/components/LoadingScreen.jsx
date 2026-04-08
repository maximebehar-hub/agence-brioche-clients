export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-brioche-beige flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="text-4xl font-black italic text-brioche-violet tracking-tight animate-pulse-soft">
            BRIOCHE
          </div>
        </div>
        <div className="flex justify-center gap-1.5 mb-4">
          <div className="w-2 h-2 bg-brioche-violet rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-brioche-violet rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-brioche-violet rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  )
}
