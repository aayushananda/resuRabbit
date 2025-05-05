import { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css";

// Add this function to register the service worker
const registerServiceWorker = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered: ", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed: ", error);
        });
    });
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  // Register service worker on component mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
