import React from "react";
import PropTypes from "prop-types";

import { UserAuth } from "connection/auth/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();
  return <>{session ? <>{children}</> : <Navigate to="/sign-in" />}</>;
};

PrivateRoute.propTypes = {
  children: PropTypes.any,
};

export default PrivateRoute;
