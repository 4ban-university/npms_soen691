#!/usr/bin/env python
# coding: utf-8
# Script for each package from the list makes a search query and saves the first 250 search results

import os
import requests
import json

DIR_PATH = os.path.dirname(os.path.realpath(__file__))

def writeToFile(names):
  with open(DIR_PATH + '/list_of_packages_to_analysis', 'w') as f:
    print("Writing...")
    for name in names:
        f.write("%s\n" % name)

if __name__ == "__main__":
  queries = ['vue','test','chai','mocha','jest','react','yarn','lodash','chalk','request','express','commander','moment','debug','electron','async',
  'axios','uuid','body-parser','webpack','babel','redux','dotenv','sevmer','eslint','typescript','gulp','mongoose','mongodb','socket.io','redis','ejs',
  'bootstrap','morgan','path','cookie-parser','bluebird','xml2json','promise','cors','fs','json','angular','meow','resolve','uglify','jade',
  'validator','koa','ajv','config','prompt','passport','jsdom','d3','history','prettier','url','vuex','tslint','crypto','bcrypt','events','merge',
  'firebase','nodemon','util','fs-extra','react-dom','colors','yargs','minimist','jquery','babel-runtime','rxjs','cheerio','classnames','gulp-util',
  'tslib','coffee-script','core-js','object-assign','winston','yosay','optimist','co','aws-sdk','ws','path','ora','ramda','autoprefixer','node-sass',
  'extend','mime','marked','postcss','less','jade','mysql','joi','compression','jsdom','nodemailer','babel-jest','passport','mustache','md5','highlight',
  'log4js','cli-table','ncp','esprima','concat-stream','globby','stylus','clone','serve-static','query-string','url','got','history','config','ajv','merge',
  'graphql','pluralize','execa','sequelize','when','nconf','multer','sinon','hoek','which','boom','deep-equal','fsevents','clean-css','util','pify','nopt',
  'warning','strip-ansi','nunkucks','cross-env','puppeteer','bcrypt','cookie','yamljs','should','bower','koa-static','web3','consolidate','materual-ui','serialport',
  'vue-loader','assert','github','string','hapi','istanbul','once','rsvp','acorn','http','knex','popper.js','babylon','node-notifier','recompose','pump','split','wrench',
  'walk','karma','helmet','requirejs','element-ui','traverse','elasticsearch','jshint','argparse','buffer','diff','bn.js','websocket','filesize','inflection','swig','cron',
  'js-cookie','watch','async-validator','send','clear','sax','nomnom','canvas','jsonschema','oauth','fs-promise','url-parse','image-size','http-errors','gulp-replace','codemirror',
  'mobx','liftoff','xlsx','blessed','cli-spinner','nebd','cli','leaflet','bs58','read','faker','map-stream','portfinder','phantomjs','fbjs','csv','prismjs','preset','level',
  'bytes','sharp','plist','levelup','hiredis','pm2','brfs','koa-compose','flat','slug','fstream','echarts','slash','discord','markdown','clui','chart.js','karma-chrome-launcher',
  'webpack-sources','needle','react-helmet','restler','osenv','raw-body','extend-shallow','touch','figures','pretty-bytes','enzyme','https','highland','log-update','selenium-webdriver',
  'command-line-usage','requireindex','node-watch','mobx-react','readline','draft-js','connect-flash','react-motion','opener','keypress','mathjs','node-static','grunt-cli','argv',
  'generic-pool','d3-scale','hyperquest','cuid','urllib','file-type','http-server','node-cache','chai-as-promised','nodegit','svgo','chance','memory-fs','loglevel','recast','depd',
  'vue-hot-reload-api','cli-table3','coveralls','tildify','file-saver','accepts','etag','xregexp','left-pad','get-port','mockjs','front-matter','thunkify','d3-selection','karma-jasmine',
  'long','koa-body','dot','inert','pouchdb','wiredep','soap','bson','arrify','mout','xhr','knox','is-promise','defaults','unirest','uglify-es','keycode','jsdoc','callsite','busboy',
  'pngjs','listr','tweetnacl','busboy','grpc','isobject','radium','clipboard','shell-quote','nock','deep-assign','nyc','process','mv','preact','vue-resource','xpath','duplexify',
  'wordwrap','sugar','multiparty','nightmare','axios','twit','zmq','fresh','husky','isarray','natural','pino','keymirror','decamelize','findit','pako','replace','ftp','retry','raven','event-emitter',
  'yeoman','toml','step','falafel','bigi','common-tags','ffi','xml','ignore','i18n','boxen','qiniu','randombytes','word-wrap','is-stream']

  with open(DIR_PATH + '/to_clean') as f:
    packages = f.readlines()
  packages = [x.strip() for x in packages]

  queries.extend(packages)
  # queries = packages

  queries = list(dict.fromkeys(queries))
  print("Base of packages:", len(queries))
  # super shit code
  names = set()

  for query in queries:
    try:
      raw = json.loads(requests.get('https://api.npms.io/v2/search?q=' + query+ '&size=250').content.decode('utf8'))
      # print("Got")
    except Exception as e:
      print(e)
    else:
      for package in raw['results']:
        # names.add(package['package']['name'].replace("@","%40").replace("/","%2f"))
        names.add(package['package']['name'])
      print("names:", len(names))
  writeToFile(names)
