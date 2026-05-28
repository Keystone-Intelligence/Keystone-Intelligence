/* ============================================================
   KEYSTONE · HERO SHADER
   ------------------------------------------------------------
   Renders a slow gold-tinted aurora into <canvas class="hero__shader">.
   Brand-aligned: dark base, low-contrast gold drift, no fast motion.

   Pauses when:
     - the tab is hidden (Page Visibility API)
     - the hero scrolls out of view (IntersectionObserver)
     - the user prefers reduced motion (script exits before init)

   No dependencies. Vanilla WebGL 1.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.querySelector('.hero__shader');
  if (!canvas) return;

  // Respect reduced-motion: keep the static .hero::before radial only.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false })
        || canvas.getContext('experimental-webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return; // No WebGL — static radial fallback shows through.

  /* ── SHADERS ── */
  var VERT_SRC = [
    'attribute vec2 a_position;',
    'void main() {',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  /* Fragment shader: Synthesis-style horizon sweep with heavy film grain.
     The grain is the signature element — it gives the painterly/printed
     texture seen in the reference. Without it, the gradient looks like
     CSS. The grain is static (per-pixel hash, no time term) so it reads
     as fixed surface texture; the colour field morphs underneath via a
     slowly-warped horizon line.

     The dark page bg is painted INSIDE the shader so grain can darken
     pixels below the page bg level — that's what produces the speckled
     "noisy dark" look in the reference. Canvas alpha is therefore 1.0
     across the whole hero. */
  var FRAG_SRC = [
    'precision highp float;',
    'uniform float u_time;',
    'uniform vec2  u_resolution;',

    // Simplex 2D noise — Ian McEwan / Stefan Gustavson, public domain.
    'vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }',
    'float snoise(vec2 v){',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439,',
    '                      -0.577350269189626, 0.024390243902439);',
    '  vec2 i  = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz;',
    '  x12.xy -= i1;',
    '  i = mod(i, 289.0);',
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))',
    '                          + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),',
    '                          dot(x12.zw,x12.zw)), 0.0);',
    '  m = m*m; m = m*m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
    '  vec3 g;',
    '  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
    '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',

    // Cheap per-pixel pseudo-random for film grain.
    'float hash21(vec2 p) {',
    '  p = fract(p * vec2(234.34, 435.345));',
    '  p += dot(p, p + 34.23);',
    '  return fract(p.x * p.y);',
    '}',

    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
    '  float aspect = u_resolution.x / u_resolution.y;',
    '  float t = u_time * 0.08;',

    // Brand palette.
    '  vec3 cDark   = vec3(0.047, 0.047, 0.071);', // #0C0C12  page bg
    '  vec3 cBrand  = vec3(0.769, 0.604, 0.235);', // #C49A3C
    '  vec3 cHot    = vec3(0.980, 0.820, 0.480);', // hot gold peak (just inside the band)
    '  vec3 cAmber  = vec3(0.541, 0.353, 0.122);', // deeper amber
    '  vec3 cEmber  = vec3(0.380, 0.180, 0.070);', // copper / ember

    // Horizon line drifts via low-frequency noise + a slow sine.
    // Living in uv space, y=0 is bottom of hero, y=1 is top.
    // Positioned LOW (0.14) so it sits at the bottom of the hero,
    // below all text content — clean strip, no legibility hit.
    '  float warp = snoise(vec2(uv.x * 1.6, t * 0.5)) * 0.05;',
    '  float horizonY = 0.14 + warp + 0.025 * sin(uv.x * 3.3 + t * 1.2);',
    '  float d = uv.y - horizonY;',                    // signed distance from horizon

    // Bright horizon strip — narrow gaussian peak centred on the line.
    '  float strip = exp(-d * d * 320.0);',
    '  vec3 stripCol = mix(cBrand, cHot, smoothstep(0.5, 1.0, strip)) * strip * 1.05;',

    // Wash above horizon — kept short so it doesn’t bleed into body text.
    // Brand gold fades into amber quickly, then into ember, then pure dark.
    '  float aboveT = smoothstep(0.0, 0.35, d);',
    '  vec3 above   = mix(cBrand * 0.40, cAmber * 0.20, aboveT);',
    '  float aboveMask = smoothstep(0.0, 0.08, d) * (1.0 - smoothstep(0.30, 0.55, d));',
    '  vec3 aboveCol  = above * aboveMask;',

    // Faint ember bloom below the horizon.
    '  float belowT = smoothstep(0.0, 0.14, -d);',
    '  float belowMask = (1.0 - smoothstep(0.14, 0.20, -d));',
    '  vec3 belowCol  = cEmber * belowT * belowMask * 0.45;',

    // Combine lit areas with the dark base.
    '  vec3 col = cDark + stripCol + aboveCol + belowCol;',

    // Right-side weighting — strip is brightest on the right (under the
    // panel), dims toward the left (under the headline + CTAs).
    '  float side = smoothstep(0.0, 1.0, uv.x);',
    '  col = mix(cDark + (col - cDark) * 0.65, col, side);',

    // Heavy static grain — the signature texture. ~14% luminance range.
    '  float g = hash21(gl_FragCoord.xy) - 0.5;',
    '  col += vec3(g) * 0.075;',

    // Subtle low-frequency noise on top of grain to vary local brightness
    // (creates the "cloud" effect inside the bright zone).
    '  float n2 = snoise(uv * 4.0 + vec2(t * 0.5, -t * 0.4)) * 0.5 + 0.5;',
    '  col *= mix(0.92, 1.08, n2);',

    // Soft top + bottom vignette so the canvas blends with the hero pad.
    '  float vTop = smoothstep(0.0, 0.06, 1.0 - uv.y);',
    '  float vBot = smoothstep(0.0, 0.04, uv.y);',
    '  col = mix(cDark, col, vTop * vBot);',

    // Clamp negative grain back to dark base — no values below pure bg.
    '  col = max(col, cDark * 0.6);',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      // Surface compile errors to console so they’re catchable.
      console.error('Hero shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT_SRC);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return;

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Hero shader link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Fullscreen quad as two triangles in clip space.
  var quad = new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1
  ]);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  var aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(program, 'u_time');
  var uRes  = gl.getUniformLocation(program, 'u_resolution');

  // Additive blending so the shader layers on top of the dark bg.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ── SIZING ── */
  // Cap DPR at 1.5 — the effect is low-frequency so anything higher just
  // burns GPU time without visible benefit on a 60Hz display.
  var DPR_CAP = 1.5;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var w = Math.max(1, Math.round(rect.width  * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  /* ── RUN LOOP ── */
  var startTime = performance.now();
  var rafId = null;
  var heroVisible = true;
  var tabVisible  = !document.hidden;
  var firstFrameDrawn = false;

  // Draw a single static frame synchronously so the canvas has content
  // even if the page is loaded in a hidden tab or paused before any RAF.
  // This avoids a black hero on slow init and on preview emulators that
  // report document.hidden=true at load time.
  function drawOnce(t) {
    gl.uniform1f(uTime, t || 0);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!firstFrameDrawn) {
      firstFrameDrawn = true;
      canvas.setAttribute('data-ready', 'true');
    }
  }

  function frame(now) {
    rafId = null;
    drawOnce((now - startTime) / 1000);
    if (heroVisible && tabVisible) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function start() {
    if (rafId == null && heroVisible && tabVisible) {
      rafId = requestAnimationFrame(frame);
    }
  }
  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* Pause when the hero scrolls out of view. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) start(); else stop();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  /* Pause when the tab is hidden. */
  document.addEventListener('visibilitychange', function () {
    tabVisible = !document.hidden;
    if (tabVisible) start(); else stop();
  });

  // Draw one frame immediately so the canvas isn't black if the run loop
  // is gated off (hidden tab, off-screen at init). Then attempt to start
  // the animation loop; it will no-op if conditions don't allow it yet.
  drawOnce(0);
  start();
})();
