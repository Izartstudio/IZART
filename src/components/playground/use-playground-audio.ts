"use client";

import { useEffect, useRef, useState } from "react";

const fadeDuration = 0.7;
type Voice = {
  element: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
  url: string;
  startedAt: number;
  stopTimer?: ReturnType<typeof setTimeout>;
};

function releaseAudio(element: HTMLAudioElement) {
  element.pause();
  element.removeAttribute("src");
  element.load();
}

function stopVoice(voice: Voice) {
  clearTimeout(voice.stopTimer);
  releaseAudio(voice.element);
  voice.source.disconnect();
  voice.gain.disconnect();
}

export function usePlaygroundAudio(url?: string | null, nextUrl?: string | null) {
  const context = useRef<AudioContext | null>(null);
  const active = useRef<Voice | null>(null);
  const buffered = useRef<{ url: string; element: HTMLAudioElement } | null>(null);
  const voices = useRef(new Set<Voice>());
  const intent = useRef(false);
  const muted = useRef(false);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const audible = Boolean(readyUrl);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const currentVoices = voices.current;
    return () => {
      intent.current = false;
      currentVoices.forEach(stopVoice);
      currentVoices.clear();
      if (buffered.current) releaseAudio(buffered.current.element);
      buffered.current = null;
      active.current = null;
      const audio = context.current;
      context.current = null;
      if (audio) void audio.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const audio = context.current;
    if (!playing || !audio) return;
    let pending: Voice | null = null;
    let cancelled = false;

    function transition(next: Voice | null, time: number) {
      const previous = active.current;
      active.current = next;
      if (!previous) return;
      const level = Math.min(1, (time - previous.startedAt) / fadeDuration);
      previous.gain.gain.cancelScheduledValues(time);
      previous.gain.gain.setValueAtTime(level, time);
      previous.gain.gain.linearRampToValueAtTime(0, time + fadeDuration);
      previous.stopTimer = setTimeout(() => {
        stopVoice(previous);
        voices.current.delete(previous);
      }, fadeDuration * 1000);
    }

    async function loadTrack(audio: AudioContext, trackUrl: string) {
      try {
        const warm = buffered.current?.url === trackUrl ? buffered.current : null;
        if (warm) buffered.current = null;
        const element = warm?.element ?? new Audio();
        element.preload = "auto";
        element.loop = true;
        const source = audio.createMediaElementSource(element);
        const gain = audio.createGain();
        const voice: Voice = { element, source, gain, url: trackUrl, startedAt: 0 };
        pending = voice;
        gain.gain.value = 0;
        source.connect(gain).connect(audio.destination);
        if (!warm) element.src = trackUrl;
        await element.play();
        if (cancelled || !intent.current) return;

        const time = audio.currentTime;
        voice.startedAt = time;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(1, time + fadeDuration);
        voices.current.add(voice);
        pending = null;
        transition(voice, time);
        setReadyUrl(trackUrl);
        setStatus("");
      } catch {
        if (pending) {
          stopVoice(pending);
          pending = null;
        }
        if (!cancelled && intent.current) {
          setStatus(active.current ? "Track unavailable. Previous track is still playing." : "Track unavailable. Tap the waveform to retry.");
        }
      }
    }

    if (!url) {
      transition(null, audio.currentTime);
      setReadyUrl(null);
      setStatus("");
    } else if (active.current?.url !== url) {
      setStatus("Loading track…");
      void loadTrack(audio, url);
    } else {
      setStatus("");
    }
    return () => {
      cancelled = true;
      if (pending) {
        stopVoice(pending);
        pending = null;
      }
    };
  }, [playing, url]);

  useEffect(() => {
    if (!playing || !url || !nextUrl || url === nextUrl) {
      if (buffered.current) releaseAudio(buffered.current.element);
      buffered.current = null;
      return;
    }
    if (readyUrl !== url || buffered.current?.url === nextUrl) return;
    if (buffered.current) releaseAudio(buffered.current.element);
    const element = new Audio();
    element.preload = "auto";
    element.src = nextUrl;
    buffered.current = { url: nextUrl, element };
  }, [nextUrl, playing, readyUrl, url]);

  useEffect(() => {
    if (!url || muted.current || intent.current) return;
    let cancelled = false;
    const audio = context.current ?? new AudioContext();
    context.current = audio;
    const start = () => {
      if (cancelled || muted.current) return;
      void audio.resume().then(() => {
        if (cancelled || muted.current) return;
        intent.current = true;
        setPlaying(true);
      }).catch(() => {});
    };
    const unlock = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".playground-player__toggle")) return;
      start();
    };
    start();
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      cancelled = true;
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [url, playing]);

  async function toggle() {
    if (intent.current && (audible || !status.startsWith("Track unavailable"))) {
      muted.current = true;
      setReadyUrl(null);
      intent.current = false;
      voices.current.forEach(stopVoice);
      voices.current.clear();
      active.current = null;
      setPlaying(false);
      setStatus("");
      return;
    }
    if (!url) return;
    muted.current = false;
    if (playing) {
      intent.current = false;
      setPlaying(false);
      return;
    }
    intent.current = true;
    try {
      const audio = context.current ?? new AudioContext();
      context.current = audio;
      await audio.resume();
      if (intent.current) setPlaying(true);
    } catch {
      intent.current = false;
      setStatus("Audio could not start. Tap Play to retry.");
    }
  }

  return { playing, audible, status, toggle };
}
