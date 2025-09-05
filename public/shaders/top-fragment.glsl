// public/shaders/top-fragment.glsl
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;

void main() {
    // 時間による色相変化
    float hue = fract(uTime * 0.05);
    vec3 baseColor = vec3(
        0.5 + 0.5 * sin(hue * 6.2831853 + 0.0), 
        0.5 + 0.5 * sin(hue * 6.2831853 + 2.0944), 
        0.5 + 0.5 * sin(hue * 6.2831853 + 4.1888)
    );

    // 内部の光るエフェクト（中心からの距離に基づく）
    vec2 center = vec2(0.0, 0.0);
    float distanceFromCenter = distance(vPosition.xy, center);
    
    // 中心部分ほど明るくする
    float innerGlow = max(0.0, 1.0 - distanceFromCenter * 0.5);
    
    // パルス効果（時間による明滅）
    float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
    
    // 最終的な色の合成
    vec3 color = baseColor;
    color += vec3(innerGlow * pulse * 0.6); // 内部の光
    
    // 中心部の輝度強調
    float centerHighlight = max(0.0, 1.0 - distanceFromCenter * 1.2);
    color += baseColor * centerHighlight * 0.4;

    gl_FragColor = vec4(color, 1.0);
}
