import Button from "@/components/ui/Button";

type PrivacyModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function PrivacyModal({
    isOpen,
    onClose,
}: PrivacyModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-4 sm:px-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Privacy Policy
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl leading-none text-neutral-400 transition hover:text-white"
                        aria-label="Close privacy policy"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-4 py-5 text-sm text-neutral-300 sm:px-6">
                    <p>
                        By creating an account, you agree that MySpotify may
                        store your account information for authentication and
                        service functionality.
                    </p>

                    <p>
                        We collect information such as your display name, email
                        address, birth date, and selected gender. This
                        information is used solely to provide and improve the
                        service.
                    </p>

                    <p>
                        Your password is securely stored using
                        industry-standard hashing and is never stored in plain
                        text.
                    </p>

                    <p>
                        We do not sell your personal information to third
                        parties. Your information may only be shared when
                        required by law or to provide essential service
                        functionality.
                    </p>

                    <p>
                        You may request deletion of your account and associated
                        data at any time through your account settings or by
                        contacting support.
                    </p>

                    <p>
                        By continuing to use MySpotify, you acknowledge that you
                        have read and understood this Privacy Policy.
                    </p>
                </div>

                <div className="flex justify-center border-t border-neutral-700 px-4 py-4 sm:px-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto sm:min-w-40"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}