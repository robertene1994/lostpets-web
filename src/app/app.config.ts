import { environment } from '../environments/environment';

// API Endpoints
export const apiUrl = environment.apiUrl;
export const apiUrlUser = `${apiUrl}/user`;
export const apiUrlAd = `${apiUrl}/ad`;
export const apiUrlChat = `${apiUrl}/chat`;
export const apiUrlMessage = `${apiUrl}/message`;

// API
export const serviceTimeOutMillis = 5000;

// Messaging Endpoins
export const messagingUrl = environment.messagingUrl;
export const messagingUserTopic = '/exchange/chatMessage/userEmail';
export const messagingUserDestination = '/send/chatMessage/userEmail';

// Loading Spinner
export const showSpinnerMillis = 1000;

// Notifications Service
export const maxErrorsShown = 7;
export const showErrorTimeIntervalSeconds = 5;

// Utils
// tslint:disable-next-line:max-line-length
export const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const mobileDevicePattern = /(iPhone|iPod|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i;
export const imageUpdateReloadIntervalMillis = 5000;
export const imageReloadIntervalMillis = 2500;

// Google Maps API
export let googleMapsApiKey = environment.googleMapsApiKey;
// if (process.env.GOOGLE_MAPS_API_KEY) {
//     googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
// } else {
//     googleMapsApiKey = require('../environments/config').GOOGLE_MAPS_API_KEY;
// }
// console.log(process.env.GOOGLE_MAPS_API_KEY);
// console.log(googleMapsApiKey);

console.log(environment.googleMapsApiKey);
