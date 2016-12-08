module Fabrique {
    export module PhaserExtensions {
        export interface IWebWorkerObjectFactory extends Phaser.GameObjectFactory {
            worker: (key: string) => Fabrique.WebWorker;
        }
        export interface IWebWorkerObjectCreator extends Phaser.GameObjectCreator {
            worker: (key: string) => Fabrique.WebWorker;
        }

        export interface IWebWorkerCache extends Phaser.Cache {
            addWorker: (key: string, data: string) => void;
            getWorker: (key: string) => string;
            removeWorker: (key: string) => void;
            _workers: {[key: string]: string};
        }

        export interface IWebWorkerLoader extends Phaser.Loader {
            worker: (key: string, url: string, callback: () => void, callbackContext: any) => void;
            cache: IWebWorkerCache;
        }

        export interface IWebWorkerGame extends Phaser.Game {
            add: IWebWorkerObjectFactory;
            make: IWebWorkerObjectCreator;
            load: IWebWorkerLoader;
            cache: IWebWorkerCache;
        }
    }
}
