import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function ConvexClerkProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();

  return (
    <ConvexProvider
      client={convex}
      useAuth={async () => {
        if (!isSignedIn) return null;
        return await getToken({ template: "convex" });
      }}
    >
      {children}
    </ConvexProvider>
  );
}

{/* Development */}
// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//       <ConvexProvider client={convex}>
//         <App />
//       </ConvexProvider>
//     </ClerkProvider>
//   </StrictMode>,
// );

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexClerkProvider>
        <App />
      </ConvexClerkProvider>
    </ClerkProvider>
  </StrictMode>
);
