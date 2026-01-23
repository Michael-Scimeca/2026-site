import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const serverClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

if (!process.env.SANITY_API_TOKEN) {
    console.warn("⚠️ SANITY_API_TOKEN is missing from environment variables! Writes will fail.");
} else {
    console.log("✅ SANITY_API_TOKEN found in environment variables.");
}
