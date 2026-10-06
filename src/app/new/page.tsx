import type { Metadata } from "next";
import { GuildHubDashboard } from "@/components/guild-hub/GuildHubDashboard";

export const metadata: Metadata = {
  title: "EFT Guild Hub",
  description:
    "Private interactive demo of the EFT Guild Hub — members-only board for tapping, training, and practice partners.",
};

export default function NewProductPage() {
  return <GuildHubDashboard />;
}
