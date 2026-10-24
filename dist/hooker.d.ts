declare namespace hooker {
    type Callable = (this: any, ...args: any[]) => any;

    /** The runtime passes an arguments object, so array methods are not available. */
    type Arguments<Args extends unknown[]> = IArguments & {
        [Key in keyof Args as Key extends `${number}` ? Key : never]: Args[Key];
    };

    interface Next<F extends Callable> {
        (): ReturnType<F>;
        readonly origin: F;
    }

    type Hooked<F extends Callable> = (this: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F>;

    /** Logs property reads and recursively proxies their values, which must be objects. */
    function mock<T extends object = Record<PropertyKey, unknown>>(target?: T): T;

    /** Lets the wrapper invoke the original function through next(), preserving this. */
    function hookFunc<F extends Callable>(
        wrapped: F,
        wrapper: (this: ThisParameterType<F>, args: Arguments<Parameters<F>>, next: Next<F>) => ReturnType<F>,
    ): Hooked<F>;

    /** Calls the original function only when the wrapper returns undefined. */
    function hookBefore<F extends Callable>(
        wrapped: F,
        wrapper: (this: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F> | undefined,
    ): Hooked<F>;

    /** Replaces a function on globalThis with a hookBefore wrapper. */
    function hookGlobal(functionName: PropertyKey, wrapper: Callable): void;
}
