precision mediump float;

uniform float uZoom;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vZoom;

void main() {
    vUv = uv;
    vZoom = uZoom;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}