"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteDocumentAction } from "@/features/client/documents-actions";

export function DeleteDocumentButton({
  documentId,
  clientId,
  filePath,
}: {
  documentId: string;
  clientId: string;
  filePath: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDocumentAction(documentId, clientId, filePath);
    } catch (error) {
      alert("Failed to delete document");
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
