import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { TripUpdate } from '../../models/TripUpdate'
import { createLogger } from '../../utils/logger'
import { getTripById,updateTripfn } from '../../businessLogic/trip'
import { getUserId } from '../utils'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    console.log("EVENT:", event);
    const tripId = event.pathParameters.tripId
    const updateTrip: TripUpdate = JSON.parse(event.body)

    logger.info("update trip id ", tripId);

    if(tripId === null) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'tripId is required'
            })
        }
    }

    const trip = await getTripById(tripId);

    logger.info("todo item to be updated found ", trip);

    const userId = getUserId(event);

    if(trip.userId !== userId) {
        return {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'This user is not the owner of the todo item'
            })
        }
    }
    
    await updateTripfn(updateTrip,tripId);
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            updateTrip
        })
    }
}