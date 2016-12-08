declare module Fabrique {
    module PhaserExtensions {
        interface WebWorkerObjectFactory extends Phaser.GameObjectFactory {
            worker: (key: string) => Fabrique.WebWorker;
        }
        interface WebWorkerObjectCreator extends Phaser.GameObjectCreator {
            worker: (key: string) => Fabrique.WebWorker;
        }
        interface WebWorkerCache extends Phaser.Cache {
            addWorker: (key: string, data: string) => void;
            getWorker: (key: string) => string;
            _workers: {
                [key: string]: string;
            };
        }
        interface WebWorkerLoader extends Phaser.Loader {
            worker: (key: string, url: string, callback: () => void, callbackContext: any) => void;
            cache: WebWorkerCache;
        }
        interface IWebWorkerGame extends Phaser.Game {
            add: WebWorkerObjectFactory;
            make: WebWorkerObjectCreator;
            load: WebWorkerLoader;
            cache: WebWorkerCache;
        }
    }
}
declare module Fabrique {
    module Plugins {
        class WebWorkers extends Phaser.Plugin {
            private workers;
            constructor(game: PhaserExtensions.IWebWorkerGame, pluginManager: Phaser.PluginManager, region: string, IdentityPoolId: string);
            private addWorkerLoader();
            private addWorkerFactory();
            private addWorkerCache();
        }
    }
}
declare module Fabrique {
    class WebWorker {
        private worker;
        private name;
        game: PhaserExtensions.IWebWorkerGame;
        onMessage: Phaser.Signal;
        constructor(game: PhaserExtensions.IWebWorkerGame, key: string);
        postMessage(...args: any[]): void;
        destroy(): void;
    }
}
