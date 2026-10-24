declare namespace value {
    interface Disposable {
        dispose(): void;
    }

    interface Value<T> {
        get(): T;
        set(value: T): void;
        del(): void;

        /** The parent value must be an object. A Value default is read lazily. */
        then<K extends PropertyKey, D = undefined>(key: K, defaultValue?: D | Value<D>): Value<T[K & keyof T] | D>;

        /** Caches reads until set() or refresh(); del() does not invalidate the cache. */
        cache(): CachedValue<T>;

        asPropertyDescriptor(): {
            get: () => T;
            set: (value: T) => void;
        };
    }

    interface CachedValue<T> extends Value<T> {
        /** Invalidates the cache so the next get() reads the underlying value. */
        refresh(): void;
    }

    interface GMValue<T> extends Value<T> {
        /**
         * Returns a handle for removing the listener. Values can be undefined after deletion.
         * The current runtime passes an undefined key to GM_addValueChangeListener.
         */
        onChanged(callback: (name: string, oldValue: T | undefined, newValue: T | undefined, remote: boolean) => void): Disposable;
    }

    /**
     * Requires GM_listValues, GM_getValue, GM_setValue, GM_deleteValue,
     * GM_addValueChangeListener, and GM_removeValueChangeListener grants.
     */
    function of<T>(key: string, defaultValue: T): GMValue<T>;
    function of<T = unknown>(key: string): GMValue<T | undefined>;
}
