// public/shaders/top-vertex.glsl
precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistortion;

void main() {
    vec3 newPosition = position;

    // 基本の波動アニメーション
    float waveX = sin(newPosition.x * 2.0 + uTime * 0.5) * 0.1;
    float waveY = sin(newPosition.y * 2.0 + uTime * 0.5) * 0.1;
    newPosition.z += waveX + waveY;

    // ===== ディストーション・ワープエフェクト =====
    
    // マウスとの距離を計算
    float mouseDistance = distance(vec2(newPosition.x, newPosition.y), uMouse);
    
    // 影響半径（この範囲内でエフェクトが発生）
    float influenceRadius = 3.0;
    float influence = smoothstep(influenceRadius, 0.0, mouseDistance);
    
    // 複数の波を組み合わせたディストーション
    float distortionStrength = influence * 0.8;
    
    // 放射状のディストーション（中心から外向き）
    vec2 direction = normalize(vec2(newPosition.x, newPosition.y) - uMouse);
    float radialWave = sin(mouseDistance * 8.0 - uTime * 4.0) * distortionStrength;
    
    // 螺旋状のディストーション
    float angle = atan(direction.y, direction.x);
    float spiralWave = sin(angle * 6.0 + mouseDistance * 4.0 - uTime * 3.0) * distortionStrength * 0.5;
    
    // XY平面での波打ち
    newPosition.x += direction.x * radialWave * 0.3;
    newPosition.y += direction.y * radialWave * 0.3;
    
    // Z方向の複雑な変形
    float zDistortion = radialWave + spiralWave;
    newPosition.z += zDistortion * 0.6;
    
    // リップル（波紋）エフェクト
    float ripple = sin(mouseDistance * 12.0 - uTime * 6.0) * influence * 0.4;
    newPosition.z += ripple;
    
    // 回転変形（マウス周辺で頂点が回転）
    float rotationStrength = influence * sin(uTime * 2.0) * 0.3;
    float cosR = cos(rotationStrength);
    float sinR = sin(rotationStrength);
    vec2 centered = vec2(newPosition.x, newPosition.y) - uMouse;
    vec2 rotated = vec2(
        centered.x * cosR - centered.y * sinR,
        centered.x * sinR + centered.y * cosR
    ) + uMouse;
    newPosition.x = rotated.x;
    newPosition.y = rotated.y;

    vUv = uv;
    vPosition = newPosition;
    vDistortion = influence; // フラグメントシェーダーでエフェクトの強度を使用

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
