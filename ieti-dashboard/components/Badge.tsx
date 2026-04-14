import { cn } from '@/lib/utils'

type Props = {
  label: string
  className?: string
  size?: 'sm' | 'md'
}

export default function Badge({ label, className, size = 'sm' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full capitalize',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {label}
    </span>
  )
}
