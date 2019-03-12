# tethered-pair [![Build Status](https://travis-ci.com/rteshnizi/tethered-pair.svg?branch=master)](https://travis-ci.com/rteshnizi/tethered-pair)
Development code for Tethered Pair Algorithm

## Live Demo
See it live [here](https://rteshnizi.bitbucket.io/)

## Notes
1. For Basic visualization I use FabricJs
2. For Geometry I use PtsJs
3. Gap String sorting did not do good. We check if the polygon is empty

## Todo
1. ~~Limit Obstacles to the ones inside or partially inside the bounding box~~
2. ~~Not all Entities need rendering (Fix Entity to accept a bool for rendering)~~
3. ~~Model.reset()~~
4. Change Plan to do BFS instead of DFS
5. fabric.Point @types is wrong for eq, lt, gt, etc. (create a PR)