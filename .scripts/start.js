const fs = require('fs');
const propertiesReader = require('properties-reader');

const targetPaths = [
    'src/environments/environment.prod.ts',
    'src/environments/environment.aws.ts',
    'src/environments/environment.heroku.ts'
];

if (process.env.GOOGLE_MAPS_API_KEY) {
    targetPaths.forEach(targetPath => {
        fs.readFile(targetPath, 'utf8', (_err, data) => {
            const formatted = data.replace('GOOGLE_MAPS_API_KEY', process.env.GOOGLE_MAPS_API_KEY);
            fs.writeFile(targetPath, formatted, 'utf8', (err) => {
                if (err)
                    return console.log(err);
            });
        });
    });
} else {
    const googleMapsApiKey = propertiesReader('.env').get('GOOGLE_MAPS_API_KEY');
    const targetPath = 'src/environments/environment.ts';
    fs.readFile(targetPath, 'utf8', (_err, data) => {
        const formatted = data.replace('GOOGLE_MAPS_API_KEY', googleMapsApiKey);
        fs.writeFile(targetPath, formatted, 'utf8', (err) => {
            if (err)
                return console.log(err);
        });
    });

    setTimeout(() => {
        fs.readFile(targetPath, 'utf8', (_err, data) => {
            console.log(data);
            const formatted = data.replace(/AI.*Bo/g, 'GOOGLE_MAPS_API_KEY');
            console.log(formatted);
            fs.writeFile(targetPath, formatted, 'utf8', (err) => {
                if (err)
                    return console.log(err);
            });
        });
    }, 20000);
}
