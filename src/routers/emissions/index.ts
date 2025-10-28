import { Router } from 'express'

import { format, startOfWeek } from 'date-fns'
import { z } from 'zod'
import {
  fetchDateWithUrl,
  InvalidDateError,
} from '../../services/measure/fetchDate'
import { MultipleMeasureResponseSchema } from '../../services/measure/response-types'
import {
  getDateWithTimezone,
  getDaysOfMonth,
  getDaysOfWeek,
} from '../../utils/date'
import {
  processMonthlyRawReport,
  processWeeklyRawReport,
} from '../../utils/report'

const router = Router({ mergeParams: true, strict: true })

type RawReport = { date: string; totalEmissions: number }

router.get('/day', async (req, res) => {
  const { domain, date } = req.query as {
    domain: string
    date: string
  }

  try {
    const response = await fetchDateWithUrl({
      domain,
      date,
    })

    if (response && response.totalEmissions) {
      res.json({
        totalEmissions: response.totalEmissions,
        domain,
        date,
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

  const validatedStartOfWeekDate = format(
    startOfWeek(getDateWithTimezone(date)),
    'yyyy-MM-dd'
  )
  try {
    const days = getDaysOfWeek(validatedStartOfWeekDate)

    const responses = await Promise.all(
      days.map(async (date: string) => {
        try {
          const result = await fetchDateWithUrl({
            domain,
            date,
          })
          return result
        } catch (error) {
          if (error instanceof InvalidDateError) {
            return false
          }
        }
      })
    )
    const reportMap = processWeeklyRawReport({
      domain,
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
  try {
    const days = getDaysOfMonth(date)

    const responses = await Promise.all(
      days.map(async (date: string) => {
        try {
          return await fetchDateWithUrl({
            domain,
            date,
          })
        } catch (error) {
          if (error instanceof InvalidDateError) {
            return false
          }
        }
      })
    )

    const reportMap = processMonthlyRawReport({
      domain,
      month: format(getDateWithTimezone(date), 'yyyy-MM'),
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
