// Middleware at middleware.ts handles authentication for all /admin/* routes
// (except /admin/login which is always accessible).
// This layout exists as a shell for future admin chrome (nav, etc).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
