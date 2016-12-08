module Fabrique {
    export class WebWorker {
        private worker: Worker;

        private name: string;

        public game: PhaserExtensions.IWebWorkerGame;

        public onMessage: Phaser.Signal;

        constructor(game: PhaserExtensions.IWebWorkerGame, key: string) {
            this.game = game;
            let url: string = this.game.cache.getWorker(key);
            if (null === url) {
                return;
            }

            this.name = key;

            this.worker = new Worker(url);

            this.onMessage = new Phaser.Signal();

            this.worker.onmessage = (e: Event) => {
                this.onMessage.dispatch(e);
            };
        }
        public postMessage(...args: any[]): void {
            this.worker.postMessage(args);
        }

        public destroy(): void {
            this.worker.terminate();
            this.onMessage.dispose();

            this.name = null;
            this.worker = null;
            this.onMessage = null;
        }
    }
}
