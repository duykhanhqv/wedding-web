"use strict";

window.WeddingSpace = (() => {
  const TAU = Math.PI * 2;
  const MAX_PARTICLES = 100000;
  const FONT_STACKS = {
    bickham: '"HLT Bickham Script Pro", cursive',
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
      const type = random();
      const bright = type > 0.994;
      const medium = !bright && type > 0.92;
      const component = random();
      const horizontalSigma = component < 0.58 ? 0.25 : component < 0.90 ? 0.46 : 0.70;
      const verticalSigma = component < 0.58 ? (band ? 0.065 : 0.09) : component < 0.90 ? (band ? 0.13 : 0.17) : (band ? 0.21 : 0.27);
      const horizontalLimit = 0.91;
      const verticalLimit = band ? 0.31 : 0.33;
      let horizontal, vertical, ellipseDistance;
      do {
        horizontal = gaussian() * horizontalSigma;
        vertical = gaussian() * verticalSigma;
        ellipseDistance = Math.hypot(horizontal / horizontalLimit, vertical / verticalLimit);
      } while (ellipseDistance > 1);
      // On the lower ellipse the upper edge is far away and the lower edge is
      // close to camera. Particle size and orbital parallax use this depth.
      const depth = band ? Math.max(0, Math.min(1, 0.5 - vertical / (verticalLimit * 2))) : random();
      if (ellipseDistance <= 0.34) distribution.central++;
      else if (ellipseDistance <= 0.72) distribution.transition++;
      else distribution.edge++;
      const core = Math.exp(-Math.pow(ellipseDistance / 0.48, 2));
      const offset = index * stride;
      data[offset] = random() * TAU;
      data[offset + 1] = horizontal;
      data[offset + 2] = vertical;
      data[offset + 3] = depth;
      data[offset + 4] = bright ? 3.2 + random() * 3.4 : medium ? 1.35 + random() * 1.45 : 0.46 + random() * 0.78;
      data[offset + 5] = (bright ? 0.88 + random() * 0.30 : 0.34 + random() * 0.62) * (0.68 + core * 0.55);
      data[offset + 6] = random() * TAU;
      data[offset + 7] = 0.72 + random() * 0.56;
      data[offset + 8] = (local + random()) / (MAX_PARTICLES / 2);
      data[offset + 9] = band;
    }
    return { data, distribution };
  }

  const PARTICLE_SET = createParticles();
  const eventCache = new Map();

  function timedEvents(kind, frequency) {
    const amount = Math.max(0, Math.min(1, frequency));
    const key = `${kind}-${Math.round(amount * 100)}`;
    if (eventCache.has(key)) return eventCache.get(key);
    if (amount === 0) { eventCache.set(key, []);return []; }
    const falling = kind === "falling";
    const random = seededRandom(falling ? 90317 : 40711);
    const minGap = falling ? 1.3 - amount * 0.7 : 8 - amount * 4.5;
    const maxGap = falling ? 2.2 - amount * 1.1 : 11.5 - amount * 5.5;
    const events = [];
    let start = falling ? 0.4 + random() * 0.9 : 2.2 + random() * 2;
    while (start < 60) {
      const side = random() < 0.5 ? 0 : 1;
      events.push({
        start,
        duration: falling ? 2.1 + random() * 1.7 : 0.82 + random() * 0.42,
        x: falling ? (side ? 0.67 : 0.06) + random() * 0.27 : 0.42 + random() * 0.16,
        y: falling ? 0.03 + random() * 0.24 : 0.55 + random() * 0.07,
        hitY: falling ? 0 : 0.79 + random() * 0.055,
        distance: falling ? 0.12 + random() * 0.2 : 0.8,
        drift: (random() - 0.5) * (falling ? 0.035 : 0.012),
        size: falling ? 0.8 + random() * 1.7 : 1.1 + random() * 1.4,
      });
      start += minGap + random() * (maxGap - minGap);
    }
    eventCache.set(key, events);
    return events;
  }

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
      float vignette=smoothstep(1.38,.53,length(p*vec2(.78,1.08)));
      gl_FragColor=vec4(color*mix(.58,1.,vignette)*u_brightness,1.);}`;
  const PARTICLE_VERTEX = `
    precision highp float;attribute float a_angle,a_radius,a_height,a_depth,a_size,a_luma,a_phase,a_speed,a_keep,a_band;
    uniform float u_time,u_speed,u_density,u_twinkle,u_brightness,u_pixelRatio,u_concentration,u_fineDensity,u_particleScale,u_edgeDensity;
    uniform vec4 u_ripple;varying float v_alpha,v_star;
    void main(){float layer=mix(1.,2.,step(.58,a_depth));float theta=a_angle+u_time*u_speed*.10472*layer*a_speed;
      float z=sin(theta);float perspective=mix(.72,1.25,(z+1.)*.5);
      float concentration=mix(1.06,.76,u_concentration);float bandWidth=mix(1.00,.98,a_band);
      float orbit=mix(.004,.026,a_depth);float x=a_radius*concentration*bandWidth+cos(theta)*orbit;
      float baseY=mix(.68,-.64,a_band);float y=baseY+a_height+sin(theta)*orbit*mix(.23,.31,a_band);
      float fine=1.-step(1.55,a_size);float visibleLimit=u_density*mix(1.,u_fineDensity,fine);
      float topDistance=length(vec2(a_radius/.91,a_height/.33));float bottomDistance=length(vec2(a_radius/.91,a_height/.31));
      float ellipseDistance=mix(topDistance,bottomDistance,a_band);float edge=smoothstep(.66,.98,ellipseDistance);
      visibleLimit*=mix(1.,mix(.55,1.,u_edgeDensity),edge);
      float rippleAge=u_ripple.z;float planeDistance=length(vec2(x-u_ripple.x,(a_depth-u_ripple.y)*.34));
      float waveRadius=rippleAge*.13;float waveDelta=planeDistance-waveRadius;
      float waveEnvelope=exp(-pow(waveDelta/.052,2.))*exp(-rippleAge*.58);
      float wave=(sin(waveDelta*76.)*.72+sin(waveDelta*123.-1.1)*.20)*waveEnvelope;
      float impactCenter=exp(-pow(planeDistance/.052,2.));
      float impactPulse=(-exp(-rippleAge*16.)+.52*exp(-pow((rippleAge-.24)/.14,2.)))*impactCenter;
      float rippleActive=step(0.,rippleAge)*step(rippleAge,3.5)*step(.001,u_ripple.w);
      y+=(wave*.018+impactPulse*.014)*u_ripple.w*rippleActive*a_band;
      if(a_keep>visibleLimit){x=3.;y=3.;}gl_Position=vec4(x,y,0.,1.);
      float sparkle=1.+sin(u_time*(.72+a_speed*.55)+a_phase)*u_twinkle*.30;
      float topGlow=exp(-pow(length(vec2(x/.54,a_height/.20)),2.));
      float bottomGlow=exp(-pow(length(vec2(x/.58,a_height/.18)),2.));float centerGlow=mix(topGlow,bottomGlow,a_band);
      float edgeLight=mix(1.,mix(.78,1.10,u_edgeDensity),edge);float depthScale=mix(1.,mix(.74,1.88,a_depth),a_band);
      float rippleLight=1.+(wave*.24+impactPulse*.11)*u_ripple.w*rippleActive*a_band;
      v_alpha=a_luma*sparkle*u_brightness*mix(.72,1.02,a_depth)*(.78+centerGlow*.38)*edgeLight*rippleLight*mix(.9,1.12,clamp(u_particleScale-0.7,0.,1.));v_star=step(3.2,a_size);
      gl_PointSize=max(1.,a_size*perspective*depthScale*u_pixelRatio*u_particleScale);}`;
  const PARTICLE_FRAGMENT = `
    precision highp float;varying float v_alpha,v_star;
    void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float core=exp(-d*d*38.);float halo=exp(-d*d*10.)*.25;
      float cross=(exp(-abs(p.x)*35.)+exp(-abs(p.y)*35.))*v_star*.16;float alpha=(core+halo+cross)*v_alpha;
      if(alpha<.008)discard;gl_FragColor=vec4(vec3(.96,.97,1.)*alpha,alpha);}`;

  function setAttribute(gl, target, name, offset) {
    const location = gl.getAttribLocation(target, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 40, offset * 4);
  }

  function itemOpacity(key, state, seconds) {
    const item = state.texts[key];
    return item?.visible ? 1 : 0;
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
    for (const key of ["names", "date"]) {
      const item = state.texts[key];const opacity = itemOpacity(key, state, seconds);
      if (!item || opacity <= 0.001 || !item.content) continue;
      const x = frame.x + frame.width * item.x / 100;const y = frame.y + frame.height * item.y / 100;
      context.font = `${Math.max(8, item.size * scale)}px ${FONT_STACKS[item.font] || FONT_STACKS.bickham}`;
      context.fillStyle = item.color;context.globalAlpha = Math.min(1, opacity * item.brightness);
      context.shadowColor = item.color;context.shadowBlur = item.glow * scale;
      const spacing = item.spacing * scale;const lines = String(item.content).split("\n");const lineHeight = item.size * 1.18 * scale;
      lines.forEach((line, lineIndex) => {
        const lineY = y + (lineIndex - (lines.length - 1) / 2) * lineHeight;
        context.textAlign = "left";drawSpaced(context, line, x, lineY, spacing);
      });
    }
    context.restore();
  }

  function activeRipple(seconds, state) {
    if (!state.dropEnabled) return null;
    let active = null;
    for (const event of timedEvents("drop", state.dropFrequency)) {
      const age = seconds - event.start - event.duration;
      if (age >= 0 && age <= 3.5) active = { ...event, age };
    }
    return active;
  }

  function drawEllipticalGradient(context, x, y, radius, flatten, stops) {
    context.save();context.translate(x,y);context.scale(1,flatten);
    const gradient=context.createRadialGradient(0,0,0,0,0,radius);
    for (const [offset,color] of stops) gradient.addColorStop(offset,color);
    context.fillStyle=gradient;context.beginPath();context.arc(0,0,radius,0,TAU);context.fill();context.restore();
  }

  function drawTransientEffects(context, frame, state, seconds) {
    context.save();
    context.beginPath();context.rect(frame.x, frame.y, frame.width, frame.height);context.clip();
    context.globalCompositeOperation = "lighter";
    if (state.fallingEnabled) {
      for (const event of timedEvents("falling", state.fallingFrequency)) {
        const progress = (seconds - event.start) / event.duration;
        if (progress < 0 || progress > 1) continue;
        const alpha = Math.pow(Math.sin(progress * Math.PI), 0.62);
        const x = frame.x + (event.x + event.drift * Math.sin(progress * Math.PI)) * frame.width;
        const y = frame.y + (event.y + event.distance * progress) * frame.height;
        const radius = event.size * frame.width / 1920;
        const dot = context.createRadialGradient(x, y, 0, x, y, radius * 2.8);
        dot.addColorStop(0, `rgba(255,255,255,${alpha * .95})`);dot.addColorStop(.32, `rgba(215,225,252,${alpha * .5})`);dot.addColorStop(1, "rgba(175,190,235,0)");
        context.fillStyle = dot;context.beginPath();context.arc(x, y, radius * 2.8, 0, TAU);context.fill();
      }
    }
    if (state.dropEnabled) {
      for (const event of timedEvents("drop", state.dropFrequency)) {
        const fall = (seconds - event.start) / event.duration;
        const hitX = frame.x + event.x * frame.width;
        const hitY = frame.y + frame.height * event.hitY;
        if (fall >= 0 && fall < 1) {
          const eased = fall * fall;
          const x = hitX + event.drift * Math.sin(fall * Math.PI) * frame.width;
          const y = frame.y + event.y * frame.height + (hitY - frame.y - event.y * frame.height) * eased;
          const opacity = Math.min(1, fall * 4) * Math.min(1, (1 - fall) * 7);
          const radius = event.size * frame.width / 1920;
          const dot = context.createRadialGradient(x, y, 0, x, y, radius * 3);
          dot.addColorStop(0, `rgba(255,255,255,${opacity})`);dot.addColorStop(.35, `rgba(215,226,255,${opacity * .48})`);dot.addColorStop(1, "rgba(175,190,235,0)");
          context.fillStyle = dot;context.beginPath();context.arc(x, y, radius * 3, 0, TAU);context.fill();
        }
        const age = seconds - event.start - event.duration;
        if (age < 0 || age > 3.5) continue;
        const intensity = state.rippleIntensity;
        const unit = frame.width / 1920;
        if (age < .48) {
          const depression = Math.exp(-age * 8) * intensity;
          context.globalCompositeOperation="source-over";
          drawEllipticalGradient(context,hitX,hitY,29*unit,.16,[[0,`rgba(0,1,8,${depression*.74})`],[.42,`rgba(26,34,58,${depression*.24})`],[1,"rgba(0,0,0,0)"]]);
          const rebound=Math.exp(-Math.pow((age-.23)/.13,2))*intensity;
          context.globalCompositeOperation="lighter";
          drawEllipticalGradient(context,hitX,hitY,20*unit,.17,[[0,`rgba(255,255,255,${rebound*.74})`],[.28,`rgba(210,222,250,${rebound*.34})`],[1,"rgba(170,188,235,0)"]]);
        }
        const ripples=[[0,1,.95],[.18,.66,1.13],[.42,.42,1.30],[.70,.25,1.46]];
        for (const [delay,strength,widthScale] of ripples) {
          const ringAge=age-delay;if(ringAge<0||ringAge>3.15)continue;
          const fade=Math.pow(1-ringAge/3.15,1.65)*intensity*strength;
          const radius=(11+ringAge*116)*unit;
          context.globalCompositeOperation="source-over";
          context.strokeStyle=`rgba(2,5,15,${fade*.68})`;context.lineWidth=Math.max(.9,(4.1-ringAge*.62)*widthScale*unit);
          context.beginPath();context.ellipse(hitX,hitY,radius,radius*.16,0,0,TAU);context.stroke();
          context.globalCompositeOperation="lighter";
          context.strokeStyle=`rgba(197,211,247,${fade*.42})`;context.lineWidth=Math.max(.5,(1.58-ringAge*.22)*widthScale*unit);
          context.beginPath();context.ellipse(hitX,hitY,radius+1.5*unit,(radius+1.5*unit)*.16,0,0,TAU);context.stroke();
        }
      }
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
      const uniform=(name)=>gl.getUniformLocation(this.particleProgram,name);gl.uniform1f(uniform("u_time"),seconds);gl.uniform1f(uniform("u_speed"),state.speed);gl.uniform1f(uniform("u_density"),state.density);gl.uniform1f(uniform("u_twinkle"),state.twinkle);gl.uniform1f(uniform("u_brightness"),state.brightness);gl.uniform1f(uniform("u_pixelRatio"),frame.height/1080);gl.uniform1f(uniform("u_concentration"),state.centerConcentration);gl.uniform1f(uniform("u_fineDensity"),state.fineDensity);gl.uniform1f(uniform("u_particleScale"),state.particleScale);gl.uniform1f(uniform("u_edgeDensity"),state.edgeDensity);
      const ripple=activeRipple(seconds,state);const rippleDepth=ripple ? Math.max(0,Math.min(1,.5+(ripple.hitY-.82)/.31)) : .5;
      gl.uniform4f(uniform("u_ripple"),ripple ? ripple.x*2-1 : 0,rippleDepth,ripple ? ripple.age : -1,ripple ? state.rippleIntensity : 0);
      gl.drawArrays(gl.POINTS,0,MAX_PARTICLES);gl.disable(gl.BLEND);
      this.context.save();this.context.globalCompositeOperation="source-over";this.context.fillStyle="#000";this.context.fillRect(0,0,outputWidth,outputHeight);this.context.drawImage(this.glCanvas,frame.x,frame.y,frame.width,frame.height);drawTransientEffects(this.context,frame,state,seconds);drawTextLayer(this.context,frame,state,seconds);this.context.restore();
    }
    dispose() {this.glCanvas.removeEventListener("webglcontextlost",this.handleLost);const gl=this.gl;gl.deleteBuffer(this.quad);gl.deleteBuffer(this.particles);gl.deleteProgram(this.backgroundProgram);gl.deleteProgram(this.particleProgram);gl.getExtension("WEBGL_lose_context")?.loseContext();}
  }
  return {
    SpaceRenderer,
    MAX_PARTICLES,
    FONT_STACKS,
    distribution: PARTICLE_SET.distribution,
    eventsFor: (kind, frequency) => timedEvents(kind, frequency).map((event) => ({ ...event }))
  };
})();
