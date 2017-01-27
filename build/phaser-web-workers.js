/*!
 * phaser-web-workers - version 0.1.0 
 * A simple Phaser plugin that allows you to easily integrate Web Workers in your game
 *
 * OrangeGames
 * Build at 27-01-2017
 * Released under MIT License 
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PhaserWebWorkers;
(function (PhaserWebWorkers) {
    var Plugin = (function (_super) {
        __extends(Plugin, _super);
        function Plugin(game, pluginManager, region, IdentityPoolId) {
            _super.call(this, game, pluginManager);
            this.addWorkerLoader();
            this.addWorkerFactory();
            this.addWorkerCache();
        }
        Plugin.prototype.addWorkerLoader = function () {
            Phaser.Loader.prototype.worker = function (key, url, callback, callbackContext) {
                var _this = this;
                if (callback === undefined) {
                    callback = false;
                }
                if (callback !== false && callbackContext === undefined) {
                    callbackContext = this;
                }
                return this.addToFileList('script', key, url, {
                    syncPoint: true, callback: function (scriptKey, data) {
                        var workerBlob = new Blob([data], { type: 'javascript/worker' });
                        _this.game.cache.addWorker(scriptKey, window.URL.createObjectURL(workerBlob));
                    }, callbackContext: callbackContext
                }, false, '.js');
            };
        };
        Plugin.prototype.addWorkerFactory = function () {
            Phaser.GameObjectFactory.prototype.worker = function (key) {
                return new PhaserWebWorkers.WebWorker(this.game, key);
            };
            Phaser.GameObjectCreator.prototype.worker = function (key) {
                return new PhaserWebWorkers.WebWorker(this.game, key);
            };
        };
        Plugin.prototype.addWorkerCache = function () {
            //Create the cache space
            Phaser.Cache.prototype._workers = {};
            //Method for adding a spine dict to the cache space
            Phaser.Cache.prototype.addWorker = function (key, url) {
                this._workers[key] = url;
            };
            //Method for adding a spine dict to the cache space
            Phaser.Cache.prototype.removeWorker = function (key) {
                if (this._workers.hasOwnProperty(key)) {
                    window.URL.revokeObjectURL(this._workers[key]);
                    delete this._workers[key];
                }
            };
            //Method for fetching a spine dict from the cache space
            Phaser.Cache.prototype.getWorker = function (key) {
                if (!this._workers.hasOwnProperty(key)) {
                    console.warn('Phaser.Cache.getWorker: Key "' + key + '" not found in Cache.');
                    return;
                }
                return this._workers[key];
            };
        };
        return Plugin;
    }(Phaser.Plugin));
    PhaserWebWorkers.Plugin = Plugin;
})(PhaserWebWorkers || (PhaserWebWorkers = {}));
var PhaserWebWorkers;
(function (PhaserWebWorkers) {
    var WebWorker = (function () {
        function WebWorker(game, key) {
            var _this = this;
            this.game = game;
            var url = this.game.cache.getWorker(key);
            if (null === url) {
                return;
            }
            this.name = key;
            this.worker = new Worker(url);
            this.onMessage = new Phaser.Signal();
            this.worker.onmessage = function (e) {
                _this.onMessage.dispatch(e);
            };
            this.worker.onerror = function (e) {
                _this.onError.dispatch(e);
            };
        }
        WebWorker.prototype.postMessage = function (data, transferList) {
            this.worker.postMessage(data, transferList);
        };
        WebWorker.prototype.destroy = function () {
            this.worker.terminate();
            this.onMessage.dispose();
            this.onError.dispose();
            this.name = null;
            this.worker = null;
            this.onMessage = null;
            this.onError = null;
        };
        return WebWorker;
    }());
    PhaserWebWorkers.WebWorker = WebWorker;
})(PhaserWebWorkers || (PhaserWebWorkers = {}));
//# sourceMappingURL=phaser-web-workers.js.map