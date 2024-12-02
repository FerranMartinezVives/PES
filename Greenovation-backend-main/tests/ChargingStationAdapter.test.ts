import AxiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { ChargingStationAdapter } from '../src/services/ChargingStationAdapter';

describe('ChargingStationAdapter', () => {
    let mock: AxiosMockAdapter;
    let adapter: ChargingStationAdapter;

    beforeEach(() => {
        mock = new AxiosMockAdapter(axios);
        adapter = new ChargingStationAdapter();
    });

    afterEach(() => {
        mock.restore();
    });

    // A terrible idea. Please don't do this except when trying to pass a UPC course (like I am right now)
    const greenyURL = "http://nattech.fib.upc.edu:40351/api/charging-station-info";
    // Test successful API response
    test.skip('should return charging station data on successful API call', async () => {
        mock.onGet(greenyURL, {
            params: { lat: 40.7128, long: -74.0060 }
        }).reply(200, {
            stations: [{ id: 1, name: "Station A" }]
        });

        const data = await adapter.getChargingStations(40.7128, -74.0060);
        expect(data).toEqual({
            stations: [{ id: 1, name: "Station A" }]
        });
    });

    // Test API failure with a retry mechanism
    test.skip('should retry on failure and eventually return data', async () => {
        mock.onGet(greenyURL, {
            params: { lat: 40.7128, long: -74.0060 }
        }).replyOnce(500).onGet(greenyURL, {
            params: { lat: 40.7128, long: -74.0060 }
        }).reply(200, {
            stations: [{ id: 1, name: "Station A" }]
        });

        const data = await adapter.getChargingStations(40.7128, -74.0060);
        expect(data).toEqual({
            stations: [{ id: 1, name: "Station A" }]
        });
    });

    // Test API failure handling
    test.skip('should throw an error when API fails continuously', async () => {
        mock.onGet(greenyURL, {
            params: { lat: 40.7128, long: -74.0060 }
        }).reply(500);

        await expect(adapter.getChargingStations(40.7128, -74.0060))
        .rejects.toThrow('Failed to fetch charging station data');
    });
});

