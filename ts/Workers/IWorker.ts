/// <reference path='../../node_modules/@orange-games/phaser/typescript/phaser.d.ts'/>
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
