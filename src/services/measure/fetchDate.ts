import MeasureAPI from '@/services/measure/api'
import { isAfter, isToday, startOfDay } from 'date-fns'
import { getDateWithTimezone } from '../../utils/date'

import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // Cache for 5 minutes

type RawFetchResponse = {
  date: string
  totalEmissions: number
}

export class InvalidDateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidDateError'
  }
}

export const fetchDateWithUrl = async ({
  domain,
  date,
}: {
  domain: string
  date: string
}): Promise<false | RawFetchResponse> => {
  const cacheKey = `emissions:day:${domain}:${date}`
  const cachedData = cache.get(cacheKey)
  if (
    cachedData &&
    typeof cachedData === 'object' &&
    'date' in cachedData &&
    'totalEmissions' in cachedData
  ) {
    return cachedData as RawFetchResponse
  }
  const now = startOfDay(getDateWithTimezone(new Date().toISOString()))
  const dateWithTimezone = getDateWithTimezone(date)
  if (!date || isAfter(dateWithTimezone, now) || isToday(dateWithTimezone)) {
    throw new InvalidDateError('Invalid date provided')
  }
  const response = await MeasureAPI.measure([domain], date)
  if (response.totalEmissions) {
    cache.set(cacheKey, { date, totalEmissions: response.totalEmissions })
    return { date, totalEmissions: response.totalEmissions }
  }
  throw new Error('No emissions data found')
}
