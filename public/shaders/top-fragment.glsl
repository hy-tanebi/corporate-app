// public/shaders/top-fragment.glsl
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;

void main() {
  // 時間で色相っぽく変化（簡易RGBシフト）
    float hue = fract(uTime * 0.05);
    vec3 color = vec3(0.5 + 0.5 * sin(hue * 6.2831853 + 0.0), 0.5 + 0.5 * sin(hue * 6.2831853 + 2.0944), 0.5 + 0.5 * sin(hue * 6.2831853 + 4.1888));

  // マウス近傍のグロー（元の簡易「内側の光」相当）
    float dist = distance(vec2(vPosition.x, vPosition.y), uMouse);
    float glow = max(0.0, 1.0 - dist * 1.5);
    color += vec3(glow * 0.5);

    gl_FragColor = vec4(color, 1.0);
}
