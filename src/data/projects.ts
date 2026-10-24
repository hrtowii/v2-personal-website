export interface Project {
  title: string;
  description: string;
  link: string;
  images?: string[];
  important?: boolean;
}

export const projectdata: { title: string; projects: Project[] }[] = [
  {
    title: "hackathons",
    projects: [
      {
        title: "wayside",
        description:
          "Hack and Roll 2026 top 9: custom badge firmware in C and RN app for streetpass functionality",
        link: "https://github.com/jun-lsh/wayside/tree/master",
        images: [
          "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/171/718/datas/original.jpg",
          "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/171/710/datas/original.jpg",
        ],
        important: true
      },
      {
        title: "hack&roll 2023",
        description: "react native app for timing coffee brewing",
        link: "https://github.com/hrtowii/hnr2023",
        important: false,
      },
      {
        title: "GeekOut 2023",
        description:
          "3rd place winner at GeekOut 2023, proposed e-learning platform 'every school good school'",
        link: "/blog/my-experience-in-geekout-2023/",
        important: true,
      },
      {
        title: "hack&roll 2024",
        description:
          "flutter / dart app to pull cna rss feed and run sentiment analysis w flask",
        link: "https://github.com/hrtowii/hnr2024",
        important: false
      },
      {
        title: "hack&roll 2025",
        description:
          "personal duck from hell, uses py/sh/React/Tauri to detect emotions and troll the user.",
        link: "https://github.com/hrtowii/hacknroll25",
        images: [
          "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/220/385/datas/gallery.jpg",
          "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/220/386/datas/gallery.jpg",
          "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/220/383/datas/gallery.jpg",
        ],
        important: true,
      },
      {
        title: "hackomania 2025",
        description:
          "imagine bereal but for food and with leaderboards, yea... written in react native",
        link: "https://github.com/hrtowii/hackomania2025",
        important: false,
      },
      {
        title: "smu legal tech 2025 <3",
        description:
          "glorified form transcriber pitched really well, won 2nd place!",
        link: "https://github.com/hrtowii/smu-legal-tech",
        important: false,
      },
      {
        title: "hacksmith 6",
        description:
          "code tester with isabelle: generates formal proof in isabelle and tests it w Python, Textual",
        link: "https://github.com/hrtowii/hacksmith",
        important: false,
      },
    ],
  },
  {
    title: "ios stuff",
    projects: [
      {
        title: "KFDFontOverwrite",
        description:
          "Fork of WDBFontOverwrite that uses kfd to overwrite fonts on iOS",
        link: "https://github.com/hrtowii/WDBFontOverwrite",
        important: false,
      },
      {
        title: "Serotonin",
        description:
          "semi-jailbreak written for iOS 16.0 - 16.6.1, using roothide bootstrap",
        link: "https://github.com/SerotoninApp/Serotonin",
        images: ["/serotonin2.jpg", "/serotonin.jpg"],
        important: true,
      },
      {
        title: "Spotify EQ",
        description: "Equalizer tweak for Spotify on iOS",
        link: "https://github.com/hrtowii/SpotifyEQ-iOS",
        important: false,
      },
      {
        title: "SparseThemer",
        description:
          "macOS app that uses SparseRestore exploit and ipatool to replace app icons on iOS",
        link: "https://github.com/haxi0/",
        important: false,
      },
    ],
  },
  {
    title: "other stuff",
    projects: [
      {
        title: "llm-tui-rs",
        description: "tui written in rust to chat w different llm providers",
        link: "https://github.com/hrtowii/llm-tui-rs",
        important: false,
      },
      {
        title: "balatro ai bot",
        description:
          "bot to play balatro, part of internship project - kind of unfinished",
        link: "https://github.com/hrtowii/balatrobot",
        important: false,
      },
      {
        title: "hrt tracker",
        description: "hrt tracking app built w/ svelte (incomplete)",
        link: "https://github.com/hrtowii/hrt-tracker",
        important: false,
      },
      {
        title: "img2ascii_c",
        description: "convert images to colored ascii art w/ C",
        link: "https://github.com/hrtowii/img2ascii_c",
        images: [
          "https://github.com/hrtowii/img2ascii_c/blob/main/output.png?raw=true",
        ],
        important: false,
      },
      {
        title: "my website v3",
        description: "old vers of this website built with astro",
        link: "https://github.com/hrtowii/personal-website",
        important: false,
      },
      {
        title: "my website v4",
        description: "new version... old one had no feeling ykwim",
        link: "https://github.com/hrtowii/personal-website/tree/rewrite",
        important: false,
      },
    ],
  },
];
