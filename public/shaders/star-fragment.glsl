precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;

varying vec3 vColor;
varying float vDistance;
varying vec3 vPosition;

void main() {
    // マウス近傍のグロー効果（より穏やかに）
    float mouseEffect = max(0.5, 1.0 - vDistance * 0.3);
    
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    
    // アルファテストで透明部分を除去
    if (texColor.a < 0.01) discard;
    
    // 星のチカチカ効果を作成
    // 各星の位置をベースにしたランダムシード
    float seed = sin(vPosition.x * 12.9898 + vPosition.y * 78.233 + vPosition.z * 37.719) * 43758.5453;
    float randomOffset = fract(seed);
    
    // 各星ごとに異なる周期とタイミングでチカチカ
    float twinkleSpeed = 0.8 + randomOffset * 1.5; // 0.8〜2.3のランダムな速度
    float timeOffset = randomOffset * 6.28318; // 0〜2πのランダムなオフセット
    
    // サイン波を使ったチカチカ効果
    float twinkle = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * twinkleSpeed + timeOffset));
    
    // さらにランダムなスパイク効果を追加（稀に強く光る）
    float spike = 1.0;
    float spikeChance = fract(sin(seed + uTime * 0.1) * 43758.5453);
    if (spikeChance > 0.98) {
        spike = 1.5 + 0.5 * sin(uTime * 10.0 + timeOffset);
    }
    
    // 白い光と青白い光を混在させる
    float colorVariation = fract(seed * 0.5); // 0-1の値で色のバリエーション
    
    // 星の中心からの距離を計算（0.0が中心、0.5が端）
    vec2 center = vec2(0.5, 0.5);
    float distanceFromCenter = distance(gl_PointCoord, center);
    
    // #2490BA色をRGBに変換（36, 144, 186）
    vec3 blueEdgeColor = vec3(36.0/255.0, 144.0/255.0, 186.0/255.0); // #2490BA（外側）
    vec3 blueCenterColor = vec3(0.3, 0.7, 1.0);                      // #2490BAの明るい青版（中心）
    vec3 warmWhiteColor = vec3(1.0, 0.9, 0.7);                       // 電球色（暖かい白）
    vec3 lightBlueGlow = vec3(0.7, 0.9, 1.0);                        // 薄い青白
    
    // 3段階の色分布：30%電球色、40%薄い青白、30%グラデーション青
    vec3 starColor;
    if (colorVariation < 0.3) {
        starColor = warmWhiteColor;
    } else if (colorVariation < 0.7) {
        starColor = lightBlueGlow;
    } else {
        // 中心から端にかけてのグラデーション（明るい青→#2490BA）
        float gradientFactor = smoothstep(0.0, 0.4, distanceFromCenter);
        starColor = mix(blueCenterColor, blueEdgeColor, gradientFactor);
    }
    
    float glowIntensity = 1.2 + 0.3 * twinkle; // チカチカに連動したグロー強度
    
    // 最終色の計算
    vec3 baseColor = vColor * mouseEffect * twinkle * spike;
    vec3 finalColor = baseColor * starColor * glowIntensity;
    gl_FragColor = vec4(finalColor, texColor.a);
}
