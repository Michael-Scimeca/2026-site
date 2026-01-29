import { defineField, defineType } from 'sanity'

export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'object',
  fields: [
    defineField({
      name: 'company',
      title: 'Company Name',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
    }),
    defineField({
      name: 'dateRange',
      title: 'Date Range',
      type: 'string',
      description: 'e.g. "2022 - Present" or "2018 - 2021"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail (Image or Video)',
      type: 'file',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
    defineField({
      name: 'creditLabel',
      title: 'Credit Label',
      type: 'string',
      description: 'e.g. "International HI Media Services"',
    }),
    defineField({
      name: 'creditLinks',
      title: 'Credit Links',
      type: 'string',
      description: 'e.g. "Apple Music, Apple Maps"',
    }),
    defineField({
      name: 'tools',
      title: 'Tools / Technologies',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
  ],
})
