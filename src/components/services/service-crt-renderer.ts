// Normalized Figma CRT controls. Disabled effects remain zero by design.
export const serviceCrtSettings = {
  mask: 0, maskSize: 6, curvature: -.45, clipToCurve: false,
  scanlines: .10, scanlineSize: 2.5, dispersion: .60,
  flicker: 0, static: 0, staticSize: 1, rollSpeed: 1.03,
  jitter: 0, vignette: .62, brightness: .4, speed: 1, backgroundBlur: 8, mobileBackgroundBlur: 2,
} as const;

const vertex = `attribute vec2 a_position; varying vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
// A separable Gaussian pass blurs the source, not the final text/CRT scanlines.
const blurFragment = `precision mediump float;
varying vec2 v_uv; uniform sampler2D u_image; uniform vec2 u_step;
void main(){
 vec3 c=vec3(0.);float total=0.;
 // Dense Gaussian sampling avoids the duplicate-image ghosts of sparse taps.
 for(int i=-12;i<=12;i++){
  float offset=float(i);float weight=exp(-.5*offset*offset/16.);
  c+=texture2D(u_image,v_uv+u_step*offset).rgb*weight;total+=weight;
 }
 gl_FragColor=vec4(c/total,1.);
}`;
const fragment = `precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_image; uniform sampler2D u_previous;
uniform vec2 u_resolution; uniform vec2 u_source; uniform vec2 u_previousSource;
uniform float u_time; uniform float u_blend;
uniform float u_curvature; uniform float u_scanlines; uniform float u_scanlineSize;
uniform float u_dispersion; uniform float u_rollSpeed; uniform float u_vignette; uniform float u_brightness;
vec2 cover(vec2 uv,vec2 source){
 float a=u_resolution.x/u_resolution.y, b=source.x/source.y;
 return (uv-.5)*vec2(min(1.,a/b),min(1.,b/a))+.5;
}
vec3 sampleFrame(sampler2D tex,vec2 dimensions,vec2 uv){
 vec2 radial=uv-.5;
 vec2 split=radial*u_dispersion*.012;
 vec2 base=cover(uv,dimensions);
 vec2 spread=cover(uv+split,dimensions)-base;
 vec3 c=vec3(texture2D(tex,clamp(base+spread,0.,1.)).r,texture2D(tex,clamp(base,0.,1.)).g,texture2D(tex,clamp(base-spread,0.,1.)).b);
 return c;
}
void main(){
 vec2 p=v_uv*2.-1.;
 vec2 warped=(p*(1.+u_curvature*.16*dot(p,p)))*.5+.5;
 vec3 c=mix(sampleFrame(u_previous,u_previousSource,warped),sampleFrame(u_image,u_source,warped),u_blend);
 // Fine scanlines plus the visible, soft curved roll from the reference.
 float line=.5+.5*sin((v_uv.y*u_resolution.y/u_scanlineSize+u_time*u_rollSpeed*3.)*6.2831853);
 c*=1.-u_scanlines*line;
 // Positive texture Y travels upward on screen. Wrapped distance lets the
 // leading/trailing band cross both edges seamlessly, about every 7 seconds.
 float phase=fract(u_time*u_rollSpeed*.14+.58);
 float curvedY=v_uv.y-u_curvature*.14*(1.-p.x*p.x);
 float distanceToRoll=abs(fract(curvedY-phase+.5)-.5);
 float roll=exp(-.5*pow(distanceToRoll/.023,2.));
 float shoulder=exp(-.5*pow(distanceToRoll/.060,2.));
 float lateral=1.-smoothstep(.5,1.05,abs(p.x));
 // Light follows the underlying screen colour, rather than a white stripe.
 c*=1.+u_brightness*(roll*1.25+shoulder*.18)*lateral;
 c+=vec3(u_brightness*(roll*.065+shoulder*.012)*lateral);
 // The reference has a broad elliptical lit area and genuinely dark edges.
 float edge=length(p*vec2(.94,.82));
 float vignette=1.-smoothstep(1.-u_vignette,1.20,edge);
 c*=vignette*vignette;
 c*=1.+u_brightness*.25;
 gl_FragColor=vec4(c,1.);
}`;

export function createServiceCrt(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) throw new Error("CRT WebGL unavailable");
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("CRT shader allocation failed");
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message || "CRT shader compilation failed"); }
    return shader;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("CRT program allocation failed");
  const shaders = [compile(gl.VERTEX_SHADER, vertex), compile(gl.FRAGMENT_SHADER, fragment)];
  shaders.forEach(shader => gl.attachShader(program, shader)); gl.linkProgram(program);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("CRT program linking failed");
  const blurProgram = gl.createProgram();
  if (!blurProgram) throw new Error("CRT blur program allocation failed");
  const blurShaders = [compile(gl.VERTEX_SHADER,vertex),compile(gl.FRAGMENT_SHADER,blurFragment)];
  blurShaders.forEach(shader=>gl.attachShader(blurProgram,shader));gl.linkProgram(blurProgram);
  blurShaders.forEach(shader=>gl.deleteShader(shader));
  if(!gl.getProgramParameter(blurProgram,gl.LINK_STATUS))throw new Error("CRT blur linking failed");
  const blurPosition=gl.getAttribLocation(blurProgram,"a_position");
  const blurImage=gl.getUniformLocation(blurProgram,"u_image"),blurStep=gl.getUniformLocation(blurProgram,"u_step");
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,"a_position");
  const uniforms = Object.fromEntries(["image","previous","resolution","source","previousSource","time","blend","curvature","scanlines","scanlineSize","dispersion","rollSpeed","vignette","brightness"].map(name => [name,gl.getUniformLocation(program,`u_${name}`)]));
  const makeTexture = () => {
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
    return texture;
  };
  let current = { texture: makeTexture(), width: 1, height: 1, bufferWidth: 1, bufferHeight: 1 };
  let previous = { texture: makeTexture(), width: 1, height: 1, bufferWidth: 1, bufferHeight: 1 };
  const rawTexture=makeTexture(),scratchTexture=makeTexture(),framebuffer=gl.createFramebuffer();
  if(!framebuffer)throw new Error("CRT blur framebuffer allocation failed");
  let scratchWidth=1,scratchHeight=1;
  let video: HTMLVideoElement | null = null;
  let poster: HTMLImageElement | null = null;
  let videoTime = -1, generation = 0, frame = 0, last = 0, drawTime = 0, elapsed = 0, blendStart = 0;
  let running = false, disposed = false, ready = false, first = true, reduce = false;
  const upload = (source: HTMLVideoElement | HTMLImageElement) => {
    const sourceWidth=source instanceof HTMLVideoElement?source.videoWidth:source.naturalWidth;
    const sourceHeight=source instanceof HTMLVideoElement?source.videoHeight:source.naturalHeight;
    const bounds=canvas.getBoundingClientRect();
    if(!sourceWidth || !sourceHeight || !bounds.width || !bounds.height)return;
    const scale=Math.min(1,1280/sourceWidth,1280/sourceHeight,Math.sqrt(125_000/(sourceWidth*sourceHeight)));
    const width=Math.max(1,Math.round(sourceWidth*scale)),height=Math.max(1,Math.round(sourceHeight*scale));
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,rawTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
    if(scratchWidth!==width || scratchHeight!==height){
      gl.bindTexture(gl.TEXTURE_2D,scratchTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      scratchWidth=width;scratchHeight=height;
    }
    if(current.bufferWidth!==width || current.bufferHeight!==height){
      gl.bindTexture(gl.TEXTURE_2D,current.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      current.bufferWidth=width;current.bufferHeight=height;
    }
    // A dense +/-3 sigma Gaussian. Convert the configured CSS-pixel blur through
    // object-fit:cover; a lower-resolution blur buffer keeps this inexpensive.
    const viewAspect=bounds.width/bounds.height,sourceAspect=sourceWidth/sourceHeight;
    const radius=(window.matchMedia("(max-width: 767px)").matches ? serviceCrtSettings.mobileBackgroundBlur : serviceCrtSettings.backgroundBlur)/4;
    const stepX=radius/bounds.width*Math.min(1,viewAspect/sourceAspect);
    const stepY=radius/bounds.height*Math.min(1,sourceAspect/viewAspect);
    gl.useProgram(blurProgram);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.enableVertexAttribArray(blurPosition);gl.vertexAttribPointer(blurPosition,2,gl.FLOAT,false,0,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,width,height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,scratchTexture,0);
    gl.bindTexture(gl.TEXTURE_2D,rawTexture);gl.uniform1i(blurImage,0);gl.uniform2f(blurStep,stepX,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,current.texture,0);
    gl.bindTexture(gl.TEXTURE_2D,scratchTexture);gl.uniform2f(blurStep,0,stepY);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    current.width=sourceWidth;current.height=sourceHeight;ready=true;
  };
  const paint = (timestamp: number) => {
    frame = 0;
    if (disposed || gl.isContextLost()) return;
    elapsed += Math.min(40,Math.max(0,timestamp-(last || timestamp)))/1000;
    last = timestamp;
    if (timestamp-drawTime >= 1000/30 || reduce) {
      drawTime = timestamp;
      try {
        if (video && video.readyState >= 2 && video.videoWidth && video.currentTime !== videoTime) { upload(video); videoTime = video.currentTime; }
        if (ready) {
          const bounds = canvas.getBoundingClientRect();
          const dpr = Math.min(devicePixelRatio || 1, innerWidth <= 767 ? 1 : 1.5);
          const budget = Math.min(dpr, Math.sqrt(2_000_000 / Math.max(1,bounds.width*bounds.height)));
          const width = Math.max(1,Math.round(bounds.width*budget)), height = Math.max(1,Math.round(bounds.height*budget));
          if (canvas.width !== width || canvas.height !== height) { canvas.width=width;canvas.height=height; }
          gl.viewport(0,0,width,height); gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
          gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,current.texture);gl.uniform1i(uniforms.image,0);
          gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,previous.texture);gl.uniform1i(uniforms.previous,1);
          gl.uniform2f(uniforms.resolution,bounds.width,bounds.height);
          gl.uniform2f(uniforms.source,current.width,current.height);gl.uniform2f(uniforms.previousSource,previous.width,previous.height);
          gl.uniform1f(uniforms.time,elapsed*serviceCrtSettings.speed);
          gl.uniform1f(uniforms.blend,first || reduce ? 1 : Math.min(1,(elapsed-blendStart)/.85));
          for (const key of ["curvature","scanlines","scanlineSize","dispersion","rollSpeed","vignette","brightness"] as const) gl.uniform1f(uniforms[key],serviceCrtSettings[key]);
          gl.drawArrays(gl.TRIANGLE_STRIP,0,4);canvas.dataset.ready="true";
        }
      } catch { canvas.dataset.ready="false"; running=false; }
    }
    if (running && !reduce) frame=requestAnimationFrame(paint);
  };
  const request = () => { if (!frame && !disposed) frame=requestAnimationFrame(paint); };
  return {
    setSource(element: HTMLVideoElement | null, imageUrl: string) {
      generation++; const sourceGeneration=generation;
      if (poster) poster.onload=null;
      if (ready) { const swap=previous;previous=current;current=swap;first=false; } else first=true;
      video=element;videoTime=-1;ready=false;blendStart=elapsed;
      poster=new Image();poster.crossOrigin="anonymous";
      poster.onload=()=>{ if(disposed || sourceGeneration!==generation) return;try{upload(poster!);request();}catch{canvas.dataset.ready="false";} };
      poster.src=imageUrl; request();
    },
    setRunning(value: boolean, reducedMotion: boolean) {
      running=value;reduce=reducedMotion;last=0;
      cancelAnimationFrame(frame);frame=0;
      if(value) request();
    },
    redraw: request,
    dispose() {
      disposed=true;generation++;cancelAnimationFrame(frame);if(poster)poster.onload=null;
      gl.deleteTexture(current.texture);gl.deleteTexture(previous.texture);gl.deleteTexture(rawTexture);gl.deleteTexture(scratchTexture);gl.deleteFramebuffer(framebuffer);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteProgram(blurProgram);
    },
  };
}
