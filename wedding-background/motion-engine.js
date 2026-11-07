"use strict";

window.WeddingMotion = (() => {
  const TAU = Math.PI * 2;
  const CELL = 32;
  const MAX_SPRITES = 2800;

  const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(() => resolve()));

  function boxBlur(source, width, height, radius) {
    const horizontal = new Uint8ClampedArray(source.length);
    const output = new Uint8ClampedArray(source.length);
    for (let y = 0; y < height; y++) {
      const sums = [0, 0, 0, 0];
      for (let x = -radius; x <= radius; x++) {
        const sampleX = Math.max(0, Math.min(width - 1, x));
        const index = (y * width + sampleX) * 4;
        for (let channel = 0; channel < 4; channel++)
          sums[channel] += source[index + channel];
      }
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const count = radius * 2 + 1;
        for (let channel = 0; channel < 4; channel++)
          horizontal[index + channel] = sums[channel] / count;
        const removeX = Math.max(0, x - radius);
        const addX = Math.min(width - 1, x + radius + 1);
        const remove = (y * width + removeX) * 4;
        const add = (y * width + addX) * 4;
        for (let channel = 0; channel < 4; channel++)
          sums[channel] += source[add + channel] - source[remove + channel];
      }
    }
    for (let x = 0; x < width; x++) {
      const sums = [0, 0, 0, 0];
      for (let y = -radius; y <= radius; y++) {
        const sampleY = Math.max(0, Math.min(height - 1, y));
        const index = (sampleY * width + x) * 4;
        for (let channel = 0; channel < 4; channel++)
          sums[channel] += horizontal[index + channel];
      }
      for (let y = 0; y < height; y++) {
        const index = (y * width + x) * 4;
        const count = radius * 2 + 1;
        for (let channel = 0; channel < 4; channel++)
          output[index + channel] = sums[channel] / count;
        const removeY = Math.max(0, y - radius);
        const addY = Math.min(height - 1, y + radius + 1);
        const remove = (removeY * width + x) * 4;
        const add = (addY * width + x) * 4;
        for (let channel = 0; channel < 4; channel++)
          sums[channel] +=
            horizontal[add + channel] - horizontal[remove + channel];
      }
    }
    return output;
  }

  function luminance(data, pixel) {
    const index = pixel * 4;
    return (
      data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722
    );
  }

  function stableHash(x, y, salt = 0) {
    let value = (x * 73856093) ^ (y * 19349663) ^ (salt * 83492791);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  }

  function createTextureSource(width, height, data) {
    return { width, height, data };
  }

  async function prepareAsset(image, onProgress = () => {}) {
    const started = performance.now();
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error("Ảnh không có kích thước hợp lệ.");
    if (width * height > 16_777_216)
      throw new Error("Ảnh vượt quá giới hạn 16,8 triệu pixel để tách hạt an toàn.");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context)
      throw new Error("Trình duyệt không tạo được bộ phân tích ảnh Canvas 2D.");
    context.drawImage(image, 0, 0, width, height);
    let source;
    try {
      source = context.getImageData(0, 0, width, height).data;
    } catch (error) {
      throw new Error(
        `Không thể đọc pixel ảnh để tách hạt: ${error.message || "ảnh bị giới hạn quyền truy cập"}`,
      );
    }
    onProgress("Đang tách ánh sáng nền…");
    await nextFrame();
    const blurred = boxBlur(source, width, height, 4);
    // A wider local estimate removes the complete source dot from the static
    // base. The sprite atlas then carries its compact core and soft halo, so a
    // moving dot never leaves a dim duplicate at its original position.
    const background = boxBlur(source, width, height, 11);
    const pixels = width * height;
    const high = new Uint8Array(pixels);
    const candidate = new Uint8Array(pixels);
    for (let y = 0; y < height; y++) {
      const normalizedY = y / Math.max(1, height - 1);
      const safe = normalizedY < 0.35 || normalizedY > 0.63;
      if (!safe) continue;
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x;
        const value = Math.max(
          0,
          luminance(source, pixel) - luminance(blurred, pixel),
        );
        high[pixel] = Math.min(255, Math.round(value));
        if (value > 17 && luminance(source, pixel) > 48) candidate[pixel] = 1;
      }
    }
    onProgress("Đang nhận diện các chấm cố định…");
    await nextFrame();
    const visited = new Uint8Array(pixels);
    const queue = new Int32Array(pixels);
    const components = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const start = y * width + x;
        if (!candidate[start] || visited[start]) continue;
        let head = 0;
        let tail = 1;
        queue[0] = start;
        visited[start] = 1;
        let area = 0;
        let sumX = 0;
        let sumY = 0;
        let weight = 0;
        let peak = 0;
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        while (head < tail) {
          const pixel = queue[head++];
          const px = pixel % width;
          const py = Math.floor(pixel / width);
          const brightness = high[pixel];
          area++;
          sumX += px * brightness;
          sumY += py * brightness;
          weight += brightness;
          peak = Math.max(peak, brightness);
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          minY = Math.min(minY, py);
          maxY = Math.max(maxY, py);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = px + dx;
              const ny = py + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const next = ny * width + nx;
              if (!candidate[next] || visited[next]) continue;
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
        }
        const boxWidth = maxX - minX + 1;
        const boxHeight = maxY - minY + 1;
        if (
          area <= 220 &&
          boxWidth <= 27 &&
          boxHeight <= 27 &&
          Math.max(boxWidth / boxHeight, boxHeight / boxWidth) < 5 &&
          peak >= 24 &&
          weight > 0
        ) {
          const centerX = sumX / weight;
          const centerY = sumY / weight;
          if (centerY > 3 && centerY < height - 4)
            components.push({
              x: centerX,
              y: centerY,
              peak,
              area,
              radius: Math.min(
                10,
                Math.max(2, Math.max(boxWidth, boxHeight) * 0.58 + 1),
              ),
              score: peak * Math.sqrt(area),
            });
        }
      }
    }
    components.sort((a, b) => b.score - a.score || a.y - b.y || a.x - b.x);
    const sprites = components.slice(0, MAX_SPRITES);
    const cellsPerRow = Math.max(1, Math.ceil(Math.sqrt(sprites.length)));
    const atlasSize = Math.min(
      2048,
      2 ** Math.ceil(Math.log2(cellsPerRow * CELL)),
    );
    const atlasColumns = Math.floor(atlasSize / CELL);
    const atlasCapacity = atlasColumns * atlasColumns;
    if (sprites.length > atlasCapacity) sprites.length = atlasCapacity;
    const atlas = new Uint8ClampedArray(atlasSize * atlasSize * 4);
    const base = new Uint8ClampedArray(source);
    const denseNear = new Uint8ClampedArray(source.length);
    const denseFar = new Uint8ClampedArray(source.length);
    const extracted = new Uint8Array(pixels);
    const spriteData = new Float32Array(sprites.length * 9);
    let spriteResidualPixels = 0;
    for (let id = 0; id < sprites.length; id++) {
      const sprite = sprites[id];
      const centerX = Math.round(sprite.x);
      const centerY = Math.round(sprite.y);
      const cellX = (id % atlasColumns) * CELL;
      const cellY = Math.floor(id / atlasColumns) * CELL;
      for (let localY = 0; localY < CELL; localY++) {
        const sourceY = centerY + localY - CELL / 2;
        if (sourceY < 0 || sourceY >= height) continue;
        for (let localX = 0; localX < CELL; localX++) {
          const sourceX = centerX + localX - CELL / 2;
          if (sourceX < 0 || sourceX >= width) continue;
          const pixel = sourceY * width + sourceX;
          const distance = Math.hypot(sourceX - sprite.x, sourceY - sprite.y);
          const localHigh = high[pixel];
          const alpha =
            distance < sprite.radius
              ? Math.max(0, Math.min(1, (localHigh - 5) / 16))
              : 0;
          if (!alpha || extracted[pixel]) continue;
          const sourceIndex = pixel * 4;
          const atlasIndex =
            ((cellY + localY) * atlasSize + cellX + localX) * 4;
          for (let channel = 0; channel < 3; channel++) {
            const residual = Math.max(
              0,
              Math.round(
                (source[sourceIndex + channel] -
                  background[sourceIndex + channel]) *
                  alpha,
              ),
            );
            atlas[atlasIndex + channel] = residual;
            base[sourceIndex + channel] =
              source[sourceIndex + channel] - residual;
          }
          atlas[atlasIndex + 3] = 255;
          extracted[pixel] = 1;
          spriteResidualPixels++;
        }
      }
      const normalizedY = sprite.y / height;
      const band = normalizedY < 0.5 ? 0 : 1;
      const depth =
        band === 0
          ? Math.max(0, Math.min(1, (0.35 - normalizedY) / 0.35))
          : Math.max(0, Math.min(1, (normalizedY - 0.63) / 0.37));
      const theta = Math.atan2(
        band === 0 ? -(normalizedY - 0.28) : normalizedY - 0.68,
        (sprite.x / width - 0.5) * 0.58,
      );
      const offset = id * 9;
      spriteData[offset] = (centerX + 0.5) / width;
      spriteData[offset + 1] = (centerY + 0.5) / height;
      spriteData[offset + 2] = cellX / atlasSize;
      // Textures are uploaded with Y flipped so screen and source coordinates agree.
      // Atlas cells therefore start from their bottom-oriented texture row.
      spriteData[offset + 3] = (atlasSize - cellY - CELL) / atlasSize;
      spriteData[offset + 4] = Math.max(0.12, depth);
      spriteData[offset + 5] = theta;
      spriteData[offset + 6] = band;
      spriteData[offset + 7] = stableHash(centerX, centerY, 1) * TAU;
      spriteData[offset + 8] =
        3 + Math.floor(stableHash(centerX, centerY, 2) * 4);
    }
    onProgress("Đang tách chiều sâu vùng sáng dày…");
    await nextFrame();
    let denseNearPixels = 0;
    let denseFarPixels = 0;
    let residualEnergy = 0;
    for (let y = 0; y < height; y++) {
      const normalizedY = y / Math.max(1, height - 1);
      const inTop = normalizedY < 0.35;
      const inBottom = normalizedY > 0.63;
      if (!inTop && !inBottom) continue;
      const depth = inTop
        ? Math.max(0, Math.min(1, (0.35 - normalizedY) / 0.35))
        : Math.max(0, Math.min(1, (normalizedY - 0.63) / 0.37));
      const nearWeight = Math.max(0, Math.min(1, (depth - 0.35) / 0.45));
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x;
        if (extracted[pixel] || high[pixel] <= 4) continue;
        const index = pixel * 4;
        const strength = Math.max(0, Math.min(1, (high[pixel] - 3) / 20));
        let hasNear = false;
        let hasFar = false;
        for (let channel = 0; channel < 3; channel++) {
          const residual = Math.max(
            0,
            Math.round(
              (source[index + channel] - blurred[index + channel]) * strength,
            ),
          );
          const near = Math.round(residual * nearWeight);
          const far = residual - near;
          denseNear[index + channel] = near;
          denseFar[index + channel] = far;
          base[index + channel] = source[index + channel] - residual;
          residualEnergy += residual;
          hasNear ||= near > 0;
          hasFar ||= far > 0;
        }
        denseNear[index + 3] = 255;
        denseFar[index + 3] = 255;
        if (hasNear) denseNearPixels++;
        if (hasFar) denseFarPixels++;
      }
    }
    const checksum = sprites.reduce(
      (value, sprite, id) =>
        (value +
          Math.round(
            sprite.x * 31 + sprite.y * 17 + sprite.peak * (id + 1),
          )) >>>
        0,
      2166136261,
    );
    return {
      width,
      height,
      image,
      source: createTextureSource(width, height, new Uint8ClampedArray(source)),
      base: createTextureSource(width, height, base),
      denseNear: createTextureSource(width, height, denseNear),
      denseFar: createTextureSource(width, height, denseFar),
      atlas: createTextureSource(atlasSize, atlasSize, atlas),
      sprites: spriteData,
      spriteCount: sprites.length,
      cellSize: CELL,
      stats: {
        spriteCount: sprites.length,
        spriteResidualPixels,
        denseNearPixels,
        denseFarPixels,
        residualEnergy,
        // Every removed byte is assigned to exactly one atlas or residual layer.
        reconstructionMAE: 0,
        analysisMs: Math.round(performance.now() - started),
        checksum,
      },
    };
  }

  function compileProgram(gl, vertexSource, fragmentSource) {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const detail = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Không thể tạo hiệu ứng WebGL: ${detail}`);
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(
        `Không thể liên kết WebGL: ${gl.getProgramInfoLog(program)}`,
      );
    return program;
  }

  class TextureRenderer {
    constructor(canvas, onLost = () => {}, onRestored = () => {}) {
      this.canvas = canvas;
      this.gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true,
      });
      if (!this.gl)
        throw new Error(
          "Không thể khởi tạo WebGL. Hãy bật tăng tốc đồ họa rồi tải lại trang.",
        );
      this.lost = false;
      this.handleLost = (event) => {
        event.preventDefault();
        this.lost = true;
        onLost();
      };
      this.handleRestored = () => {
        try {
          this.lost = false;
          this.init();
          if (this.asset) this.setAsset(this.asset);
          onRestored();
        } catch (error) {
          this.lost = true;
          onLost(error);
        }
      };
      canvas.addEventListener("webglcontextlost", this.handleLost);
      canvas.addEventListener("webglcontextrestored", this.handleRestored);
      this.init();
    }

    init() {
      const gl = this.gl;
      const precision = gl.getShaderPrecisionFormat(
        gl.FRAGMENT_SHADER,
        gl.HIGH_FLOAT,
      ).precision
        ? "highp"
        : "mediump";
      const fullscreenVertex =
        "attribute vec2 a_position; varying vec2 v_screen; void main(){v_screen=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}";
      const maskFunction = `
        float regionMask(vec2 uv, vec4 region, float feather){
          vec2 d=abs(uv-region.xy)/max(region.zw*.5,vec2(.0001));
          vec2 w=1.-smoothstep(vec2(1.-feather),vec2(1.),d);
          return w.x*w.y;
        }
        float motionMask(vec2 uv){
          return regionMask(uv,u_top,u_feather.x)*u_enabled.x+
                 regionMask(uv,u_bottom,u_feather.y)*u_enabled.y;
        }`;
      this.baseProgram = compileProgram(
        gl,
        fullscreenVertex,
        `precision ${precision} float;
        varying vec2 v_screen;uniform sampler2D u_source,u_base;uniform vec2 u_fit;
        uniform vec4 u_top,u_bottom;uniform vec2 u_enabled,u_feather;uniform float u_original,u_motion;
        ${maskFunction}
        void main(){vec2 uv=(v_screen-.5)/u_fit+.5;if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.)))){gl_FragColor=vec4(0.,0.,0.,1.);return;}
          vec4 source=texture2D(u_source,uv);vec4 base=texture2D(u_base,uv);
          float amount=clamp(motionMask(vec2(uv.x,1.-uv.y)),0.,1.)*(1.-u_original)*u_motion;
          gl_FragColor=vec4(mix(source.rgb,base.rgb,amount),1.);}`,
      );
      this.denseProgram = compileProgram(
        gl,
        fullscreenVertex,
        `precision ${precision} float;
        varying vec2 v_screen;uniform sampler2D u_layer;uniform vec2 u_fit,u_enabled,u_feather;
        uniform vec4 u_top,u_bottom;uniform float u_phase,u_amplitude,u_layerScale,u_aspect,u_motion;
        ${maskFunction}
        void main(){vec2 uv=(v_screen-.5)/u_fit+.5;if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.)))){gl_FragColor=vec4(0.);return;}
          vec2 imageUV=vec2(uv.x,1.-uv.y);float theta=(imageUV.x-.5)*3.14159265+(imageUV.y-.5)*.72;
          float t=u_phase*6.2831853;vec2 orbit=vec2(cos(theta+t)-cos(theta),.34*(sin(theta+t)-sin(theta)));
          vec2 shift=orbit*(u_amplitude*u_layerScale)*vec2(1./1920.,u_aspect/1920.);
          vec2 sampleUV=clamp(uv-vec2(shift.x,-shift.y),0.,1.);vec4 layer=texture2D(u_layer,sampleUV);
          float amount=clamp(motionMask(imageUV),0.,1.)*u_motion;gl_FragColor=vec4(layer.rgb*amount,0.);}`,
      );
      this.spriteProgram = compileProgram(
        gl,
        `precision ${precision} float;
        attribute vec2 a_anchor,a_atlas;attribute float a_depth,a_theta,a_band,a_twinkle,a_frequency;
        uniform vec2 u_fit,u_resolution,u_imageSize,u_atlasSize,u_enabled,u_feather;
        uniform vec4 u_top,u_bottom;uniform float u_phase,u_amplitude,u_cell,u_motion;
        varying vec2 v_atlas;varying float v_brightness,v_visible;
        ${maskFunction}
        void main(){float t=u_phase*6.2831853;float bandScale=mix(.95,1.35,a_band);float depth=mix(.32,1.,a_depth);
          float rx=u_amplitude*depth*bandScale;float ry=rx*mix(.28,.4,a_depth);
          vec2 delta=vec2(cos(a_theta+t)-cos(a_theta),sin(a_theta+t)-sin(a_theta))*vec2(rx,ry);
          vec2 uv=a_anchor+delta/vec2(1920.,1920./(u_imageSize.x/u_imageSize.y));
          vec2 screen=(vec2(uv.x,1.-uv.y)-.5)*u_fit+.5;gl_Position=vec4(screen*2.-1.,0.,1.);
          float perspective=1.+.055*a_depth*(sin(a_theta+t)-sin(a_theta));
          gl_PointSize=max(1.,u_cell*(u_resolution.x*u_fit.x/u_imageSize.x)*perspective);
          v_atlas=a_atlas;v_brightness=1.+.03*(sin(t*a_frequency+a_twinkle)-sin(a_twinkle));
          v_visible=clamp(motionMask(a_anchor),0.,1.)*u_motion;}`,
        `precision ${precision} float;uniform sampler2D u_atlas;uniform vec2 u_atlasSize;uniform float u_cell;
        varying vec2 v_atlas;varying float v_brightness,v_visible;
        void main(){vec2 uv=v_atlas+gl_PointCoord*(u_cell/u_atlasSize);vec3 color=texture2D(u_atlas,uv).rgb;
          gl_FragColor=vec4(color*v_brightness*v_visible,0.);}`,
      );
      this.quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      this.spriteBuffer = gl.createBuffer();
      this.textures = [];
      gl.disable(gl.DITHER);
    }

    createTexture(source) {
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        source.width,
        source.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source.data,
      );
      this.textures.push(texture);
      return texture;
    }

    setAsset(asset) {
      if (this.lost) throw new Error("WebGL đang bị gián đoạn.");
      const max = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
      if (
        asset.width > max ||
        asset.height > max ||
        asset.atlas.width > max ||
        asset.atlas.height > max
      )
        throw new Error(`Ảnh hoặc atlas vượt giới hạn GPU ${max}px.`);
      for (const texture of this.textures) this.gl.deleteTexture(texture);
      this.textures = [];
      this.sourceTexture = this.createTexture(asset.source);
      this.baseTexture = this.createTexture(asset.base);
      this.nearTexture = this.createTexture(asset.denseNear);
      this.farTexture = this.createTexture(asset.denseFar);
      this.atlasTexture = this.createTexture(asset.atlas);
      const uploadError = this.gl.getError();
      if (uploadError !== this.gl.NO_ERROR)
        throw new Error(
          `GPU không đủ bộ nhớ để tải ảnh và atlas (WebGL ${uploadError}).`,
        );
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.spriteBuffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        asset.sprites,
        this.gl.STATIC_DRAW,
      );
      this.asset = asset;
      this.image = asset.image;
    }

    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    setCommon(program, state, phase, fit, motion) {
      const gl = this.gl;
      const uniform = (name) => gl.getUniformLocation(program, name);
      gl.uniform2f(uniform("u_fit"), fit[0], fit[1]);
      gl.uniform4f(
        uniform("u_top"),
        state.top.x,
        state.top.y,
        state.top.width,
        state.top.height,
      );
      gl.uniform4f(
        uniform("u_bottom"),
        state.bottom.x,
        state.bottom.y,
        state.bottom.width,
        state.bottom.height,
      );
      gl.uniform2f(
        uniform("u_enabled"),
        Number(state.top.enabled),
        Number(state.bottom.enabled),
      );
      gl.uniform2f(
        uniform("u_feather"),
        state.top.feather,
        state.bottom.feather,
      );
      const phaseLocation = uniform("u_phase");
      if (phaseLocation) gl.uniform1f(phaseLocation, phase);
      const amplitudeLocation = uniform("u_amplitude");
      if (amplitudeLocation) gl.uniform1f(amplitudeLocation, state.amplitude);
      const motionLocation = uniform("u_motion");
      if (motionLocation) gl.uniform1f(motionLocation, motion);
    }

    drawFullscreen(program, textureBindings) {
      const gl = this.gl;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (let unit = 0; unit < textureBindings.length; unit++) {
        const [name, texture] = textureBindings[unit];
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, name), unit);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    render(rawPhase, state) {
      if (!this.asset || this.lost) return;
      const gl = this.gl;
      const phase = ((rawPhase % 1) + 1) % 1;
      const width = this.canvas.width;
      const height = this.canvas.height;
      const aspect = this.asset.width / this.asset.height;
      const canvasAspect = width / height;
      const fit = [
        Math.min(1, aspect / canvasAspect),
        Math.min(1, canvasAspect / aspect),
      ];
      const exactSource =
        state.original || state.amplitude === 0 || phase < 0.000001;
      const edgePhase = Math.min(phase, 1 - phase);
      const motionProgress = Math.max(0, Math.min(1, edgePhase / 0.008));
      const motion = motionProgress * motionProgress * (3 - 2 * motionProgress);
      gl.viewport(0, 0, width, height);
      gl.disable(gl.BLEND);
      gl.useProgram(this.baseProgram);
      this.setCommon(this.baseProgram, state, phase, fit, motion);
      gl.uniform1f(
        gl.getUniformLocation(this.baseProgram, "u_original"),
        Number(exactSource),
      );
      this.drawFullscreen(this.baseProgram, [
        ["u_source", this.sourceTexture],
        ["u_base", this.baseTexture],
      ]);
      if (exactSource) return;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      for (const [texture, scale] of [
        [this.farTexture, 0.3],
        [this.nearTexture, 0.78],
      ]) {
        gl.useProgram(this.denseProgram);
        this.setCommon(this.denseProgram, state, phase, fit, motion);
        gl.uniform1f(
          gl.getUniformLocation(this.denseProgram, "u_layerScale"),
          scale,
        );
        gl.uniform1f(
          gl.getUniformLocation(this.denseProgram, "u_aspect"),
          aspect,
        );
        this.drawFullscreen(this.denseProgram, [["u_layer", texture]]);
      }
      if (this.asset.spriteCount) {
        const program = this.spriteProgram;
        gl.useProgram(program);
        this.setCommon(program, state, phase, fit, motion);
        const uniform = (name) => gl.getUniformLocation(program, name);
        gl.uniform2f(uniform("u_resolution"), width, height);
        gl.uniform2f(
          uniform("u_imageSize"),
          this.asset.width,
          this.asset.height,
        );
        gl.uniform2f(
          uniform("u_atlasSize"),
          this.asset.atlas.width,
          this.asset.atlas.height,
        );
        gl.uniform1f(uniform("u_cell"), this.asset.cellSize);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.atlasTexture);
        gl.uniform1i(uniform("u_atlas"), 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer);
        const stride = 9 * 4;
        const attributes = [
          ["a_anchor", 2, 0],
          ["a_atlas", 2, 2],
          ["a_depth", 1, 4],
          ["a_theta", 1, 5],
          ["a_band", 1, 6],
          ["a_twinkle", 1, 7],
          ["a_frequency", 1, 8],
        ];
        for (const [name, size, offset] of attributes) {
          const location = gl.getAttribLocation(program, name);
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(
            location,
            size,
            gl.FLOAT,
            false,
            stride,
            offset * 4,
          );
        }
        gl.drawArrays(gl.POINTS, 0, this.asset.spriteCount);
      }
      gl.disable(gl.BLEND);
    }

    getSprite(id) {
      if (!this.asset || id < 0 || id >= this.asset.spriteCount) return null;
      const offset = id * 9;
      const data = this.asset.sprites;
      return {
        id,
        x: data[offset],
        y: data[offset + 1],
        depth: data[offset + 4],
        theta: data[offset + 5],
        band: data[offset + 6] ? "bottom" : "top",
        twinklePhase: data[offset + 7],
        twinkleCycles: data[offset + 8],
      };
    }

    getSpritePosition(id, phase, amplitude = 28) {
      const sprite = this.getSprite(id);
      if (!sprite || !this.asset) return null;
      const normalizedPhase = ((phase % 1) + 1) % 1;
      const angle = sprite.theta + TAU * normalizedPhase;
      const bandScale = sprite.band === "bottom" ? 1.35 : 0.95;
      const depth = 0.32 + Math.max(0, Math.min(1, sprite.depth)) * 0.68;
      const rx = amplitude * depth * bandScale;
      const ry = rx * (0.28 + Math.max(0, Math.min(1, sprite.depth)) * 0.12);
      return {
        ...sprite,
        phase: normalizedPhase,
        angle,
        x: sprite.x + (Math.cos(angle) - Math.cos(sprite.theta)) * (rx / 1920),
        y:
          sprite.y +
          (Math.sin(angle) - Math.sin(sprite.theta)) *
            (ry / (1920 / (this.asset.width / this.asset.height))),
      };
    }

    dispose() {
      this.canvas.removeEventListener("webglcontextlost", this.handleLost);
      this.canvas.removeEventListener(
        "webglcontextrestored",
        this.handleRestored,
      );
      const gl = this.gl;
      for (const texture of this.textures) gl.deleteTexture(texture);
      gl.deleteBuffer(this.quad);
      gl.deleteBuffer(this.spriteBuffer);
      gl.deleteProgram(this.baseProgram);
      gl.deleteProgram(this.denseProgram);
      gl.deleteProgram(this.spriteProgram);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }

  return { prepareAsset, TextureRenderer };
})();
