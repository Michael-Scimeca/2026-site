import { type SchemaTypeDefinition } from 'sanity'
import { homePage } from './homePage'
import { experience } from './experience'
import { gameStats } from './gameStats'
import { winnerSubmission } from './winnerSubmission'
import { chatVisitor } from './chatVisitor'

import { timelineItem } from './timelineItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homePage, experience, timelineItem, gameStats, winnerSubmission, chatVisitor],
}
