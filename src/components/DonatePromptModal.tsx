"use client";
import { HandHeart } from "lucide-react";
import { DONATE_URL } from "@/lib/deployment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onDismiss: () => void;
}

export function DonatePromptModal({ open, onDismiss }: Props) {
  if (!DONATE_URL) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <HandHeart className="h-6 w-6" />
          </span>
          <DialogTitle className="mt-3 text-xl">Still here? That means a lot.</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6">
            You&apos;ve spent a good while with JSON Prism today. No ads, no account, nothing you paste
            ever leaves your browser - it stays that way because it&apos;s a labor of love, not a business.
            <br />
            <br />
            If it saved you a headache, a small donation helps keep it free and maintained. Never required - always appreciated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col sm:space-x-0">
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDismiss}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-400"
          >
            <HandHeart className="h-4 w-4" /> Donate ❤️
          </a>
          <Button variant="ghost" onClick={onDismiss} className="w-full">
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
