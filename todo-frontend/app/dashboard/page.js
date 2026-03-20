import React, { Suspense } from 'react'
import Dashboard from '../custom/components/DashboardClient'
import { Spinner } from '@/components/ui/spinner'

const page = () => {
  return (
    <div>
        <Suspense fallback={<Spinner/>}>
            <Dashboard/>
        </Suspense>
    </div>
  )
}

export default page