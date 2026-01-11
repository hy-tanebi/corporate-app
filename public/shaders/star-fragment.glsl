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
    float twinkleSpeed = 0.5 + randomOffset * 1.0; // 少しゆっくりに (0.5〜1.5)
    float timeOffset = randomOffset * 6.28318; // 0〜2πのランダムなオフセット

    // サイン波を使ったチカチカ効果（より穏やかに）
    // 0.7 + 0.3 * sin(...) -> 明るさの変動幅を抑制
    float twinkle = 0.85 + 0.15 * sin(uTime * twinkleSpeed + timeOffset);

    // スパイク効果（稀に強く光る）も控えめに
    float spike = 1.0;
    float spikeChance = fract(sin(seed + uTime * 0.1) * 43758.5453);
    if (spikeChance > 0.995) { // 発生頻度を下げる
        spike = 1.2 + 0.3 * sin(uTime * 8.0 + timeOffset); // 過剰な輝きを抑える
    }

    // 色の計算
    // VertexShaderから渡された spectral color (vColor) をベースにする
    // 中心から端にかけてのフォールオフ
    vec2 center = vec2(0.5, 0.5);
    float distanceFromCenter = distance(gl_PointCoord, center);

    // ソフトな円形マスク
    float alpha = 1.0 - smoothstep(0.3, 0.5, distanceFromCenter);

    // 最終色の計算
    // ベースカラー * マウスエフェクト * ツインクル * スパイク
    vec3 finalColor = vColor * mouseEffect * twinkle * spike;

    gl_FragColor = vec4(finalColor, texColor.a * alpha);
}
