"use strict";

window.WeddingSpace = (() => {
  const TAU = Math.PI * 2;
  const MAX_PARTICLES = 16000;
  const FONT_STACKS = {
    script: '"Great Vibes", cursive',
    serif: 'Georgia, "Times New Roman", serif',
    classic: '"Times New Roman", Times, serif',
    sans: 'Arial, Helvetica, sans-serif',
  };

  function seededRandom(seed = 20261115) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Không thể biên dịch WebGL: ${message}`);
    }
    return shader;
  }

  function program(gl, vertex, fragment) {
    const result = gl.createProgram();
    const vertexShader = compile(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(result, vertexShader);
    gl.attachShader(result, fragmentShader);
    gl.linkProgram(result);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(result);
      gl.deleteProgram(result);
      throw new Error(`Không thể liên kết WebGL: ${message}`);
    }
    return result;
  }

  function createParticles() {
    const random = seededRandom();
    const gaussian = () => {
      const first = Math.max(1e-7, random());
      return Math.sqrt(-2 * Math.log(first)) * Math.cos(TAU * random());
    };
    const stride = 10;
    const data = new Float32Array(MAX_PARTICLES * stride);
    const distribution = { central: 0, transition: 0, edge: 0 };
    for (let index = 0; index < MAX_PARTICLES; index++) {
      const band = index < MAX_PARTICLES / 2 ? 0 : 1;
      const local = index % (MAX_PARTICLES / 2);
      const depth = random();
      const type = random();
      const bright = type > 0.992;
      const medium = !bright && type > 0.94;
      let horizontal;
      do {
        horizontal = gaussian() * (random() < 0.699 ? 0.231 : 0.665);
      } while (Math.abs(horizontal) > 0.98);
      const distance = Math.abs(horizontal);
      if (distance <= 0.3) distribution.central++;
      else if (distance <= 0.7) distribution.transition++;
      else distribution.edge++;
      const core = Math.exp(-Math.pow(horizontal / 0.34, 2));
      const offset = index * stride;
      data[offset] = random() * TAU;
      data[offset + 1] = horizontal;
      data[offset + 2] = (random() + random() + random() - 1.5) * (band ? 0.065 : 0.105);
      data[offset + 3] = depth;
      data[offset + 4] = bright ? 3.4 + random() * 3.2 : medium ? 1.45 + random() * 1.2 : 0.5 + random();
      data[offset + 5] = (bright ? 0.9 + random() * 0.35 : 0.22 + random() * 0.58) * (0.5 + core * 0.62);
      data[offset + 6] = random() * TAU;
      data[offset + 7] = 0.72 + random() * 0.56;
      data[offset + 8] = (local + random()) / (MAX_PARTICLES / 2);
      data[offset + 9] = band;
    }
    return { data, distribution };
  }

  const PARTICLE_SET = createParticles();

  const FULLSCREEN_VERTEX = `attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
  const BACKGROUND_FRAGMENT = `
    precision highp float;varying vec2 v_uv;uniform float u_time,u_brightness;
    float beam(float x,float center,float width){return exp(-pow((x-center)/width,2.));}
    void main(){vec2 p=v_uv*2.-1.;vec3 color=vec3(.0015,.0025,.0085);
      color+=vec3(.006,.008,.021)*(1.-length(p)*.27);
      float middle=smoothstep(.2,.76,1.-abs(p.y));
      float columns=beam(p.x,-.72,.026)+beam(p.x,-.38,.018)+beam(p.x,.0,.024)+beam(p.x,.42,.019)+beam(p.x,.76,.025);
      color+=vec3(.19,.205,.29)*columns*middle*.16;
      float topGlow=exp(-pow((p.y-.64)/.095,2.))*(.22+.78*exp(-pow(p.x/.63,2.)));
      float stage=exp(-pow(p.x/.36,2.)-pow((p.y+.63)/.09,2.));
      color+=vec3(.28,.30,.42)*topGlow*.12+vec3(.42,.44,.59)*stage*.27;
      vec2 ringP=vec2(p.x/.40,(p.y+.60)/.075);float radius=length(ringP);float pulse=.5+.5*sin(u_time*.64);
      float ring1=exp(-pow((radius-(.62+.035*pulse))/.018,2.));
      float ring2=exp(-pow((radius-(.82-.025*pulse))/.014,2.));float ring3=exp(-pow((radius-1.02)/.012,2.));
      float ringFade=smoothstep(.18,.82,pulse)*exp(-pow(p.x/.62,4.));
      color+=vec3(.50,.52,.78)*(ring1*.10+ring2*.07+ring3*.04)*ringFade;
      float vignette=smoothstep(1.38,.53,length(p*vec2(.78,1.08)));
      gl_FragColor=vec4(color*mix(.58,1.,vignette)*u_brightness,1.);}`;
  const PARTICLE_VERTEX = `
    precision highp float;attribute float a_angle,a_radius,a_height,a_depth,a_size,a_luma,a_phase,a_speed,a_keep,a_band;
    uniform float u_time,u_speed,u_density,u_twinkle,u_brightness,u_pixelRatio,u_concentration,u_fineDensity;varying float v_alpha,v_star;
    void main(){float layer=mix(1.,2.,step(.58,a_depth));float theta=a_angle+u_time*u_speed*.10472*layer*a_speed;
      float z=sin(theta);float perspective=mix(.72,1.25,(z+1.)*.5);
      float concentration=mix(1.30,.70,u_concentration);float bandWidth=mix(1.06,.94,a_band);
      float orbit=mix(.004,.026,a_depth);float x=a_radius*concentration*bandWidth+cos(theta)*orbit;
      float baseY=mix(.64,-.60,a_band);float y=baseY+a_height+sin(theta)*orbit*mix(.23,.31,a_band);
      float fine=1.-step(1.55,a_size);float visibleLimit=u_density*mix(1.,u_fineDensity,fine);
      if(a_keep>visibleLimit){x=3.;y=3.;}gl_Position=vec4(x,y,0.,1.);
      float sparkle=1.+sin(u_time*(.72+a_speed*.55)+a_phase)*u_twinkle*.30;
      float centerGlow=exp(-pow(x/.38,2.));
      v_alpha=a_luma*sparkle*u_brightness*mix(.58,1.03,a_depth)*(.62+centerGlow*.38);v_star=step(3.2,a_size);
      gl_PointSize=max(1.,a_size*perspective*u_pixelRatio);}`;
  const PARTICLE_FRAGMENT = `
    precision highp float;varying float v_alpha,v_star;
    void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float core=exp(-d*d*34.);float halo=exp(-d*d*9.)*.34;
      float cross=(exp(-abs(p.x)*35.)+exp(-abs(p.y)*35.))*v_star*.16;float alpha=(core+halo+cross)*v_alpha;
      if(alpha<.008)discard;gl_FragColor=vec4(vec3(.83,.87,1.)*alpha,alpha);}`;

  function setAttribute(gl, target, name, offset) {
    const location = gl.getAttribLocation(target, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 40, offset * 4);
  }

  function itemOpacity(key, state, seconds) {
    const item = state.texts[key];
    if (!item?.visible) return 0;
    if (state.mode === "fixed") return ["message", "heart"].includes(key) ? 0 : 1;
    if (key === "monogram") return 1;
    const fade = Math.max(0.2, state.fadeSeconds);
    const first = Math.max(1, state.sceneOneSeconds);
    const second = Math.max(1, state.sceneTwoSeconds);
    const total = first + second + fade * 2;
    const time = ((seconds % total) + total) % total;
    let sceneOne;
    if (time < first) sceneOne = 1;
    else if (time < first + fade) sceneOne = 1 - (time - first) / fade;
    else if (time < first + fade + second) sceneOne = 0;
    else sceneOne = (time - first - fade - second) / fade;
    return ["title", "names", "date"].includes(key) ? sceneOne : 1 - sceneOne;
  }

  function measureSpaced(context, text, spacing) {
    const characters = Array.from(text);
    return characters.reduce((sum, character) => sum + context.measureText(character).width, 0) + Math.max(0, characters.length - 1) * spacing;
  }
  function drawSpaced(context, text, x, y, spacing) {
    const characters = Array.from(text);
    let cursor = x - measureSpaced(context, text, spacing) / 2;
    for (const character of characters) {
      context.fillText(character, cursor, y);
      cursor += context.measureText(character).width + spacing;
    }
  }

  function drawTextLayer(context, frame, state, seconds) {
    const scale = frame.width / 1920;
    context.save();context.beginPath();context.rect(frame.x, frame.y, frame.width, frame.height);context.clip();context.textBaseline = "middle";
    for (const key of ["monogram", "title", "names", "date", "message", "heart"]) {
      const item = state.texts[key];const opacity = itemOpacity(key, state, seconds);
      if (!item || opacity <= 0.001 || !item.content) continue;
      const x = frame.x + frame.width * item.x / 100;const y = frame.y + frame.height * item.y / 100;
      context.font = `${Math.max(8, item.size * scale)}px ${FONT_STACKS[item.font] || FONT_STACKS.sans}`;
      context.fillStyle = item.color;context.globalAlpha = Math.min(1, opacity * item.brightness);
      context.shadowColor = item.color;context.shadowBlur = item.glow * scale;
      const spacing = item.spacing * scale;const lines = String(item.content).split("\n");const lineHeight = item.size * 1.18 * scale;
      lines.forEach((line, lineIndex) => {
        const lineY = y + (lineIndex - (lines.length - 1) / 2) * lineHeight;
        if (key === "monogram" && Array.from(line.replace(/\s/g, "")).length === 2) {
          const [left, right] = Array.from(line.replace(/\s/g, ""));context.textAlign = "center";
          context.fillText(left, x - item.size * scale * .13, lineY);context.fillText(right, x + item.size * scale * .13, lineY + item.size * scale * .05);
        } else {context.textAlign = "left";drawSpaced(context, line, x, lineY, spacing);}
      });
    }
    context.restore();
  }

  class SpaceRenderer {
    constructor(canvas, onContextLost = () => {}) {
      this.canvas = canvas;this.context = canvas.getContext("2d", { alpha: false });
      if (!this.context) throw new Error("Không tạo được canvas ghép hình và chữ.");
      this.glCanvas = document.createElement("canvas");
      this.gl = this.glCanvas.getContext("webgl", { alpha: false, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
      if (!this.gl) throw new Error("WebGL không khả dụng. Hãy bật tăng tốc đồ họa.");
      this.lost = false;this.handleLost = (event) => {event.preventDefault();this.lost = true;onContextLost();};
      this.glCanvas.addEventListener("webglcontextlost", this.handleLost);this.init();
    }
    init() {
      const gl = this.gl;this.backgroundProgram = program(gl, FULLSCREEN_VERTEX, BACKGROUND_FRAGMENT);this.particleProgram = program(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
      this.quad = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      this.particles = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, this.particles);gl.bufferData(gl.ARRAY_BUFFER, PARTICLE_SET.data, gl.STATIC_DRAW);
      this.stats = { ...PARTICLE_SET.distribution };
      gl.disable(gl.DEPTH_TEST);gl.disable(gl.DITHER);
    }
    resize(width, height) {this.canvas.width = Math.max(1, width);this.canvas.height = Math.max(1, height);}
    render(phase, state) {
      if (this.lost) return;
      const duration = state.renderDuration || 60;const seconds = (((phase % 1) + 1) % 1) * duration;
      const outputWidth = this.canvas.width;const outputHeight = this.canvas.height;const targetAspect = 16 / 9;
      let frameWidth = outputWidth;let frameHeight = frameWidth / targetAspect;
      if (frameHeight > outputHeight) {frameHeight = outputHeight;frameWidth = frameHeight * targetAspect;}
      const frame = {x:Math.round((outputWidth-frameWidth)/2),y:Math.round((outputHeight-frameHeight)/2),width:Math.max(1,Math.round(frameWidth)),height:Math.max(1,Math.round(frameHeight))};
      if (this.glCanvas.width !== frame.width || this.glCanvas.height !== frame.height) {this.glCanvas.width=frame.width;this.glCanvas.height=frame.height;}
      const gl=this.gl;gl.viewport(0,0,frame.width,frame.height);gl.disable(gl.BLEND);gl.useProgram(this.backgroundProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);
      const position=gl.getAttribLocation(this.backgroundProgram,"a_position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.uniform1f(gl.getUniformLocation(this.backgroundProgram,"u_time"),seconds);gl.uniform1f(gl.getUniformLocation(this.backgroundProgram,"u_brightness"),state.brightness);gl.drawArrays(gl.TRIANGLES,0,6);
      gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(this.particleProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.particles);
      [["a_angle",0],["a_radius",1],["a_height",2],["a_depth",3],["a_size",4],["a_luma",5],["a_phase",6],["a_speed",7],["a_keep",8],["a_band",9]].forEach(([name,offset])=>setAttribute(gl,this.particleProgram,name,offset));
      const uniform=(name)=>gl.getUniformLocation(this.particleProgram,name);gl.uniform1f(uniform("u_time"),seconds);gl.uniform1f(uniform("u_speed"),state.speed);gl.uniform1f(uniform("u_density"),state.density);gl.uniform1f(uniform("u_twinkle"),state.twinkle);gl.uniform1f(uniform("u_brightness"),state.brightness);gl.uniform1f(uniform("u_pixelRatio"),frame.height/1080);gl.uniform1f(uniform("u_concentration"),state.centerConcentration);gl.uniform1f(uniform("u_fineDensity"),state.fineDensity);
      gl.drawArrays(gl.POINTS,0,MAX_PARTICLES);gl.disable(gl.BLEND);
      this.context.save();this.context.globalCompositeOperation="source-over";this.context.fillStyle="#000";this.context.fillRect(0,0,outputWidth,outputHeight);this.context.drawImage(this.glCanvas,frame.x,frame.y,frame.width,frame.height);drawTextLayer(this.context,frame,state,seconds);this.context.restore();
    }
    dispose() {this.glCanvas.removeEventListener("webglcontextlost",this.handleLost);const gl=this.gl;gl.deleteBuffer(this.quad);gl.deleteBuffer(this.particles);gl.deleteProgram(this.backgroundProgram);gl.deleteProgram(this.particleProgram);gl.getExtension("WEBGL_lose_context")?.loseContext();}
  }
  return { SpaceRenderer, MAX_PARTICLES, FONT_STACKS, distribution: PARTICLE_SET.distribution };
})();
