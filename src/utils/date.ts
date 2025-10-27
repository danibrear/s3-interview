import { add, getDaysInMonth, getMonth, getYear } from 'date-fns'

export const getDaysOfWeek = (startOfWeekDate: string): string[] => {
  try {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeekDate)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0] as string
    })
  } catch (error) {
    console.error('[ERROR] Failed to get days of week:', error)
    return [] // Return an empty array on error
  }
}

export const getDaysOfMonth = (dateStr: string): string[] => {
  console.log('dataStr:', dateStr)
  const date = add(new Date(dateStr), { days: 1 })
  const year = getYear(date)
  const month = getMonth(date)
  const daysInMonth = getDaysInMonth(date)

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dayDate = new Date(year, month, day)
    return dayDate.toISOString().split('T')[0] as string
  })
}
