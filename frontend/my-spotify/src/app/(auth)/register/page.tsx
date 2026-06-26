"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { register } from "@/services/authService";
import { validateEmail, validatePassword } from "@/utils/authUtils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import DateInput from "@/components/ui/DateInput";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";

type RegisterErrors = {
  displayNameError: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  dateError: string;
  genderError: string;
}

export default function LoginPage() {
  const { loginUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [applyArtist, setApplyArtist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({
    displayNameError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
    dateError: "",
    genderError: "",
  });

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors : RegisterErrors = {
        displayNameError: displayName.length < 64 ? 
            "" : "Display name should be at most 64 letters",
        emailError: validateEmail(email),
        passwordError: validatePassword(password),
        confirmPasswordError: validatePassword(confirmPassword),
        dateError: birthDate ? "" : "Please select a date",
        genderError: gender ? "" : "Please select your geneder,"
    }
    setRegisterErrors(errors);
    if (errors.displayNameError || errors.emailError || errors.passwordError
        || errors.confirmPasswordError || errors.dateError || errors.genderError
    ) return;

    if (!(password === confirmPassword)) {
        setError("Passwords don't match!");
        return;
    }

    if (!acceptPolicy) {
        setError("You can't register without accepting our privacy policy");
        return;
    }

    try {
        const result = await register(displayName, email, password, birthDate, gender);
        loginUser(result.user, result.token);
        if (applyArtist) {
            router.push("/apply-artist");
        }
        else {
            router.push("/")
        }
    } catch {
        setError("Something went wrong");
    }
    
  };

  const clearBackendError = () => {
    if (error) setError(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-green-500 text-center mb-6 tracking-wide">
            MySpotify
      </h1>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <h2 className="text-xl text-center font-semibold text-white mb-2">
            Register Here!
        </h2>

        <Input
            label="Name"
            placeholder="Display name"
            value={displayName}
            error={registerErrors.displayNameError}
            onChange={(e) => {setDisplayName(e.target.value); clearBackendError();}}
        />
        
        <Input
            label="Email"
            placeholder="Email"
            value={email}
            error={registerErrors.emailError}
            onChange={(e) => {setEmail(e.target.value); clearBackendError();}}
        />

        <Input
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            error={registerErrors.passwordError}
            onChange={(e) => {setPassword(e.target.value); clearBackendError();}}
        />

        <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            error={registerErrors.confirmPasswordError}
            onChange={(e) => {setConfirmPassword(e.target.value); clearBackendError();}}
        />

        <DateInput
            label="Birthdate"
            value={birthDate}
            error={registerErrors.dateError}
            onChange={(e) => {setBirthDate(e.target.value); clearBackendError();}}
        />

        <Select 
            label="Gender"
            value={gender}
            error={registerErrors.genderError}
            onChange={(e) => {setGender(e.target.value); clearBackendError();}}
        >
            <option value={""}>Select Gender</option>
            <option value={"male"}>Male</option>
            <option value={"female"}>Female</option>
            <option value={"undetermined"}>Rather not say</option>
        </Select>

        {/* add the privacy policy page */}
        <Checkbox
            label="I agree to the Privacy Policy"
            checked={acceptPolicy}
            onChange={(e) => setAcceptPolicy(e.target.checked)}
        />

        <Checkbox
            label="I want to apply as an artist"
            checked={applyArtist}
            onChange={(e) => setApplyArtist(e.target.checked)}
        />

        <Alert message={error}/>

        <Button type="submit">Register</Button>
      </form>

      <p className="mt-6 text-sm text-neutral-400">
        Already have an account?{" "}
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