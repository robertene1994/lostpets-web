import { writeFile } from 'fs';
import { environment } from './environments/environment';

const targetPath = './src/environments/environment.prod.ts';
const envConfigFile = `
    export const environment = {
        production: '${environment.production}',
        googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY},
        apiUrl: '${environment.apiUrl}',
        messagingUrl: '${environment.messagingUrl}',
    };`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
    if (err) {
        return console.log(err);
    }
});
