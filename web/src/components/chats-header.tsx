import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon } from "@hugeicons/core-free-icons";
import type { Dispatch, SetStateAction } from "react";
import NetworkAlert from "@/components/network-alert";
import NewChatDialog from "@/components/new-chat-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface ChatsHeaderProps {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  chatsLength: number;
}

export default function ChatsHeader({
  searchText,
  setSearchText,
  chatsLength,
}: ChatsHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-2 border-b px-4 py-2">
      <div className="flex items-center justify-between gap-2">
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search..."
            value={searchText}
            onChange={(event) => setSearchText(event.currentTarget.value)}
          />
          {searchText && (
            <InputGroupAddon align="inline-end">
              {chatsLength} results
            </InputGroupAddon>
          )}
        </InputGroup>
        <NewChatDialog />
      </div>
      <NetworkAlert />
    </div>
  );
}
