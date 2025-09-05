// public/shaders/top-vertex.glsl
precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec3 newPosition = position;

    // 基本の波動アニメーション（時間ベースのみ）
    float waveX = sin(newPosition.x * 2.0 + uTime * 0.5) * 0.1;
    float waveY = sin(newPosition.y * 2.0 + uTime * 0.5) * 0.1;
    newPosition.z += waveX + waveY;

    vUv = uv;
    vPosition = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
