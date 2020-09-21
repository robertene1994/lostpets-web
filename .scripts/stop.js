const fs = require('fs');

if (!process.env.GOOGLE_MAPS_API_KEY) {
    const targetPath = 'src/environments/environment.ts';
    fs.readFile(targetPath, 'utf8', (_err, data) => {
        console.log(data);
        const formatted = data.replace(/AI.*Bo/g, 'GOOGLE_MAPS_API_KEY');
        fs.writeFile(targetPath, formatted, 'utf8', (err) => {
            if (err)
                return console.log(err);
        });
    });
}
