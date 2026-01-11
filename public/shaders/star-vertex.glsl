precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform float uSize;

// positionは自動提供されるが、colorは明示的に宣言が必要
attribute vec3 color;
attribute float aScale; // 追加: 個別のサイズスケール

varying vec3 vColor;
varying float vDistance;
varying vec3 vPosition;

void main() {
    vColor = color;
    vPosition = position; // フラグメントシェーダーで使用するため

    // カメラ座標系へ
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // NDC座標でのマウス距離計算（正規化座標系で統一）
    vec4 projectedPosition = projectionMatrix * mvPosition;
    vec2 screenPos = projectedPosition.xy / projectedPosition.w;
    vDistance = distance(screenPos, uMouse);

    // 基本サイズを確保しつつ、距離でスケール（最小サイズ保証）
    float distanceFactor = max(0.3, 1.0 - vDistance * 0.5);

    // aScale を乗算して個々のサイズを適用
    float size = uSize * aScale * distanceFactor;

    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
