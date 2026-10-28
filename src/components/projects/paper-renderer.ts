import { MAX_DPR } from "./gallery/constants";

// Exact interleaved WebGL receipt renderer supplied with the reference.
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(result, source); gl.compileShader(result);
  if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result) || "WebGL shader compilation failed");
  return result;
}

type TextureRecord = { texture: WebGLTexture | null; width: number; height: number; ready?: boolean };
export type PaperRenderer = { render: (progress: number) => boolean; resize: () => void; dispose: () => void };

export function createPaperRenderer(canvas: HTMLCanvasElement, imageSources: string[]): PaperRenderer {
  let disposed = false;
  const pendingImages: HTMLImageElement[] = [];
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, depth: true, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) throw new Error("WebGL is unavailable");
  const vertexSource = `uniform float u_center;attribute vec3 a_position;attribute vec2 a_uv;attribute float a_blur;attribute float a_brightness;attribute float a_opacity;varying vec2 v_uv;varying float v_blur;varying float v_brightness;varying float v_opacity;void main(){float scale=1.0/(1.0-a_position.z*0.68);vec2 clip=vec2(a_position.x*scale,(1.0-2.0*a_position.y-u_center)*scale+u_center);gl_Position=vec4(clip,clamp(-a_position.z*0.8,-0.95,0.95),1.0);v_uv=a_uv;v_blur=a_blur;v_brightness=a_brightness;v_opacity=a_opacity;}`;
  const fragmentSource = `precision mediump float;uniform sampler2D u_texture;uniform vec2 u_texel;varying vec2 v_uv;varying float v_blur;varying float v_brightness;varying float v_opacity;void main(){if(v_opacity<0.01)discard;vec2 d=u_texel*v_blur;vec4 color=texture2D(u_texture,v_uv)*0.36;color+=texture2D(u_texture,v_uv+vec2(d.x,0.0))*0.14;color+=texture2D(u_texture,v_uv-vec2(d.x,0.0))*0.14;color+=texture2D(u_texture,v_uv+vec2(0.0,d.y))*0.14;color+=texture2D(u_texture,v_uv-vec2(0.0,d.y))*0.14;color+=texture2D(u_texture,v_uv+d)*0.04;color+=texture2D(u_texture,v_uv-d)*0.04;gl_FragColor=vec4(color.rgb*v_brightness,v_opacity);}`;
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertexSource)); gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "WebGL program link failed"); gl.useProgram(program);
  let mobile = matchMedia("(max-width:767px)").matches;
  const rows = mobile ? 64 : 92, stride = 8;
  const vertices = new Float32Array((rows + 1) * 2 * stride), indices = new Uint16Array(rows * 6);
  for (let row = 0; row < rows; row += 1) { const offset = row * 6, left = row * 2; indices.set([left,left+1,left+2,left+1,left+3,left+2], offset); }
  const vertexBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  ([ ["a_position",3,0], ["a_uv",2,3], ["a_blur",1,5], ["a_brightness",1,6], ["a_opacity",1,7] ] as const).forEach(([name,size,offset]) => { const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride*4,offset*4); });
  const centerLocation=gl.getUniformLocation(program,"u_center"), texelLocation=gl.getUniformLocation(program,"u_texel");
  const textures: TextureRecord[] = imageSources.map((source, projectIndex) => {
    const record: TextureRecord={texture:gl.createTexture(),width:1,height:1};gl.bindTexture(gl.TEXTURE_2D,record.texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    const image = new Image();
    pendingImages.push(image);
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (disposed) return;
      try {
        record.width = image.naturalWidth;
        record.height = image.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, record.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        record.ready = true;
        canvas.dispatchEvent(new CustomEvent("iz-texture-ready", { detail: { index: projectIndex } }));
      } catch (error) {
        canvas.dispatchEvent(new CustomEvent("iz-texture-error", { detail: { index: projectIndex, error } }));
      }
    };
    image.onerror = () => canvas.dispatchEvent(new CustomEvent("iz-texture-error", { detail: { index: projectIndex } }));
    image.src = source;
    return record;
  });
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  let layout={width:1,height:1,top:0,viewport:innerHeight}, signature="";
  const resize=()=>{const bounds=canvas.getBoundingClientRect();layout={width:Math.max(1,canvas.clientWidth),height:Math.max(1,canvas.clientHeight),top:bounds.top,viewport:innerHeight};mobile=matchMedia("(max-width:767px)").matches;const ratio=Math.min(devicePixelRatio||1,MAX_DPR),width=Math.max(1,Math.round(layout.width*ratio)),height=Math.max(1,Math.round(layout.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}};
  const render=(progress:number)=>{
    if (disposed || gl.isContextLost()) return false;
    gl.useProgram(program);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const cardGap=mobile?.025:.035,center=mobile?.5:(layout.viewport*.5-layout.top)/layout.height,cardAspect=mobile?3/4:815/458.44;
    const desiredHeight=layout.width*.92/cardAspect/layout.height,availableHeight=mobile?.86:Math.max(.02,2*Math.min(center,1-center)-.12),frontHeight=Math.min(desiredHeight,availableHeight),cardWidth=Math.min(.92,frontHeight*layout.height*cardAspect/layout.width);
    const nextSignature=`${cardWidth.toFixed(5)}:${frontHeight.toFixed(5)}:${center.toFixed(5)}`;if(signature!==nextSignature){signature=nextSignature;canvas.parentElement?.style.setProperty("--iz-card-width",`${cardWidth*100}%`);canvas.parentElement?.style.setProperty("--iz-card-height",`${frontHeight*100}%`);canvas.parentElement?.style.setProperty("--iz-card-center",`${center*100}%`);}
    gl.uniform1f(centerLocation,1-2*center);const topLine=center-frontHeight*.5,bottomLine=center+frontHeight*.5,radius=mobile?.034:.04,arcLength=Math.PI*radius*.5,planeGap=mobile?.065:.085,maxPlaneLength=mobile?.13:.17;
    for(let projectIndex=imageSources.length-1;projectIndex>=0;projectIndex-=1){
      if (!textures[projectIndex].ready) continue;
      if(projectIndex-progress>1.2||projectIndex-progress< -1.3)continue;const texture=textures[projectIndex],displayAspect=layout.width*cardWidth/(layout.height*frontHeight),textureAspect=texture.width/texture.height,uScale=textureAspect>displayAspect?displayAspect/textureAspect:1,vScale=textureAspect<displayAspect?textureAspect/displayAspect:1;let visibleRows=0;
      for(let row=0;row<=rows;row+=1){const t=row/rows,paperY=(projectIndex-progress)*(1+cardGap)+t;let mappedY=topLine+paperY*frontHeight,z=0,opacity=1,backness=0,blur=0;
        if(paperY<0||paperY>1){const above=paperY<0,depth=(above?-paperY:paperY-1)*frontHeight;if(depth<arcLength){const theta=depth/radius;mappedY=(above?topLine:bottomLine)+(above?-1:1)*radius*Math.sin(theta);z=-radius*(1-Math.cos(theta));backness=depth/arcLength;}else{const tail=depth-arcLength,gapBlend=1-Math.exp(-tail/.028);mappedY=(above?topLine:bottomLine)+(above?-1:1)*radius;z=-(radius+planeGap*gapBlend+tail*1.08);backness=1;opacity=clamp(1-tail/maxPlaneLength);}blur=backness*(mobile?3.5:5.5);}
        if(paperY>1+(arcLength+maxPlaneLength)/frontHeight||paperY<-(arcLength+maxPlaneLength)/frontHeight)opacity=0;if(opacity>.01)visibleRows+=1;
        for(let column=0;column<2;column+=1){const offset=(row*2+column)*stride;vertices[offset]=column?cardWidth:-cardWidth;vertices[offset+1]=mappedY;vertices[offset+2]=z;vertices[offset+3]=.5+(column-.5)*uScale;vertices[offset+4]=.5+((1-t)-.5)*vScale;vertices[offset+5]=blur;vertices[offset+6]=1-backness*.36;vertices[offset+7]=opacity;}
      }
      if(!visibleRows)continue;gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,vertices);gl.bindTexture(gl.TEXTURE_2D,texture.texture);gl.uniform2f(texelLocation,1/texture.width,1/texture.height);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    }
    return Boolean(textures[Math.round(progress)]?.ready);
  };
  resize();return{render,resize,dispose:()=>{disposed=true;pendingImages.forEach(image=>{image.onload=null;image.onerror=null;});textures.forEach(record=>gl.deleteTexture(record.texture));gl.deleteBuffer(vertexBuffer);gl.deleteBuffer(indexBuffer);gl.deleteProgram(program);}};
}
