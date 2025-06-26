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
    return { success: true, data };
  };

  const signInUser = async (email, password) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log(error.message);
      return { success: false, error };
    }
    if (data) {
      console.log("success");
      return { success: true, data };
    }
  };

  const signOut = () => {
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
