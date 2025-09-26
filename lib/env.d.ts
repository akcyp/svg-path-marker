declare module 'snabbdom-transform-jsx-props' {
  export const jsxDomPropsModule: Record<'create' | 'update', () => void>;
}
