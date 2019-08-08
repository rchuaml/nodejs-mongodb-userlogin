var mongoose = require('mongoose');
const password = process.env.MONGO_DB_PW || 'node_shop';

mongoose.connect('mongodb+srv://node_shop:' + password + '@cluster0-nuwrj.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('mongodb connected');
});

module.exports = db;