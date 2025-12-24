import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import { generateAvatarGradient } from "@/utils/generate-avatar-gradient";

interface AvatarWithPresenceProps {
  src?: string;
  name?: string;
  status?: "online" | "offline";
}

export default function AvatarWithPresence({
  src,
  name,
  status,
}: AvatarWithPresenceProps) {
  return (
    <div className="relative w-fit">
      <Avatar style={{ background: generateAvatarGradient(name ?? "") }}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "pointer-events-none absolute right-0 bottom-0 size-2 rounded-full ring-2 ring-background",
          status === "online" ? "bg-green-600" : "bg-muted-foreground",
        )}
      >
        <span className="sr-only">{status}</span>
      </span>
    </div>
  );
}
