type DateString = string // 'YYYY-MM-DD' formatted date string

export type RawMonthReport = {
  totalEmissions: number
  month: string
  domain: string
  high: {
    date: DateString
    value: number
  }
  low: {
    date: DateString
    value: number
  }
  average: number
}

export type RawWeekReport = {
  totalEmissions: number
  dates: string[]
  domain: string
  high: {
    date: DateString
    value: number
  }
  low: {
    date: DateString
    value: number
  }
  average: number
}

export type RawDayReport = {
  date: string
  totalEmissions: number
  domain: string
}
