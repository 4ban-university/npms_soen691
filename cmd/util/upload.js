const nano = require('nano')('http://admin:admin@localhost:5984');

function upload(json) {
  nano.db.create('soen').then((body) => {
    console.log('Database created!', body);
  }).catch((err) => {
    console.log("Can't create database!", err)
  })

  const database = nano.db.use('soen')

  database.insert(json, json.collected.metadata.name).then((body) => {
    console.log("Inserted", body);
  }).catch((err) => {
    console.log("Can't insert data into database!", err)
  })
}

module.exports = upload