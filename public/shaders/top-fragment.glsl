// public/shaders/top-fragment.glsl
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;

// ノイズ関数（霜の質感用）
float random(vec3 st) {
    return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453123);
}

float noise(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));
    float e = random(i + vec3(0.0, 0.0, 1.0));
    float f2 = random(i + vec3(1.0, 0.0, 1.0));
    float g = random(i + vec3(0.0, 1.0, 1.0));
    float h = random(i + vec3(1.0, 1.0, 1.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
        mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
        u.z
    );
}

void main() {
    // 時間による色相変化
    float hue = fract(uTime * 0.05);
    vec3 baseColor = vec3(
        0.5 + 0.5 * sin(hue * 6.2831853 + 0.0),
        0.5 + 0.5 * sin(hue * 6.2831853 + 2.0944),
        0.5 + 0.5 * sin(hue * 6.2831853 + 4.1888)
    );

    // 霜のような質感（複数スケールのノイズ）
    float frostScale1 = 8.0;
    float frostScale2 = 20.0;
    float frostScale3 = 35.0;

    vec3 noisePos = vPosition + uTime * 0.02;

    float frost1 = noise(noisePos * frostScale1);
    float frost2 = noise(noisePos * frostScale2) * 0.5;
    float frost3 = noise(noisePos * frostScale3) * 0.3;

    float frostPattern = frost1 * 0.5 + frost2 * 0.3 + frost3 * 0.2;

    // 霜で色を少し明るく、ざらつかせる
    vec3 frostedColor = baseColor * (0.85 + frostPattern * 0.3);

    // 内部の光るエフェクト（中心からの距離に基づく）
    vec2 center = vec2(0.0, 0.0);
    float distanceFromCenter = distance(vPosition.xy, center);

    // 中心部分ほど明るくする
    float innerGlow = max(0.0, 1.0 - distanceFromCenter * 0.5);

    // パルス効果（時間による明滅）
    float pulse = sin(uTime * 3.0) * 0.3 + 0.7;

    // 最終的な色の合成
    vec3 color = frostedColor;
    color += vec3(innerGlow * pulse * 0.6); // 内部の光

    // 中心部の輝度強調
    float centerHighlight = max(0.0, 1.0 - distanceFromCenter * 1.2);
    color += baseColor * centerHighlight * 0.4;

    gl_FragColor = vec4(color, 1.0);
}
