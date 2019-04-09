const got = require('got')
const handleError = require('./util/handleError')
const readTheFile = require('./util/fileReader')
const score = require('./scoring/scoring')
const { upload } = require('./util/upload')
const { saveMax } = require('./util/upload')
const evaluate = require('./evaluate/index')
const mean = require('lodash/mean');


exports.command = 'scoring'
exports.describe = 'The actual scoring of the packages'

exports.builder = (yargs) =>
  yargs
  .usage('Usage: $0 scoring \n\n')
  .example('$0 scoring', 'Start')

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
  var list = readTheFile('/Users/ban/code/soen691/score/l0')
  var maxPopularity = readTheFile('/Users/ban/code/soen691/score/popularityMax')[0]
  var minPopularity = readTheFile('/Users/ban/code/soen691/score/popularityMin')[0]
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
        fullData.score.detail.popularity = (fullData.score.detail.popularity - minPopularity)/(maxPopularity - minPopularity)
        fullData.score.detail.popularity = ( ((100 - (fullData.score.detail.popularity * 100)) * (fullData.score.detail.popularity)) + (fullData.score.detail.popularity * 100) ) / 100
        var initialScore = (0.65 * fullData.score.detail.quality) +(0.35 * fullData.score.detail.popularity)
        var futureQuality = mean([fullData.score.detail.quality, fullData.score.detail.maintenance])
        var futurePopularity = (futureQuality - fullData.score.detail.quality) + fullData.score.detail.popularity
        var futureScore = (0.65 * futureQuality) + (0.35 * futurePopularity)

        fullData.score.final = (0.65 * initialScore) + (0.35 * futureScore)
        console.log(fullData.collected.metadata.name, fullData.score.detail.popularity)
        upload(fullData)
      })
      .then(() => {
        process.exitCode = 0;
      })
      .catch((err) => handleError(err));
  }
};
