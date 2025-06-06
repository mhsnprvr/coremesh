import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/UI/Dialog.tsx";
import { Button } from "@components/UI/Button.tsx";
import { LockKeyholeOpenIcon } from "lucide-react";
import { useRefreshKeysDialog } from "./useRefreshKeysDialog.ts";
import { useDevice } from "@core/stores/deviceStore.ts";
import { useMessageStore } from "@core/stores/messageStore.ts";
import { deviceNameParser } from "@app/core/utils/nameParser.ts";

export interface RefreshKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefreshKeysDialog = ({
  open,
  onOpenChange,
}: RefreshKeysDialogProps) => {
  const { activeChat } = useMessageStore();
  const { nodeErrors, nodes } = useDevice();
  const { handleCloseDialog, handleNodeRemove } = useRefreshKeysDialog();

  const nodeErrorNum = nodeErrors.get(activeChat);

  if (!nodeErrorNum) {
    console.error("Node with error not found");
    return null;
  }

  const nodeWithError = nodes.get(nodeErrorNum?.node ?? 0);

  if (!nodeWithError) {
    console.error("Node with error not found");
    return null;
  }

  const text = {
    title: `Keys Mismatch - ${
      deviceNameParser(nodeWithError?.user?.longName) ?? ""
    }`,
    description: `Your node is unable to send a direct message to node: ${
      deviceNameParser(nodeWithError?.user?.longName) ?? ""
    } (${
      deviceNameParser(nodeWithError?.user?.shortName) ?? ""
    }). This is due to the remote node's current public key does not match the previously stored key for this node.`,
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-8 flex flex-col gap-2">
        <DialogClose onClick={handleCloseDialog} />
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
        </DialogHeader>
        {text.description}
        <ul className="mt-2">
          <li className="flex place-items-center gap-2 items-start">
            <div className="p-2 bg-slate-500 rounded-lg mt-1">
              <LockKeyholeOpenIcon
                size={30}
                className="text-white justify-center"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <p className="font-bold mb-0.5">Accept New Keys</p>
                <p>
                  This will remove the node from device and request new keys.
                </p>
              </div>
              <Button variant="default" onClick={handleNodeRemove}>
                Request New Keys
              </Button>
              <Button variant="outline" onClick={handleCloseDialog}>
                Dismiss
              </Button>
            </div>
          </li>
        </ul>
        {/* </DialogDescription> */}
      </DialogContent>
    </Dialog>
  );
};
