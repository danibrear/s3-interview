import type { NextFunction, Request, Response } from 'express'
import { DateFormatSchema } from '../validations/date'
import { UrlSchema } from '../validations/url'

export const validateQueryData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { domain, date } = req.query as { domain?: string; date?: string }

  if (!domain || !date) {
    res.status(403).json({ error: 'Missing required parameters' })
    return
  }

  let validatedUrl: string
  let validatedDate: string
  try {
    validatedUrl = UrlSchema.parse(domain)
    validatedDate = DateFormatSchema.parse(date)
    if (!validatedDate) {
      throw new Error('Invalid date')
    }
    if (!validatedUrl) {
      throw new Error('Invalid URL')
    }
  } catch (error) {
    console.log('[ERROR] Invalid parameters:', error)
    res.status(403).json({ error: 'Invalid parameters' })
    return
  }

  next()
}
