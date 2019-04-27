#!/usr/bin/env python
# coding: utf-8
# Script divides one large list into many smaller ones

import os
import requests
import json

DIR_PATH = os.path.dirname(os.path.realpath(__file__))


def writeToFile(lst, index):
  print(DIR_PATH)
  with open(DIR_PATH + '/lst_deep' + str(index), 'w') as f:
    print("Writing...")
    for name in lst:
        f.write("%s\n" % name)


if __name__ == "__main__":
  with open(DIR_PATH + '/list_of_packages_to_analysis') as f:
    packages = f.readlines()
  packages = [x.strip() for x in packages]

  l = []
  index = 0
  for pkg in packages:
    l.append(pkg)
    if (len(l) == 1200):
      # TODO: Ignore the last 1199 packages of the list. Fix it
      writeToFile(l, index)
      index = index + 1
      l = []

