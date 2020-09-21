// import { GOOGLE_MAPS_API_KEY } from './config';

export const environment = {
    production: false,
    apiUrl: 'http://172.16.12.54:8080',
    messagingUrl: 'ws://172.16.12.54:8080/lostpets-ws/websocket',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};
