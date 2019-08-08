require('dotenv').config();
require('./database-connection/db');
const express = require('express');
const bodyparser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyparser.json());

// Forward to each router
app.use('/api/user', require('./routers/api/user'));

// Open server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`server is listening to PORT ${PORT}, http://localhost:${PORT}`);
});