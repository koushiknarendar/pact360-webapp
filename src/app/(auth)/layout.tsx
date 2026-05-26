export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">PACT360</h1>
          <p className="text-zinc-400 text-sm mt-1">India&apos;s Privacy Compliance OS</p>
        </div>
        {children}
      </div>
    </div>
  )
}
