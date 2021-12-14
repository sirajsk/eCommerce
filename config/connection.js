const mongoClient = require('mongodb').MongoClient
const state = { db: null }
module.exports.connect = function (done) {
    const url = 'mongodb+srv://siraj:siraj123@projuctebuy.6vcgq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    const dbname = 'projuctEbuy'
    mongoClient.connect(url, (err, data) => {
        if (err)
            return done(err)
        state.db = data.db(dbname)

        done()
    })


}
module.exports.get = function () {
    return state.db
}