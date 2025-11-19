"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit, Trash2, Check, X, Download } from "lucide-react";

interface TableActionsProps {
  viewUrl?: string;
  editUrl?: string;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onDownload?: () => void;
  isActive?: boolean;
  showDelete?: boolean;
  showToggle?: boolean;
  showDownload?: boolean;
}

export function TableActions({
  viewUrl,
  editUrl,
  onDelete,
  onToggleStatus,
  onDownload,
  isActive,
  showDelete = true,
  showToggle = false,
  showDownload = false,
}: TableActionsProps) {
  return (
    <div className="flex space-x-2">
      {viewUrl && (
        <Link href={viewUrl}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )}
      {editUrl && (
        <Link href={editUrl}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      )}
      {showToggle && onToggleStatus && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleStatus}
          className={isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
        >
          {isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </Button>
      )}
      {showDownload && onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="text-blue-600 hover:text-blue-700"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

