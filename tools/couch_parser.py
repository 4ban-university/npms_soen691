#!/usr/bin/env python
# coding: utf-8

# Examples of getting and putting the data via curl
# curl -X PUT http://admin:admin@127.0.0.1:5984/npm_test/ark -d '{"_id":"1"}'
# curl https://replicate.npmjs.com/ark
# Script for filling the test database with ready-made data (test purposes)

import os
import requests
import json

DIR_PATH = os.path.dirname(os.path.realpath(__file__))

if __name__ == "__main__":
  with open(DIR_PATH + '/npm_list') as f:
    packages = f.readlines()
  packages = [x.strip() for x in packages]
  packages = [x.replace("@", "%40") for x in packages]
  packages = [x.replace("/", "%2F") for x in packages]
  for package in packages:
    try:
      raw = json.loads(requests.get('https://api.npms.io/v2/package/' + package).content.decode('utf8'))
    except Exception as e:
      print(e)
    else:
      try:
        raw.pop("_rev")
      except Exception as e:
        print(e)
      try:
        r = requests.put('http://admin:admin@127.0.0.1:5984/test/' + package, json=raw)
      except Exception as e:
        print(e)
      else:
          print("%s : %s" % (package, r.content))



