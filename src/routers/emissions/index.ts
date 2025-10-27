import { Router } from 'express'

import MeasureAPI from '@/services/measure/api'
import { isAfter, sub } from 'date-fns'
import { MultipleMeasureResponseSchema } from '../../services/measure/response-types'
import { getDaysOfMonth, getDaysOfWeek } from '../../utils/date'
import { processRawReport } from '../../utils/report'
import {
  DateFormatSchema,
  StartOfMonthDateFormatSchema,
  StartOfWeekDateFormatSchema,
} from '../../validations/date'
import { UrlSchema } from '../../validations/url'

const router = Router({ mergeParams: true, strict: true })

type RawReport = { date: string; totalEmissions: number }

router.get('/day', async (req, res) => {
  const { domain, date } = req.query as {
    domain: string
    date: string
  }

  let validatedUrl: string
  let validatedDate: string

  try {
    validatedUrl = UrlSchema.parse(domain)
    validatedDate = DateFormatSchema.parse(date)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Invalid parameters' })
    return
  }

  try {
    const response = await MeasureAPI.measure([validatedUrl], validatedDate)

    if (response.totalEmissions) {
      res.json({ totalEmissions: response.totalEmissions, domain, date })
      return
    }

    res.status(404).json({ error: 'No emissions data found' })
  } catch (_error) {
    console.error(_error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/week', async (req, res) => {
  const { domain, date } = req.query as { domain: string; date: string }

  // TODO - Implement the logic to sum `totalEmissions` for the given domain's emissions for the week
  // the date is the start of the week

  let validatedUrl: string
  let validatedStartOfWeekDate: string
  try {
    validatedUrl = UrlSchema.parse(domain)
    validatedStartOfWeekDate = StartOfWeekDateFormatSchema.parse(date)
    if (!validatedStartOfWeekDate) {
      throw new Error('Invalid start of week date')
    }
    if (!validatedUrl) {
      throw new Error('Invalid URL')
    }
  } catch (error) {
    console.log('[ERROR] Invalid parameters:', error)
    res.status(400).json({ error: 'Invalid parameters' })
    return
  }
  try {
    const days = getDaysOfWeek(validatedStartOfWeekDate)

    const responses = await Promise.all(
      days.map(async (date: string) => {
        if (!date || isAfter(new Date(date), sub(new Date(), { days: 1 }))) {
          return { date, totalEmissions: 0 }
        }
        const response = await MeasureAPI.measure([validatedUrl], date)
        if (response.totalEmissions) {
          return { date, totalEmissions: response.totalEmissions }
        }
        return { date, totalEmissions: 0 }
      })
    )
    const reportMap = processRawReport({
      domain: validatedUrl,
      response: responses.filter((r) => r !== null) as RawReport[],
    })

    const validatedResponse = MultipleMeasureResponseSchema.parse(reportMap)
    if (!validatedResponse) {
      throw new Error('Invalid response format')
    }

    return res.json(validatedResponse)
  } catch (error) {
    console.error('[ERROR] Invalid response format:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

router.get('/month', async (req, res) => {
  const { domain, date } = req.query as { domain: string; date: string }
  let validatedUrl: string
  let validatedStartOfMonthDate: string
  try {
    validatedUrl = UrlSchema.parse(domain)
    validatedStartOfMonthDate = StartOfMonthDateFormatSchema.parse(date)
    if (!validatedStartOfMonthDate) {
      throw new Error('Invalid start of month date')
    }
    if (!validatedUrl) {
      throw new Error('Invalid URL')
    }
  } catch (error) {
    console.log('[ERROR] Invalid parameters:', error)
    res.status(400).json({ error: 'Invalid parameters' })
    return
  }
  try {
    const days = getDaysOfMonth(validatedStartOfMonthDate)

    const responses = await Promise.all(
      days.map(async (date: string) => {
        if (!date || isAfter(new Date(date), sub(new Date(), { days: 1 }))) {
          return { date, totalEmissions: 0 }
        }
        try {
          const response = await MeasureAPI.measure([validatedUrl], date)
          if (response.totalEmissions) {
            return { date, totalEmissions: response.totalEmissions }
          }
        } catch (error) {
          console.error(`[ERROR] MeasureAPI failed for date ${date}:`, error)
        }
        return { date, totalEmissions: 0 }
      })
    )
    const reportMap = processRawReport({
      domain: validatedUrl,
      response: responses.filter((r) => r !== null) as RawReport[],
    })

    const validatedResponse = MultipleMeasureResponseSchema.parse(reportMap)
    if (!validatedResponse) {
      throw new Error('Invalid response format')
    }

    return res.json(validatedResponse)
  } catch (error) {
    console.error('[ERROR] Invalid response format:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

export default router
