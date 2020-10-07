import { googleMaps } from './google-maps.environment';

export const environment = {
    production: false,
    apiUrl: 'https://lostpets-back-end.herokuapp.com',
    messagingUrl: 'wss://lostpets-back-end.herokuapp.com/lostpets-ws/websocket',
    googleMapsApiKey: googleMaps.googleMapsApiKey,
};
