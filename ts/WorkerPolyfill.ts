module PhaserWebWorkers {
    /**
     * PseudoWorker class based on the work of https://github.com/nolanlawson/pseudo-worker
     *
     * The idea behind this class is that we can benchmark how the logic will run on a single thread, compared to a real worker thread.
     * This allows us to give a sense of the performance increase when using web workers.
     *
     * This class should be used for benchmarking only, however (when needed) this could also be used for backwards compatibility
     *
     */
    export class WorkerPolyfill implements Worker {
        private messageListeners: (() => void)[] = [];
        private errorListeners: (() => void)[] = [];
        private workerMessageListeners: (() => void)[] = [];
        private workerErrorListeners: (() => void)[] = [];
        private postMessageListeners: (() => void)[] = [];
        private terminated: boolean = false;
        private worker: {
            postMessage: (msg: string) => void,
            addEventListener: (type: string, fun: () => void) => void,
            onerror?: (msg: any) => void
            onmessage?: (msg: any) => void
        };

        private script: any;

        public onerror: (msg: any) => void;
        public onmessage: (msg: any) => void;

        constructor(path: string) {
            (<any>window).bla = this;
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        this.script = xhr.responseText;
                        this.worker = {
                            postMessage: (msg: any) => this.workerPostMessage(msg),
                            addEventListener: (type: any, fun: any) => this.workerAddEventListener(type, fun)
                        };

                        ///* jshint unused:false */
                        this.eval(this.worker, this.script);

                        let currentListeners: any = this.postMessageListeners;
                        this.postMessageListeners = [];
                        for (let i: number = 0; i < currentListeners.length; i++) {
                            this.runPostMessage(currentListeners[i]);
                        }
                    } else {
                        this.postError(new Error('cannot find script ' + path));
                    }
                }
            };

            xhr.send();
        }

        private eval(self: any, script: any): void {
            /* tslint:disable */
            (function (): void {
                eval(script);
            }).call(self);
            /* tslint:enable */
        }

        // custom each loop is for IE8 support
        private executeEach(arr: any, fun: (msg: any) => void): void {
            let i: number = -1;
            while (++i < arr.length) {
                if (arr[i]) {
                    fun(arr[i]);
                }
            }
        }

        private callErrorListener(err: any): (listener: any) => void {
            return (listener: any) => {
                listener({
                    type: 'error',
                    error: err,
                    message: err.message
                });
            };
        }

        private postError(err: any): void {
            let callFun: any = this.callErrorListener(err);
            if (typeof this.onerror === 'function') {
                callFun(this.onerror);
            }
            if (this.worker && typeof this.worker.onerror === 'function') {
                callFun(this.worker.onerror);
            }
            this.executeEach(this.errorListeners, callFun);
            this.executeEach(this.workerErrorListeners, callFun);
        }

        private runPostMessage(msg: any): void {
            let callFun: (listener: any) => void = (listener: any) => {
                try {
                    listener({data: msg});
                } catch (err) {
                    this.postError(err);
                }
            };

            if (this.worker && typeof this.worker.onmessage === 'function') {
                callFun(this.worker.onmessage);
            }
            this.executeEach(this.workerMessageListeners, callFun);
        }

        private workerPostMessage(msg: any): void {
            let callFun: (listener: any) => void = (listener: any) => {
                listener({
                    data: msg
                });
            };

            if (typeof this.onmessage === 'function') {
                callFun(this.onmessage);
            }
            this.executeEach(this.messageListeners, callFun);
        }

        private workerAddEventListener(type: any, fun: any): void {
            /* istanbul ignore else */
            if (type === 'message') {
                this.workerMessageListeners.push(fun);
            } else if (type === 'error') {
                this.workerErrorListeners.push(fun);
            }
        }

        public addEventListener(type: any, fun: any): void {
            /* istanbul ignore else */
            if (type === 'message') {
                this.messageListeners.push(fun);
            } else if (type === 'error') {
                this.errorListeners.push(fun);
            }
        }

        public removeEventListener(type: any, fun: any): void {
            let listeners: any;
            /* istanbul ignore else */
            if (type === 'message') {
                listeners = this.messageListeners;
            } else if (type === 'error') {
                listeners = this.errorListeners;
            } else {
                return;
            }
            let i: number = -1;
            while (++i < listeners.length) {
                let listener: any = listeners[i];
                if (listener === fun) {
                    delete listeners[i];
                    break;
                }
            }
        }

        public postMessage(msg: any): void {
            if (typeof msg === 'undefined') {
                throw new Error('postMessage() requires an argument');
            }
            if (this.terminated) {
                return;
            }
            if (!this.script) {
                this.postMessageListeners.push(msg);
                return;
            }
            this.runPostMessage(msg);
        }

        public terminate(): void {
            this.terminated = true;
        }

        public dispatchEvent(evt: Event): boolean {
            return true;
        }
    }
}
