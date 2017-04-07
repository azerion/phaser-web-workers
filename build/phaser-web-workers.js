/*!
 * phaser-web-workers - version 0.2.0 
 * A simple Phaser plugin that allows you to easily integrate Web Workers in your game
 *
 * OrangeGames
 * Build at 07-04-2017
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
            Phaser.GameObjectFactory.prototype.worker = function (key, testWorker) {
                if (testWorker === void 0) { testWorker = false; }
                if (testWorker) {
                    return new PhaserWebWorkers.PseudoWorker(this.game, key);
                }
                return new PhaserWebWorkers.WebWorker(this.game, key);
            };
            Phaser.GameObjectCreator.prototype.worker = function (key, testWorker) {
                if (testWorker === void 0) { testWorker = false; }
                if (testWorker) {
                    return new PhaserWebWorkers.PseudoWorker(this.game, key);
                }
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
    /**
     * PseudoWorker class based on the work of https://github.com/nolanlawson/pseudo-worker
     *
     * The idea behind this class is that we can benchmark how the logic will run on a single thread, compared to a real worker thread.
     * This allows us to give a sense of the performance increase when using web workers.
     *
     * This class should be used for benchmarking only, however (when needed) this could also be used for backwards compatibility
     *
     */
    var WorkerPolyfill = (function () {
        function WorkerPolyfill(path) {
            var _this = this;
            this.messageListeners = [];
            this.errorListeners = [];
            this.workerMessageListeners = [];
            this.workerErrorListeners = [];
            this.postMessageListeners = [];
            this.terminated = false;
            window.bla = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        _this.script = xhr.responseText;
                        _this.worker = {
                            postMessage: function (msg) { return _this.workerPostMessage(msg); },
                            addEventListener: function (type, fun) { return _this.workerAddEventListener(type, fun); }
                        };
                        ///* jshint unused:false */
                        _this.eval(_this.worker, _this.script);
                        var currentListeners = _this.postMessageListeners;
                        _this.postMessageListeners = [];
                        for (var i = 0; i < currentListeners.length; i++) {
                            _this.runPostMessage(currentListeners[i]);
                        }
                    }
                    else {
                        _this.postError(new Error('cannot find script ' + path));
                    }
                }
            };
            xhr.send();
        }
        WorkerPolyfill.prototype.eval = function (self, script) {
            /* tslint:disable */
            (function () {
                eval(script);
            }).call(self);
            /* tslint:enable */
        };
        // custom each loop is for IE8 support
        WorkerPolyfill.prototype.executeEach = function (arr, fun) {
            var i = -1;
            while (++i < arr.length) {
                if (arr[i]) {
                    fun(arr[i]);
                }
            }
        };
        WorkerPolyfill.prototype.callErrorListener = function (err) {
            return function (listener) {
                listener({
                    type: 'error',
                    error: err,
                    message: err.message
                });
            };
        };
        WorkerPolyfill.prototype.postError = function (err) {
            var callFun = this.callErrorListener(err);
            if (typeof this.onerror === 'function') {
                callFun(this.onerror);
            }
            if (this.worker && typeof this.worker.onerror === 'function') {
                callFun(this.worker.onerror);
            }
            this.executeEach(this.errorListeners, callFun);
            this.executeEach(this.workerErrorListeners, callFun);
        };
        WorkerPolyfill.prototype.runPostMessage = function (msg) {
            var _this = this;
            var callFun = function (listener) {
                try {
                    listener({ data: msg });
                }
                catch (err) {
                    _this.postError(err);
                }
            };
            if (this.worker && typeof this.worker.onmessage === 'function') {
                callFun(this.worker.onmessage);
            }
            this.executeEach(this.workerMessageListeners, callFun);
        };
        WorkerPolyfill.prototype.workerPostMessage = function (msg) {
            var callFun = function (listener) {
                listener({
                    data: msg
                });
            };
            if (typeof this.onmessage === 'function') {
                callFun(this.onmessage);
            }
            this.executeEach(this.messageListeners, callFun);
        };
        WorkerPolyfill.prototype.workerAddEventListener = function (type, fun) {
            /* istanbul ignore else */
            if (type === 'message') {
                this.workerMessageListeners.push(fun);
            }
            else if (type === 'error') {
                this.workerErrorListeners.push(fun);
            }
        };
        WorkerPolyfill.prototype.addEventListener = function (type, fun) {
            /* istanbul ignore else */
            if (type === 'message') {
                this.messageListeners.push(fun);
            }
            else if (type === 'error') {
                this.errorListeners.push(fun);
            }
        };
        WorkerPolyfill.prototype.removeEventListener = function (type, fun) {
            var listeners;
            /* istanbul ignore else */
            if (type === 'message') {
                listeners = this.messageListeners;
            }
            else if (type === 'error') {
                listeners = this.errorListeners;
            }
            else {
                return;
            }
            var i = -1;
            while (++i < listeners.length) {
                var listener = listeners[i];
                if (listener === fun) {
                    delete listeners[i];
                    break;
                }
            }
        };
        WorkerPolyfill.prototype.postMessage = function (msg) {
            if (typeof msg === 'undefined') {
                throw new Error('postMessage() requires an argument');
            }
            if (this.terminated) {
                return;
            }
            if (!this.script) {
                this.postMessageListeners.push(msg);
                return;
            }
            this.runPostMessage(msg);
        };
        WorkerPolyfill.prototype.terminate = function () {
            this.terminated = true;
        };
        WorkerPolyfill.prototype.dispatchEvent = function (evt) {
            return true;
        };
        return WorkerPolyfill;
    }());
    PhaserWebWorkers.WorkerPolyfill = WorkerPolyfill;
})(PhaserWebWorkers || (PhaserWebWorkers = {}));
var PhaserWebWorkers;
(function (PhaserWebWorkers) {
    var PseudoWorker = (function () {
        function PseudoWorker(game, key) {
            var _this = this;
            this.game = game;
            var url = this.game.cache.getWorker(key);
            if (null === url) {
                return;
            }
            this.name = key;
            this.worker = new PhaserWebWorkers.WorkerPolyfill(url);
            this.onMessage = new Phaser.Signal();
            this.onError = new Phaser.Signal();
            this.worker.onmessage = function (e) {
                _this.onMessage.dispatch(e);
            };
            this.worker.onerror = function (e) {
                _this.onError.dispatch(e);
            };
        }
        PseudoWorker.prototype.postMessage = function (data, transferList) {
            this.worker.postMessage(data, transferList);
        };
        PseudoWorker.prototype.destroy = function () {
            this.worker.terminate();
            this.onMessage.dispose();
            this.onError.dispose();
            this.name = null;
            this.worker = null;
            this.onMessage = null;
            this.onError = null;
        };
        return PseudoWorker;
    }());
    PhaserWebWorkers.PseudoWorker = PseudoWorker;
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
            this.onError = new Phaser.Signal();
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