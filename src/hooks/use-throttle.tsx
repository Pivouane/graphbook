import * as React from "react";

export function useThrottle<T>(value: T, delay: number) {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}
