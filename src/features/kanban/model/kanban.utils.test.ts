import { describe, expect, it } from 'vitest'

import { createKanbanItemFixture } from '@/test/kanban-fixtures'

import { canMoveItem, getPositionForIndex, groupKanbanItemsByStatus } from './kanban.utils'

describe('kanban utilities', () => {
  it('allows same-column and adjacent moves while rejecting direct jumps', () => {
    expect(canMoveItem('to-do', 'to-do')).toBe(true)
    expect(canMoveItem('to-do', 'doing')).toBe(true)
    expect(canMoveItem('doing', 'done')).toBe(true)
    expect(canMoveItem('done', 'doing')).toBe(true)
    expect(canMoveItem('to-do', 'done')).toBe(false)
    expect(canMoveItem('done', 'to-do')).toBe(false)
  })

  it('groups items by status and sorts each group by position', () => {
    const items = [
      createKanbanItemFixture({ id: 'doing-2', title: 'Second doing', position: 2000, status: 'doing' }),
      createKanbanItemFixture({ id: 'todo-1', title: 'First todo', position: 1000, status: 'to-do' }),
      createKanbanItemFixture({ id: 'doing-1', title: 'First doing', position: 1000, status: 'doing' }),
      createKanbanItemFixture({ id: 'done-1', title: 'First done', position: 1000, status: 'done' }),
    ]

    expect(groupKanbanItemsByStatus(items)).toEqual({
      'to-do': [items[1]],
      doing: [items[2], items[0]],
      done: [items[3]],
    })
  })

  it('returns stable insertion positions for first, middle, and last indexes', () => {
    const items = [
      createKanbanItemFixture({ id: 'first', title: 'First', position: 1000 }),
      createKanbanItemFixture({ id: 'second', title: 'Second', position: 3000 }),
    ]

    expect(getPositionForIndex(items, 0)).toBe(0)
    expect(getPositionForIndex(items, 1)).toBe(2000)
    expect(getPositionForIndex(items, 2)).toBe(4000)
  })
})
