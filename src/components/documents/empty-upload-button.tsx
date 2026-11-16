"use client";

import { Button } from "@/components/ui/button";
import { UploadIcon } from "@/components/ui/icons";
import { useUpload } from "./upload-provider";

export function EmptyUploadButton() {
  const { openPicker } = useUpload();
  return (
    <Button variant="primary" onClick={openPicker} className="mt-1">
      <UploadIcon />
      Carica documenti
    </Button>
  );
}
