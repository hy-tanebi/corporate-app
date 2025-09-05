// public/shaders/top-fragment.glsl
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistortion;

uniform float uTime;
uniform vec2 uMouse;

void main() {
    // 基本の時間変化色相
    float hue = fract(uTime * 0.05);
    vec3 baseColor = vec3(
        0.5 + 0.5 * sin(hue * 6.2831853 + 0.0), 
        0.5 + 0.5 * sin(hue * 6.2831853 + 2.0944), 
        0.5 + 0.5 * sin(hue * 6.2831853 + 4.1888)
    );

    // ディストーション領域の色彩強化
    vec3 distortionColor = vec3(1.0, 0.3, 0.8); // ピンク系
    vec3 color = mix(baseColor, distortionColor, vDistortion * 0.7);

    // マウス近傍のグロー効果
    float mouseDistance = distance(vec2(vPosition.x, vPosition.y), uMouse);
    float glow = max(0.0, 1.0 - mouseDistance * 1.5);
    
    // ディストーション領域でのパルス効果
    float pulse = sin(uTime * 8.0) * 0.5 + 0.5;
    float distortionGlow = vDistortion * pulse * 0.8;
    
    // 色の合成
    color += vec3(glow * 0.5);
    color += distortionColor * distortionGlow;
    
    // 彩度とコントラストの調整
    color = mix(color, normalize(color), vDistortion * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
}
