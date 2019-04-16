const got = require('got')
const handleError = require('./util/handleError')
const readTheFile = require('./util/fileReader')
const score = require('./scoring/scoring')
const { upload } = require('./util/upload')
const { saveMax } = require('./util/upload')
const evaluate = require('./evaluate/index')


exports.command = 'prepare'
exports.describe = 'Get json from api.npms.io, analyze, first step of scoring.'

exports.builder = (yargs) =>
  yargs
  .usage('Usage: $0 prepare \n\n')
  .example('$0 prepare', 'Start')

  .options({
    output: {
      alias: 'o',
      describe: 'Format the results in a human readable format or as JSON',
      default: 'human',
      choices: ['human', 'json'],
    },
    api: {
      describe: 'The API url',
      default: 'http://api.npms.io/v2',
    },
  });

exports.handler = (argv) => {
  var list = readTheFile('/Users/ban/code/soen691/score/lists/lst_deep80')
  var maxPopularity = 0
  var minPopularity = 99999999999999
  for(var i in list){
    got(`${argv.api}/package/${encodeURIComponent(list[i])}`, {
        json: true
      })
      .then((res) => {
        var fullData = res.body
        delete fullData['evaluation']
        delete fullData['score']
        // console.log(fullData)
        var evaluation = evaluate(fullData.collected)
        fullData['evaluation'] = evaluation

        var scores = score(fullData)
        fullData['score'] = scores.score
        // console.log(scores)
        // console.log(fullData)
        maxPopularity = fullData.score.detail.popularity > maxPopularity ? fullData.score.detail.popularity : maxPopularity
        minPopularity = fullData.score.detail.popularity < minPopularity ? fullData.score.detail.popularity : minPopularity
        console.log("Package:", fullData.collected.metadata.name)
        saveMax(maxPopularity, minPopularity)
        //205108 0
        // upload(fullData)
      })
      .then(() => {
        process.exitCode = 0;
      })
      .catch((err) => handleError(err));
  }
};
