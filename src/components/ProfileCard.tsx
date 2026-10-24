import { useEffect, useState } from "react";
import { useLanyard } from "use-lanyard";
import "./ProfileCard.css";

const DISCORD_ID = "413331641109446656";

const ProfileCard: React.FC = () => {
  const data: any = useLanyard(DISCORD_ID);
  const [avatarLink, setAvatarLink] = useState("");

  useEffect(() => {
    const hash = data?.discord_user?.avatar;
    if (!hash) return;

    const key = `avatar-${hash}`;
    const cached = localStorage.getItem(key);

    if (cached) {
      setAvatarLink(cached);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 128, 128);

      const image = ctx.getImageData(0, 0, 128, 128);
      const p = image.data;

      // Floyd-Steinberg error diffusion
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const i = (y * 128 + x) * 4;
          const gray = p[i] * 0.2126 + p[i + 1] * 0.7152 + p[i + 2] * 0.0722;
          const error = gray - (gray < 128 ? 0 : 255);

          const color = gray < 128
            ? [24, 9, 54]
            : [204, 255, 204];

          p[i] = color[0];
          p[i + 1] = color[1];
          p[i + 2] = color[2];

          const diffuse = (dx: number, dy: number, weight: number) => {
            if (x + dx >= 128 || x + dx < 0 || y + dy >= 128) return;
            const j = ((y + dy) * 128 + x + dx) * 4;
            for (let c = 0; c < 3; c++) {
              p[j + c] = Math.max(0, Math.min(255, p[j + c] + error * weight));
            }
          };

          diffuse(1, 0, 7 / 16);
          diffuse(-1, 1, 3 / 16);
          diffuse(0, 1, 5 / 16);
          diffuse(1, 1, 1 / 16);
        }
      }

      ctx.putImageData(image, 0, 0);

      const result = canvas.toDataURL("image/png");

      try {
        localStorage.setItem(key, result);
      } catch {
        // Storage unavailable or quota exceeded
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
    </div>
  );
};

export default ProfileCard;
