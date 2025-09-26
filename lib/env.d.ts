declare module 'snabbdom-transform-jsx-props' {
  export const jsxDomPropsModule: Record<'create' | 'update', () => void>;
}

declare module '*.svg' {
  export default string;
}

declare module '*.scss?inline' {
  export default string;
}
