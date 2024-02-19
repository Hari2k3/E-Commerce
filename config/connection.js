const { MongoClient } = require('mongodb');
const state = {
    db: null
};

// Update your db.connect method like this:
module.exports.connect = function (done) {
    const url = 'mongodb://127.0.0.1:27017';
    const dbname = 'shopping';
    const client = new MongoClient(url);
    async function run(){
        state.db= client.db(dbname);
        console.log("Database Connected");  
    }
    
    run().catch(console.dir);
    // MongoClient.connect(url,(err, client) => {
    //     if (err) {
    //         console.error('Error connecting to the database:', err);
    //         return done(err); // Call the callback with the error
    //     }
    //     state.db = client.db(dbname);
    //     console.log('Database connected');
    //     done();
    //     console.log('Callback executed');
    //  // Call the callback without an error
    // });
};


module.exports.get = function () {
    return state.db;
};
