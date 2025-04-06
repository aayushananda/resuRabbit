"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Google from "../../../public/images/google.png";
import { signIn } from "next-auth/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "info"
  >("info");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const callbackUrl = "/jobs";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      setAlertSeverity(data.message ? "success" : "error");
      setShowAlert(true);

      if (data.message) {
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      }
    } catch (error) {
      setMessage("An error occurred during sign-up");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      setMessage("An error occurred during Google sign-up");
      setAlertSeverity("error");
      setShowAlert(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <div className="relative bg-gray-700">
      <div className="w-full 2xl:h-[1000px] lg:h-[700px] md:h-[800px] sm:h-[700px] h-[700px] pt-5 bg-gray-20">
        <div className="flex justify-center items-center">
          {showAlert && (
            <div className="fixed top-5 left-1/2 w-full transform -translate-x-1/2 z-50">
              <Alert severity={alertSeverity} className="w-1/4 mx-auto">
                {message}
              </Alert>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center my-8 z-40 relative">
          <div className="flex justify-between md:w-1/2 lg:w-2/5 text-white px-4">
            <div className="w-full p-5 border border-gray-400 rounded-xl bg-white/60 dark:bg-black/90">
              <div>
                <h1 className="text-5xl font-semibold dark:text-white text-black">
                  Sign Up
                </h1>
                <h1 className="my-3 dark:text-white text-black">
                  Already have an account?
                  <Link href="/login">
                    <span className="dark:text-purple-300 text-purple-800 hover:text-purple-950 underline dark:hover:text-purple-400 cursor-pointer pl-0.5">
                      Sign In
                    </span>
                  </Link>
                </h1>
              </div>

              <form className="flex flex-col mt-6" onSubmit={handleRegister}>
                <div className="flex gap-2">
                  <div className="w-full">
                    <h1 className="dark:text-white/90 text-black mb-1">Name</h1>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="dark:bg-slate-800 border-[1px] dark:text-white text-black border-black rounded-sm py-3 px-2 w-full focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="w-full my-4">
                  <h1 className="dark:text-white/90 text-black mb-1">Email</h1>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="dark:bg-slate-800 border-[1px] dark:text-white text-black border-black rounded-sm py-3 px-2 w-full focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="w-full my-2 relative">
                  <h1 className="dark:text-white/90 text-black mb-1">
                    Password
                  </h1>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={isLoading}
                    className="dark:bg-slate-800 border-[1px] dark:text-white text-black border-black rounded-sm py-3 px-2 w-full focus:outline-none disabled:opacity-50"
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/80"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <AiFillEyeInvisible
                        size={24}
                        className="mt-6 text-gray-600 dark:text-gray-400"
                      />
                    ) : (
                      <AiFillEye
                        size={24}
                        className="mt-6 text-gray-600 dark:text-gray-400"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-lg dark:bg-purple-900 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-sm dark:hover:bg-purple-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
                </button>
              </form>

              <div className="flex justify-center items-center my-3 text-black dark:text-white/90">
                OR
              </div>

              <div className="w-full flex justify-center items-center">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full py-2 border border-gray-400 rounded-md flex justify-center items-center gap-1 text-black dark:text-white hover:text-white hover:bg-black dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src={Google}
                    width={30}
                    height={30}
                    alt="Google logo"
                    className="rounded-full"
                  />
                  Sign Up With Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
