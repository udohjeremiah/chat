import { HugeiconsIcon } from "@hugeicons/react";
import { Ellipsis, LogoutIcon, UserX } from "@hugeicons/core-free-icons";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useNetworkState } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { useApp } from "@/providers/app-provider";
import { formatServiceError } from "@/utils/format-service-error";
import AvatarWithPresence from "@/components/avatar-with-presence";
import { deleteAccount } from "@/services/users/delete-account";

export default function ChatsFooter() {
  const network = useNetworkState();
  const [alertOpen, setAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { app, setApp } = useApp();

  const handleLogout = () => {
    delete apiClient.defaults.headers.common["Authorization"];
    localStorage.removeItem("jwt");

    setApp((prev) => ({
      ...prev,
      user: undefined,
      chatList: undefined,
      chatLoaded: undefined,
      chat: undefined,
      activeChatUserId: undefined,
    }));

    router.invalidate();
    router.navigate({ to: "/signin", reloadDocument: true });
  };

  const handleDeleteAccount = async () => {
    if (!app.user || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteAccount(app.user._id);

      router.invalidate();
      router.navigate({ to: "/signin", reloadDocument: true });
    } catch (error) {
      console.error(formatServiceError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-t px-4 py-2">
      <div className="flex items-center justify-between gap-2 rounded-md border px-4 py-2">
        <div className="flex items-center gap-2">
          <AvatarWithPresence
            src={app.user?.avatar}
            name={app.user?.name}
            status={network.online ? "online" : "offline"}
          />
          <div className="flex flex-col gap-0.5 font-medium">
            <span className="truncate text-sm leading-none">
              {app.user?.name}
            </span>
            <span className="truncate text-xs leading-none text-muted-foreground">
              @{app.user?.username}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <HugeiconsIcon icon={Ellipsis} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleLogout}>
              <HugeiconsIcon icon={LogoutIcon} /> Logout
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setAlertOpen(true)}
            >
              <HugeiconsIcon icon={UserX} /> Delete account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your messages and data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              {isDeleting ? "Deleting..." : "Delete "}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
