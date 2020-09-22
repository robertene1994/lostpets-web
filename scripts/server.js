const express = require('express');
const http = require('http');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const port = process.env.PORT || '4200';
app.set('port', port);

http.createServer(app).listen(port, () => {
    console.log(`Server started on port ${port}.`);
});
