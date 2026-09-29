import { SaveIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCharactersQuery } from '@/lib/react-query/queries'

import { KANBAN_COLUMNS, KANBAN_PRIORITIES } from './kanban.constants'
import type { KanbanAssignee, KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput, KanbanPriority, KanbanStatus } from './kanban.types'
import { canMoveItem, mergeAssigneesById, normalizeCharacterAssignees, normalizeLabels, sortAssigneesForBoard } from './kanban.utils'

type KanbanItemFormValues = {
  title: string
  descriptionMarkdown: string
  assigneeId: string
  priority: KanbanPriority
  labels: string
  status: KanbanStatus
  position: number
}

type KanbanItemFormDialogProps = {
  item?: KanbanItem | null
  mode: 'create' | 'edit'
  open: boolean
  isSaving: boolean
  assignedAssignees: KanbanAssignee[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: KanbanItemCreateInput) => Promise<void>
  onUpdate: (itemId: string, input: KanbanItemPatchInput) => Promise<void>
}

const fieldClassName =
  'w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClassName = 'grid gap-1.5 text-sm font-medium'
const errorClassName = 'text-xs font-medium text-destructive'
const primaryButtonClassName =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary-foreground px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity,transform] duration-150 ease-[var(--ease-out-quart)] hover:bg-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0'
const secondaryButtonClassName =
  'inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background-color,color,opacity,transform] duration-150 ease-[var(--ease-out-quart)] hover:bg-secondary hover:text-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0'

const kanbanItemFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or fewer'),
  descriptionMarkdown: z.string().max(1200, 'Description must be 1200 characters or fewer'),
  assigneeId: z.string().refine(
    (value) => {
      return value === 'unassigned' || value.trim().length > 0
    },
    { message: 'Choose a valid assignee' },
  ),
  priority: z.custom<KanbanPriority>(
    (value) => {
      return typeof value === 'string' && KANBAN_PRIORITIES.includes(value as KanbanPriority)
    },
    { message: 'Choose a valid priority' },
  ),
  labels: z.string().max(160, 'Labels must be 160 characters or fewer'),
  status: z.custom<KanbanStatus>(
    (value) => {
      return typeof value === 'string' && KANBAN_COLUMNS.some((column) => column.id === value)
    },
    { message: 'Choose a valid status' },
  ),
  position: z.number({ error: 'Position is required' }).int('Position must be a whole number').min(0, 'Position must be 0 or greater'),
})

const getFormValues = (item?: KanbanItem | null): KanbanItemFormValues => {
  return {
    title: item?.title ?? '',
    descriptionMarkdown: item?.descriptionMarkdown ?? '',
    assigneeId: item?.assigneeId ?? 'unassigned',
    priority: item?.priority ?? 'medium',
    labels: item?.labels.join(', ') ?? '',
    status: item?.status ?? 'to-do',
    position: item?.position ?? 1000,
  }
}

export const KanbanItemFormDialog = ({
  item,
  mode,
  open,
  isSaving,
  assignedAssignees,
  onOpenChange,
  onCreate,
  onUpdate,
}: KanbanItemFormDialogProps) => {
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const searchedCharactersQuery = useCharactersQuery(
    {
      page: 1,
      name: assigneeSearch.trim() || undefined,
    },
    open,
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<KanbanItemFormValues>({
    defaultValues: getFormValues(item),
    mode: 'onBlur',
    resolver: zodResolver(kanbanItemFormSchema),
  })

  useEffect(() => {
    if (open) {
      reset(getFormValues(item))
      setAssigneeSearch('')
    }
  }, [item, open, reset])

  const title = mode === 'create' ? 'Create item' : 'Edit item'
  const description = mode === 'create' ? 'New items start in To do.' : 'Update fields and move through allowed transitions.'

  const statusOptions = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => {
      const isCurrentStatus = item?.status === column.id
      const isAllowed = mode === 'create' ? column.id === 'to-do' : Boolean(item && canMoveItem(item.status, column.id))

      return {
        ...column,
        disabled: !isCurrentStatus && !isAllowed,
      }
    })
  }, [item, mode])

  const assigneeOptions = useMemo(() => {
    const searchedAssignees = normalizeCharacterAssignees(searchedCharactersQuery.data?.characters?.results)
    const mergedAssignees = Array.from(mergeAssigneesById(assignedAssignees, searchedAssignees).values())
    const currentUnknownAssignee =
      item?.assigneeId && !mergedAssignees.some((assignee) => assignee.id === item.assigneeId)
        ? [{ id: item.assigneeId, name: 'Unknown assignee', image: null }]
        : []

    return sortAssigneesForBoard([...mergedAssignees, ...currentUnknownAssignee], item ? [item] : [])
  }, [assignedAssignees, item, searchedCharactersQuery.data])

  const handleValidSubmit = async (values: KanbanItemFormValues) => {
    const baseInput = {
      title: values.title.trim(),
      descriptionMarkdown: values.descriptionMarkdown.trim(),
      assigneeId: values.assigneeId === 'unassigned' ? null : values.assigneeId,
      priority: values.priority,
      labels: normalizeLabels(values.labels),
    }

    if (mode === 'create') {
      await onCreate(baseInput)
      onOpenChange(false)
      return
    }

    if (!item) {
      return
    }

    await onUpdate(item.id, {
      ...baseInput,
      status: values.status,
      position: Number(values.position),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit(handleValidSubmit)}>
          <label className={labelClassName}>
            Title
            <input
              className={cn(fieldClassName, errors.title && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            {errors.title ? <span className={errorClassName}>{errors.title.message}</span> : null}
          </label>

          <label className={labelClassName}>
            Description
            <textarea
              className={cn(fieldClassName, 'min-h-28 resize-y', errors.descriptionMarkdown && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
              aria-invalid={Boolean(errors.descriptionMarkdown)}
              {...register('descriptionMarkdown')}
            />
            {errors.descriptionMarkdown ? <span className={errorClassName}>{errors.descriptionMarkdown.message}</span> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              Assignee
              <input
                className={fieldClassName}
                value={assigneeSearch}
                placeholder="Search characters"
                onChange={(event) => setAssigneeSearch(event.target.value)}
              />
              <select
                className={cn(fieldClassName, errors.assigneeId && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
                aria-invalid={Boolean(errors.assigneeId)}
                {...register('assigneeId')}
              >
                <option value="unassigned">Unassigned</option>
                {assigneeOptions.map((assignee) => {
                  return (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  )
                })}
              </select>
              {searchedCharactersQuery.isFetching ? <span className="text-xs text-muted-foreground">Loading characters...</span> : null}
              {!searchedCharactersQuery.isFetching && assigneeSearch.trim() && assigneeOptions.length === 0 ? (
                <span className="text-xs text-muted-foreground">No characters found.</span>
              ) : null}
              {searchedCharactersQuery.isError ? <span className={errorClassName}>Characters could not be loaded.</span> : null}
              {errors.assigneeId ? <span className={errorClassName}>{errors.assigneeId.message}</span> : null}
            </label>

            <label className={labelClassName}>
              Priority
              <select
                className={cn(fieldClassName, errors.priority && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
                aria-invalid={Boolean(errors.priority)}
                {...register('priority')}
              >
                {KANBAN_PRIORITIES.map((priority) => {
                  return (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  )
                })}
              </select>
              {errors.priority ? <span className={errorClassName}>{errors.priority.message}</span> : null}
            </label>
          </div>

          <label className={labelClassName}>
            Labels
            <input
              className={cn(fieldClassName, errors.labels && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
              aria-invalid={Boolean(errors.labels)}
              {...register('labels')}
            />
            {errors.labels ? <span className={errorClassName}>{errors.labels.message}</span> : null}
          </label>

          {mode === 'edit' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                Status
                <select
                  className={cn(fieldClassName, errors.status && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
                  aria-invalid={Boolean(errors.status)}
                  {...register('status')}
                >
                  {statusOptions.map((column) => {
                    return (
                      <option key={column.id} value={column.id} disabled={column.disabled}>
                        {column.title}
                      </option>
                    )
                  })}
                </select>
                {errors.status ? <span className={errorClassName}>{errors.status.message}</span> : null}
              </label>

              <label className={labelClassName}>
                Position
                <input
                  className={cn(fieldClassName, errors.position && 'border-destructive focus:border-destructive focus:ring-destructive/20')}
                  type="number"
                  min="0"
                  step="1"
                  aria-invalid={Boolean(errors.position)}
                  {...register('position', { valueAsNumber: true })}
                />
                {errors.position ? <span className={errorClassName}>{errors.position.message}</span> : null}
              </label>
            </div>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              className={secondaryButtonClassName}
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={primaryButtonClassName}
              disabled={isSaving}
            >
              <SaveIcon className="size-4" aria-hidden="true" />
              Save
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
