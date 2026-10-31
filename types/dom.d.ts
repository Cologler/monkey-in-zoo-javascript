/// <reference lib="esnext.disposable" />

declare namespace dom {
    interface Disposable {
        dispose(): void;
        [Symbol.dispose](): void;
    }

    interface OnceHandle extends Disposable {
        /** Waits for the first match; timeout is in milliseconds. */
        wait(timeout: number): Promise<void>;
    }

    interface Options {
        /** Defaults to document. */
        element?: Node | null;
        /** Overrides the default subtree, childList, and attributes observation. */
        observerOptions?: MutationObserverInit | null;
        /** Allows an element to trigger the callback again after an observed removal. */
        allowsMultiTimes?: boolean;
    }

    /** Watches matching elements, including an asynchronous scan of existing elements. */
    function on<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        callback: (element: HTMLElementTagNameMap[K]) => void,
        options?: Options | null,
    ): Disposable;
    function on<K extends keyof SVGElementTagNameMap>(
        selector: K,
        callback: (element: SVGElementTagNameMap[K]) => void,
        options?: Options | null,
    ): Disposable;
    function on<E extends Element = Element>(
        selector: string,
        callback: (element: E) => void,
        options?: Options | null,
    ): Disposable;

    /** Stops watching before invoking the callback for the first matching element. */
    function once<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        callback: (element: HTMLElementTagNameMap[K]) => void,
        options?: Options | null,
    ): OnceHandle;
    function once<K extends keyof SVGElementTagNameMap>(
        selector: K,
        callback: (element: SVGElementTagNameMap[K]) => void,
        options?: Options | null,
    ): OnceHandle;
    function once<E extends Element = Element>(
        selector: string,
        callback: (element: E) => void,
        options?: Options | null,
    ): OnceHandle;

    /** Watches removed nodes, excluding moves detected within the same observer batch. */
    function onNodeRemoved(callback: (node: Node) => void, fromElement?: Node | null): Disposable;

    /** Logs matching elements and their observed mutations to the console. */
    function track(selector: string): Disposable;
}

/** Compatibility alias for dom. */
declare var Dom: typeof dom;
