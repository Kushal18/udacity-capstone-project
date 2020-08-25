import * as uuid from 'uuid'

import { TripItem } from '../models/TripItem'
import { TripAccess } from '../dataLayer/tripAccess'
import { CreateTripRequest } from '../requests/CreateTripRequest'
import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { TripUpdate } from '../models/TripUpdate'

const tripAccess = new TripAccess()

export async function getTripById(tripId: String) {
  return tripAccess.getTripById(tripId);
} 

export async function updateTripfn(updateTrip: TripUpdate,tripId: String) {
  return tripAccess.updateTrip(updateTrip,tripId);
}

export async function getTripsForUser(
  event: APIGatewayProxyEvent
) {
  const userId = getUserId(event);

  return tripAccess.getTripsForUser(userId);
} 

export async function createTrip(
  createTripRequest: CreateTripRequest,
  event: APIGatewayProxyEvent
): Promise<TripItem> {

  const itemId = uuid.v4()
  const userId = getUserId(event)

  return await tripAccess.createTrip({
    userId: userId,
    tripId: itemId,
    createdAt: new Date().toISOString(),
    name: createTripRequest.name,
    startDate: createTripRequest.startDate,
    endDate: createTripRequest.endDate,
    destination: createTripRequest.destination
  })
}

export async function setAttachmentUrl(
  tripId: string,
  attachmentUrl: string,
): Promise<void> {
  const trip = await tripAccess.getTripById(tripId);

  tripAccess.setAttachmentUrl(trip.tripId, attachmentUrl);
} 