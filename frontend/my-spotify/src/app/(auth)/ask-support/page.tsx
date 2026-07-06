'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Message from '@/components/ui/Message';

import { useAuth } from '@/contexts/AuthContext';
import { useSubmitTicket } from '@/hooks/queries/user/useSubmitTicket';

export default function AskSupportPage() {
  const router = useRouter();
  const { user: authUser} = useAuth() as any;

  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const submitTicket = useSubmitTicket();

  const handleSubmit = () => {
    const trimmed = question.trim();

    if (!trimmed) {
      setError('Please enter your question.');
      return;
    }

    setError('');

    submitTicket.mutate(
      { uid: authUser.id ,message: trimmed },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
      }
    );
  };

  return (
    <>
        <h1 className="text-2xl font-bold text-green-500 text-center mb-6 tracking-wide">
        Contact Support
        </h1>

        <p className="text-sm text-neutral-400 text-center mb-6">
        Describe your issue and our support team will respond as soon as possible.
        </p>

        <div className="space-y-2">
        <label className="text-sm text-neutral-300 font-medium">
            Your Question
        </label>

        <textarea
            value={question}
            onChange={(e) => {
            setQuestion(e.target.value);
            setError('');
            }}
            rows={8}
            placeholder="Explain your issue..."
            className="
            w-full
            rounded-lg
            bg-neutral-800
            border
            border-neutral-700
            p-3
            text-sm
            text-white
            resize-none
            focus:outline-none
            focus:ring-2
            focus:ring-green-500
            focus:border-transparent
            "
        />

        <Alert message={error} />
        </div>

        <div className="flex gap-3 mt-6">
        <Button
            variant="secondary"
            onClick={() => router.push('/settings')}
        >
            Cancel
        </Button>

        <Button
            disabled={submitTicket.isPending}
            onClick={handleSubmit}
        >
            {submitTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
        </Button>
        </div>

        <Message
            isOpen={showSuccess}
            type="confirm"
            title="Ticket Submitted"
            description="Your support request has been submitted successfully. We'll get back to you as soon as possible."
            confirmLabel="OK"
            onConfirm={() => router.push('/settings')}
        />
    </>
    );
}