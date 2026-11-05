import { getPlaygroundPage } from "@/sanity/playground";

export async function GET(request: Request) {
  const genre = new URL(request.url).searchParams.get("genre");
  const page = await getPlaygroundPage();
  const track = page.genres.find(item => item._key === genre)?.track?.url;
  if (!track || !/^https:\/\/cdn\.sanity\.io\/files\/[\w-]+\/[\w-]+\/[a-f0-9]+\.mp3$/i.test(track)) {
    return new Response(null, { status: 404 });
  }

  try {
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);
    const options = { redirect: "error", cache: "no-store", signal: request.signal, headers } as const;
    let audio = await fetch(track, options);
    const token = process.env.SANITY_API_READ_TOKEN;
    if ((audio.status === 401 || audio.status === 403) && token) {
      await audio.body?.cancel();
      headers.set("Authorization", `Bearer ${token}`);
      audio = await fetch(track, options);
    }
    if ((!audio.ok && audio.status !== 416) || !audio.body) return new Response(null, { status: 502 });
    const responseHeaders = new Headers({ "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=60" });
    for (const name of ["accept-ranges", "content-range", "content-length"]) {
      const value = audio.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(audio.body, { status: audio.status, headers: responseHeaders });
  } catch {
    return new Response(null, { status: 502 });
  }
}
