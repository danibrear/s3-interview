import axios from 'axios'
import { expect, test } from 'bun:test'
import type { RawMonthReport } from '../src/types/RawReport'

const callMonth = async () => {
  const domain = 'yahoo.com'
  const date = '2025-09-22'
  return await axios(`http://localhost:3000/emissions/month`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      domain,
      date,
    },
  })
}
test('GET /emissions/month', async () => {
  const response = await callMonth()

  const expectedResponse: RawMonthReport = {
    domain: 'https://yahoo.com',
    month: '2025-09',
    totalEmissions: 8.61915,
    average: 0.287305,
    high: { date: '2025-09-15', value: 0.54321 },
    low: { date: '2025-09-01', value: 0.12345 },
  }
  expect(response.status).toBe(200)
  expect(response.data).toHaveProperty('domain', expectedResponse.domain)
  expect(response.data).toHaveProperty('average')
  expect(response.data).toHaveProperty('totalEmissions')
  expect(response.data).toHaveProperty('high')
  expect(response.data).toHaveProperty('low')
  expect(response.data.average).toBeCloseTo(expectedResponse.average, 3)
  expect(response.data.totalEmissions).toBeCloseTo(
    expectedResponse.totalEmissions,
    3
  )
})
