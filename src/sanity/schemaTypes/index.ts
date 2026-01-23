import { type SchemaTypeDefinition } from 'sanity'
import { homePage } from './homePage'
import { experience } from './experience'
import { gameStats } from './gameStats'
import { winnerSubmission } from './winnerSubmission'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homePage, experience, gameStats, winnerSubmission],
}
