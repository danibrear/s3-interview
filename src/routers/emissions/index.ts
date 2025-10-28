import { Router } from 'express'

import { z } from 'zod'
import { fetchDateWithUrl } from '../../services/measure/fetchDate'
import { MultipleMeasureResponseSchema } from '../../services/measure/response-types'
import { getDaysOfMonth, getDaysOfWeek } from '../../utils/date'
import {
  processMonthlyRawReport,
  processWeeklyRawReport,
} from '../../utils/report'
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
    res.status(403).json({ error: 'Invalid parameters' })
    return
  }

  try {
    const response = await fetchDateWithUrl({
      domain: validatedUrl,
      date: validatedDate,
    })

    if (response && response.totalEmissions) {
      res.json({
        totalEmissions: response.totalEmissions,
        domain: validatedUrl,
        date: validatedDate,
      })
      return
    }

    res.status(403).json({ error: 'No emissions data found' })
  } catch (_error) {
    if (_error instanceof Error && _error.name === 'InvalidDateError') {
      res.status(403).json({ error: 'Invalid date provided' })
      return
    }
    if (_error instanceof z.ZodError) {
      console.error('[ERROR] Validation error:', _error)
      res.status(403).json({
        error: 'Invalid data received. Check the domain and try again',
      })
      return
    }
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
    res.status(403).json({ error: 'Invalid parameters' })
    return
  }

  try {
    const days = getDaysOfWeek(validatedStartOfWeekDate)

    const responses = await Promise.all(
      days.map(async (date: string) => {
        const result = await fetchDateWithUrl({
          domain: validatedUrl,
          date,
        })
        return result
      })
    )
    const reportMap = processWeeklyRawReport({
      domain: validatedUrl,
      response: responses.filter((r) => r !== false) as RawReport[],
    })

    const validatedResponse = MultipleMeasureResponseSchema.parse(reportMap)
    if (!validatedResponse) {
      throw new Error('Invalid response format')
    }

    return res.json(validatedResponse)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[ERROR] Validation error:', error)
      res.status(403).json({
        error: 'Invalid data received. Check the domain and try again',
      })
      return
    }
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
        return await fetchDateWithUrl({
          domain: validatedUrl,
          date,
        })
      })
    )

    const reportMap = processMonthlyRawReport({
      domain: validatedUrl,
      month: validatedStartOfMonthDate,
      response: responses.filter((r) => r !== false) as RawReport[],
    })
    const validatedResponse = MultipleMeasureResponseSchema.parse(reportMap)
    if (!validatedResponse) {
      throw new Error('Invalid response format')
    }

    return res.json(validatedResponse)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[ERROR] Validation error:', error)
      res.status(403).json({
        error: 'Invalid data received. Check the domain and try again',
      })
      return
    }
    console.error('[ERROR] Invalid response format:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

export default router
