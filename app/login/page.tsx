// app/(auth)/login/page.tsx
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Google from "../../public/images/google_logo.png"
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { signIn, useSession } from "next-auth/react"
import Alert from '@mui/material/Alert'
import { useRouter, useSearchParams } from 'next/navigation'

interface LoginResponse {
  token?: string;
  error?: string;
}

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info'>('info')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
//   const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('from') || '/dashboard'

//   useEffect(() => {
//     if (session && status === 'authenticated') {
//       router.push(callbackUrl)
//     }
//   }, [session, status, router, callbackUrl])

//   useEffect(() => {
//     const error = searchParams.get('error')
//     if (error) {
//       setMessage(decodeURIComponent(error))
//       setAlertSeverity('error')
//       setShowAlert(true)
//     }
//   }, [searchParams])

//   useEffect(() => {
//     if (showAlert) {
//       const timer = setTimeout(() => {
//         setShowAlert(false)
//       }, 3000)

//       return () => clearTimeout(timer)
//     }
//   }, [showAlert])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
    
//     try {
//       const result = await signIn('credentials', {
//         email,
//         password,
//         redirect: false,
//         callbackUrl,
//       })

//       if (!result?.error) {
//         setMessage("Login successful!")
//         setAlertSeverity('success')
//         setShowAlert(true)
        
//         setTimeout(() => {
//           router.push(callbackUrl)
//           router.refresh()
//         }, 1000)
//       } else {
//         setMessage(result.error)
//         setAlertSeverity('error')
//         setShowAlert(true)
//       }
//     } catch (error) {
//       setMessage("An error occurred during login")
//       setAlertSeverity('error')
//       setShowAlert(true)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleGoogleSignIn = async () => {
//     setIsLoading(true)
//     try {
//       await signIn("google", {
//         callbackUrl,
//       })
//     } catch (error) {
//       setMessage("An error occurred during Google sign in")
//       setAlertSeverity('error')
//       setShowAlert(true)
//       setIsLoading(false)
//     }
//   }


  return (
    <div className="relative">
      <div className='w-full 2xl:h-[1000px] lg:h-[670px] md:h-[800px] sm:h-[900px] h-[900px] pt-5 '>
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
        
        <div className="flex justify-center items-center my-12 z-50 relative">
          <div className='flex justify-between md:w-1/2 lg:w-2/5 text-white px-4'>
            <div className='w-full p-5 border border-gray-400 rounded-xl bg-white/60 dark:bg-black/90 shadow-lg'>
              <div>
                <h1 className='text-5xl font-semibold dark:text-white text-black'>Login</h1>
                <h1 className='my-3 dark:text-white text-black'>
                  Don&apos;t have an account? 
                  <Link href="/signup"> 
                    <span className='dark:text-purple-300 text-purple-800 hover:text-purple-950 underline dark:hover:text-purple-400 cursor-pointer ml-1'>
                      Sign Up
                    </span> 
                  </Link>
                </h1>
              </div>

              <form className='flex flex-col mt-6'>
                <div className='w-full'>
                  <h1 className='mb-1 dark:text-white/90 text-black'>Email</h1>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder='Email' 
                    required 
                    disabled={isLoading}
                    className='dark:bg-slate-800 border-[1px] dark:text-white text-black border-black rounded-sm py-3 px-2 w-full focus:outline-none disabled:opacity-50'
                  />
                </div>
                
                <div className='w-full my-4 relative'>
                  <h1 className='dark:text-white/90 text-black mb-1'>Password</h1>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder='********' 
                    required 
                    disabled={isLoading}
                    className='dark:bg-slate-800 dark:text-white text-black border-[1px] border-black rounded-sm py-3 px-2 w-full focus:outline-none disabled:opacity-50'
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/80"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? 
                      <AiFillEyeInvisible size={24} className='mt-6 text-gray-600 dark:text-gray-400'/> : 
                      <AiFillEye size={24} className='mt-6 text-gray-600 dark:text-gray-400' />
                    }
                  </button>
                </div>
                
                <button 
                  type='submit' 
                  disabled={isLoading}
                  className='w-full text-lg dark:bg-purple-900 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-sm dark:hover:bg-purple-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className='flex items-center my-6'>
                <div className='flex-1 border-t border-gray-400'></div>
                <div className='px-4 text-black dark:text-white/90'>OR</div>
                <div className='flex-1 border-t border-gray-400'></div>
              </div>

              <div className='w-full flex justify-center items-center'>
                <button 
                //   onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className='w-full py-2 border border-gray-400 rounded-md flex justify-center items-center gap-2 text-black dark:text-white hover:text-white hover:bg-black dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Image 
                    src={Google} 
                    width={24} 
                    height={24} 
                    alt='Google logo'
                    className='rounded-full'  
                  />
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login