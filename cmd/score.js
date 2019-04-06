const got = require('got')
const handleError = require('./util/handleError')
const Table = require('cli-table3')
const chalk = require('chalk')
const moment = require('moment')
const truncate = require('truncate')
const readTheFile = require('./util/fileReader')
const score = require('./scoring/scoring')
const upload = require('./util/upload')
const evaluate = require('./evaluate/index')
const aggregate = require('./scoring/aggregate')

exports.command = 'score'
exports.describe = 'Get json from api.npms.io, score and upload it to the couchdb database.'

exports.builder = (yargs) =>
  yargs
  .usage('Usage: $0 score \n\n')
  .example('$0 score', 'Start')

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
  var list = readTheFile('/Users/ban/code/soen691/score/list')
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

        // console.log(fullData)
        // var listOfEvaluations = []
        // listOfEvaluations.push(evaluation)
        // listOfEvaluations.push(evaluation)
        // listOfEvaluations.push(evaluation)
        // // console.log(listOfEvaluations)
        // var aggregation = aggregate(listOfEvaluations)
        // console.log(aggregation)
        // // // console.log(res.body)
        var scores = score(fullData)
        fullData['score'] = scores.score
        // console.log(scores)
        console.log(fullData)

        upload(fullData) // send whole scored json
      })
      .then(() => {
        process.exitCode = 0;
      })
      .catch((err) => handleError(err));
  }
};
