import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false to ensure fresh data for game stats
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN, // Needed for write operations from client-side if we did it there, but we are using API route. Wait, the API route imports THIS client. 
})
