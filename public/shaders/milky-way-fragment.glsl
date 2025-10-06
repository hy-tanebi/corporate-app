uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPosition;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
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

  // 天の川の帯を斜めに配置
  float angle = 0.5; // 斜めの角度
  vec2 rotatedUv = vec2(
    centeredUv.x * cos(angle) - centeredUv.y * sin(angle),
    centeredUv.x * sin(angle) + centeredUv.y * cos(angle)
  );

  // 帯の中心からの距離
  float distFromBand = abs(rotatedUv.y);

  // 帯のマスク（中心が明るく、端が暗い）
  float bandMask = 1.0 - smoothstep(0.0, 0.25, distFromBand);

  // ノイズで自然な濃淡を作る
  vec2 noiseUv = vUv * 3.0 + vec2(uTime * 0.02, 0.0);
  float noise = fbm(noiseUv);
  noise = noise * 0.5 + 0.5; // 0-1に正規化

  // 細かいディテール用のノイズ
  vec2 detailUv = vUv * 8.0 + vec2(uTime * 0.01, uTime * 0.005);
  float detailNoise = fbm(detailUv);
  detailNoise = detailNoise * 0.5 + 0.5;

  // ノイズを組み合わせる
  float combinedNoise = noise * 0.7 + detailNoise * 0.3;

  // バンドマスクとノイズを組み合わせる
  float intensity = bandMask * combinedNoise;

  // 端のフェードアウト（画面端で消える）
  float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(centeredUv));
  intensity *= edgeFade;

  // 色のグラデーション
  vec3 color = mix(uColor2, uColor1, intensity);

  // 最終的な不透明度
  float alpha = intensity * uOpacity;

  gl_FragColor = vec4(color, alpha);
}
