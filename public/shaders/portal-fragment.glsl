precision mediump float;

uniform float uZoom;
varying vec2 vUv;

void main() {
    // 中心からの距離を計算
    vec2 center = vec2(0.5, 0.5);
    float distance = length(vUv - center);
    
    // シンプルな円の半径計算（uZoomが0.1で小さな円、1.0で大きな円）
    float radius = uZoom * 0.5; // 最大で画面の半分まで
    
    // 明確な円のエッジ（ぼかしなし）
    if (distance < radius) {
        // 円の内側 - 赤色で表示
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.8);
    } else {
        // 円の外側 - 透明
        discard;
    }
    
    // デバッグ用: ズーム値を色の強度で表現
    gl_FragColor.rgb *= uZoom;
}
