declare module PhaserWebWorkers {
    interface IWorker {
        game: PhaserExtensions.IWebWorkerGame;
        onMessage: Phaser.Signal;
        onError: Phaser.Signal;
        postMessage(data: any, transferList?: any[]): void;
        destroy(): void;
    }
}
declare module PhaserWebWorkers {
    module PhaserExtensions {
        interface IWebWorkerObjectFactory extends Phaser.GameObjectFactory {
            worker: (key: string, testWorker: boolean) => PhaserWebWorkers.IWorker;
        }
        interface IWebWorkerObjectCreator extends Phaser.GameObjectCreator {
            worker: (key: string, testWorker: boolean) => PhaserWebWorkers.IWorker;
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
    /**
     * PseudoWorker class based on the work of https://github.com/nolanlawson/pseudo-worker
     *
     * The idea behind this class is that we can benchmark how the logic will run on a single thread, compared to a real worker thread.
     * This allows us to give a sense of the performance increase when using web workers.
     *
     * This class should be used for benchmarking only, however (when needed) this could also be used for backwards compatibility
     *
     */
    class WorkerPolyfill implements Worker {
        private messageListeners;
        private errorListeners;
        private workerMessageListeners;
        private workerErrorListeners;
        private postMessageListeners;
        private terminated;
        private worker;
        private script;
        onerror: (msg: any) => void;
        onmessage: (msg: any) => void;
        constructor(path: string);
        private eval(self, script);
        private executeEach(arr, fun);
        private callErrorListener(err);
        private postError(err);
        private runPostMessage(msg);
        private workerPostMessage(msg);
        private workerAddEventListener(type, fun);
        addEventListener(type: any, fun: any): void;
        removeEventListener(type: any, fun: any): void;
        postMessage(msg: any): void;
        terminate(): void;
        dispatchEvent(evt: Event): boolean;
    }
}
declare module PhaserWebWorkers {
    class PseudoWorker implements IWorker {
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
declare module PhaserWebWorkers {
    class WebWorker implements IWorker {
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
declare module PhaserWebWorkers {
    class Plugin extends Phaser.Plugin {
        game: PhaserExtensions.IWebWorkerGame;
        constructor(game: PhaserExtensions.IWebWorkerGame, pluginManager: Phaser.PluginManager, region: string, IdentityPoolId: string);
        private addWorkerLoader();
        private addWorkerFactory();
        private addWorkerCache();
    }
}
