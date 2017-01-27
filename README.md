# phaser-web-workers
A simple Phaser plugin that allows you to easily integrate Web Workers in your game, this is ideal for offloading cpu intensive work (pathfinding, maybe physics?) to a seperate browser thread.

Currently still in alpha-phase and not yet feature complete.

Getting Started
---------------
First you want to get a fresh copy of the plugin. You can get it from this repo or from npm, ain't that handy.
```
npm install @orange-games/phaser-web-workers --save-dev
```

Next up you'd want to add it to your list of js sources you load into your game
```html
<!-- Local installation -->
<script src="node_modules/phaser-input/build/phaser-web-workers.js"></script>

<!-- OrangeGames' CDN -->
<script src="//cdn.fbrq.io/phaser-web-workers/v0.1.0/phaser-web-workers.min.js"></script> <!-- Latest -->
```

After adding the script to the page you can activate it by enabling the plugin:
```javascript
game.add.plugin(PhaserWebWorkers.Plugin);
```

Usage
-----
As this is a simple wrapper (including preloading) of workers, not a lot of exciting stuff needs to happen in order to get this set up.

First step is to preload the worker whenever you do you usual preloading:
```javascript
        function preload() {
            //Preload the file we'd like to use as a worker
            game.load.worker('myWorker', 'worker.js');
        }
```

After that it's just a matter of creating the worker, assigning a listener and send it some data.
The worker is configured to handle the incomming data (or errors) and responed whenever it's done processing.
```javascript
//Create the worker from cache
var worker = game.make.worker('myWorker');
//Assign the message listener
worker.onMessage.add(function (e) {
    console.log('received worker data!', e);
});           
//Assign the error listener
worker.onError.add(function (e) {
    console.log('Oh no, something went wrong!', e);
});

```

Don't forget to destroy your worker when your done with it (they take a decent amount of memory):
```javascript
worker.destroy();
```

Why use a Webworker?
--------------------
Webworkers are ideal for doing heavy computations whilst not locking up your game. The browser accomplishes this by running everything a worker does in a seperate thread. So you can offload your fancy stuff like pathfinding.

Browser Support
---------------
[Almost everywhere](http://caniuse.com/#feat=webworkers)

Disclaimer
----------
We at OrangeGames just love playing and creating awesome games. We aren't affiliated with Phaser.io. We just needed some awesome web worker compatibility in our awesome HTML5 games. Feel free to use it for enhancing your own awesome games!

Phaser Web Workers is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.
