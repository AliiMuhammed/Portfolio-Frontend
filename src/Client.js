import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'


export const client = sanityClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true,
    token: process.env.REACT_APP_SANITY_TOKEN,
    apiVersion: '2024-01-01'
})

export const builder = imageUrlBuilder(client)

export const urlFor = (source) => {
    return builder.image(source)
}