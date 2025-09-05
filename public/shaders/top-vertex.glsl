// public/shaders/top-vertex.glsl
precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec3 newPosition = position;

  // もともとの波（Z方向に軽く）
    float waveX = sin(newPosition.x * 2.0 + uTime * 0.5) * 0.1;
    float waveY = sin(newPosition.y * 2.0 + uTime * 0.5) * 0.1;
    newPosition.z += waveX + waveY;

  // マウス近傍の押し出し（簡易）
    float dist = distance(vec2(newPosition.x, newPosition.y), uMouse);
    float pushEffect = max(0.0, 1.0 - dist * 2.0);
    newPosition.z += pushEffect * 0.3;

    vUv = uv;
    vPosition = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
