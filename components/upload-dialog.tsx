"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export interface UploadDialogProps {
  open: boolean
  onClose: () => void
  /** optional callback once a file is chosen */
  onFile?: (file: File) => void
}

export function UploadDialog({ open, onClose, onFile }: UploadDialogProps) {
  const [selected, setSelected] = useState<File | null>(null)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{"Upload CSV of Leads"}</DialogTitle>
        </DialogHeader>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            setSelected(file)
            if (file && onFile) onFile(file)
          }}
          className="w-full border p-2"
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {"Cancel"}
          </Button>
          <Button
            onClick={() => {
              if (selected && onFile) onFile(selected)
              onClose()
            }}
            disabled={!selected}
          >
            {"Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
