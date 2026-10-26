import { useEffect, useState } from "react";
import { useLanyard } from "use-lanyard";
import { dither } from "../utils/dither";
import "./ProfileCard.css";

const DISCORD_ID = "413331641109446656";

const ProfileCard: React.FC = () => {
  const data = useLanyard(DISCORD_ID);
  const [avatarLink, setAvatarLink] = useState("");
  const activities = (data?.activities ?? [])
    .filter(({ name }) => name.toLowerCase() !== "spotify")
    .map(({ type, name, details, state, emoji }) =>
      [type === 4 ? emoji?.name : name, details, state].filter(Boolean).join(" — ")
    )
    .filter(Boolean);

  useEffect(() => {
    const hash = data?.discord_user?.avatar;
    if (!hash) return;

    const key = `avatar-${hash}`;
    const cached = localStorage.getItem(key);

    // if (cached) {
    //   setAvatarLink(cached);
    //   return;
    // }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const result = dither(img);
      if (!result) return;

      try {
        localStorage.setItem(key, result);
      } catch {
      }

      setAvatarLink(result);
    };

    img.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${hash}.png?size=512`;

    return () => {
      img.onload = null;
    };
  }, [data?.discord_user?.avatar]);

  return (
    <div className="pfp_wrapper">
      {/*<img
        className="pfp_shadow"
        height={250}
        width={250}
        src={avatarLink}
        alt=""
        aria-hidden="true"
      />*/}
      <img
        className="pfp"
        height={250}
        width={250}
        src={avatarLink}
        alt="User avatar"
      />
      <p className="discord-status">{data?.discord_status}</p>
      {activities.map((activity, i) => (
        <span className="discord-status" key={i}>{activity}</span>
      ))}
    </div>
  );
};

export default ProfileCard;
