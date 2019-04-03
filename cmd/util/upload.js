const nano = require('nano')('http://admin:admin@localhost:5984');

function upload(json) {
  nano.db.create('soen')
  const soen = nano.db.use('soen')

  soen.insert({ json }, json.collected.metadata.name).then((body) => {
  console.log(body);
});
}

module.exports = upload