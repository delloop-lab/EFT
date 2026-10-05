import type { ResourceItem } from "./types";

export const resources: ResourceItem[] = [
  {
    id: "res-audio-intro",
    title: "EFT intro tapping guide",
    description:
      "A short audio walkthrough of the basic tapping points for members new to EFT.",
    kind: "audio",
    fileName: "eft-intro-tapping.wav",
    href: "/resources/audio/eft-intro-tapping.wav",
    duration: "3 sec",
    sizeLabel: "129 KB",
    format: "WAV",
  },
  {
    id: "res-audio-breathing",
    title: "Breathing reset guide",
    description:
      "Calming paced-breathing audio to use before or after a tapping session.",
    kind: "audio",
    fileName: "breathing-reset-guide.wav",
    href: "/resources/audio/breathing-reset-guide.wav",
    duration: "3.5 sec",
    sizeLabel: "151 KB",
    format: "WAV",
  },
  {
    id: "res-audio-evening",
    title: "Evening wind-down",
    description:
      "Gentle evening audio to help members settle and close out the day.",
    kind: "audio",
    fileName: "evening-wind-down.wav",
    href: "/resources/audio/evening-wind-down.wav",
    duration: "4 sec",
    sizeLabel: "172 KB",
    format: "WAV",
  },
  {
    id: "res-video-tapping",
    title: "Tapping sequence demo",
    description:
      "Demo video clip showing a short tapping sequence members can download and revisit offline.",
    kind: "video",
    fileName: "tapping-sequence-demo.mp4",
    href: "/resources/video/tapping-sequence-demo.mp4",
    duration: "Demo clip",
    sizeLabel: "1.1 MB",
    format: "MP4",
  },
  {
    id: "res-video-workshop",
    title: "Workshop recap clip",
    description:
      "A short workshop-style recap video for members who missed the live session.",
    kind: "video",
    fileName: "workshop-recap-clip.mp4",
    href: "/resources/video/workshop-recap-clip.mp4",
    duration: "Demo clip",
    sizeLabel: "503 KB",
    format: "MP4",
  },
];
