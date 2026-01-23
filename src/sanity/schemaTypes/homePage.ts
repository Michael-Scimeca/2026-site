import { defineField, defineType } from 'sanity'

export const homePage = defineType({
    name: 'homePage',
    title: 'Home Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Site Title',
            type: 'string',
            initialValue: 'Michael Scimeca',
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                defineField({
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative text',
                }),
            ],
        }),
        defineField({
            name: 'headline',
            title: 'Main Headline',
            type: 'string',
            description: 'e.g. "Web Developer & Designer"',
        }),
        defineField({
            name: 'subHeadline',
            title: 'Sub Headline',
            type: 'string',
            description: 'e.g. "Permanent located in..."',
        }),
        defineField({
            name: 'about',
            title: 'About Section',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'experience',
            title: 'Experience Timeline',
            type: 'array',
            of: [{ type: 'experience' }],
        }),
        defineField({
            name: 'footer',
            title: 'Footer Contact Info',
            type: 'object',
            fields: [
                defineField({ name: 'email', type: 'string', title: 'Email' }),
                defineField({ name: 'location', type: 'string', title: 'Location' }),
                defineField({ name: 'socialHandle', type: 'string', title: 'Social Handle (e.g. @itsjonhowell)' }),
            ]
        }),
    ],
})
