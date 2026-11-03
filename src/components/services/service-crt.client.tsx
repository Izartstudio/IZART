"use client";
import { useEffect, useRef, type RefObject } from "react";
import { createServiceCrt } from "./service-crt-renderer";
import styles from "./services-showcase.module.css";

export function ServiceCrt({ stageRef, active, poster, mobilePoster }: {
  stageRef: RefObject<HTMLDivElement | null>; active: number; poster: string; mobilePoster?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createServiceCrt> | null>(null);
  const sourceRef = useRef({ active, poster, mobilePoster });
  useEffect(() => { sourceRef.current={active,poster,mobilePoster}; }, [active,poster,mobilePoster]);
  useEffect(() => {
    const canvas=canvasRef.current,stage=stageRef.current;
    if(!canvas || !stage)return;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const mobile=matchMedia("(max-width: 767px)");
    let visible=false;
    const source=()=>{
      const data=sourceRef.current;
      const video=stage.querySelector<HTMLVideoElement>(`[data-service-media="${data.active}"] video`);
      rendererRef.current?.setSource(video,mobile.matches?data.mobilePoster||data.poster:data.poster);
    };
    const sync=()=>rendererRef.current?.setRunning(visible&&!document.hidden,motion.matches);
    const start=()=>{
      rendererRef.current?.dispose();rendererRef.current=null;canvas.dataset.ready="false";
      try{rendererRef.current=createServiceCrt(canvas);source();sync();}catch{/* Video and CSS CRT fallback stay visible. */}
    };
    const lost=(event:Event)=>{event.preventDefault();canvas.dataset.ready="false";rendererRef.current?.setRunning(false,motion.matches);};
    start();
    const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});visibility.observe(canvas);
    const resize=new ResizeObserver(()=>rendererRef.current?.redraw());resize.observe(stage);
    canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",start);
    stage.addEventListener("service-crt-source",source);
    document.addEventListener("visibilitychange",sync);window.addEventListener("pageshow",sync);
    motion.addEventListener("change",sync);mobile.addEventListener("change",source);
    return()=>{
      visibility.disconnect();resize.disconnect();rendererRef.current?.dispose();rendererRef.current=null;
      canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",start);
      stage.removeEventListener("service-crt-source",source);
      document.removeEventListener("visibilitychange",sync);window.removeEventListener("pageshow",sync);
      motion.removeEventListener("change",sync);mobile.removeEventListener("change",source);
    };
  },[stageRef]);
  useEffect(()=>{stageRef.current?.dispatchEvent(new Event("service-crt-source"));},[active,poster,mobilePoster,stageRef]);
  return <canvas ref={canvasRef} className={styles.crtCanvas} aria-hidden="true" />;
}
