"use client";

import React from "react";
import { Check, X } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  isOpen: boolean;
  status: "success" | "failed";
  plan?: string | null;
  referenceId?: string | null;
  onClose: () => void;
};

export default function PaymentResultModal({ isOpen, status, plan, referenceId, onClose }: Props) {
  if (!isOpen) return null;

  const isSuccess = status === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-md ${isSuccess ? "bg-green-900/80 border-green-500" : "bg-red-900/80 border-red-500"} border rounded-2xl p-6 space-y-4 shadow-2xl`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSuccess ? "bg-green-600" : "bg-red-600"}`}>
            {isSuccess ? <Check className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{isSuccess ? "Transaction Successful" : "Transaction Failed"}</h3>
            <p className="text-sm text-neutral-200">{isSuccess ? `You've been upgraded to ${plan?.toUpperCase() ?? "the selected"} tier.` : "The transaction was not successful. Please try again or contact support."}</p>
          </div>
        </div>

        {referenceId && (
          <div className="text-sm text-neutral-300">Reference: <span className="font-mono">{referenceId}</span></div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose} variant="primary">OK</Button>
        </div>
      </div>
    </div>
  );
}
