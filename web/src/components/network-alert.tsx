import { useNetworkState } from "@uidotdev/usehooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function NetworkAlert() {
  const network = useNetworkState();

  if (network.online) return;

  return (
    <Alert variant="destructive">
      <HugeiconsIcon icon={Alert02Icon} />
      <AlertTitle>Computer not connected</AlertTitle>
      <AlertDescription>
        Make sure your computer has an active internet connection.
      </AlertDescription>
    </Alert>
  );
}
