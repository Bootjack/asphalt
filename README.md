# Asphalt
A project roadmap that lives with your code.

## Setup
```
$ npm install asphalt
```

## Usage
Creating a new item:
```
$ asphalt create feature
title: My Feature
description: Does the things
acceptance: Thing one
acceptance: Thing two
started: 1970-01-01
completed:

Created feature abcde
```

Display status of all items:
```
$ asphalt status feature
id      title         started    completed
abcde   My Feature    1970-01-01    
```

Display details of one item:
```
$ asphalt show feature abcde
title: My Feature
description: Does the Things
acceptance: Thing one, Thing two
started: 1970-01-01
```
