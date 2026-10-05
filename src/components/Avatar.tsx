import type { Member } from "@/lib/types";

export function Avatar({
  member,
  size = "md",
}: {
  member: Pick<Member, "name" | "initials" | "avatarColor">;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: member.avatarColor }}
      aria-hidden
    >
      {member.initials}
    </div>
  );
}
