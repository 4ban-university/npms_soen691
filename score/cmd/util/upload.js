const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');

const upload = (json) => {
  // nano.db.create('test').then((body) => {
  //   console.log('Database created!', body);
  // }).catch((err) => {
  //   console.log("Can't create database!", err)
  // })

  const database = nano.db.use('npm')
  database.insert(json, json.collected.metadata.name).then((body) => {
    // console.log("Uploaded")
  }).catch((err) => {
    console.log('Insert error ' + err)
  })

  // database.insert(json, json.collected.metadata.name).then((body) => {
  //   console.log("Inserted", body);
  // }).catch((err) => {
  //   console.log("Can't insert data into database!", err)
  // })
}

const saveMax = (max, min) => {
  fs.writeFile('popularityMax', max, (err) => {
    if (err) throw err;
  });
  fs.writeFile('popularityMin', min, (err) => {
    if (err) throw err;
  });
}

module.exports = { upload, saveMax }