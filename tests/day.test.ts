import axios from 'axios'
import { expect, test } from 'bun:test'
import type { RawDayReport } from '../src/types/RawReport'

const callDate = async () => {
  const domain = 'yahoo.com'
  const date = '2025-09-22'
  return await axios(`http://localhost:3000/emissions/day`, {
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
test('GET /emissions/day', async () => {
  const response = await callDate()

  const expectedResponse: RawDayReport = {
    domain: 'https://yahoo.com',
    totalEmissions: 0.2873057,
    date: '2025-09-22',
  }
  expect(response.status).toBe(200)
  expect(response.data).toHaveProperty('domain', expectedResponse.domain)
  expect(response.data).toHaveProperty('totalEmissions')
  expect(response.data.totalEmissions).toBeCloseTo(
    expectedResponse.totalEmissions,
    3
  )
})

test('Fails when given a future date', async () => {
  const domain = 'yahoo.com'
  const date = '3025-09-22'
  try {
    await axios(`http://localhost:3000/emissions/day`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        domain,
        date,
      },
    })
  } catch (_error) {
    const error = _error as { response: { status: number; data: unknown } }
    expect(error.response.status).toBe(403)
    expect(error.response.data).toHaveProperty('error', 'Invalid date provided')
  }
})
