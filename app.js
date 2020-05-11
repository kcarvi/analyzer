const express = require('express');

require('dotenv/config');

const router = require('./routes/index.js')

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'pug');

app.use(express.static('public'))

app.use('/', router);

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('App listening on port ' + port);
});

