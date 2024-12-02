import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'

export class ChargingStationAdapter {
  private readonly httpClient: AxiosInstance
  private readonly greenyURL: string = 'http://nattech.fib.upc.edu:40353/api/charging-station-info'
  private readonly apiURL: string = process.env.CHARGING_STATION_API ?? this.greenyURL

  constructor () {
    this.httpClient = axios.create()

    axiosRetry(this.httpClient, {
      retries: 3,
      retryDelay: () => axiosRetry.exponentialDelay(),
      retryCondition: (error) => {
        // Explicit null checks on error.response
        return axiosRetry.isRetryableError(error) && (error.response === null || error.response === undefined || error.response.status !== 404)
      }
    })
  }

  public async getChargingStations (lat: number, long: number): Promise<any> {
    try {
      const response: AxiosResponse = await this.httpClient.post(this.apiURL, {
        latitude: lat,
        longitude: long,
        exact: true
      })
      if (response.status === 200 && response.data !== null) {
        return response.data
      } else {
        throw new Error('No data received')
      }
    } catch (error: any) {
      // Explicitly check the properties of error response
      if (error.response !== null && error.response !== undefined && typeof error.response.status === 'number' && error.response.status === 404) {
        return { message: 'No charging stations found at the provided coordinates', stations: [] }
      }

      // Safely access error message and check against empty string
      const errorMessage = error instanceof Error && error.message !== '' ? error.message : 'Unknown error occurred'
      console.error('Error fetching charging station data:', errorMessage)
      throw new Error('Failed to fetch charging station data')
    }
  }
}
