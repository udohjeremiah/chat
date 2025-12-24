import { useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddIcon } from "@hugeicons/core-free-icons";
import NewChatForm from "@/components/new-chat-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function NewChatDialog() {
  const isTablet = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  if (isTablet) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon-sm" className="rounded-full">
            <HugeiconsIcon icon={AddIcon} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new chat</DialogTitle>
            <DialogDescription>
              Enter a username to find someone and start chatting.
            </DialogDescription>
          </DialogHeader>
          <NewChatForm closeDialog={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon-sm" className="rounded-full">
          <HugeiconsIcon icon={AddIcon} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Start a new chat</DrawerTitle>
          <DrawerDescription>
            Enter a username to find someone and start chatting.
          </DrawerDescription>
        </DrawerHeader>
        <NewChatForm closeDialog={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
