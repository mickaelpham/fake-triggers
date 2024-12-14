import { nanoid } from 'nanoid'

const PREFIXES = {
  company: 'cpy_',
  group: 'grp_',
  user: 'usr_',
  workspace: 'wrk_',
} as const

type Model = keyof typeof PREFIXES

export function generateId(model: Model) {
  return PREFIXES[model] + nanoid()
}
