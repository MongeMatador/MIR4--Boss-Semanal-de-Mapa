import { useRef, useEffect } from 'react';

/**
 * Custom hook for getting the previous value of a prop or state.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
    // Fix: The original call `useRef<T>()` was causing an error "Expected 1 arguments, but got 0."
    // Explicitly passing `undefined` as the initial value resolves this issue with some toolchains
    // while maintaining the same behavior. The ref type is also made more explicit.
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
