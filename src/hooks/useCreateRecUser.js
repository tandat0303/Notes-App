import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function useCreateRecUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const recUser = useMutation(api.users.createUserRecord);
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || synced.current) return;

    synced.current = true;

    recUser({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      username: user.username,
      avatar: user.imageUrl,
    });
  }, [isLoaded, isSignedIn, user, recUser]);
}
