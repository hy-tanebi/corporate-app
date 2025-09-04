declare module '*.glsl?raw' {
  const content: string;
  export default content;
}

// react-three/fiberのJSX型拡張
declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: any;
    }
  }
}
