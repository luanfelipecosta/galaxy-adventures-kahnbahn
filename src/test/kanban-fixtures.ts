import type { KanbanItem, KanbanPriority, KanbanStatus } from '@/features/kanban/model/kanban.types'

type CreateKanbanItemFixtureOptions = {
  id: string
  title: string
  assigneeId?: string
  createdAt?: string
  descriptionMarkdown?: string
  labels?: string[]
  position?: number
  priority?: KanbanPriority
  status?: KanbanStatus
  updatedAt?: string
}

export const createKanbanItemFixture = ({
  id,
  title,
  assigneeId = '1',
  createdAt = '2026-01-01T00:00:00.000Z',
  descriptionMarkdown = 'Track the next interdimensional step.',
  labels = ['mission'],
  position = 1000,
  priority = 'medium',
  status = 'to-do',
  updatedAt = createdAt,
}: CreateKanbanItemFixtureOptions): KanbanItem => {
  return {
    assigneeId,
    createdAt,
    descriptionMarkdown,
    id,
    labels,
    logs: [
      {
        createdAt,
        id: `${id}-log`,
        message: 'Item created in To do.',
        type: 'created',
      },
    ],
    position,
    priority,
    status,
    title,
    updatedAt,
  }
}

export const testCharacters = [
  {
    id: '1',
    image: 'https://example.com/rick.png',
    name: 'Rick Sanchez',
    species: 'Human',
    status: 'Alive',
  },
  {
    id: '2',
    image: 'https://example.com/morty.png',
    name: 'Morty Smith',
    species: 'Human',
    status: 'Alive',
  },
  {
    id: '3',
    image: 'https://example.com/summer.png',
    name: 'Summer Smith',
    species: 'Human',
    status: 'Alive',
  },
]
