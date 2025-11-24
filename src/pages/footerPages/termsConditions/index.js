import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import DefaultNavbar from "components/DefaultNavbar";
import DefaultFooter from "components/Footers/DefaultFooter";

import { routes } from "routes";
import footerRoutes from "footer.routes";

import { useTranslation } from "react-i18next";

function TermsConditions() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  return (
    <>
      <DefaultNavbar routes={translatedRoutes} sticky />

      <MKBox
        minHeight="30vh"
        display="flex"
        alignItems="center"
        sx={{
          backgroundColor: ({ palette }) => palette.info.main,
          color: "white",
          mb: 6,
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <MKTypography variant="h2" fontWeight="bold" mb={2} mt={6}>
                Terms & Conditions
              </MKTypography>
              <MKTypography variant="body1" color="white" opacity={0.85}>
                Please read these terms and conditions carefully before using our website.
              </MKTypography>
            </Grid>
          </Grid>
        </Container>
      </MKBox>

      {/* Terms Content */}
      <Container sx={{ mb: 8 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Card sx={{ p: 4, boxShadow: ({ boxShadows: { xxl } }) => xxl }}>
              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                1. Introduction
              </MKTypography>
              <MKTypography variant="body1" mb={3} sx={{ whiteSpace: "pre-line" }}>
                Welcome to our website. By accessing or using this site, you agree to comply with
                and be bound by the following terms and conditions. If you do not agree with any
                these terms, you must not use our website.
              </MKTypography>

              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                2. Intellectual Property
              </MKTypography>
              <MKTypography variant="body1" mb={3} sx={{ whiteSpace: "pre-line" }}>
                All content, trademarks, graphics, and logos on this website are the property of the
                website owner and are protected by applicable intellectual property laws.
              </MKTypography>

              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                3. User Obligations
              </MKTypography>
              <MKTypography variant="body1" mb={3} sx={{ whiteSpace: "pre-line" }}>
                Users agree not to misuse the website, including but not limited to transmitting
                harmful code, attempting unauthorized access, or interfering with the normal
                functioning of the site.
              </MKTypography>

              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                4. Limitation of Liability
              </MKTypography>
              <MKTypography variant="body1" mb={3} sx={{ whiteSpace: "pre-line" }}>
                The website owner shall not be liable for any direct, indirect, or consequential
                damages arising from the use of this website or any linked resources.
              </MKTypography>

              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                5. Changes to Terms
              </MKTypography>
              <MKTypography variant="body1" mb={3} sx={{ whiteSpace: "pre-line" }}>
                We reserve the right to update these terms at any time without prior notice. Users
                are encouraged to review this page periodically for the latest information.
              </MKTypography>

              <MKTypography variant="h5" fontWeight="bold" mb={2}>
                6. Contact Information
              </MKTypography>
              <MKTypography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                If you have questions about these Terms & Conditions, please contact us at:
                joefigueiras@gmail.com
              </MKTypography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default TermsConditions;
