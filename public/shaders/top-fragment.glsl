// public/shaders/top-fragment.glsl

precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;

void main() {
    // 時間によって色相環を変化させる
    float hue = mod(uTime * 0.05, 1.0);
    vec3 color = vec3(1.0, 0.0, 0.0);
    // hue-shift (簡易的な色相シフト)
    color = vec3(sin(hue * 6.28 + 0.0) * 0.5 + 0.5, sin(hue * 6.28 + 2.0) * 0.5 + 0.5, sin(hue * 6.28 + 4.0) * 0.5 + 0.5);

    // マウスカーソルに近いほど明るくする
    float dist = distance(vec2(vPosition.x, vPosition.y), uMouse);
    float glow = max(0.0, 1.0 - dist * 1.5);
    color += vec3(glow * 0.5);

    gl_FragColor = vec4(color, 1.0);
}
