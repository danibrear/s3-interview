# Take Home Project Assessment

### Overview

This API is meant to be used as a Data Aggregator for emissions data, using the Scope3 `/measure` endpoint to calculate the total emissions of a given domain (inventory ID). Documentation for this API endpoint can be found here: https://docs.scope3.com/reference/measure-1. For testing, a list of valid domains can be found in the [`VALID_DOMAINS.txt` file](./VALID_DOMAINS.txt).

This should take no longer than 2 hours to complete, please do not exceed this time limit. We will discuss your implementation in detail at a follow up meeting, along with pair-programming another assessment. If you have any questions or need clarification, please feel free to reach out to [bminer@scope3.com](mailto:bminer@scope3.com).

You may use all of the usual tools at your disposal, including installing any additional dependencies you may need.

### Project Structure

- **Server Entrypoint**: [`src/server.ts`](./src/server.ts) - Express server configuration and middleware setup
- **Measure Service API**: [`src/services/measure/api.ts`](./src/services/measure/api.ts) - Scope3 API client for emissions calculations
- **Emissions Router**: [`src/routers/emissions/index.ts`](./src/routers/emissions/index.ts) - API routes for emissions endpoints

_NOTE_: The Measure Service API client is already implemented for you to use, you _do not_ need to implement it yourself. However, feel free to modify it for your own needs, if you wish.

### TODOs

Currently, this API only has one emissions endpoint (`/emissions/day`), which fetches the `totalEmissions` for a given domain on a given date. We want to expand this API to perform more complex data aggregation.

- Create a robust middleware function for parsing and validating inputted query parameters for the `/emissions` router
  - Currently, you can pass anything as the `domain` and `date` query parameters. The middleware should validate that the `domain` is a valid domain name and the `date` is a valid date in the format `YYYY-MM-DD`.
  - This middleware should be dynamic and reusable for any future endpoints that require similar validation. Use Zod for schema validation (already installed)
- Implement the `/emissions/week` endpoint
  - Endpoint must take `domain` and `date` query parameters.
  - Using the Measure API, get the `totalEmissions` for each date in the week, where the starting day is the provided date. The endpoint should return a 403 if the date is invalid (undefined, invalid, or in the future)
  - Sum all values to calculate the total emissions for the week, including high, low, and average calculations for the week.
  - Response structure:
    ```json
    {
      "totalEmissions": number,
      "dates": string[],
      "domain": string,
      "high": {
        "date": string,
        "value": number
      },
      "low": {
        "date": string,
        "value": number
      },
      "average": number
    }
    ```
- Implement the `/emissions/month` endpoint
  - Endpoint must take `domain` and `date` query parameters (`date` here is the first day of the month, or simply "YYYY-MM").
  - Response structure:
    ```json
    {
      "totalEmissions": number,
      "month": string,
      "domain": string,
      "high": {
        "date": string,
        "value": number
      },
      "low": {
        "date": string,
        "value": number
      },
      "average": number
    }
    ```
  - Using the Measure API, get the `totalEmissions` for each date of the month, where the starting day is the first of the month specified. The endpoint should return a 403 if the date is invalid (undefined, invalid, or in the future)
  - Sum all values to calculate the total emissions for the month for the given domain, along with calculating high, low, and average emissions for the month.

### Evaluation Criteria

When reviewing your submission, we'll be assessing the following aspects:

#### Performance & Efficiency

- **Parallel processing**: Implement solutions that fetch data concurrently rather than sequentially. The `/week` and `/month` endpoints will need to make multiple API calls, these should be optimized to run in parallel.
- **Response time**: Our system has a 30-second HTTP timeout limit. Your implementation should return responses well under this threshold, even for the `/month` endpoint which requires fetching ~30 days of data.
- **Error handling**: Gracefully handle API failures and network issues without blocking the entire request.

#### Code Quality & Architecture

- **Reusability**: Avoid code duplication between endpoints. Extract shared logic where you see fit that can be used across the `/day`, `/week`, and `/month` endpoints.
- **Maintainability**: Write clean, well-organized code that would be easy for other developers to understand and extend.

#### Middleware & Validation

- **Dynamic validation**: Create a flexible middleware system that can validate different query parameter schemas without duplicating validation logic.
- **Zod integration**: Use Zod schemas to define and enforce parameter validation rules in a type-safe manner.
- **Error responses**: Return appropriate HTTP status codes (400 for invalid input, 403 for forbidden dates, etc.) with clear error messages.

#### Bonus Considerations

- Thoughtful edge case handling (e.g., leap years, month boundaries, timezone considerations)
- Logging and observability for debugging and monitoring (there is a configured [logging system](./src/logger.ts) already in place, use or improve this if you wish!)
