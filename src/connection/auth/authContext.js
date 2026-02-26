import { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";

import supabase from "connection/client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  const signUpUser = async (email, password) => {
    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.log(error.message);
      return { success: false, error };
    }

    // Email already taken
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      const duplicateError = new Error("An account with this email already exists.");
      return { success: false, error: duplicateError };
    }

    return { success: true, data };
  };

  const signInUser = async (email, password, rememberMe = false) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) return { success: false, error };

    if (!rememberMe) {
      // Move the session from localStorage to sessionStorage
      // so it clears when the browser tab/window closes
      const key = "sb-session";
      const stored = localStorage.getItem(key);
      if (stored) {
        sessionStorage.setItem(key, stored);
        localStorage.removeItem(key);
      }
    }

    return { success: true, data };
  };

  const signOut = async () => {
    const { error } = supabase.auth.signOut();
    if (error) {
      console.log("ERROR: ", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, authLoading, signUpUser, signInUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.any,
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
