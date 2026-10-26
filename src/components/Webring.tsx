import "./Webring.css";
import { helium, nixos_gif, tailscale } from "../utils/base64stuff";

const webring_links = [
	{ href: "https://hrtowii.nekoweb.org", src: "/88x31-madoka.png" },
  { href: "https://dane.gg", src: "https://dane.gg/assets/img/88x31.gif" },
  { href: "https://h4rl.dev", src: "/h4rl.png" },
  { href: "https://experi.uwa.ooo", src: "https://experi.uwa.ooo/88x31-button/experi.gif" },
	{ href: "https://snoolie.gay/", src: "/snoolie.gif" },
	{ href: "https://cyb3r17.space", src: "/cyb3r17.png" },
	{ href: "https://miaow.ing/", src: "https://miaow.ing/images/88x31_miaowing.png" },
	{ href: "https://anemoia.moe", src: "https://anemoia.moe/images/buttons/footer/jesx.gif" },
	{ href: "https://bleedinghe.art", src: "/bleedingheart.png" },
	{ href: "https://scuffed.online/", src: "/scuffed.png" },
	{ href: "https://melqtx.com/", src: "https://melqtx.com/images/mel-88x31.png" },
  { href: "https://kryx.lol", src: "https://files.catbox.moe/zbv4jc.gif" },
  { href: "https://looparchive.pages.dev", src: "https://looparchive.pages.dev/88x31.gif" },
  { href: "https://claration.dev", src: "https://claration.dev/88x31/me.png" }
];

const badge_links = [
	{ href: "https://badge.les.bi", src: "https://badge.les.bi/88x31/trans/bi/half/outset.png", alt: "trans bi" },
	{ href: "/", src: "https://cyber.dabamos.de/88x31/darwin.gif", alt: "darwin" },
  { href: "/", src: "/arch.gif", alt: "arch btw" },
  { href: "https://nixos.org", src: nixos_gif, alt: "nixos" },
	{ href: "https://helium.computer", src: helium, alt: "helium" },
	{ href: "https://tailscale.com", src: tailscale, alt: "tailscale" },
  { href: "https://last.fm", src: "https://www.averymt.zip/img/lastfm.gif", alt: "lastfm" },
  { src: "https://88x31.nl/gifs/eightyeight.gif", href: "https://eightyeightthirty.one/" },
  { href: "https://nekoweb.org/", src: "https://nekoweb.org/assets/buttons/button6.gif" },
  { href: "https://datakra.sh/", src: "https://datakra.sh/assets/datakrashbutton2.png" },
  { href: "https://datakra.sh/", src: "https://88x31.datakra.sh/img/random/cyberpsychosis_arasaka.gif" },
];

interface ScrollItem {
  href: string;
  src: string;
  alt?: string;
}

interface ScrollRowProps {
  items: ScrollItem[];
}

const ScrollRow = ({ items }: ScrollRowProps) => (
	<div className="webring-row">
		<div className="webring-track">
			{Array.from({ length: 8 }, (_, copy) => (
				<div key={copy} className="webring-group">
					{items.map(({ href, src, alt }, i) => (
						<a key={i} href={href} tabIndex={copy > 0 ? -1 : undefined}>
							<img src={src} alt={alt ?? href} width={88} height={31} />
						</a>
					))}
				</div>
			))}
		</div>
	</div>
);

function Petring() {
  return (
    <div className="petring">
      <div className="petring_logo">
        <a href="https://webring.pet">
          <img src="https://webring.pet/petring-button-midnight.png"/>
        </a>
      </div>
      <div className="petring_buttons">
        <div className="petring_button">
          <a href="https://webring.pet/user/htrowii/prev">
            <p>previous!</p>
          </a>
        </div>
        <div className="petring_button">
          <a href="https://webring.pet/user/htrowii/random">
            <p>random!</p>
          </a>
        </div>
        <div className="petring_button">
          <a href="https://webring.pet/user/htrowii/next">
            <p>next!</p>
          </a>
        </div>
      </div>
    </div>
  );
}
const Webring = () => (
	<>
		<ScrollRow items={webring_links} />
    <ScrollRow items={badge_links} />
		<Petring/>
	</>
);

export default Webring;
