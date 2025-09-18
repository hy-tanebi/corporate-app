// public/shaders/hover-fluid-fragment.glsl
precision highp float;
#include <common>

uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uTime;
uniform float uIntensity;
uniform float uRadius;
uniform float uFalloff;
uniform float uDispAmp;
uniform float uNoiseAmp;

uniform float uBaseAmp;
uniform float uBaseScale;

uniform vec2 uHeroCenter;
uniform vec2 uHeroSize;
uniform float uHeroRadius;

uniform float uChromAb;
uniform int uShowMask;

varying vec2 vUv;

// --- utils ---
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}
vec2 grad(vec2 p) {
  float e = 0.0015;
  float n1 = fbm(p + vec2(e, 0.0));
  float n2 = fbm(p + vec2(-e, 0.0));
  float n3 = fbm(p + vec2(0.0, e));
  float n4 = fbm(p + vec2(0.0, -e));
  return vec2(n1 - n2, n3 - n4);
}
float roundRectMask(vec2 uv, vec2 center, vec2 halfSize, float radius) {
  vec2 p = abs(uv - center) - halfSize + radius;
  float d = length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - radius;
  return 1.0 - smoothstep(0.0, 0.003, d);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(1.0, uResolution.y);

  // --- ヒーロー領域（一時的に全画面に拡大してテスト） ---
  float heroMask = 1.0; // roundRectMask(uv, uHeroCenter, uHeroSize, uHeroRadius);

  // --- ベースの“水面ゆらぎ” ---
  vec2 bp = uv * vec2(uBaseScale * aspect, uBaseScale) + vec2(uTime * 0.018, -uTime * 0.016);
  vec2 baseNrm = grad(bp);
  vec2 baseDisp = baseNrm * 0.016 * heroMask;

  // --- ポインター周辺 ---
  vec2 vel = uVel;
  float vlen = length(vel);
  vec2 dir = normalize(vel + 1e-6);
  vec2 rel = uv - uMouse;
  float along = dot(rel, dir);
  float perp = dot(rel, vec2(-dir.y, dir.x));
  float aniso = mix(1.0, 1.45, clamp(vlen * 3.5, 0.0, 1.0));
  float rEll = length(vec2(along / aniso, perp));
  float mask = 1.0 - smoothstep(uRadius, uRadius + uFalloff, rEll);
  mask *= clamp(uIntensity, 0.0, 1.0);
  mask *= heroMask;

  vec2 bulgeC = uMouse + dir * (0.025 * vlen);
  float bulge = 1.0 - smoothstep(0.0, uRadius, length(uv - bulgeC));
  bulge *= mask;

  vec2 tailC = uMouse - dir * (0.16 * vlen);
  float tail = 1.0 - smoothstep(uRadius * 1.7, uRadius * 1.7 + uFalloff * 1.3, length(uv - tailC));
  float ghost = tail * smoothstep(0.28, 0.6, vlen) * 0.55;

  // とろみノイズ
  vec2 nUv = uv * vec2(6.0 * aspect, 6.0) + vec2(uTime * 0.55, -uTime * 0.48) + vel * 1.4;
  float n1 = fbm(nUv);
  float n2 = fbm(nUv + vec2(19.3, -11.7));
  vec2 flow = (vec2(n1, n2) - 0.5) * 2.0;

  vec2 ndir = normalize(rel + 1e-6);
  vec2 tangent = vec2(-ndir.y, ndir.x);
  vec2 disp = ndir * (0.70 * bulge) +
    tangent * (0.38 * bulge) +
    flow * (uNoiseAmp * mask) +
    (-dir) * (0.30 * ghost);

  vec2 dispCombined = baseDisp * uBaseAmp + disp * uDispAmp;

  // サンプリング（FBOは Linear）
  vec2 uvR = clamp(uv + dispCombined * (1.00 + uChromAb), vec2(0.001), vec2(0.999));
  vec2 uvG = clamp(uv + dispCombined * (1.00), vec2(0.001), vec2(0.999));
  vec2 uvB = clamp(uv + dispCombined * (1.00 - uChromAb), vec2(0.001), vec2(0.999));
  vec4 colR = texture2D(uScene, uvR);
  vec4 colG = texture2D(uScene, uvG);
  vec4 colB = texture2D(uScene, uvB);
  vec4 col;
  col.r = colR.r;
  col.g = colG.g;
  col.b = colB.b;
  col.a = 1.0;

  if(uShowMask == 1) {
    vec3 dbg = mix(vec3(0.0), vec3(0.2, 0.7, 1.0), heroMask);
    dbg = mix(dbg, vec3(1.0, 0.2, 0.2), mask);
    dbg = mix(dbg, vec3(1.0, 1.0, 0.3), ghost);
    gl_FragColor = vec4(dbg, 1.0);
    #include <colorspace_fragment>
    return;
  }

  gl_FragColor = col;          // 線形のまま
  #include <colorspace_fragment> // three が最終色空間へ変換
}
