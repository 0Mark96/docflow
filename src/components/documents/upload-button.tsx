"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { useUpload } from "./upload-provider";

/** "Carica documenti" in the sidebar: opens the file picker from any page. */
export function UploadButton() {
  const { openPicker } = useUpload();
  return (
    <Button variant="primary" className="w-full" onClick={openPicker}>
      <PlusIcon />
      Carica documenti
    </Button>
  );
}
