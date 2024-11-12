const MongoClient = require('mongodb').MongoClient;
const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017'
    const dbname = 'shop-nest'
    MongoClient.connect(url)
        .then((client) => {
            state.db = client.db(dbname)
            done()
        })
        .catch((err) => {
            done(err)
        })
}
module.exports.get = function () {
    return state.db
}