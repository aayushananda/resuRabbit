"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Google from "../../../public/images/google.png";
import { signIn } from "next-auth/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import Hero_img from "../../../public/images/Hero.png"

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
    <div className="relative bg-white">
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

        <div className="flex justify-center items-center">
          <div className="flex-col w-3/4">
              <h1 className="text-5xl font-semibold text-black mb-2 ">
                  Sign Up
              </h1>
              <p className="text-black/70 mb-2">Welcome back! Select the below SignUp methods.</p>
            <div className="p-5 rounded-xl shadow-2xl w-full flex justify-evenly items-center gap-8">
              <div className="w-3/4">
              <form className="flex flex-col" onSubmit={handleRegister}>
                <div className="flex gap-2 my-4">
                  <div className="w-full">
                    <h1 className="text-black mb-1 font-semibold">Enter Username</h1>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="border-[1px] text-black border-black/20 rounded-md py-3 px-2 w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div className="w-full my-4">
                  <h1 className="text-black mb-1 font-semibold">Enter Your Email Id</h1>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="border-[1px] text-black border-black/20 rounded-md py-3 px-2 w-full focus:outline-none"
                  />
                </div>

                <div className="w-full my-4 relative">
                  <h1 className="text-black mb-1 font-semibold">
                    Password
                  </h1>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={isLoading}
                    className="border-[1px] text-black border-black/20 rounded-md py-3 px-2 w-full focus:outline-none"
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
                  className="w-full text-lg py-1.5 bg-[#6300B3] hover:bg-purple-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-400"></div>
                <div className="px-4 text-black">or signup with</div>
                <div className="flex-1 border-t border-gray-400"></div>
              </div>

              <div className="w-full flex justify-center items-center">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full py-2 border border-gray-400 rounded-md flex justify-center items-center gap-1 text-black hover:text-white hover:bg-black dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div>
                <h1 className="my-3 text-black">
                  Already have an account?
                  <Link href="/login">
                    <span className="text-purple-800 hover:text-purple-950 underline dark:hover:text-purple-400 cursor-pointer pl-0.5">
                      Sign In
                    </span>
                  </Link>
                </h1>
              </div>
              </div>
              <div>
                <Image src={Hero_img} width={700} height={500} alt="Image"></Image>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
