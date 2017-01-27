declare module PhaserWebWorkers {
    module PhaserExtensions {
        interface IWebWorkerObjectFactory extends Phaser.GameObjectFactory {
            worker: (key: string) => PhaserWebWorkers.WebWorker;
        }
        interface IWebWorkerObjectCreator extends Phaser.GameObjectCreator {
            worker: (key: string) => PhaserWebWorkers.WebWorker;
        }
        interface IWebWorkerCache extends Phaser.Cache {
            addWorker: (key: string, data: string) => void;
            getWorker: (key: string) => string;
            removeWorker: (key: string) => void;
            _workers: {
                [key: string]: string;
            };
        }
        interface IWebWorkerLoader extends Phaser.Loader {
            worker: (key: string, url: string, callback?: () => void, callbackContext?: any) => void;
            cache: IWebWorkerCache;
        }
        interface IWebWorkerGame extends Phaser.Game {
            add: IWebWorkerObjectFactory;
            make: IWebWorkerObjectCreator;
            load: IWebWorkerLoader;
            cache: IWebWorkerCache;
        }
    }
}
declare module PhaserWebWorkers {
    class Plugin extends Phaser.Plugin {
        game: PhaserExtensions.IWebWorkerGame;
        constructor(game: PhaserExtensions.IWebWorkerGame, pluginManager: Phaser.PluginManager, region: string, IdentityPoolId: string);
        private addWorkerLoader();
        private addWorkerFactory();
        private addWorkerCache();
    }
}
declare module PhaserWebWorkers {
    class WebWorker {
        private worker;
        private name;
        game: PhaserExtensions.IWebWorkerGame;
        onMessage: Phaser.Signal;
        onError: Phaser.Signal;
        constructor(game: PhaserExtensions.IWebWorkerGame, key: string);
        postMessage(data: any, transferList?: any[]): void;
        destroy(): void;
    }
}
