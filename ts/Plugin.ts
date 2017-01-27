module PhaserWebWorkers {
    export class Plugin extends Phaser.Plugin {
        public game: PhaserExtensions.IWebWorkerGame;

        constructor(game: PhaserExtensions.IWebWorkerGame, pluginManager: Phaser.PluginManager, region: string, IdentityPoolId: string) {
            super(game, pluginManager);

            this.addWorkerLoader();
            this.addWorkerFactory();
            this.addWorkerCache();
        }

        private addWorkerLoader(): void {
            (<PhaserExtensions.IWebWorkerLoader>Phaser.Loader.prototype).worker = function (key: string, url: string, callback?: boolean | any, callbackContext?: any): void {
                if (callback === undefined) {
                    callback = false;
                }

                if (callback !== false && callbackContext === undefined) {
                    callbackContext = this;
                }

                return this.addToFileList('script', key, url, {
                    syncPoint: true, callback: (scriptKey: string, data: string) => {
                        let workerBlob: Blob = new Blob([data], {type: 'javascript/worker'});
                        this.game.cache.addWorker(scriptKey, window.URL.createObjectURL(workerBlob));
                    }, callbackContext: callbackContext
                }, false, '.js');
            };
        }

        private addWorkerFactory(): void {
            (<PhaserExtensions.IWebWorkerObjectFactory>Phaser.GameObjectFactory.prototype).worker = function (key: string): WebWorker {
                return new WebWorker(this.game, key);
            };

            (<PhaserExtensions.IWebWorkerObjectCreator>Phaser.GameObjectCreator.prototype).worker = function (key: string): WebWorker {
                return new WebWorker(this.game, key);
            };
        }

        private addWorkerCache(): void {
            //Create the cache space
            (<PhaserExtensions.IWebWorkerCache>Phaser.Cache.prototype)._workers = {};

            //Method for adding a spine dict to the cache space
            (<PhaserExtensions.IWebWorkerCache>Phaser.Cache.prototype).addWorker = function (key: string, url: string): void {
                this._workers[key] = url;
            };

            //Method for adding a spine dict to the cache space
            (<PhaserExtensions.IWebWorkerCache>Phaser.Cache.prototype).removeWorker = function (key: string): void {
                if (this._workers.hasOwnProperty(key)) {
                    window.URL.revokeObjectURL(this._workers[key]);
                    delete this._workers[key];
                }
            };

            //Method for fetching a spine dict from the cache space
            (<PhaserExtensions.IWebWorkerCache>Phaser.Cache.prototype).getWorker = function (key: string): string {
                if (!this._workers.hasOwnProperty(key)) {
                    console.warn('Phaser.Cache.getWorker: Key "' + key + '" not found in Cache.');
                    return;
                }

                return this._workers[key];
            };
        }
    }
}
