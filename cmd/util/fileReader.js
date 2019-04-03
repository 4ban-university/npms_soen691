
function readTheFile(inputFile) {
  var fs = require('fs');
  var array = fs.readFileSync(inputFile).toString().split("\n");
  return array
}

module.exports = readTheFile