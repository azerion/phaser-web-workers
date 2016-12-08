var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fabrique;
(function (Fabrique) {
    var Plugins;
    (function (Plugins) {
        var WebWorkers = (function (_super) {
            __extends(WebWorkers, _super);
            function WebWorkers(game, pluginManager, region, IdentityPoolId) {
                _super.call(this, game, pluginManager);
                this.workers = [];
                this.addWorkerLoader();
                this.addWorkerFactory();
                this.addWorkerCache();
            }
            WebWorkers.prototype.addWorkerLoader = function () {
                Phaser.Loader.prototype.worker = function (key, url, callback, callbackContext) {
                    if (callback === undefined) {
                        callback = false;
                    }
                    if (callback !== false && callbackContext === undefined) {
                        callbackContext = this;
                    }
                    this.game.cache.addWorker(key, url);
                    return this.addToFileList('script', key, url, { syncPoint: true, callback: callback, callbackContext: callbackContext }, false, '.js');
                };
            };
            WebWorkers.prototype.addWorkerFactory = function () {
                Phaser.GameObjectFactory.prototype.worker = function (key) {
                    return new Fabrique.WebWorker(this.game, key);
                };
                Phaser.GameObjectCreator.prototype.worker = function (key) {
                    return new Fabrique.WebWorker(this.game, key);
                };
            };
            WebWorkers.prototype.addWorkerCache = function () {
                //Create the cache space
                Phaser.Cache.prototype._workers = {};
                //Method for adding a spine dict to the cache space
                Phaser.Cache.prototype.addWorker = function (key, url) {
                    this._workers[key] = url;
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
            return WebWorkers;
        }(Phaser.Plugin));
        Plugins.WebWorkers = WebWorkers;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
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
        }
        WebWorker.prototype.postMessage = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this.worker.postMessage(args);
        };
        WebWorker.prototype.destroy = function () {
            this.worker.terminate();
            this.onMessage.dispose();
            this.name = null;
            this.worker = null;
            this.onMessage = null;
        };
        return WebWorker;
    }());
    Fabrique.WebWorker = WebWorker;
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-web-workers.js.map