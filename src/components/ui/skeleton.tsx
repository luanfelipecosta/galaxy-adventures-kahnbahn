import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <span
      className={cn('block animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
    />
  )
}
