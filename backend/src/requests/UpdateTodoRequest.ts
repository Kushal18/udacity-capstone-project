/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  destination: string
  startDate: string
  dueDate: string
}