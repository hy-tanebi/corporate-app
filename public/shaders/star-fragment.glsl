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
    
    // 最終色の計算
    vec3 finalColor = vColor * mouseEffect * twinkle * spike;
    gl_FragColor = vec4(finalColor, texColor.a);
}
