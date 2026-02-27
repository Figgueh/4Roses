import { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";

import supabase from "connection/client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  const signUpUser = async (email, firstName, lastName, password, dateOfBirth) => {
    if (!email || !firstName || !lastName || !password || !dateOfBirth) {
      const duplicateError = new Error("All fields require a value.");
      return { success: false, error: duplicateError };
    }

    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          date_of_birth: dateOfBirth || null,
        },
      },
    });

    if (error) {
      return { success: false, error };
    }

    // Email already taken
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      const duplicateError = new Error("An account with this email already exists.");
      return { success: false, error: duplicateError };
    }

    return { success: true, account: data };
  };

  const signInUser = async (email, password, rememberMe = false) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) return { success: false, error };

    if (!rememberMe) {
      // Move session to sessionStorage so it clears on tab close
      const stored = localStorage.getItem("sb-session");
      if (stored) {
        sessionStorage.setItem("sb-session", stored);
        localStorage.removeItem("sb-session");
      }
    }

    return { success: true, data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("ERROR: ", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within an AuthContextProvider");
  }
  return context;
};
