import { url, z } from 'zod'

export const UrlSchema = z.string().transform((str) => {
  if (!str.startsWith('http')) {
    str = `https://${str}`
  }
  return url({ hostname: z.regexes.domain }).parse(str)
})

export type Url = z.infer<typeof UrlSchema>
