precision mediump float;

uniform sampler2D uTexture;

varying vec3 vColor;
varying float vDistance;

void main() {
    // マウス近傍のグロー効果（より穏やかに）
    float mouseEffect = max(0.5, 1.0 - vDistance * 0.3);
    
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    
    // アルファテストで透明部分を除去
    if (texColor.a < 0.01) discard;
    
    // 最終色の計算
    vec3 finalColor = vColor * mouseEffect;
    gl_FragColor = vec4(finalColor, texColor.a);
}
