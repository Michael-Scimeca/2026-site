import { defineField, defineType } from 'sanity'

export const timelineItem = defineType({
    name: 'timelineItem',
    title: 'Timeline Item',
    type: 'object',
    fields: [
        defineField({
            name: 'company',
            title: 'Company',
            type: 'string',
        }),
        defineField({
            name: 'date',
            title: 'Date Range',
            type: 'string',
            description: 'e.g. "2022 - Present"',
        }),
        defineField({
            name: 'roles',
            title: 'Roles',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'title',
                            title: 'Job Title',
                            type: 'string',
                        }),
                        defineField({
                            name: 'description',
                            title: 'Description',
                            type: 'array',
                            of: [{ type: 'string' }],
                            description: 'List of bullet points',
                        }),
                    ],
                },
            ],
        }),
    ],
})
