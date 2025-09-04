// public/shaders/top-vertex.glsl

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution; // 追加

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec3 newPosition = position;

    // 時間と頂点のx,y座標に基づいて、z軸方向に頂点を変形させる
    float waveX = sin(newPosition.x * 2.0 + uTime * 0.5) * 0.1;
    float waveY = sin(newPosition.y * 2.0 + uTime * 0.5) * 0.1;
    newPosition.z += waveX + waveY;

    // マウスの位置を考慮して、マウスの近くの頂点を押し出す
    // distは頂点とマウスの距離
    float dist = distance(vec2(newPosition.x, newPosition.y), uMouse);
    float pushEffect = max(0.0, 1.0 - dist * 2.0);
    newPosition.z += pushEffect * 0.3;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
    vUv = uv;
    vPosition = newPosition;
}
