"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { generateOtp, verifyOtp, changePassword } from "@/services/authService";
import { validateEmail, validatePassword, validateOtp } from "@/utils/authUtils";

type ResetStage = "email" | "otp" | "password";

type ResetErrors = {
    emailError: string;
    otpError: string;
    passwordError: string;
    confirmPasswordError: string;
};

export default function PasswordResetPage() {
    const router = useRouter();

    const [stage, setStage] = useState<ResetStage>("email");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpId, setOtpId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [secondsLeft, setSecondsLeft] = useState(0);

    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<ResetErrors>({
        emailError: "",
        otpError: "",
        passwordError: "",
        confirmPasswordError: "",
    });


    useEffect(() => {
        if (stage !== "otp") return;
        if (secondsLeft <= 0) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [stage, secondsLeft]);


    const handleGenerateOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(email);

        setErrors((prev) => ({
            ...prev,
            emailError,
        }));

        if (emailError) return;

        try {
            const result = await generateOtp(email);
            setOtpId(result);

            setOtp("");
            setSecondsLeft(15 * 60);
            setStage("otp");
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpError = validateOtp(otp)
        setErrors((prev) => ({
            ...prev,
            otpError,
        }));
        if (otpError) return;

        try {
            await verifyOtp(otpId, otp);

            setErrors((prev) => ({
                ...prev,
                otpError: "",
            }));

            setStage("password");
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        }
    };

    const handleResendOtp = async () => {
        try {
            const result = await generateOtp(email);
            setOtpId(result);

            setOtp("");
            setSecondsLeft(15 * 60);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordError = validatePassword(password);
        const confirmPasswordError =validatePassword(confirmPassword);

        setErrors((prev) => ({
            ...prev,
            passwordError,
            confirmPasswordError,
        }));

        if (passwordError || confirmPasswordError)
            return;

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        try {
            await changePassword(email, password);
            router.push("/login");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        }
    };

    const clearBackendError = () => {
        if (error) setError(null);
    };

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <>
            <h1 className="text-2xl font-bold text-green-500 text-center mb-6 tracking-wide">
                MySpotify
            </h1>

            <form
                onSubmit={stage === "email" ? handleGenerateOtp : stage === "otp"
                        ? handleVerifyOtp : handleResetPassword
                }
                className="w-full space-y-4"
            >
                <h2 className="text-xl text-center font-semibold text-white">
                    Reset Password
                </h2>

                <p className="text-center text-sm text-neutral-400">
                    Step{" "}
                    {stage === "email" ? "1" : stage === "otp" ? "2" : "3"}{" "}
                    of 3
                </p>

                {/* ---------------- Stage 1 ---------------- */}

                {stage === "email" && (
                    <>
                        <Input
                            label="Email"
                            placeholder="Email"
                            value={email}
                            error={errors.emailError}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearBackendError();
                            }}
                        />

                        <Alert message={error} />

                        <Button type="submit">
                            Send Verification Code
                        </Button>
                    </>
                )}

                {/* ---------------- Stage 2 ---------------- */}

                {stage === "otp" && (
                    <>
                        <div className="rounded-lg bg-neutral-800/40 border border-neutral-700/40 p-3">
                            <p className="text-sm text-neutral-400">
                                Verification code sent to
                            </p>

                            <p className="text-white mt-1 break-all">
                                {email}
                            </p>
                        </div>

                        <Input
                            label="Verification Code"
                            placeholder="Enter OTP"
                            value={otp}
                            error={errors.otpError}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                clearBackendError();
                            }}
                        />

                        {secondsLeft > 0 ? (
                            <p className="text-sm text-neutral-400 text-center">
                                Code expires in{" "}
                                <span className="text-green-400">
                                    {minutes}:
                                    {seconds
                                        .toString()
                                        .padStart(2, "0")}
                                </span>
                            </p>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleResendOtp}
                            >
                                Resend Code
                            </Button>
                        )}

                        <Alert message={error} />

                        <div className="flex gap-4">
                            <Button type="submit">
                                Verify
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setStage("email");
                                    setOtp("");
                                    setError(null);
                                }}
                            >
                                Back
                            </Button>
                        </div>
                    </>
                )}

                {/* ---------------- Stage 3 ---------------- */}

                {stage === "password" && (
                    <>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            error={errors.passwordError}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                clearBackendError();
                            }}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            error={
                                errors.confirmPasswordError
                            }
                            onChange={(e) => {
                                setConfirmPassword(
                                    e.target.value
                                );
                                clearBackendError();
                            }}
                        />

                        <Alert message={error} />

                        <Button type="submit">
                            Reset Password
                        </Button>
                    </>
                )}
            </form>

            <p className="mt-6 text-sm text-neutral-400">
                Remembered your password?{" "}
                <Link
                    href="/login"
                    className="text-green-400 hover:text-green-300 transition font-medium"
                >
                    Login
                </Link>
            </p>
        </>
    );
}