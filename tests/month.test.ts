import axios from 'axios'
import { expect, test } from 'bun:test'

const callMonth = async () => {
  const domain = 'yahoo.com'
  const date = '2024-10-22'
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
  expect(response.status).toBe(200)
  expect(response.data).toHaveProperty('domain', 'https://yahoo.com')
  expect(response.data).toHaveProperty('dates')
  expect(response.data.dates.length).toBe(31)
  expect(Array.isArray(response.data.dates)).toBe(true)
})
