import { getUser } from '@/lib/auth'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import USPSection from '@/components/landing/USPSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import FAQSection from '@/components/landing/FAQSection'
import LandingFooter from '@/components/landing/LandingFooter'

export default async function LandingPage() {
  const user = await getUser()
  const isLoggedIn = !!user

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <LandingNav isLoggedIn={isLoggedIn} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <USPSection />
      <FeaturesSection />
      <FAQSection />
      <LandingFooter />
    </div>
  )
}
