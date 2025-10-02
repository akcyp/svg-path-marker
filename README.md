# SVG Editor

A simple web-based SVG editor for creating and editing scalable vector graphics.

> [!WARNING]
> This package is still in the experimental phase. You can expect new functionalities, but with this comes the possibility of more frequent errors

> [!IMPORTANT]
> Package is using modern Web APIs which may be not available on older browsers
> See:
>
> - https://caniuse.com/mdn-api_htmlelement_attachinternals
> - https://caniuse.com/mdn-api_elementinternals
> - https://caniuse.com/mdn-api_shadowroot

[![SVG Path Marker on NPM](https://img.shields.io/npm/v/svg-path-marker.svg)](https://www.npmjs.com/package/svg-path-marker)
![Minified size](https://img.shields.io/bundlephobia/min/svg-path-marker)

![Preview](preview.jpg)

## Demo

See https://akcyp.github.io/svg-path-marker/

## Features

- Draw and edit SVG shapes
- Multiple shapes support
- Touch devices support
- Keyboard support
- Undo/redo actions (Ctrl-Z, Ctrl-Y)
- Resposive (tool is rendering with native SVG element instead of canvas)
- Cross framework support thanks to Web Component implementation
- Form control support

## Quick usage guide

- Double click to add new point (tap on touch devices)
- Click on point to edit its properties & add successor commands (points)
- Drag points around

# Developer guide

## Installation

```sh
# with npm
npm i svg-path-marker
# with yarn
yarn add svg-path-marker
# with pnpm
pnpm add svg-path-marker
```

## Loading in your application

```ts
// Load with JS / TS:
import 'svg-path-marker';
import type { SVGPathMarker } from 'svg-path-marker';
```

```html
<!-- Load with html script tag: -->
<script type="module" src="./node_modules/svg-path-marker"></script>

<!-- Usage: -->
<svg-path-marker d="M 0,0" viewbox="0 0 500 500">
  <!-- Any content, for example: -->
  <img width="500px" height="500px" src="..." />
</svg-path-marker>

<!-- Use as form control: -->
<form>
  <!-- "d" property is a value -->
  <svg-path-marker
    name="path"
    d="M 0,0 L 0,5 L 5,5 Z"
    style="width: 100px; height: 100px"
  ></svg-path-marker>
  <button type="submit">Submit</button>
</form>
```

CSS states:

```css
svg-path-marker:disabled {
  /* Custom disabled styles */
}
svg-path-marker:invalid {
  /* Custom invalid input styles */
}
svg-path-marker:state(open) {
  /* Custom open styles (when at least one path is not closed) */
}
svg-path-marker:state(closed) {
  /* Custom closed state (when all paths are closed) */
}
svg-path-marker:state(drag) {
  /* While moving points */
}
```

Props:

```ts
export interface SVGPathMarkerProps {
  /**
   * Required path[d] prop, for reference see:
   * - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d
   * - https://www.w3.org/TR/1999/WD-SVG-19990412/paths.html
   */
  d: string;
  /**
   * When present, makes the editor not mutable
   */
  disabled?: boolean;
  /**
   * The viewbox attribute defines the position and dimension, in user space, of an SVG editor viewport.
   */
  viewbox?: string;
  /**
   * Integer string to round points coordinates
   */
  precision?: string;
  /**
   * Show helper points by default
   */
  showhelpers?: boolean;
}
```

## React integration example

```ts
import 'svg-path-marker';
import type { SVGPathMarker, SVGPathMarkerProps } from 'svg-path-marker';
import { useEffect, useRef, useState } from 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'svg-path-marker': React.DetailedHTMLProps<React.HTMLAttributes<SVGPathMarker>, SVGPathMarkerProps> & Partial<SVGPathMarkerProps>;
    }
  }
}

export default function App() {
  const ref = useRef<SVGPathMarker>(null);
  useEffect(() => {
    const marker = ref.current;
    if (!marker) return;
    const onChange = () => setD(marker.d ?? '');
    marker.addEventListener('change', onChange);
    return () => marker.removeEventListener('change', onChange);
  }, []);

  const [d, setD] = useState('');
  return (
    <>
      <svg-path-marker d={d} ref={ref} style={{ width: '500px', height: '500px', border: '1px solid' }}></svg-path-marker>
      <div>Path: {d}</div>
    </>
  );
}
```
