"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/Loader/Loader"

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

        // Exemple : charger d’autres données globales si besoin
        // const { data: settings } = await supabase.from("settings").select("*").single();
        // console.log("Settings:", settings);

      } catch (err) {
        console.error("Erreur AuthProvider:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Optionnel : écouter les changements d’auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <Loader />; // ⬅️ affiche ton écran global de chargement
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
