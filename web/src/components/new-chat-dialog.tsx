import { useState } from "react";
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

export default function NewChatDialog() {
  const [open, setOpen] = useState(false);

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
