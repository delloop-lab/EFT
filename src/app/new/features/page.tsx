import type { Metadata } from "next";
import { GuildHubFeatures } from "@/components/guild-hub/GuildHubFeatures";

export const metadata: Metadata = {
  title: "Features & Benefits · EFT Guild Hub",
  description:
    "Client-facing overview of features and benefits of the EFT Guild Hub — private members space for tapping, training, and practice.",
};

export default function NewFeaturesPage() {
  return <GuildHubFeatures />;
}
