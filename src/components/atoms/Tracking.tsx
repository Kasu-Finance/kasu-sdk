'use client'

import { lazy, Suspense, useEffect, useState } from 'react'

const Hotjar = lazy(() => import('@/components/atoms/Hotjar'))

const Tracking: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(true)

  useEffect(() => {
    const userConsentLocalStorage = localStorage.getItem('userConsent')
    if (userConsentLocalStorage) {
      const { consent } = JSON.parse(userConsentLocalStorage)
      if (consent) {
        setConsentGiven(true)
      }
    }

    window.addEventListener('consentGiven', () => setConsentGiven(true))

    // Clean-up function
    return () => {
      window.removeEventListener('consentGiven', () => setConsentGiven(true))
    }
  }, [])

  return (
    <>
      {consentGiven && (
        <Suspense fallback={null}>
          <Hotjar appLoaded={consentGiven} />
        </Suspense>
      )}
    </>
  )
}

export default Tracking
