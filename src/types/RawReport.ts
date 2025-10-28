export type RawMonthReport = {
  totalEmissions: number
  month: string
  domain: string
  high: {
    date: string
    value: number
  }
  low: {
    date: string
    value: number
  }
  average: number
}

export type RawWeekReport = {
  totalEmissions: number
  dates: string[]
  domain: string
  high: {
    date: string
    value: number
  }
  low: {
    date: string
    value: number
  }
  average: number
}

export type RawDayReport = {
  date: string
  totalEmissions: number
  domain: string
}
