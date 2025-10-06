uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPosition;

// Simplex 2D noise
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
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
  // UVを中心から計算（-0.5 ~ 0.5）
  vec2 centeredUv = vUv - 0.5;

  // 渦状の歪み（回転する力場を作る）
  float dist = length(centeredUv);
  float angle = atan(centeredUv.y, centeredUv.x);

  // 渦の強さ（中心から外側に向かって弱くなる）
  float swirlStrength = (0.5 - dist) * 2.0;
  swirlStrength = max(0.0, swirlStrength);

  // 時間と共に回転する渦（非常にゆっくり）
  float swirlAngle = angle + swirlStrength * uTime * 0.02;

  // 渦状に歪んだUV座標
  vec2 swirlUv = vec2(
    cos(swirlAngle) * dist,
    sin(swirlAngle) * dist
  );

  // 複数の渦を重ねる（ガス雲の複雑な動き・非常にゆっくり）
  vec2 swirl2Uv = centeredUv;
  float swirl2 = fbm(centeredUv * 1.5 + vec2(uTime * 0.005, 0.0));
  swirl2Uv += vec2(cos(swirl2 * 6.28), sin(swirl2 * 6.28)) * 0.1;

  // 中心からの距離でマスク
  float distFromCenter = length(centeredUv);

  // 緩やかに消えるマスク（ガス雲のふんわり感）
  float circleMask = 1.0 - smoothstep(0.1, 0.5, distFromCenter);

  // 端で完全に消える
  float edgeFade = 1.0 - smoothstep(0.35, 0.5, distFromCenter);
  circleMask *= edgeFade;

  // 渦状のUVを使った大きなガスの塊（非常にゆっくり）
  vec2 coarseUv = swirlUv * 2.0 + vec2(uTime * 0.001, 0.0);
  float coarseNoise = fbm(coarseUv);
  coarseNoise = coarseNoise * 0.5 + 0.5;

  // 渦に巻き込まれるガスの流れ（非常にゆっくり）
  vec2 noiseUv = swirl2Uv * 3.0 + vec2(uTime * 0.002, -uTime * 0.0015);
  float noise = fbm(noiseUv);
  noise = noise * 0.5 + 0.5;

  // 細かい煙のディテール（非常にゆっくり）
  vec2 detailUv = swirlUv * 5.0 + vec2(uTime * 0.003, uTime * 0.002);
  float detailNoise = fbm(detailUv);
  detailNoise = detailNoise * 0.5 + 0.5;

  // 非常に細かい煙の質感（非常にゆっくり）
  vec2 fineUv = (centeredUv + swirlUv * 0.5) * 8.0 + vec2(uTime * 0.004, -uTime * 0.0025);
  float fineNoise = fbm(fineUv);
  fineNoise = fineNoise * 0.5 + 0.5;

  // ガス雲の複雑な濃淡（渦状の動きを含む）
  float combinedNoise = coarseNoise * 0.4 + noise * 0.3 + detailNoise * 0.2 + fineNoise * 0.1;

  // 円形マスクとノイズを組み合わせる
  float intensity = circleMask * combinedNoise;

  // 色のグラデーション
  vec3 color = mix(uColor2, uColor1, intensity);

  // 最終的な不透明度
  float alpha = intensity * uOpacity;

  gl_FragColor = vec4(color, alpha);
}
