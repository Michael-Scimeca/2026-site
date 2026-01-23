import {defineField, defineType} from 'sanity'

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
      of: [{type: 'block'}], 
    }),
  ],
})
