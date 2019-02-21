/// <reference path='../PhaserExtensions.ts'/>

declare module PhaserWebWorkers {
    export interface IWorker {
        game: PhaserExtensions.IWebWorkerGame;
        onMessage: Phaser.Signal;
        onError: Phaser.Signal;
        postMessage(data: any, transferList?: any[]): void;
        destroy(): void;
    }
}
