import { useEffect, useState } from 'react'

import type { KanbanAssignee } from '../model/kanban.types'
import { getAssigneeInitials } from '../model/kanban.utils'

type KanbanAssigneeAvatarProps = {
  assignee: KanbanAssignee | null
  name: string
  className?: string
}

export const KanbanAssigneeAvatar = ({ assignee, className, name }: KanbanAssigneeAvatarProps) => {
  const [hasImageError, setHasImageError] = useState(false)
  const shouldShowImage = Boolean(assignee?.image && !hasImageError)

  useEffect(() => {
    setHasImageError(false)
  }, [assignee?.image])

  return (
    <span
      className={
        className ??
        'inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-[0.65rem] font-semibold text-primary-foreground'
      }
    >
      {shouldShowImage ? (
        <img className="size-full object-cover" src={assignee?.image ?? undefined} alt="" onError={() => setHasImageError(true)} />
      ) : (
        getAssigneeInitials(name)
      )}
    </span>
  )
}
