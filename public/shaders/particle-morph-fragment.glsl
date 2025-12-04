// public/shaders/particle-morph-fragment.glsl
// パーティクルモーフィング用フラグメントシェーダー

precision highp float;

uniform highp float uProgress;
uniform sampler2D uImageTexture;

varying vec2 vUv;
varying float vAlpha;
varying vec3 vColor;

void main() {
  // 円形のパーティクル形状
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // ソフトエッジ
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  alpha *= vAlpha;

  // 流体状態では光る効果を強調
  float glow = (1.0 - uProgress) * 0.5;
  vec3 finalColor = vColor + vec3(glow);

  // カード状態に近づくにつれて画像のテクスチャを表示
  if (uProgress > 0.7) {
    vec3 texColor = texture2D(uImageTexture, vUv).rgb;
    finalColor = mix(finalColor, texColor, (uProgress - 0.7) / 0.3);
  }

  gl_FragColor = vec4(finalColor, alpha);
}
