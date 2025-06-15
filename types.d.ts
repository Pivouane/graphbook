// Global type declarations
import { Privacy } from "@prisma/client";
import React from "react";

// Declare any missing JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      DATABASE_URL: string;
      [key: string]: string | undefined;
    }
  }

  // Add global interface
  interface Window {
    [key: string]: any;
  }

  var global: {
    [key: string]: any;
  };
}

// Post types
interface PostProps {
  id: string;
  title: string;
  content: string;
  image: string | null;
  author?: { id: string; name?: string; email?: string };
  user?: { id: string };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  privacy: Privacy | null;
}

// Add missing types for components with children props
declare namespace React {
  interface PropsWithChildren {
    children: React.ReactNode;
  }
}

// Export empty object to make it a module
export {};
