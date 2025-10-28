import { getDaysInMonth, getMonth, getYear } from 'date-fns'

import * as tz from 'date-fns-tz'

export const getDaysOfWeek = (startOfWeekDate: string): string[] => {
  try {
    return Array.from({ length: 7 }, (_, i) => {
      const timeZoneDate = tz.toDate(startOfWeekDate, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      timeZoneDate.setDate(timeZoneDate.getDate() + i)
      return timeZoneDate.toISOString().split('T')[0] as string
    })
  } catch (error) {
    console.error('[ERROR] Failed to get days of week:', error)
    return [] // Return an empty array on error
  }
}

export const getDaysOfMonth = (dateStr: string): string[] => {
  const timeZoneDate = tz.toDate(dateStr, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const year = getYear(timeZoneDate)
  const month = getMonth(timeZoneDate)
  const daysInMonth = getDaysInMonth(timeZoneDate)

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dayDate = new Date(year, month, day)
    return dayDate.toISOString().split('T')[0] as string
  })
}

export const getDateWithTimezone = (dateStr: string): Date => {
  return tz.toDate(dateStr, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}
