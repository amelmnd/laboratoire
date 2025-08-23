"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/Loader/Loader";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Erreur AuthProvider:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // <-- change /dashboard par ta page
      },
    });
    if (error) console.error("Erreur OAuth:", error.message);
  };


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur déconnexion:", error.message);
    } else {
      window.location.href = "/"; // redirige vers la home
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
