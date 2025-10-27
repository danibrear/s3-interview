import { format, startOfMonth, startOfWeek } from 'date-fns'
import { z } from 'zod'
export const DateFormatSchema = z.string().transform((str) => {
  const date = new Date(str)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }
  console.log('date:', date)
  return format(date, 'yyyy-MM-dd')
})

export const StartOfWeekDateFormatSchema = z.string().transform((str) => {
  const date = new Date(str)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }
  // Set the date to the start of the week (Monday)
  const weekStart = startOfWeek(date)
  console.log('weekStart:', weekStart)
  return format(weekStart, 'yyyy-MM-dd')
})
export const StartOfMonthDateFormatSchema = z.string().transform((str) => {
  const date = new Date(str)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  console.log('date:', date)
  // Set the date to the start of the month
  const monthStart = startOfMonth(date)
  console.log('monthStart:', monthStart)
  return format(monthStart, 'yyyy-MM-dd')
})

export type DateFormat = z.infer<typeof DateFormatSchema>
export type StartOfWeekDateFormat = z.infer<typeof StartOfWeekDateFormatSchema>
export type StartOfMonthDateFormat = z.infer<
  typeof StartOfMonthDateFormatSchema
>
