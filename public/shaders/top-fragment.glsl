// public/shaders/top-fragment.glsl
precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;

// 3D Simplex Noise（よりリアルなノイズ）
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// FBM（Fractal Brownian Motion）
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
    // 時間による色相変化（元の光る効果を維持）
    float hue = fract(uTime * 0.05);
    vec3 glowColor = vec3(
        0.5 + 0.5 * sin(hue * 6.2831853 + 0.0),
        0.5 + 0.5 * sin(hue * 6.2831853 + 2.0944),
        0.5 + 0.5 * sin(hue * 6.2831853 + 4.1888)
    );

    // ざらざらした質感（複数レイヤーのノイズ）
    vec3 noisePos = vPosition * 3.0 + uTime * 0.02;

    // 大きなノイズ（全体的な粗さ）
    float coarseNoise = fbm(noisePos * 0.5) * 0.5 + 0.5;

    // 中くらいのノイズ（石や砂の粒感）
    float mediumNoise = fbm(noisePos * 2.0) * 0.5 + 0.5;

    // 細かいノイズ（表面のざらつき）
    float fineNoise = snoise(noisePos * 12.0) * 0.5 + 0.5;

    // ノイズを組み合わせてざらついた質感を作る
    float roughness = coarseNoise * 0.4 + mediumNoise * 0.3 + fineNoise * 0.3;

    // ざらつきを光る色に適用（マットな質感に）
    vec3 texturedColor = glowColor * (0.7 + roughness * 0.3);

    // 内部の光るエフェクト（中心からの距離に基づく）
    vec2 center = vec2(0.0, 0.0);
    float distanceFromCenter = distance(vPosition.xy, center);

    // 中心部分ほど明るくする
    float innerGlow = max(0.0, 1.0 - distanceFromCenter * 0.5);

    // パルス効果（時間による明滅）
    float pulse = sin(uTime * 3.0) * 0.3 + 0.7;

    // 表面の凹凸感（ライティングシミュレーション）
    float normalNoise = fbm(noisePos * 4.0);
    float lighting = normalNoise * 0.2 + 0.8;

    // 最終的な色の合成
    vec3 color = texturedColor * lighting;
    color += glowColor * innerGlow * pulse * 0.6; // 内部の光

    // 中心部の輝度強調
    float centerHighlight = max(0.0, 1.0 - distanceFromCenter * 1.2);
    color += glowColor * centerHighlight * 0.4;

    // わずかな色のバリエーション（質感の深み）
    float colorVariation = snoise(noisePos * 1.5) * 0.05;
    color += vec3(colorVariation);

    gl_FragColor = vec4(color, 1.0);
}
