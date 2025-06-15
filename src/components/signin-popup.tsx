"use client";

import { authClient } from "@/lib/auth-client";
import React, { useEffect, useRef, useState } from "react";

export default function SignInPopup() {
  const { data: session, isPending } = authClient.useSession();

  const [showPopup, setShowPopup] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!emailRef.current?.value) {
      loginRef.current?.setAttribute("disabled", "disabled");
    }
  }, [emailRef.current?.value]);

  useEffect(() => {
    if (!session && !isPending) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [isPending]);

  return (
    showPopup && (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Is this your first time here?</h1>
          <p>Log in with your Epita e-mail address</p>
          <input
            type="email"
            placeholder="Email"
            className="text-black p-2 mt-2 border border-gray-300 rounded-md"
            ref={emailRef}
          />
          <button
            className="bg-blue-500 text-white rounded-md p-2 mt-2"
            onClick={async () =>
              authClient.signIn.magicLink({
                email: emailRef.current?.value!,
                name: emailRef.current?.value!.split("@")[0],
              })
            }
          >
            Sign in
          </button>
        </div>
      </div>
    )
  );
}
