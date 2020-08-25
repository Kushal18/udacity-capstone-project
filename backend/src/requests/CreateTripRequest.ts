/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTripRequest {
  name: string
  destination: string
  startDate: string
  endDate: string
}
