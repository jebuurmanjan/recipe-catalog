import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export const metadata = { title: 'Admin login' }

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
