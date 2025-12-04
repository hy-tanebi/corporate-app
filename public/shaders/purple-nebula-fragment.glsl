uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPosition;

// 3D Simplex Noise
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

// Fractal Brownian Motion (FBM) - より複雑なノイズパターン
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  // UV座標を中心基準に
  vec2 uv = vUv - 0.5;

  // 中心からの距離
  float dist = length(uv);

  // 複数のノイズレイヤーを組み合わせてガス状の雲を作成
  vec3 pos1 = vec3(vUv * 3.0, uTime * 0.15);
  vec3 pos2 = vec3(vUv * 2.0, uTime * 0.1 + 100.0);
  vec3 pos3 = vec3(vUv * 4.0, uTime * 0.05 + 200.0);

  // FBMで複雑なノイズパターンを生成
  float noise1 = fbm(pos1);
  float noise2 = fbm(pos2);
  float noise3 = fbm(pos3);

  // ノイズを組み合わせて雲の形状を作る
  float cloud = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
  cloud = smoothstep(-0.5, 1.0, cloud);

  // 渦巻き効果を追加（より柔らかく）
  float angle = atan(uv.y, uv.x);
  float spiral = sin(angle * 2.0 + dist * 3.0 - uTime * 0.2) * 0.5 + 0.5;
  cloud *= mix(0.5, 1.0, spiral);

  // 中心から外側に向かってより滑らかにフェードアウト
  float radialFade = 1.0 - smoothstep(0.0, 1.2, dist);
  radialFade = pow(radialFade, 2.0); // より滑らかな減衰
  cloud *= radialFade;

  // 境界をさらにぼかすための追加フェード
  float edgeSoftness = smoothstep(0.7, 1.3, dist);
  cloud *= (1.0 - edgeSoftness);

  // 3色をブレンドして紫色のグラデーション
  vec3 color = mix(uColor1, uColor2, cloud);
  color = mix(color, uColor3, noise3 * 0.5 + 0.5);

  // 明るい部分を強調（より控えめに）
  float brightness = smoothstep(0.5, 1.0, cloud);
  color += uColor1 * brightness * 0.2;

  // 最終的な不透明度（境界をより柔らかく）
  float alpha = cloud * uOpacity * radialFade * (1.0 - edgeSoftness);
  alpha = smoothstep(0.0, 0.5, alpha); // さらに滑らかに

  gl_FragColor = vec4(color, alpha);
}
