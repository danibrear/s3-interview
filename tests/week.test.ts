import axios from 'axios'
import { expect, test } from 'bun:test'

const callWeek = async () => {
  const domain = 'yahoo.com'
  const date = '2025-10-22'
  return await axios(`http://localhost:3000/emissions/week`, {
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

test('GET /emissions/week', async () => {
  const response = await callWeek()
  expect(response.status).toBe(200)
  expect(response.data).toHaveProperty('domain', 'https://yahoo.com')
  expect(response.data).toHaveProperty('dates')
  expect(Array.isArray(response.data.dates)).toBe(true)
})
