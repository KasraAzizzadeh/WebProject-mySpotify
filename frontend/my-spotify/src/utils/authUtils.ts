export const validateEmail = (email: string) => {
    let message : string = "";
    if (!email) {
        message = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        message = "Please enter a valid email";
    }
    return message;
}

export const validatePassword = (password: string) => {
    let message : string = "";
    if (!password) {
        message = "Password is required!";
    } else if (password.length < 8) {
        message = "Password should be at least 8 characters";
    } else if (password.length > 32) {
        message = "Password should be at most 32 characters";
    } else if (!/[a-z]/.test(password)) {
        message = "Password must contain a lowercase letter";
    } else if (!/[A-Z]/.test(password)) {
        message = "Password must contain an uppercase letter";
    } else if (!/\d/.test(password)) {
        message = "Password must contain a number";
    } else if (!/[^A-Za-z\d]/.test(password)) {
        message = "Password must contain a special character";
    }
    return message;
}

export const validateOtp = (otp: string) => {
    let message = "";

    if (!otp.trim()) {
        message = "OTP is required!";
    } else if (!/^\d{6}$/.test(otp)) {
        message = "OTP must be a 6-digit number";
    }

    return message;
};