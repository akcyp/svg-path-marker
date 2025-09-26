export const cx = (...classNames: (string | string[] | Record<string, boolean>)[]): string => {
  return classNames
    .flatMap((c) => {
      if (typeof c === 'string') return [c];
      if (typeof c === 'object') {
        if (Array.isArray(c)) return c;
        return Object.entries(c)
          .filter(([_, v]) => v)
          .map(([k]) => k);
      }
    })
    .join(' ');
};
