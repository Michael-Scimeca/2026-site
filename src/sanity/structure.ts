import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Page')
        .child(
          S.document()
            .schemaType('homePage')
            .documentId('homePage')
        ),
      S.divider(),
      S.listItem()
        .title('💬 Chat Visitors')
        .child(
          S.documentTypeList('chatVisitor')
            .title('Chat Visitors')
            .defaultOrdering([{ field: 'lastVisit', direction: 'desc' }])
        ),
      S.divider(),
      // Filter out singleton and organized types from the auto-list
      ...S.documentTypeListItems().filter(
        (listItem) => !['homePage', 'chatVisitor'].includes(listItem.getId() || '')
      ),
    ])
