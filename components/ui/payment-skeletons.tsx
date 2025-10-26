import { Skeleton } from './skeleton'
import { Card, CardContent } from './card'

export function PaymentDetailsSkeleton() {
  return (
    <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-6 w-24 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-4 w-16 bg-white/10 mb-2" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 bg-white/10 mb-2" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 bg-white/10 mb-2" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 bg-white/10 mb-2" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WalletStatusSkeleton() {
  return (
    <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-28 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-20 bg-white/10 mb-1" />
                <Skeleton className="h-8 w-24 bg-white/10" />
              </div>
              <Skeleton className="w-8 h-8 bg-white/10 rounded-full" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-20 bg-white/10 mb-1" />
                <Skeleton className="h-8 w-24 bg-white/10" />
              </div>
              <Skeleton className="w-8 h-8 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
          <Skeleton className="h-4 w-32 bg-white/10 mb-1" />
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentSummarySkeleton() {
  return (
    <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Skeleton className="h-4 w-16 bg-white/10 mb-1" />
              <Skeleton className="h-6 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ConversionRatesSkeleton() {
  return (
    <Card className="h-full p-6 overflow-hidden rounded-2xl bg-purple-900/30 border border-purple-500/30 shadow-2xl">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-6 w-6 bg-white/10" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Skeleton className="h-4 w-20 bg-white/10 mb-1" />
              <Skeleton className="h-6 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentButtonSkeleton() {
  return (
    <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardContent className="p-0">
        <div className="text-center">
          <Skeleton className="h-12 w-full bg-white/10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
