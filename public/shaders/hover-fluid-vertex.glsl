// public/shaders/hover-fluid-vertex.glsl
varying vec2 vUv;
void main() {
    vUv = uv;
  // PlaneGeometry(2,2) を使い、ワールド変換/投影を無視して NDC に直接出力
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
