import { CheckCircle2Icon, CircleIcon, Clock3Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { KanbanColumn, KanbanStatus } from './kanban.types'

type KanbanStatusRadioOption = KanbanColumn & {
  disabled: boolean
}

type KanbanStatusRadioGroupProps = {
  errorMessage?: string
  options: KanbanStatusRadioOption[]
  register: React.InputHTMLAttributes<HTMLInputElement>
  value: KanbanStatus
}

const statusIcons: Record<KanbanStatus, typeof CircleIcon> = {
  'to-do': CircleIcon,
  doing: Clock3Icon,
  done: CheckCircle2Icon,
}

export const KanbanStatusRadioGroup = ({ errorMessage, options, register, value }: KanbanStatusRadioGroupProps) => {
  return (
    <fieldset className="grid gap-1.5 text-sm font-medium" aria-invalid={Boolean(errorMessage)}>
      <legend>Status</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = statusIcons[option.id]
          const isSelected = value === option.id

          return (
            <label
              key={option.id}
              className={cn(
                'relative flex min-h-16 cursor-pointer items-center gap-3 rounded-md border border-input bg-card px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                isSelected && 'border-primary/50 bg-primary/10 text-primary-foreground',
                option.disabled && 'cursor-not-allowed opacity-50 hover:bg-card hover:text-muted-foreground',
                errorMessage && 'border-destructive',
              )}
            >
              <input className="sr-only" type="radio" value={option.id} disabled={option.disabled} {...register} />
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{option.title}</span>
            </label>
          )
        })}
      </div>
      {errorMessage ? <span className="text-xs font-medium text-destructive">{errorMessage}</span> : null}
    </fieldset>
  )
}
