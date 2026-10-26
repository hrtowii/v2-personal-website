import { useEffect, useState } from "react";
import { dither } from "../utils/dither";
import "./Music.css";

const LASTFM_USER = "htrowii";
const LASTFM_API_KEY = "7a6a9d9af3a543d82266d8f0ff110f2c";

interface LastfmTrack {
  name: string;
  url: string;
  artist: { "#text": string };
  image?: { "#text": string; size: string }[];
  "@attr"?: { nowplaying?: string };
}

export default function Music() {
  const [tracks, setTracks] = useState<LastfmTrack[]>([]);
  const [art, setArt] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=5`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => setTracks(data.recenttracks?.track ?? []))
      .catch(console.error);

    return () => controller.abort();
  }, []);

  const cover = tracks[0]?.image?.findLast((image) => image["#text"])?.["#text"];

  return (
    <section className="lastfm">
      {cover && (
        <img
          key={cover}
          src={cover}
          crossOrigin="anonymous"
          alt=""
          hidden
          onLoad={(e) => {
            try {
              setArt(dither(e.currentTarget));
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {art && <img className="lastfm-art" src={art} alt="music album art" />}

      <h3>last_fm</h3>

      <ul>
        {tracks.map((track, i) => (
          <li key={i}>
            <a href={track.url}>{track.name}</a> — {track.artist["#text"]}
            {track["@attr"]?.nowplaying === "true" && " (playing)"}
          </li>
        ))}
      </ul>
      <a className="lastfm-link" href="https://last.fm/u/htrowii">
        my lastfm
      </a>
    </section>
  );
}
