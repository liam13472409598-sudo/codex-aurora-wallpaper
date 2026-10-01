(()=>{if(window.__codexAurora)return;
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

function auroraAdapterStyles(host) {
 const base=`
html[data-codex-aurora] {background:#070e18!important;color-scheme:dark;}
html[data-codex-aurora] body {background:transparent!important;isolation:isolate;}
`;
 if(host==='antigravity') return base+`
html[data-codex-aurora] #root {position:relative;z-index:0;background:transparent!important;}
html[data-codex-aurora] #root .bg-background {background:transparent!important;}
html[data-codex-aurora] #root .bg-sidebar {background:rgba(7,15,25,.38)!important;}
html[data-codex-aurora] #root :is(.bg-card,.bg-popover,.bg-input) {background:rgba(10,22,34,var(--aurora-glass,.72))!important;}
html[data-codex-aurora] :is([role=dialog],[role=menu],[role=listbox],[data-radix-popper-content-wrapper]) {background:#102030!important;}
`;
 if(host==='cursor') return base+`
html[data-codex-aurora] body > div:has(.monaco-workbench) {background:transparent!important;}
html[data-codex-aurora] :is(.monaco-workbench,.workspace-container,.workspaces-container,.agent-panel) {
 background:transparent!important;
 --vscode-editor-background:transparent!important;
 --vscode-sideBar-background:rgba(7,15,25,.36)!important;
 --vscode-panel-background:rgba(7,15,25,.34)!important;
 --vscode-activityBar-background:rgba(7,15,25,.48)!important;
 --vscode-editorGroupHeader-tabsBackground:rgba(7,15,25,.36)!important;
 --vscode-titleBar-activeBackground:rgba(7,15,25,.48)!important;
 --vscode-statusBar-background:rgba(7,15,25,.7)!important;
 --vscode-quickInput-background:#102030!important;
 --vscode-menu-background:#102030!important;
 --vscode-input-background:rgba(10,22,34,var(--aurora-glass,.72))!important;
 --vscode-editorWidget-background:rgba(10,22,34,.96)!important;
 --vscode-terminal-background:transparent!important;
}
html[data-codex-aurora] :is(.monaco-editor,.monaco-editor .margin,.monaco-editor-background,.monaco-editor .overflow-guard,.editor-instance,.editor-container,.editor-group-container) {background:transparent!important;}
html[data-codex-aurora] :is(.part.sidebar,.part.auxiliarybar,.part.panel,.agent-panel) {background:rgba(7,15,25,.28)!important;}
html[data-codex-aurora] :is(.interactive-input-part,.composer-container) {background:rgba(10,22,34,var(--aurora-glass,.72))!important;}
html[data-codex-aurora] .xterm-screen {mix-blend-mode:screen;}
html[data-codex-aurora] :is(.quick-input-widget,.context-view .monaco-menu-container,.monaco-dialog-box,.monaco-hover,.suggest-widget) {background:#102030!important;}
`;
 if(host==='claude-terminal') return base+`
html[data-codex-aurora] #terminal-root {background:transparent!important;}
html[data-codex-aurora] .terminal-card {background:rgba(6,14,24,var(--aurora-glass,.72))!important;}
html[data-codex-aurora] .xterm-viewport {background:transparent!important;}
`;
 throw new Error('Unsupported aurora host: '+host);
}

// Static UI template; materialized with DOM APIs (no HTML injection sinks).
const AURORA_PANEL_TEMPLATE = [
  {
    "tag": "style",
    "attrs": {},
    "children": [
      "\n:host{font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif;color:#e6f5f0;font-size:13px;color-scheme:dark;line-height:1.45}\n*{box-sizing:border-box}button,input,select{font:inherit}button,select{cursor:pointer}button{color:inherit}\n.toggle{position:absolute;right:18px;top:82px;pointer-events:auto;border:1px solid #72e8cd55;background:#10251eeb;color:#befbe8;border-radius:20px;padding:8px 13px;box-shadow:0 4px 18px #0005;font-size:12px;}\n.panel{position:absolute;right:18px;top:126px;bottom:24px;width:min(346px,calc(100vw - 36px));max-height:760px;background:#0b171fed;border:1px solid #aecfc126;border-radius:20px;box-shadow:0 20px 60px #0007;backdrop-filter:blur(24px);pointer-events:auto;display:flex;flex-direction:column;overflow:hidden}\n[hidden]{display:none!important}header{padding:20px 22px 14px;border-bottom:1px solid #ffffff12}.eyebrow{color:#72dcc0;font-size:10px;letter-spacing:3px}h2{font-size:21px;font-weight:550;letter-spacing:1px;margin:5px 0}header p{color:#8199a7;font-size:11px;margin:0}.close{float:right;border:0;background:none;font-size:23px;color:#99b3c0;padding:0 2px}.content{padding:16px 22px;overflow-y:auto;scrollbar-width:thin}.presets{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:18px}button.preset,footer button,.actions button{border:1px solid #ffffff19;background:#ffffff06;border-radius:8px;padding:8px;font-size:12px}button:hover{background:#63e5be22;border-color:#63e5be88}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #80e9ce;outline-offset:3px}\nh3{font-weight:500;color:#809aa8;font-size:11px;letter-spacing:2px;margin:20px 0 12px}.row{margin-bottom:15px}.rowline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.value{display:flex;align-items:center;color:#6be6c6;font-size:11px;gap:3px}.num{width:57px;color:#8feace;background:#ffffff06;border:1px solid transparent;border-radius:4px;text-align:right;font-variant-numeric:tabular-nums;padding:3px;appearance:textfield}.num::-webkit-inner-spin-button{appearance:none}input[type=range]{display:block;width:100%;height:4px;margin:8px 0 2px;accent-color:#71dfc2;cursor:pointer}select{background:#17302f;border:1px solid #78dcb344;color:#c1eee0;padding:7px;border-radius:7px}input[type=checkbox]{accent-color:#70e0bf}.actions{display:flex;gap:8px;margin-top:14px}.actions>*{flex:1}summary{cursor:pointer;color:#9db4c0;font-size:12px;margin:20px 0 15px}.status{color:#7998a5;font-size:11px;margin-top:12px;min-height:16px}.error{color:#f4b9a0}footer{padding:13px 22px;border-top:1px solid #ffffff12;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#688391}footer a{color:#7fa89e;text-decoration:none}.import{display:none}\n"
    ]
  },
  {
    "tag": "button",
    "attrs": {
      "class": "toggle",
      "aria-expanded": "false",
      "aria-label": "打开极光壁纸设置"
    },
    "children": [
      "✦ 极光"
    ]
  },
  "\n",
  {
    "tag": "section",
    "attrs": {
      "class": "panel",
      "hidden": "",
      "aria-label": "极光壁纸设置"
    },
    "children": [
      {
        "tag": "header",
        "attrs": {},
        "children": [
          {
            "tag": "button",
            "attrs": {
              "class": "close",
              "aria-label": "关闭设置"
            },
            "children": [
              "×"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "class": "eyebrow"
            },
            "children": [
              "AURORA / LIVE WALLPAPER"
            ]
          },
          {
            "tag": "h2",
            "attrs": {},
            "children": [
              "极光电离层"
            ]
          },
          {
            "tag": "p",
            "attrs": {},
            "children": [
              "实时渲染 · 所有调整自动保存"
            ]
          }
        ]
      },
      {
        "tag": "div",
        "attrs": {
          "class": "content"
        },
        "children": [
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "presets"
            },
            "children": []
          },
          {
            "tag": "div",
            "attrs": {
              "class": "rowline"
            },
            "children": [
              {
                "tag": "label",
                "attrs": {
                  "for": "enabled"
                },
                "children": [
                  "动态壁纸"
                ]
              },
              {
                "tag": "input",
                "attrs": {
                  "id": "enabled",
                  "type": "checkbox"
                },
                "children": []
              }
            ]
          },
          "\n",
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "渲染与播放"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "class": "rowline"
            },
            "children": [
              {
                "tag": "label",
                "attrs": {
                  "for": "quality"
                },
                "children": [
                  "渲染质量"
                ]
              },
              {
                "tag": "select",
                "attrs": {
                  "id": "quality"
                },
                "children": [
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "low"
                    },
                    "children": [
                      "轻量 · 32 层"
                    ]
                  },
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "medium"
                    },
                    "children": [
                      "均衡 · 50 层"
                    ]
                  },
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "high"
                    },
                    "children": [
                      "精细 · 72 层"
                    ]
                  }
                ]
              }
            ]
          },
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "actions"
            },
            "children": [
              {
                "tag": "button",
                "attrs": {
                  "id": "pause"
                },
                "children": [
                  "暂停"
                ]
              },
              {
                "tag": "button",
                "attrs": {
                  "id": "replay"
                },
                "children": [
                  "重播开场"
                ]
              }
            ]
          },
          "\n",
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "光幕与色彩"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "id": "field"
            },
            "children": []
          },
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "阅读舒适度"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "id": "reading"
            },
            "children": []
          },
          {
            "tag": "details",
            "attrs": {},
            "children": [
              {
                "tag": "summary",
                "attrs": {},
                "children": [
                  "开场动画参数"
                ]
              },
              {
                "tag": "div",
                "attrs": {
                  "id": "intro"
                },
                "children": []
              }
            ]
          },
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "actions"
            },
            "children": [
              {
                "tag": "button",
                "attrs": {
                  "id": "export"
                },
                "children": [
                  "导出参数"
                ]
              },
              {
                "tag": "button",
                "attrs": {
                  "id": "import"
                },
                "children": [
                  "导入参数"
                ]
              }
            ]
          },
          {
            "tag": "input",
            "attrs": {
              "class": "import",
              "type": "file",
              "accept": "application/json,.json"
            },
            "children": []
          },
          {
            "tag": "div",
            "attrs": {
              "class": "status",
              "role": "status"
            },
            "children": [
              "本地渲染 · 最高 30 FPS · 隐藏时暂停"
            ]
          },
          "\n"
        ]
      },
      {
        "tag": "footer",
        "attrs": {},
        "children": [
          {
            "tag": "span",
            "attrs": {},
            "children": [
              {
                "tag": "a",
                "attrs": {
                  "href": "https://www.shadertoy.com/view/XtGGRt",
                  "target": "_blank",
                  "rel": "noreferrer"
                },
                "children": [
                  "Auroras / nimitz"
                ]
              }
            ]
          },
          {
            "tag": "button",
            "attrs": {
              "id": "reset"
            },
            "children": [
              "恢复默认参数"
            ]
          }
        ]
      }
    ]
  }
];

const HOST = window.__auroraHostConfig?.id || 'codex';
const KEY = HOST === 'codex' ? 'codex-aurora-wallpaper:v1' : HOST + '-aurora-wallpaper:v1';
const fields = [
 ['speed','漂移速度',0,3,.01,'×'],['intensity','极光强度',0,3,.01,'×'],
 ['curtainScale','光幕密度',.05,2,.01,''],['turbulence','湍流扰动',0,1.8,.01,''],
 ['glow','离子辉光',0,2.4,.01,''],['starDensity','星尘数量',0,1.5,.01,''],
 ['hue','极光色相',-180,180,1,'°'],['saturation','色彩饱和度',0,2,.01,'×'],
 ['opacity','壁纸透明度',0,1,.01,''],['shade','阅读遮罩',0,.9,.01,''],
 ['glass','面板不透明度',.1,.95,.01,''],['introDuration','开场时长',.6,6,.05,'秒'],
 ['introFeather','开场羽化',.03,.4,.01,''],['introStart','光幕起点',-.5,.25,.01,''],
 ['introEnd','光幕终点',.8,1.8,.01,''],['introSkyEnd','天空显现',.1,.9,.01,''],
 ['introStarStart','星尘延迟',0,.8,.01,'']
];
const defaults = {...DEFAULT_AURORA_IONOSPHERE_BACKGROUND_SETTINGS, opacity:.88, shade:.27, glass:.72, enabled:true};
const presets = {
 '默认': {...defaults,speed:3,intensity:1.43,curtainScale:2,turbulence:1.65,glow:1.4,starDensity:0,introDuration:4.95,introFeather:.4,introStart:.25,introEnd:1.8,shade:.16},
 '静谧工作': {...defaults,speed:.38,intensity:.85,starDensity:.3,shade:.46},
 '翡翠光幕': {...defaults,speed:.9,intensity:1.35,curtainScale:.8,glow:1.1,shade:.18},
 '紫色星海': {...defaults,hue:95,saturation:1.2,starDensity:1.2,intensity:1.15,shade:.2}
};
function normalize(raw) {
 const x = {...defaults,...normalizeAuroraIonosphereSettings(raw)};
 for (const [key,,min,max] of fields) if (['opacity','shade','glass'].includes(key)) x[key] = clampParticleNumber(raw?.[key],min,max,defaults[key]);
 x.enabled = typeof raw?.enabled === 'boolean' ? raw.enabled : true;
 return x;
}
let settings; try {settings=normalize(JSON.parse(localStorage.getItem(KEY)||'{}'));} catch {settings={...defaults};}
if (window.__auroraHostConfig?.settings) settings=normalize(window.__auroraHostConfig.settings);
const root = document.documentElement;
const layer = document.createElement('div'); layer.id='codex-aurora-layer'; layer.setAttribute('aria-hidden','true');
layer.style.cssText='position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#070e18;';
const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;display:block;';
const shade=document.createElement('div');shade.style.cssText='position:absolute;inset:0;background:#040b16;pointer-events:none;';
layer.append(canvas,shade);
const theme=document.createElement('style');theme.id='codex-aurora-style';
theme.textContent=`
html[data-codex-aurora] {background:#070e18!important;color-scheme:dark;}
html[data-codex-aurora] body {background:transparent!important;isolation:isolate;}
html[data-codex-aurora] #root {position:relative;z-index:1;background:transparent!important;}
html[data-codex-aurora],html[data-codex-aurora] #root,html[data-codex-aurora] #root [data-theme] {
 --lightningcss-light:initial;--lightningcss-dark: ;
 --app-color-background-surface:rgba(7,15,25,.23)!important;
 --app-color-background-surface-under:transparent!important;
 --app-color-background-elevated-primary:rgba(8,19,30,var(--aurora-glass,.72))!important;
 --app-color-background-elevated-primary-opaque:#102130!important;
 --app-color-background-elevated-secondary:rgba(11,24,37,.85)!important;
 --app-color-background-elevated-secondary-opaque:#132334!important;
 --app-color-background-card:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --app-color-background-control:rgba(15,30,43,.85)!important;
 --app-color-background-editor-opaque:#0b1725!important;
 --app-color-background-application-menu:#101f2e!important;
 --color-token-main-surface-primary:rgba(7,15,25,.23)!important;
 --color-token-side-bar-background:rgba(6,14,24,.5)!important;
 --app-shell-panel-background:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --color-text-emphasis:#e8f2f4!important;--color-text-primary:#e8f2f4!important;
 --color-text-secondary:#a9bbc7!important;--color-text-tertiary:#91a4b3!important;
 --color-token-foreground:#e8f2f4!important;
 --color-background-composer-primary:rgba(9,20,32,var(--aurora-glass,.72))!important;
 --composer-layout-surface-background:rgba(9,20,32,var(--aurora-glass,.72))!important;
}
html[data-codex-aurora] #root :is([role=dialog],[role=menu],[role=listbox]) {background:#102030!important;}
`;
if (HOST !== 'codex') { theme.textContent = auroraAdapterStyles(HOST); layer.style.zIndex = '-1'; }
const panelHost=document.createElement('div');panelHost.id='codex-aurora-controls';
panelHost.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483600;';
const shadow=panelHost.attachShadow({mode:'open'});
function materialize(nodes){return nodes.map(n=>{if(typeof n==='string')return document.createTextNode(n);const el=document.createElement(n.tag);for(const [key,value]of Object.entries(n.attrs||{}))el.setAttribute(key,value);el.append(...materialize(n.children||[]));return el;});}
shadow.append(...materialize(AURORA_PANEL_TEMPLATE));
let renderer=null, error=null, disposed=false, saveTimer;
const originalAttr=root.getAttribute('data-codex-aurora');
const originalHost=root.getAttribute('data-aurora-host');
const oldGlass=root.style.getPropertyValue('--aurora-glass');
const oldGlassPriority=root.style.getPropertyPriority('--aurora-glass');
const $=s=>shadow.querySelector(s);
function status(message,bad=false){$('.status').textContent=message;$('.status').classList.toggle('error',bad);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{status('设置无法保存：本地存储不可用',true);}window.dispatchEvent(new CustomEvent('aurora-settings-changed',{detail:{host:HOST,settings:{...settings}}}));}
function apply(){
 if(disposed)return;
 if(settings.enabled){
  root.setAttribute('data-codex-aurora','');root.setAttribute('data-aurora-host',HOST);root.style.setProperty('--aurora-glass',String(settings.glass));
  if(!layer.isConnected)document.body.prepend(layer);
  if(!theme.isConnected)document.head.append(theme);
  canvas.style.opacity=String(settings.opacity);shade.style.opacity=String(settings.shade);
  if(!renderer){try{renderer=new AuroraIonosphereRenderer(layer,canvas,settings,msg=>{error=msg;status(msg?'图形状态：'+msg:'本地渲染 · 最高 30 FPS · 隐藏时暂停',!!msg);});}catch(e){error=e.message;settings.enabled=false;status('无法启动极光：'+e.message,true);apply();return;}}
  else renderer.setSettings(settings);
 }else{
  renderer?.dispose();renderer=null;layer.remove();theme.remove();
  if(originalAttr===null)root.removeAttribute('data-codex-aurora');else root.setAttribute('data-codex-aurora',originalAttr);
  if(originalHost===null)root.removeAttribute('data-aurora-host');else root.setAttribute('data-aurora-host',originalHost);
  if(oldGlass)root.style.setProperty('--aurora-glass',oldGlass,oldGlassPriority);else root.style.removeProperty('--aurora-glass');
 }
 $('#enabled').checked=settings.enabled;$('#pause').textContent=settings.paused?'继续动画':'暂停动画';
 clearTimeout(saveTimer);saveTimer=setTimeout(persist,160);
}
function sync(){for(const [key] of fields){shadow.querySelectorAll(`[data-key="${key}"]`).forEach(el=>el.value=settings[key]);}$('#quality').value=settings.quality;apply();}
for(const [name,value]of Object.entries(presets)){const b=document.createElement('button');b.className='preset';b.textContent=name;b.onclick=()=>{settings={...value};sync();renderer?.replay();};$('.presets').append(b);}
for(const [key,label,min,max,step,unit]of fields){
 const box=document.createElement('div');box.className='row';
 const line=document.createElement('div');line.className='rowline';
 const caption=document.createElement('label');caption.htmlFor='range-'+key;caption.textContent=label;
 const value=document.createElement('span');value.className='value';
 const number=document.createElement('input');number.className='num';number.type='number';number.setAttribute('aria-label',label+'数值');
 const units=document.createElement('span');units.textContent=unit;
 const range=document.createElement('input');range.type='range';range.id='range-'+key;range.setAttribute('aria-label',label);
 for(const input of [number,range]){input.min=min;input.max=max;input.step=step;input.dataset.key=key;}
 value.append(number,units);line.append(caption,value);box.append(line,range);
 $(key.startsWith('intro')?'#intro':['opacity','shade','glass'].includes(key)?'#reading':'#field').append(box);
 box.querySelectorAll('input').forEach(input=>input.addEventListener(input.type==='range'?'input':'change',()=>{const v=input.valueAsNumber;if(Number.isFinite(v)){settings[key]=Math.min(max,Math.max(min,v));sync();}}));
}
function show(on){$('.panel').hidden=!on;$('.toggle').setAttribute('aria-expanded',String(on));if(on)$('.close').focus();else $('.toggle').focus();}
$('.toggle').onclick=()=>show($('.panel').hidden);$('.close').onclick=()=>show(false);
shadow.addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
$('#enabled').onchange=e=>{settings.enabled=e.target.checked;apply();};
$('#quality').onchange=e=>{settings.quality=e.target.value;apply();};
$('#pause').onclick=()=>{settings.paused=!settings.paused;apply();};$('#replay').onclick=()=>renderer?.replay();
$('#reset').onclick=()=>{settings={...defaults};sync();renderer?.replay();};
$('#export').onclick=()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify({format:'codex-aurora-v1',settings},null,2)],{type:'application/json'}));a.href=url;a.download='极光壁纸参数.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
$('#import').onclick=()=>$('.import').click();$('.import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error('文件过大');const v=JSON.parse(await f.text());if(v.format!=='codex-aurora-v1'||!isObjectRecord(v.settings))throw Error('不是有效的极光参数文件');settings=normalize(v.settings);sync();status('参数已导入并保存');}catch(e){status('导入失败：'+e.message,true);}finally{$('.import').value='';}};
function storage(e){if(e.key===KEY){try{settings=normalize(JSON.parse(e.newValue||'{}'));sync();}catch{}}}
window.addEventListener('storage',storage);
document.body.append(panelHost);
window.__codexAurora={version:'1.2.0',host:HOST,getSettings:()=>({...settings}),getStatus:()=>({enabled:settings.enabled,error,canvas:[canvas.width,canvas.height],renderer:!!renderer}),setSettings:v=>{settings=normalize({...settings,...v});sync();},show:()=>show(true),dispose:()=>{if(disposed)return;settings.enabled=false;apply();clearTimeout(saveTimer);persist();disposed=true;window.removeEventListener('storage',storage);panelHost.remove();delete window.__codexAurora;}};
sync();

})();