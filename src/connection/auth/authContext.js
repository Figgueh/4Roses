import { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import supabase from "connection/client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  const signUpUser = async (email, firstName, lastName, password, dateOfBirth, lang) => {
    if (!email || !firstName || !lastName || !password || !dateOfBirth) {
      const duplicateError = new Error("All fields require a value.");
      return { success: false, error: duplicateError };
    }

    // Send data to the backend
    const { data: response } = await axios.post(
      `${process.env.REACT_APP_BACKEND}/users/createUser`,
      {
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        lang,
      }
    );

    if (response.success === false) {
      return { success: false, error: response.error };
    }

    // Send confirmation email
    await axios.post(`${process.env.REACT_APP_BACKEND}/email/sendEmailVerification`, {
      id: response.data.user.id,
      link: response.data.properties.action_link,
    });

    return { success: true, account: response.data };
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
