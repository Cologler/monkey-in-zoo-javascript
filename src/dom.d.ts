declare namespace Dom {

    class QueryEventEmitterOptions {
        element?: HTMLElement;
        observerOptions: MutationObserverInit;
        includeTextNode: boolean;
        invokeAt?: 'AnimationFrame';
        debug: boolean;
    }

    class EventEmitterInfo<R> {
        readonly call: number;
        off();
        stop();
        readonly ret: R;
    }

    type Func<E, R> = (node: E|Node, info: EventEmitterInfo<R>) => R;

    class QueryEventEmitter<E extends Element> {
        on(func: Func<E, any>): any;
        on<R>(func: Func<E, R>): R;

        once(func: Func<E, any>): any;
        once<R>(func: Func<E, R>): R;

        dispose(): void;
    }

    export function query<K extends keyof HTMLElementTagNameMap>(selector: K,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<HTMLElementTagNameMap[K]>;
    export function query<K extends keyof SVGElementTagNameMap>(selector: K,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<SVGElementTagNameMap[K]>;
    export function query<E extends Element>(selector: string,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<E>;

    export function on<K extends keyof HTMLElementTagNameMap>(selector: K,
        func: Func<HTMLElementTagNameMap[K], any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<HTMLElementTagNameMap[K]>;
    export function on<K extends keyof SVGElementTagNameMap>(selector: K,
        func: Func<SVGElementTagNameMap[K], any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<SVGElementTagNameMap[K]>;
    export function on<E extends Element>(selector: string,
        func: Func<E, any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<E>;

    export function once<K extends keyof HTMLElementTagNameMap>(selector: K,
        func: Func<HTMLElementTagNameMap[K], any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<HTMLElementTagNameMap[K]>;
    export function once<K extends keyof SVGElementTagNameMap>(selector: K,
        func: Func<SVGElementTagNameMap[K], any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<SVGElementTagNameMap[K]>;
    export function once<E extends Element>(selector: string,
        func: Func<E, any>,
        options?: QueryEventEmitterOptions)
        : QueryEventEmitter<E>;
}


