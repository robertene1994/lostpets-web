const fs = require('fs');

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

    const environmentPath = 'src/environments/environment.ts';
    fs.readFile(environmentPath, 'utf8', (_err, data) => {
        let formatted = data.split('\n').splice(2, data.split('\n').length - 1).join('\n');
        formatted = formatted.replace('googleMaps.googleMapsApiKey', undefined);
        fs.writeFile(environmentPath, formatted, 'utf8', (err) => {
            if (err)
                return console.log(err);
        });
    });
}
