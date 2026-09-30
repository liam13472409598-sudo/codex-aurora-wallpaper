// Adapted from Rice-dog/code-codex; underlying Auroras shader by nimitz.
// See SOURCES.md and THIRD_PARTY_NOTICES.md for attribution and license boundaries.
const isObjectRecord = (v         )                               => !!v && typeof v === 'object' && !Array.isArray(v);
const clampParticleNumber = (v         , min        , max        , fallback        )         => typeof v === 'number' && Number.isFinite(v) ? Math.min(max,Math.max(min,v)) : fallback;






















const AURORA_IONOSPHERE_QUALITY = Object.freeze({
  low: Object.freeze({ steps: 32, rayScale: 0.72, maxDpr: 1.1, minAdaptiveScale: 0.92, noiseAtlasSize: 512 }),
  medium: Object.freeze({ steps: 50, rayScale: 0.76, maxDpr: 1.25, minAdaptiveScale: 0.9, noiseAtlasSize: 768 }),
  high: Object.freeze({ steps: 72, rayScale: 0.82, maxDpr: 1.4, minAdaptiveScale: 0.9, noiseAtlasSize: 1024 }),
}





    );

const DEFAULT_AURORA_IONOSPHERE_BACKGROUND_SETTINGS                                     = Object.freeze({
  hue: 0,
  saturation: 1,
  quality: "medium",
  speed: 1,
  intensity: 1,
  curtainScale: 0.5,
  turbulence: 0.58,
  glow: 0.72,
  starDensity: 0.56,
  introDuration: 2.4,
  introFeather: 0.16,
  introStart: -0.22,
  introEnd: 1.32,
  introSkyEnd: 0.48,
  introStarStart: 0.34,
  paused: false,
});


function normalizeAuroraIonosphereSettings(value         )                                     {
  const record = isObjectRecord(value) ? value : {};
  const defaults = DEFAULT_AURORA_IONOSPHERE_BACKGROUND_SETTINGS;
  const quality = record.quality === "low" || record.quality === "medium" || record.quality === "high"
    ? record.quality
    : defaults.quality;
  return {
    hue: clampParticleNumber(record.hue, -180, 180, defaults.hue),
    saturation: clampParticleNumber(record.saturation, 0, 2, defaults.saturation),
    quality,
    speed: clampParticleNumber(record.speed, 0, 3, defaults.speed),
    intensity: clampParticleNumber(record.intensity, 0, 3, defaults.intensity),
    curtainScale: clampParticleNumber(record.curtainScale, 0.05, 2, defaults.curtainScale),
    turbulence: clampParticleNumber(record.turbulence, 0, 1.8, defaults.turbulence),
    glow: clampParticleNumber(record.glow, 0, 2.4, defaults.glow),
    starDensity: clampParticleNumber(record.starDensity, 0, 1.5, defaults.starDensity),
    introDuration: clampParticleNumber(record.introDuration, 0.6, 6, defaults.introDuration),
    introFeather: clampParticleNumber(record.introFeather, 0.03, 0.4, defaults.introFeather),
    introStart: clampParticleNumber(record.introStart, -0.5, 0.25, defaults.introStart),
    introEnd: clampParticleNumber(record.introEnd, 0.8, 1.8, defaults.introEnd),
    introSkyEnd: clampParticleNumber(record.introSkyEnd, 0.1, 0.9, defaults.introSkyEnd),
    introStarStart: clampParticleNumber(record.introStarStart, 0, 0.8, defaults.introStarStart),
    paused: typeof record.paused === "boolean" ? record.paused : defaults.paused,
  };
}


const AURORA_IONOSPHERE_VERTEX_SHADER = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

/*
 * Adapted from “Auroras” by nimitz (@stormoid), Shadertoy XtGGRt.
 * The runtime noise atlas, volumetric height planes, spectral emission, and
 * four procedural star layers are preserved from the standalone effect.
 * Applicable license evidence remains conditional; see the third-party notices.
 */
const AURORA_IONOSPHERE_NOISE_SHADER = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uNoiseDomainMin;
uniform vec2 uNoiseDomainSize;
uniform vec2 uFlowRotation;
uniform float uNoiseScale;
uniform float uNoiseTurbulence;

mat2 rotateNoiseDomain(float angle) {
  float angle2 = angle * angle;
  float c = 1.0 - angle2 * (0.5 - angle2 * 0.041666667);
  float s = angle * (1.0 - angle2 * (0.166666667 - angle2 * 0.008333333));
  return mat2(c, s, -s, c);
}
float tri(float x) { return clamp(abs(fract(x) - 0.5), 0.01, 0.49); }
vec2 tri2(vec2 p) { return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }
float triNoise2d(vec2 p, mat2 flowRotation) {
  float rz = 0.0;
  p *= uNoiseScale;
  p = p * rotateNoiseDomain(p.x * 0.06);
  vec2 bp = p;
  vec2 dg = tri2(bp * 1.85) * 0.75 * flowRotation;
  p -= dg * 0.4 * uNoiseTurbulence;
  p *= 1.21 + (rz - 1.0) * 0.02;
  rz += tri(p.x + tri(p.y)) * 0.756;
  p = p * mat2(-1.0, 0.0, 0.0, -1.0);
  dg = tri2(bp * 2.405) * 0.75 * flowRotation;
  p -= dg * 0.888888889 * uNoiseTurbulence;
  p *= 1.21 + (rz - 1.0) * 0.02;
  rz += tri(p.x + tri(p.y)) * 0.31752;
  p = p * mat2(0.757322769, -0.653040752, 0.653040752, 0.757322769);
  dg = tri2(bp * 3.1265) * 0.75 * flowRotation;
  p -= dg * 1.97530864 * uNoiseTurbulence;
  p *= 1.21 + (rz - 1.0) * 0.02;
  rz += tri(p.x + tri(p.y)) * 0.1333584;
  p = p * mat2(-0.147075554, 0.989125261, -0.989125261, -0.147075554);
  dg = tri2(bp * 4.06445) * 0.75 * flowRotation;
  p -= dg * 4.38957476 * uNoiseTurbulence;
  p *= 1.21 + (rz - 1.0) * 0.02;
  rz += tri(p.x + tri(p.y)) * 0.056010528;
  p = p * mat2(-0.534555438, -0.845133412, 0.845133412, -0.534555438);
  dg = tri2(bp * 5.283785) * 0.75 * flowRotation;
  p -= dg * 9.75461058 * uNoiseTurbulence;
  p *= 1.21 + (rz - 1.0) * 0.02;
  rz += tri(p.x + tri(p.y)) * 0.0235244218;
  return clamp(1.0 / pow(max(rz * 29.0, 0.0001), 1.3), 0.0, 0.55);
}
void main() {
  vec2 atlasUv = gl_FragCoord.xy / uResolution;
  vec2 worldPosition = uNoiseDomainMin + atlasUv * uNoiseDomainSize;
  mat2 flowRotation = mat2(uFlowRotation.x, uFlowRotation.y, -uFlowRotation.y, uFlowRotation.x);
  float density = triNoise2d(worldPosition, flowRotation);
  gl_FragColor = vec4(density, density, density, 1.0);
}
`;

function createAuroraIonosphereFieldShader(stepCount        )         {
  return `
precision highp float;
#define AURORA_STEPS ${stepCount}
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uGlow;
uniform float uIntro;
uniform float uIntroFeather;
uniform float uIntroStart;
uniform float uIntroEnd;
uniform sampler2D uLayerLut;
uniform float uLayerLutStep;
uniform sampler2D uNoiseAtlas;
uniform vec2 uNoiseDomainMin;
uniform vec2 uNoiseDomainInverseSize;
float hash21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 4.1414))) * 43758.5453); }
float decode16(vec2 encoded) { return dot(encoded, vec2(65280.0, 255.0)) / 65535.0; }
void sampleAuroraLayer(vec3 ro, vec3 rd, float inverseRayHeight, float pixelJitter,
  float planeHeight, float jitterAmount, vec3 spectralColor, float layerWeight,
  inout vec4 color, inout vec4 averageColor) {
  float planeDistance = (planeHeight - ro.y) * inverseRayHeight - pixelJitter * jitterAmount;
  vec3 position = ro + planeDistance * rd;
  vec2 noiseUv = (position.zx - uNoiseDomainMin) * uNoiseDomainInverseSize;
  float density = texture2D(uNoiseAtlas, noiseUv).r;
  vec4 layerColor = vec4(spectralColor * density, density);
  averageColor = mix(averageColor, layerColor, 0.5);
  color += averageColor * layerWeight;
}
vec4 aurora(vec3 ro, vec3 rd) {
  vec4 color = vec4(0.0);
  vec4 averageColor = vec4(0.0);
  float pixelJitter = 0.006 * hash21(gl_FragCoord.xy);
  float inverseRayHeight = 1.0 / (rd.y * 2.0 + 0.4);
  for (int index = 0; index < AURORA_STEPS; index++) {
    float lookupX = (float(index) + 0.5) * uLayerLutStep;
    vec4 spectralAndWeightHigh = texture2D(uLayerLut, vec2(lookupX, 0.25));
    vec4 geometryAndWeightLow = texture2D(uLayerLut, vec2(lookupX, 0.75));
    sampleAuroraLayer(ro, rd, inverseRayHeight, pixelJitter,
      decode16(geometryAndWeightLow.rg) * 1.6, geometryAndWeightLow.b,
      spectralAndWeightHigh.rgb,
      decode16(vec2(spectralAndWeightHigh.a, geometryAndWeightLow.a)) * 0.15,
      color, averageColor);
  }
  color *= clamp(rd.y * 15.0 + 0.4, 0.0, 1.0);
  color.rgb *= uIntensity * mix(0.55, 1.175, uGlow);
  color.a *= clamp(uIntensity, 0.0, 2.0);
  return color * 1.8;
}
void main() {
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  vec2 p = vec2(screenUv.x - 0.5, screenUv.y * 0.55 + 0.015);
  p.x *= uResolution.x / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, -6.7);
  vec3 rd = normalize(vec3(p, 1.3));
  float curtainProgress = smoothstep(0.06, 0.94, uIntro);
  float revealEdge = mix(uIntroStart, uIntroEnd, curtainProgress);
  float revealFeather = max(0.001, uIntroFeather);
  float curtainReveal = 1.0 - smoothstep(revealEdge - revealFeather, revealEdge + revealFeather, screenUv.y);
  curtainReveal = mix(curtainReveal, 1.0, smoothstep(0.92, 1.0, uIntro));
  float curtainIgnition = smoothstep(0.02, 0.22, uIntro);
  float horizonFade = smoothstep(0.0, 0.01, abs(rd.y)) * 0.1 + 0.9;
  vec4 field = smoothstep(vec4(0.0), vec4(1.5), aurora(ro, rd))
    * horizonFade * curtainReveal * curtainIgnition;
  gl_FragColor = field;
}
`;
}

const AURORA_IONOSPHERE_COMPOSITE_SHADER = `
precision highp float;
#define STAR_LAYERS 4
uniform vec2 uResolution;
uniform float uStarResolution;
uniform float uStarDensity;
uniform float uIntro;
uniform float uIntroSkyEnd;
uniform float uIntroStarStart;
uniform sampler2D uAuroraTexture;
uniform mat3 uAuroraColor;
uniform vec2 uAuroraUvScale;
uniform vec2 uAuroraUvOffset;
vec3 hash33(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p.zxy, p.yxz + 19.27);
  return fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
}
vec3 stars(vec3 p) {
  if (uStarDensity <= 0.0) return vec3(0.0);
  vec3 color = vec3(0.0);
  float densityScale = 1.51 * uStarDensity;
  vec3 starPoint = p * (0.15 * uStarResolution);
  for (int index = 0; index < STAR_LAYERS; index++) {
    float fi = float(index);
    vec3 q = fract(starPoint) - 0.5;
    vec3 id = floor(starPoint);
    vec2 random = hash33(id).xy;
    float star = 1.0 - smoothstep(0.0, 0.6, length(q));
    star *= step(random.x, (0.0005 + fi * fi * 0.001) * densityScale);
    vec3 tint = mix(vec3(1.0, 0.49, 0.1), vec3(0.75, 0.9, 1.0), random.y);
    color += star * (tint * 0.1 + 0.9);
    starPoint *= 1.3;
  }
  return color * color * 0.8;
}
vec3 sky(vec3 rd) {
  float sunDisk = dot(normalize(vec3(-0.5, -0.6, 0.9)), rd) * 0.5 + 0.5;
  float sunDisk2 = sunDisk * sunDisk;
  sunDisk = sunDisk2 * sunDisk2 * sunDisk;
  vec3 color = mix(vec3(0.05, 0.1, 0.2), vec3(0.1, 0.05, 0.2), rd.y * 0.5 + 0.5);
  color += sunDisk * vec3(1.0, 0.9, 0.7) * 0.63;
  return color * 0.63;
}
void main() {
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  vec2 p = vec2(screenUv.x - 0.5, screenUv.y * 0.55 + 0.015);
  p.x *= uResolution.x / uResolution.y;
  vec3 rd = normalize(vec3(p, 1.3));
  float horizonFade = smoothstep(0.0, 0.01, abs(rd.y)) * 0.1 + 0.9;
  float skyIntro = smoothstep(0.0, max(0.001, uIntroSkyEnd), uIntro);
  float starIntro = smoothstep(uIntroStarStart, min(1.0, uIntroStarStart + 0.56), uIntro);
  vec3 color = sky(rd) * horizonFade * skyIntro;
  vec4 field = texture2D(uAuroraTexture, uAuroraUvOffset + screenUv * uAuroraUvScale);
  color += stars(rd) * starIntro;
  color = color * (1.0 - field.a) + max(vec3(0.0), uAuroraColor * field.rgb);
  gl_FragColor = vec4(color, 1.0);
}
`;








function auroraIonosphereSmoothstep(edge0        , edge1        , value        )         {
  const amount = Math.min(1, Math.max(0, (value - edge0) / Math.max(0.000001, edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}

function auroraIonosphereWritePacked16(data            , highIndex        , lowIndex        , value        )       {
  const packed = Math.round(Math.min(1, Math.max(0, value)) * 65535);
  data[highIndex] = packed >> 8;
  data[lowIndex] = packed & 255;
}

function calculateAuroraIonosphereNoiseDomain(width        , height        , steps        )                              {
  const aspect = width / Math.max(1, height);
  const planeHeights = [0.8, 0.8 + Math.pow(steps - 1, 1.4) * 0.002];
  let minimumZ = Number.POSITIVE_INFINITY;
  let maximumZ = Number.NEGATIVE_INFINITY;
  let minimumX = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  for (let yIndex = 0; yIndex <= 16; yIndex += 1) {
    const pY = (yIndex / 16) * 0.55 + 0.015;
    for (let xIndex = 0; xIndex <= 16; xIndex += 1) {
      const pX = (xIndex / 16 - 0.5) * aspect;
      const length = Math.hypot(pX, pY, 1.3);
      const directionX = pX / length;
      const directionY = pY / length;
      const directionZ = 1.3 / length;
      const inverseRayHeight = 1 / (directionY * 2 + 0.4);
      for (const planeHeight of planeHeights) {
        for (const jitterDistance of [0, 0.006]) {
          const distance = planeHeight * inverseRayHeight - jitterDistance;
          const worldX = distance * directionX;
          const worldZ = -6.7 + distance * directionZ;
          minimumZ = Math.min(minimumZ, worldZ);
          maximumZ = Math.max(maximumZ, worldZ);
          minimumX = Math.min(minimumX, worldX);
          maximumX = Math.max(maximumX, worldX);
        }
      }
    }
  }
  const zPadding = Math.max(0.08, (maximumZ - minimumZ) * 0.035);
  const xPadding = Math.max(0.08, (maximumX - minimumX) * 0.035);
  return {
    minX: minimumZ - zPadding,
    minY: minimumX - xPadding,
    sizeX: maximumZ - minimumZ + zPadding * 2,
    sizeY: maximumX - minimumX + xPadding * 2,
  };
}

class AuroraIonosphereRenderer {
  #settings                                    ;
           #gl                       ;
           #host             ;
           #canvas                   ;
           #onError                            ;
  #noiseProgram               ;
  #fieldProgram               ;
  #compositeProgram               ;
  #buffer              ;
  #layerTexture               ;
  #noiseTexture               ;
  #fieldTexture               ;
  #noiseFramebuffer                   ;
  #fieldFramebuffer                   ;
  #noiseUniforms                                                                                                                              ;
  #fieldUniforms                                                                                                                                                                                                                      ;
  #compositeUniforms                                                                                                                                                                                           ;
  #animationFrame = 0;
  #running = true;
  #contextReady = true;
  #documentVisible = !document.hidden;
  #resizePending = true;
  #settingsDirty = true;
  #elapsed = 0;
  #introProgress = 0;
  #lastFrame = 0;
  #hostBounds         ;
  #rayTextureWidth = 1;
  #rayTextureHeight = 1;
  #rayWidth = 1;
  #rayHeight = 1;
  #atlasWidth = 1;
  #atlasHeight = 1;
  #starResolution = 1;
  #noiseDomain                             ;
  #adaptiveScale = 1;
  #sampleDuration = 0;
  #sampledFrames = 0;
           #uvScale = { x: 0, y: 0 };
           #uvOffset = { x: 0.5, y: 0.5 };
           #reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
           #resizeObserver                ;

  constructor(
    host             ,
    canvas                   ,
    settings                                    ,
    onError                            ,
  ) {
    this.#host = host;
    this.#canvas = canvas;
    this.#settings = normalizeAuroraIonosphereSettings(settings);
    this.#onError = onError;
    this.#hostBounds = host.getBoundingClientRect();
    this.#noiseDomain = calculateAuroraIonosphereNoiseDomain(1, 1, AURORA_IONOSPHERE_QUALITY[this.#settings.quality].steps);
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL is unavailable for Aurora Ionosphere Background");
    this.#gl = gl;
    this.#build();
    this.#resizeObserver = new ResizeObserver(() => {
      this.#hostBounds = this.#host.getBoundingClientRect();
      this.#resizePending = true;
      this.#schedule();
    });
    this.#resizeObserver.observe(host);
    document.addEventListener("visibilitychange", this.#onVisibilityChange);
    canvas.addEventListener("webglcontextlost", this.#onContextLost);
    canvas.addEventListener("webglcontextrestored", this.#onContextRestored);
    this.#reducedMotion.addEventListener("change", this.#onReducedMotionChange);
    this.#schedule();
  }

  setSettings(settings                                    )       {
    const next = normalizeAuroraIonosphereSettings(settings);
    if (next.quality !== this.#settings.quality) {
      this.#settings = next;
      this.#build();
      this.#adaptiveScale = 1;
      this.#resizePending = true;
    } else {
      this.#settings = next;
      this.#settingsDirty = true;
    }
    this.#schedule();
  }

  replay()       {
    this.#introProgress = 0;
    this.#elapsed = 0;
    this.#lastFrame = 0;
    this.#schedule();
  }

  dispose()       {
    if (!this.#running) return;
    this.#running = false;
    this.#stopLoop();
    this.#resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", this.#onVisibilityChange);
    this.#canvas.removeEventListener("webglcontextlost", this.#onContextLost);
    this.#canvas.removeEventListener("webglcontextrestored", this.#onContextRestored);
    this.#reducedMotion.removeEventListener("change", this.#onReducedMotionChange);
    this.#destroyGpuResources();
  }

  #compile(type        , source        )              {
    const shader = this.#gl.createShader(type);
    if (!shader) throw new Error("The Aurora Ionosphere shader could not be allocated");
    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);
    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      const message = this.#gl.getShaderInfoLog(shader) || "Aurora Ionosphere shader compilation failed";
      this.#gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  #link(fragmentSource        )               {
    const vertex = this.#compile(this.#gl.VERTEX_SHADER, AURORA_IONOSPHERE_VERTEX_SHADER);
    const fragment = this.#compile(this.#gl.FRAGMENT_SHADER, fragmentSource);
    const program = this.#gl.createProgram();
    if (!program) throw new Error("The Aurora Ionosphere shader program could not be allocated");
    this.#gl.attachShader(program, vertex);
    this.#gl.attachShader(program, fragment);
    this.#gl.linkProgram(program);
    this.#gl.deleteShader(vertex);
    this.#gl.deleteShader(fragment);
    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      const message = this.#gl.getProgramInfoLog(program) || "Aurora Ionosphere shader linking failed";
      this.#gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  #requiredUniform(program              , name        )                       {
    const location = this.#gl.getUniformLocation(program, name);
    if (location === null) throw new Error(`Missing Aurora Ionosphere shader uniform: ${name}`);
    return location;
  }

  #createTexture(unit        , filter        )               {
    const texture = this.#gl.createTexture();
    if (!texture) throw new Error("The Aurora Ionosphere texture could not be allocated");
    this.#gl.activeTexture(this.#gl.TEXTURE0 + unit);
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, filter);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, filter);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, 1, 1, 0, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, null);
    return texture;
  }

  #createFramebuffer(texture              )                   {
    const framebuffer = this.#gl.createFramebuffer();
    if (!framebuffer) throw new Error("The Aurora Ionosphere framebuffer could not be allocated");
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, framebuffer);
    this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.COLOR_ATTACHMENT0, this.#gl.TEXTURE_2D, texture, 0);
    if (this.#gl.checkFramebufferStatus(this.#gl.FRAMEBUFFER) !== this.#gl.FRAMEBUFFER_COMPLETE) throw new Error("Aurora framebuffer unavailable");
    return framebuffer;
  }

  #createLayerTexture(steps        )               {
    const data = new Uint8Array(steps * 2 * 4);
    for (let index = 0; index < steps; index += 1) {
      const phase = index * 0.043;
      const planeHeight = 0.8 + Math.pow(index, 1.4) * 0.002;
      const jitterAmount = auroraIonosphereSmoothstep(0, 15, index);
      const spectralColor = [-1.15, 1.5, -0.2].map((offset) => Math.sin(offset + phase) * 0.5 + 0.5);
      const layerWeight = Math.pow(2, -index * 0.065 - 2.5) * auroraIonosphereSmoothstep(0, 5, index);
      const spectralOffset = index * 4;
      const geometryOffset = (steps + index) * 4;
      data[spectralOffset] = Math.round((spectralColor[0] ?? 0) * 255);
      data[spectralOffset + 1] = Math.round((spectralColor[1] ?? 0) * 255);
      data[spectralOffset + 2] = Math.round((spectralColor[2] ?? 0) * 255);
      auroraIonosphereWritePacked16(data, geometryOffset, geometryOffset + 1, planeHeight / 1.6);
      data[geometryOffset + 2] = Math.round(jitterAmount * 255);
      auroraIonosphereWritePacked16(data, spectralOffset + 3, geometryOffset + 3, layerWeight / 0.15);
    }
    const texture = this.#createTexture(0, this.#gl.NEAREST);
    this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, steps, 2, 0, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, data);
    return texture;
  }

  #destroyGpuResources()       {
    if (this.#buffer) this.#gl.deleteBuffer(this.#buffer);
    if (this.#noiseProgram) this.#gl.deleteProgram(this.#noiseProgram);
    if (this.#fieldProgram) this.#gl.deleteProgram(this.#fieldProgram);
    if (this.#compositeProgram) this.#gl.deleteProgram(this.#compositeProgram);
    if (this.#layerTexture) this.#gl.deleteTexture(this.#layerTexture);
    if (this.#noiseTexture) this.#gl.deleteTexture(this.#noiseTexture);
    if (this.#fieldTexture) this.#gl.deleteTexture(this.#fieldTexture);
    if (this.#noiseFramebuffer) this.#gl.deleteFramebuffer(this.#noiseFramebuffer);
    if (this.#fieldFramebuffer) this.#gl.deleteFramebuffer(this.#fieldFramebuffer);
  }

  #build()       {
    this.#destroyGpuResources();
    this.#rayTextureWidth = 0; this.#rayTextureHeight = 0;
    this.#atlasWidth = 0; this.#atlasHeight = 0;
    const quality = AURORA_IONOSPHERE_QUALITY[this.#settings.quality];
    this.#noiseProgram = this.#link(AURORA_IONOSPHERE_NOISE_SHADER);
    this.#fieldProgram = this.#link(createAuroraIonosphereFieldShader(quality.steps));
    this.#compositeProgram = this.#link(AURORA_IONOSPHERE_COMPOSITE_SHADER);
    this.#buffer = this.#gl.createBuffer() ?? (() => { throw new Error("The Aurora Ionosphere geometry buffer could not be allocated"); })();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), this.#gl.STATIC_DRAW);
    for (const program of [this.#noiseProgram, this.#fieldProgram, this.#compositeProgram]) {
      this.#gl.useProgram(program);
      const position = this.#gl.getAttribLocation(program, "aPosition");
      if (position < 0) throw new Error("The Aurora Ionosphere position attribute is unavailable");
      this.#gl.enableVertexAttribArray(position);
      this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    }
    this.#layerTexture = this.#createLayerTexture(quality.steps);
    this.#noiseTexture = this.#createTexture(2, this.#gl.LINEAR);
    this.#noiseFramebuffer = this.#createFramebuffer(this.#noiseTexture);
    this.#fieldTexture = this.#createTexture(1, this.#gl.LINEAR);
    this.#fieldFramebuffer = this.#createFramebuffer(this.#fieldTexture);
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    this.#noiseUniforms = {
      resolution: this.#requiredUniform(this.#noiseProgram, "uResolution"),
      domainMin: this.#requiredUniform(this.#noiseProgram, "uNoiseDomainMin"),
      domainSize: this.#requiredUniform(this.#noiseProgram, "uNoiseDomainSize"),
      flowRotation: this.#requiredUniform(this.#noiseProgram, "uFlowRotation"),
      scale: this.#requiredUniform(this.#noiseProgram, "uNoiseScale"),
      turbulence: this.#requiredUniform(this.#noiseProgram, "uNoiseTurbulence"),
    };
    this.#fieldUniforms = {
      resolution: this.#requiredUniform(this.#fieldProgram, "uResolution"),
      intensity: this.#requiredUniform(this.#fieldProgram, "uIntensity"),
      glow: this.#requiredUniform(this.#fieldProgram, "uGlow"),
      intro: this.#requiredUniform(this.#fieldProgram, "uIntro"),
      introFeather: this.#requiredUniform(this.#fieldProgram, "uIntroFeather"),
      introStart: this.#requiredUniform(this.#fieldProgram, "uIntroStart"),
      introEnd: this.#requiredUniform(this.#fieldProgram, "uIntroEnd"),
      layerLut: this.#requiredUniform(this.#fieldProgram, "uLayerLut"),
      layerLutStep: this.#requiredUniform(this.#fieldProgram, "uLayerLutStep"),
      noiseAtlas: this.#requiredUniform(this.#fieldProgram, "uNoiseAtlas"),
      domainMin: this.#requiredUniform(this.#fieldProgram, "uNoiseDomainMin"),
      inverseDomainSize: this.#requiredUniform(this.#fieldProgram, "uNoiseDomainInverseSize"),
    };
    this.#compositeUniforms = {
      resolution: this.#requiredUniform(this.#compositeProgram, "uResolution"),
      starResolution: this.#requiredUniform(this.#compositeProgram, "uStarResolution"),
      starDensity: this.#requiredUniform(this.#compositeProgram, "uStarDensity"),
      intro: this.#requiredUniform(this.#compositeProgram, "uIntro"),
      introSkyEnd: this.#requiredUniform(this.#compositeProgram, "uIntroSkyEnd"),
      introStarStart: this.#requiredUniform(this.#compositeProgram, "uIntroStarStart"),
      fieldTexture: this.#requiredUniform(this.#compositeProgram, "uAuroraTexture"),
      color: this.#requiredUniform(this.#compositeProgram, "uAuroraColor"),
      uvScale: this.#requiredUniform(this.#compositeProgram, "uAuroraUvScale"),
      uvOffset: this.#requiredUniform(this.#compositeProgram, "uAuroraUvOffset"),
    };
    this.#gl.useProgram(this.#fieldProgram);
    this.#gl.uniform1i(this.#fieldUniforms.layerLut, 0);
    this.#gl.uniform1i(this.#fieldUniforms.noiseAtlas, 2);
    this.#gl.uniform1f(this.#fieldUniforms.layerLutStep, 1 / quality.steps);
    this.#gl.useProgram(this.#compositeProgram);
    this.#gl.uniform1i(this.#compositeUniforms.fieldTexture, 1);
    this.#settingsDirty = true;
    this.#resizePending = true;
    this.#onError(undefined);
  }

  #resize()       {
    this.#resizePending = false;
    const quality = AURORA_IONOSPHERE_QUALITY[this.#settings.quality];
    const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    const width = Math.max(1, Math.floor(this.#hostBounds.width * dpr));
    const height = Math.max(1, Math.floor(this.#hostBounds.height * dpr));
    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
    this.#starResolution = Math.max(1, width);
    const nextRayTextureWidth = Math.max(1, Math.floor(width * quality.rayScale));
    const nextRayTextureHeight = Math.max(1, Math.floor(height * quality.rayScale));
    if (nextRayTextureWidth !== this.#rayTextureWidth || nextRayTextureHeight !== this.#rayTextureHeight) {
      this.#rayTextureWidth = nextRayTextureWidth;
      this.#rayTextureHeight = nextRayTextureHeight;
      this.#gl.activeTexture(this.#gl.TEXTURE1);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#fieldTexture);
      this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#rayTextureWidth, this.#rayTextureHeight, 0, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, null);
    }
    this.#noiseDomain = calculateAuroraIonosphereNoiseDomain(width, height, quality.steps);
    const longestDomainEdge = Math.max(this.#noiseDomain.sizeX, this.#noiseDomain.sizeY);
    const atlasLongEdge = Math.min(quality.noiseAtlasSize, this.#gl.getParameter(this.#gl.MAX_TEXTURE_SIZE)          );
    const nextAtlasWidth = Math.max(256, Math.round(atlasLongEdge * this.#noiseDomain.sizeX / longestDomainEdge));
    const nextAtlasHeight = Math.max(256, Math.round(atlasLongEdge * this.#noiseDomain.sizeY / longestDomainEdge));
    if (nextAtlasWidth !== this.#atlasWidth || nextAtlasHeight !== this.#atlasHeight) {
      this.#atlasWidth = nextAtlasWidth;
      this.#atlasHeight = nextAtlasHeight;
      this.#gl.activeTexture(this.#gl.TEXTURE2);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#noiseTexture);
      this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#atlasWidth, this.#atlasHeight, 0, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, null);
    }
    this.#rayWidth = Math.max(1, Math.floor(this.#rayTextureWidth * this.#adaptiveScale));
    this.#rayHeight = Math.max(1, Math.floor(this.#rayTextureHeight * this.#adaptiveScale));
    this.#uvScale.x = Math.max(0, this.#rayWidth - 1) / this.#rayTextureWidth;
    this.#uvScale.y = Math.max(0, this.#rayHeight - 1) / this.#rayTextureHeight;
    this.#uvOffset.x = 0.5 / this.#rayTextureWidth;
    this.#uvOffset.y = 0.5 / this.#rayTextureHeight;
  }

  #stopLoop()       {
    if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = 0;
  }

  #schedule()       {
    if (!this.#animationFrame && this.#running && this.#contextReady && this.#documentVisible) {
      this.#animationFrame = requestAnimationFrame(this.#draw);
    }
  }

  #draw = (now        )       => {
    this.#animationFrame = 0;
    if (!this.#running || !this.#contextReady || !this.#documentVisible) return;
    if (!this.#settingsDirty && !this.#resizePending && this.#lastFrame && now - this.#lastFrame < 32) { this.#schedule(); return; }
    if (this.#resizePending) this.#resize();
    const settings = this.#settings;
    const reduced = this.#reducedMotion.matches;
    const delta = this.#lastFrame ? Math.min((now - this.#lastFrame) / 1000, 0.05) : 0;
    this.#lastFrame = now;
    if (!settings.paused) this.#elapsed += delta * settings.speed * (reduced ? 0.16 : 1);
    this.#introProgress = reduced
      ? 1
      : Math.min(1, this.#introProgress + delta / Math.max(0.1, settings.introDuration));

    if (!settings.paused && !reduced) {
      this.#sampleDuration += delta;
      this.#sampledFrames += 1;
      if (this.#sampledFrames >= 30) {
        const quality = AURORA_IONOSPHERE_QUALITY[settings.quality];
        const averageFrameTime = this.#sampleDuration / this.#sampledFrames;
        const previousScale = this.#adaptiveScale;
        if (averageFrameTime > 1 / 25) this.#adaptiveScale = Math.max(quality.minAdaptiveScale, this.#adaptiveScale - 0.04);
        else if (averageFrameTime < 1 / 29) this.#adaptiveScale = Math.min(1, this.#adaptiveScale + 0.02);
        this.#sampleDuration = 0;
        this.#sampledFrames = 0;
        if (this.#adaptiveScale !== previousScale) this.#resizePending = true;
      }
    }

    const intro = auroraIonosphereSmoothstep(0, 1, this.#introProgress);
    const flowAngle = this.#elapsed * 0.06;
    const gl = this.#gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#noiseFramebuffer);
    gl.viewport(0, 0, this.#atlasWidth, this.#atlasHeight);
    gl.useProgram(this.#noiseProgram);
    gl.uniform2f(this.#noiseUniforms.resolution, this.#atlasWidth, this.#atlasHeight);
    gl.uniform2f(this.#noiseUniforms.domainMin, this.#noiseDomain.minX, this.#noiseDomain.minY);
    gl.uniform2f(this.#noiseUniforms.domainSize, this.#noiseDomain.sizeX, this.#noiseDomain.sizeY);
    gl.uniform2f(this.#noiseUniforms.flowRotation, Math.cos(flowAngle), Math.sin(flowAngle));
    if (this.#settingsDirty) {
      gl.uniform1f(this.#noiseUniforms.scale, 0.6 + 0.8 * settings.curtainScale);
      gl.uniform1f(this.#noiseUniforms.turbulence, 0.3 + 1.2 * settings.turbulence);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fieldFramebuffer);
    gl.viewport(0, 0, this.#rayWidth, this.#rayHeight);
    gl.useProgram(this.#fieldProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.#layerTexture);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.#noiseTexture);
    gl.uniform2f(this.#fieldUniforms.resolution, this.#rayWidth, this.#rayHeight);
    gl.uniform2f(this.#fieldUniforms.domainMin, this.#noiseDomain.minX, this.#noiseDomain.minY);
    gl.uniform2f(this.#fieldUniforms.inverseDomainSize, 1 / this.#noiseDomain.sizeX, 1 / this.#noiseDomain.sizeY);
    gl.uniform1f(this.#fieldUniforms.intro, intro);
    if (this.#settingsDirty) {
      gl.uniform1f(this.#fieldUniforms.intensity, settings.intensity);
      gl.uniform1f(this.#fieldUniforms.glow, settings.glow);
      gl.uniform1f(this.#fieldUniforms.introFeather, settings.introFeather);
      gl.uniform1f(this.#fieldUniforms.introStart, settings.introStart);
      gl.uniform1f(this.#fieldUniforms.introEnd, settings.introEnd);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    gl.useProgram(this.#compositeProgram);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.#fieldTexture);
    gl.uniform2f(this.#compositeUniforms.resolution, this.#canvas.width, this.#canvas.height);
    gl.uniform1f(this.#compositeUniforms.starResolution, this.#starResolution);
    gl.uniform1f(this.#compositeUniforms.intro, intro);
    gl.uniform2f(this.#compositeUniforms.uvScale, this.#uvScale.x, this.#uvScale.y);
    gl.uniform2f(this.#compositeUniforms.uvOffset, this.#uvOffset.x, this.#uvOffset.y);
    if (this.#settingsDirty) {
      gl.uniform1f(this.#compositeUniforms.starDensity, settings.starDensity);
      // Rotate around the neutral RGB axis; compute only when settings change.
      const angle = settings.hue * Math.PI / 180;
      const c = Math.cos(angle) * settings.saturation;
      const t = (1 - c) / 3;
      const k = Math.sin(angle) * settings.saturation / Math.sqrt(3);
      gl.uniformMatrix3fv(this.#compositeUniforms.color, false, new Float32Array([
        c+t, t+k, t-k, t-k, c+t, t+k, t+k, t-k, c+t,
      ]));
      gl.uniform1f(this.#compositeUniforms.introSkyEnd, settings.introSkyEnd);
      gl.uniform1f(this.#compositeUniforms.introStarStart, settings.introStarStart);
      this.#settingsDirty = false;
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!settings.paused || this.#introProgress < 1) this.#schedule();
    else this.#lastFrame = 0;
  };

  #onVisibilityChange = ()       => {
    this.#documentVisible = !document.hidden;
    this.#lastFrame = 0;
    if (this.#documentVisible) this.#schedule();
    else this.#stopLoop();
  };

  #onContextLost = (event       )       => {
    event.preventDefault();
    this.#contextReady = false;
    this.#stopLoop();
    this.#onError("The Aurora Ionosphere graphics context was lost; waiting for recovery.");
  };

  #onContextRestored = ()       => {
    try {
      // Handles from the lost WebGL generation must never be deleted on the new context.
      this.#buffer = undefined ;
      this.#noiseProgram = undefined ; this.#fieldProgram = undefined ; this.#compositeProgram = undefined ;
      this.#layerTexture = undefined ; this.#noiseTexture = undefined ; this.#fieldTexture = undefined ;
      this.#noiseFramebuffer = undefined ; this.#fieldFramebuffer = undefined ;
      this.#contextReady = true;
      this.#build();
      this.#adaptiveScale = 1;
      this.#lastFrame = 0;
      this.#schedule();
    } catch (error) {
      this.#contextReady = false;
      this.#onError(error instanceof Error ? error.message : "The Aurora Ionosphere graphics context could not be restored");
    }
  };

  #onReducedMotionChange = ()       => {
    this.#settingsDirty = true;
    this.#lastFrame = 0;
    this.#schedule();
  };
}
