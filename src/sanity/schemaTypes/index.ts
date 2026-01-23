import { type SchemaTypeDefinition } from 'sanity'
import { homePage } from './homePage'
import { experience } from './experience'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homePage, experience],
}
