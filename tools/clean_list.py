#!/usr/bin/env python
# coding: utf-8
# Script to get a list of unique package names from a saved dictionary

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
  with open(DIR_PATH + '/to_clean') as f:
    packages = f.readlines()
  packages = [x.strip() for x in packages]
  # packages = [x.replace("-", "%40") for x in packages]
  names = set()
  for package in packages:
    names.add(package.split(' ')[0])
  writeToFile(names)
