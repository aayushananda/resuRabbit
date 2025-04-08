"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Google from "../../../public/images/google.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signIn, useSession } from "next-auth/react";
import Alert from "@mui/material/Alert";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Login_png from "../../../public/images/Login.png"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "info"
  >("info");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = "/jobs";

  useEffect(() => {
    if (session && status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setMessage(decodeURIComponent(error));
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.error) {
        setMessage("Login successful!");
        setAlertSeverity("success");
        setShowAlert(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      } else {
        setMessage(result.error);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Credentials login error:", error);
      setMessage("An error occurred during login");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });
      if (!result?.error) {
        setMessage("Google sign-in successful!");
        setAlertSeverity("success");
        setShowAlert(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      } else {
        setMessage(result.error || "Google sign-in failed");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setMessage("An error occurred during Google sign in");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative">
      <div className="w-full 2xl:h-[1000px] lg:h-[670px] md:h-[800px] sm:h-[900px] h-[900px] pt-5">
        <div className="flex justify-center items-center">
          {showAlert && (
            <div className="fixed top-5 left-1/2 w-full transform -translate-x-1/2 z-50">
              <Alert
                severity={alertSeverity}
                className="w-1/4 mx-auto"
                onClose={() => setShowAlert(false)}
              >
                {message}
              </Alert>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center">
          <div className="flex-col w-3/4">
            <h1 className="text-5xl font-semibold text-black mb-2">
              Login
            </h1>
            <p className="text-black/70 mb-2">Welcome back! Select the below login methods.</p>
            <div className="p-5 rounded-xl shadow-2xl w-full flex justify-evenly items-center gap-8">
              <div className="w-3/5">
              <form className="flex flex-col mt-6" onSubmit={handleLogin}>
                <div className="w-full">
                  <h1 className="mb-1 text-black font-semibold">Enter Email</h1>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="border-[1px] text-black border-black/30 rounded-md py-3 px-2 w-full focus:outline-none"
                  />
                </div>

                <div className="w-full my-4 relative">
                  <h1 className="text-black mb-1 font-semibold">
                    Enter Password
                  </h1>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={isLoading}
                    className="text-black border-[1px] border-black/30 rounded-md py-3 px-2 w-full focus:outline-none"
                  />
                  <button
                    type="button"
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
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-lg py-1.5 bg-[#6300B3] hover:bg-purple-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-400"></div>
                <div className="px-4 text-black">or login with</div>
                <div className="flex-1 border-t border-gray-400"></div>
              </div>

              <div className="w-full flex justify-center items-center">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2 border border-gray-400 rounded-md flex justify-center items-center gap-2 text-black hover:text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src={Google}
                    width={24}
                    height={24}
                    alt="Google logo"
                    className="rounded-full"
                  />
                  Sign in with Google
                </button>
              </div>
                <div>
                <h1 className="my-3 text-black">
                  Don&apos;t have an account?
                  <Link href="/signup">
                    <span className="text-purple-800 hover:text-purple-950 underline cursor-pointer ml-1">
                      Sign Up
                    </span>
                  </Link>
                </h1>
              </div>
              </div>
              <div>
                <Image src={Login_png} width={400} height={200} alt="Image"></Image>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
