module Fabrique {
    export module Plugins {
        export class WebWorkers extends Phaser.Plugin {
            private workers: {[key: string]: WebWorker}[] = [];

            constructor(game: PhaserExtensions.IWebWorkerGame, pluginManager: Phaser.PluginManager, region: string, IdentityPoolId: string) {
                super(game, pluginManager);

                this.addWorkerLoader();
                this.addWorkerFactory();
                this.addWorkerCache();
            }

            private addWorkerLoader() {
                (<PhaserExtensions.WebWorkerLoader>Phaser.Loader.prototype).worker = function(key: string, url: string, callback: boolean | any, callbackContext: any) {
                    if (callback === undefined) {
                        callback = false;
                    }

                    if (callback !== false && callbackContext === undefined) {
                        callbackContext = this;
                    }

                    this.game.cache.addWorker(key, url);

                    return this.addToFileList('script', key, url, { syncPoint: true, callback: callback, callbackContext: callbackContext }, false, '.js');
                };
            }

            private addWorkerFactory() {
                (<PhaserExtensions.WebWorkerObjectFactory>Phaser.GameObjectFactory.prototype).worker = function (key: string):Fabrique.WebWorker {
                    return new Fabrique.WebWorker(this.game, key);
                };

                (<PhaserExtensions.WebWorkerObjectCreator>Phaser.GameObjectCreator.prototype).worker = function (key: string):Fabrique.WebWorker {
                    return new Fabrique.WebWorker(this.game, key);
                };
            }

            private addWorkerCache(): void {
                //Create the cache space
                (<PhaserExtensions.WebWorkerCache>Phaser.Cache.prototype)._workers = {};

                //Method for adding a spine dict to the cache space
                (<PhaserExtensions.WebWorkerCache>Phaser.Cache.prototype).addWorker = function(key: string, url: string)
                {
                    this._workers[key] = url;
                };

                //Method for fetching a spine dict from the cache space
                (<PhaserExtensions.WebWorkerCache>Phaser.Cache.prototype).getWorker = function(key: string): string
                {
                    if (!this._workers.hasOwnProperty(key)) {
                        console.warn('Phaser.Cache.getWorker: Key "' + key + '" not found in Cache.');
                        return;
                    }

                    return this._workers[key];
                };
            }
        }
    }
}
