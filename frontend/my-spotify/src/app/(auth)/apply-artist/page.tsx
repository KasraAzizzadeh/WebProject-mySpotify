"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { applyArtist } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import Alert from "@/components/ui/Alert";

type ApplyArtistErrors = {
  nameError: string;
}

export default function ArtistApplyPage() {
  const [artisticName, setArtisticName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [applyArtistErrors, setApplyArtistErrors] = useState<ApplyArtistErrors>({
    nameError: "",
  });

  const router = useRouter();
  const { user: authUser, token: authToken, updateUser} = useAuth();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors : ApplyArtistErrors = {
      nameError: artisticName.length < 64 ? 
            "" : "Artistic name should be at most 64 letters",
    }
    setApplyArtistErrors(errors)

    if (files.length < 1) {
        setError("You should upload a sample of your works");
        return;
    }

    if (authUser === null || authToken === null) {
        setError("You should be logged in to apply")
        return;
    }

    if (!errors.nameError) {
        try{
            const result = await applyArtist(authUser, artisticName, files);
            updateUser(result);
            router.push("/");
        } catch {
            setError("Something went wrong");
        }
    }
  };

  const cancelApply = () => {
    router.push("/");
  }

  const clearBackendError = () => {
    if (error) setError(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-green-500 text-center mb-6 tracking-wide">
        MySpotify
      </h1>

      <form onSubmit={handleApply} className="w-full space-y-4">
        <h2 className="text-xl text-center font-semibold text-white mb-2">
          Welcome back!
        </h2>

        <Input
            label="Artistic Name"
            placeholder="Artistic name"
            value={artisticName}
            error={applyArtistErrors.nameError}
            onChange={(e) => {setArtisticName(e.target.value); clearBackendError();}}
        />

        <FileInput
            label="Sample Works"
            multiple={true}
            maxFiles={5}
            accept=".mp3,.wav,.flac"
            value={files}
            onChange={setFiles}
        />

        <Alert message={error}/>

        <div className="flex gap-4">
            <Button type="submit">Apply</Button>
            <Button variant="secondary" onClick={cancelApply}>Cancel</Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-neutral-400">
        Not logged in?{" "}
        <Link
          href="/login"
          className="text-green-400 hover:text-green-300 transition font-medium"
        >
          Login here
        </Link>
      </p>
    </>
  );
}