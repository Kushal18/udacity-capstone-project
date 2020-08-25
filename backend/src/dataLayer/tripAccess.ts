import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TripUpdate } from '../models/TripUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

import { TripItem } from '../models/TripItem'

const tripsTable = process.env.TRIPS_TABLE
const userIndex = process.env.USER_ID_INDEX

export class TripAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly tripsTable = process.env.TRIPS_TABLE) {
  }
  
  async getTripsForUser(userId: String) {
    const result = await this.docClient.query({
      TableName : tripsTable,
      IndexName : userIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      },

      ScanIndexForward: false
    }).promise()

    return result.Items;
  }

  async getTripById(tripId: String): Promise<TripItem> {
    const result = await this.docClient.query({
      TableName : tripsTable,
      KeyConditionExpression: 'tripId = :tripId',
      ExpressionAttributeValues: {
          ':tripId': tripId
      },

      ScanIndexForward: false
    }).promise()

    const item = result.Items[0];
    return item as TripItem;
  }

  async updateTrip(updateTrip: TripUpdate,tripId: String) {
    await this.docClient.update({
      TableName: tripsTable,
          Key: {
            tripId: tripId
          },
          UpdateExpression: 'set #namefield = :n, destination = :d, startDate = :sd, endDate = :ed',
          ExpressionAttributeValues: {
              ':n': updateTrip.name,
              ':d': updateTrip.destination,
              ':sd': updateTrip.startDate,
              ':ed': updateTrip.endDate
          },
          ExpressionAttributeNames: {
              "#namefield": "name"
          }
    }).promise()
  }

  async createTrip(tripItem: TripItem): Promise<TripItem> {
    await this.docClient.put({
      TableName: this.tripsTable,
      Item: tripItem
    }).promise()

    return tripItem
  }

  async setAttachmentUrl(
    tripId: string,
    attachmentUrl: string,
  ): Promise<void> {
    this.docClient
        .update({
            TableName: this.tripsTable,
            Key: {
              tripId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            },
            ReturnValues: 'UPDATED_NEW',
        })
        .promise();
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
