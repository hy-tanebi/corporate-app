// public/shaders/distort-fragment.glsl
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 mouse = uMouse / uResolution.xy;

    float dist = distance(uv, mouse);
    float wave = sin(dist * 50.0 + uTime * 2.0) * 0.05 / (dist * 10.0 + 1.0);

    vec2 distortedUv = uv + vec2(wave, wave);

    vec3 color = texture2D(uTexture, distortedUv).rgb;

    gl_FragColor = vec4(color, 1.0);
}
