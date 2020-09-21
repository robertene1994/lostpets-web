const fs = require('fs');

const targetPaths = [
    'src/environments/environment.prod.ts',
    'src/environments/environment.aws.ts',
    'src/environments/environment.heroku.ts'
];

targetPaths.forEach(targetPath => {
    fs.readFile(targetPath, 'utf8', (_err, data) => {
        const formatted = data.replace('GOOGLE_MAPS_API_KEY', process.env.GOOGLE_MAPS_API_KEY);
        fs.writeFile(targetPath, formatted, 'utf8', (err) => {
            if (err)
                return console.log(err);
        });
    });
});
