/**
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect } from "react";

// react-router components
import { Routes, Route, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Material Kit 2 React themes
import theme from "assets/theme";

// Material Kit 2 React routes
import { routes } from "routes";
import Home from "pages/Home";
import ActivityBuilder from "pages/ActivityBuilder";
import { useTranslation } from "react-i18next";
import ContactDeveloperPage from "pages/footerPages/ContactDev";
import TermsConditions from "pages/footerPages/termsConditions";
import Booking from "pages/Booking";
import BookingSuccess from "pages/Booking/BookingSuccess";
import BillingForm from "pages/Booking/BillingForm";
import ContinuePayment from "pages/Booking/ContinuePayment";
import ConfirmEmail from "pages/Register/confirm";
import PrivateRoute from "connection/users/PrivateRoute";
import ResetPassword from "pages/SignIn/ResetPassword";

export default function App() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  // Build routes with translations
  const translatedRoutes = routes(t);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {getRoutes(translatedRoutes)}
        <Route path="/" element={<Home />} />

        {/* Account creation */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        <Route path="activities/:section/:slug" element={<ActivityBuilder />} />
        <Route path="activities/:section" element={<ActivityBuilder />} />

        {/* Private routes */}
        <Route
          path="book"
          element={
            <PrivateRoute>
              <Booking />
            </PrivateRoute>
          }
        />
        <Route
          path="billing"
          element={
            <PrivateRoute>
              <BillingForm />
            </PrivateRoute>
          }
        />
        <Route
          path="booking-success"
          element={
            <PrivateRoute>
              <BookingSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="continue-payment/:id"
          element={
            <PrivateRoute>
              <ContinuePayment />
            </PrivateRoute>
          }
        />

        {/* Footer pages */}
        <Route path="contact-developer" element={<ContactDeveloperPage />} />
        <Route path="terms-and-conditions" element={<TermsConditions />} />
        {/* <Route path="*" element={<Navigate to="/pages/landing-pages/home" />} /> */}
      </Routes>
    </ThemeProvider>
  );
}
