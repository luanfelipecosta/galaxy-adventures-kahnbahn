import { LoaderCircleIcon, SaveIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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

import { KanbanAssigneePicker } from './kanban-assignee-picker'
import { KANBAN_COLUMNS, KANBAN_PRIORITIES } from '../model/kanban.constants'
import { KanbanMarkdownDescriptionField } from './kanban-markdown-description-field'
import { KanbanStatusRadioGroup } from './kanban-status-radio-group'
import type { KanbanAssignee, KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput, KanbanPriority, KanbanStatus } from '../model/kanban.types'
import { canMoveItem, mergeAssigneesById, normalizeCharacterAssignees, normalizeLabels, sortAssigneesForBoard } from '../model/kanban.utils'

type KanbanItemFormValues = {
  title: string
  descriptionMarkdown: string
  assigneeId: string
  priority: KanbanPriority
  labels: string
  status: KanbanStatus
}

type KanbanItemFormDialogProps = {
  item?: KanbanItem | null
  mode: 'create' | 'edit'
  open: boolean
  isSaving: boolean
  assignedAssignees: KanbanAssignee[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: KanbanItemCreateInput) => Promise<unknown>
  onUpdate: (itemId: string, input: KanbanItemPatchInput) => Promise<unknown>
}

const fieldClassName =
  'w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClassName = 'grid gap-1.5 text-sm font-medium'
const errorClassName = 'text-xs font-medium text-destructive'

const kanbanItemFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or fewer'),
  descriptionMarkdown: z.string().max(1200, 'Description must be 1200 characters or fewer'),
  assigneeId: z.string().trim().min(1, 'Choose an assignee'),
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
})

const getFormValues = (item?: KanbanItem | null): KanbanItemFormValues => {
  return {
    title: item?.title ?? '',
    descriptionMarkdown: item?.descriptionMarkdown ?? '',
    assigneeId: item?.assigneeId ?? '',
    priority: item?.priority ?? 'medium',
    labels: item?.labels.join(', ') ?? '',
    status: item?.status ?? 'to-do',
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
    setValue,
    trigger,
    watch,
  } = useForm<KanbanItemFormValues>({
    defaultValues: getFormValues(item),
    mode: 'onBlur',
    resolver: zodResolver(kanbanItemFormSchema),
  })
  const selectedAssigneeId = watch('assigneeId')
  const selectedStatus = watch('status')
  const descriptionMarkdown = watch('descriptionMarkdown')

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
      assigneeId: values.assigneeId.trim(),
      priority: values.priority,
      labels: normalizeLabels(values.labels),
    }

    try {
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
      })
      onOpenChange(false)
    } catch {
      // Save feedback is owned by the board view so the dialog can remain open.
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving && !nextOpen) {
      return
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          <KanbanMarkdownDescriptionField
            errorMessage={errors.descriptionMarkdown?.message}
            value={descriptionMarkdown}
            textareaProps={register('descriptionMarkdown')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <KanbanAssigneePicker
              assignees={assigneeOptions}
              errorMessage={errors.assigneeId?.message}
              errorMessageId="kanban-assignee-error"
              isError={searchedCharactersQuery.isError}
              isLoading={searchedCharactersQuery.isFetching}
              search={assigneeSearch}
              selectedAssigneeId={selectedAssigneeId}
              onSearchChange={setAssigneeSearch}
              onSelect={(assigneeId) => {
                setValue('assigneeId', assigneeId, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                void trigger('assigneeId')
              }}
            />

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
            <KanbanStatusRadioGroup
              errorMessage={errors.status?.message}
              options={statusOptions}
              register={register('status')}
              value={selectedStatus}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <SaveIcon className="size-4" aria-hidden="true" />
              )}
              {isSaving ? 'Saving' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
