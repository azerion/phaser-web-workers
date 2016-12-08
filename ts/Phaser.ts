module Fabrique {
    export module PhaserExtensions {
        export interface WebWorkerObjectFactory extends Phaser.GameObjectFactory {
            worker: (key: string) => Fabrique.WebWorker;
        }
        export interface WebWorkerObjectCreator extends Phaser.GameObjectCreator {
            worker: (key: string) => Fabrique.WebWorker;
        }

        export interface WebWorkerCache extends Phaser.Cache {
            addWorker: (key:string, data:string) => void;
            getWorker: (key:string) => string;
            _workers: {[key: string]: string};
        }

        export interface WebWorkerLoader extends Phaser.Loader {
            worker: (key:string, url:string, callback: () => void, callbackContext: any) => void;
            cache: WebWorkerCache;
        }

        export interface IWebWorkerGame extends Phaser.Game {
            add: WebWorkerObjectFactory;
            make: WebWorkerObjectCreator;
            load: WebWorkerLoader;
            cache: WebWorkerCache;
        }
    }
}