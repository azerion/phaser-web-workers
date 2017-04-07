module PhaserWebWorkers {
    export class PseudoWorker implements IWorker {
        private worker: Worker;

        private name: string;

        public game: PhaserExtensions.IWebWorkerGame;

        public onMessage: Phaser.Signal;

        public onError: Phaser.Signal;

        constructor(game: PhaserExtensions.IWebWorkerGame, key: string) {
            this.game = game;
            let url: string = this.game.cache.getWorker(key);
            if (null === url) {
                return;
            }

            this.name = key;

            this.worker = new WorkerPolyfill(url);

            this.onMessage = new Phaser.Signal();
            this.onError = new Phaser.Signal();

            this.worker.onmessage = (e: Event) => {
                this.onMessage.dispatch(e);
            };

            this.worker.onerror = (e: ErrorEvent) => {
                this.onError.dispatch(e);
            };
        }

        public postMessage(data: any, transferList?: any[]): void {
            this.worker.postMessage(data, transferList);
        }

        public destroy(): void {
            this.worker.terminate();
            this.onMessage.dispose();
            this.onError.dispose();

            this.name = null;
            this.worker = null;
            this.onMessage = null;
            this.onError = null;
        }
    }
}
