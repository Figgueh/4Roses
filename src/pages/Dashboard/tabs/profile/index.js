import { useState } from "react";

import MKBox from "components/MKBox";
import MKInput from "components/MKInput";
import MKAvatar from "components/MKAvatar";

import { Grid } from "@mui/material";

import { updateAccount } from "connection/users/updateAccount";
import MKButton from "components/MKButton";

function ProfileTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleAccountUpdate = (event) => {
    event.preventDefault();
    const fullName = firstName + " " + lastName;
    updateAccount(fullName, "");
  };
  return (
    <Grid container justifyContent="center" spacing={2} pl={5} pt={3}>
      <Grid size={1} pb={3} px={3}>
        <MKAvatar alt="Profile picture" size="xxl" shadow="xl" onClick=""></MKAvatar>
      </Grid>
      <Grid size={4}>
        <MKBox xl={4} ml={3} pt={2}>
          <MKInput
            type="first name"
            label="First name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <MKBox pt={2}>
            <MKInput
              type="last name"
              label="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </MKBox>
        </MKBox>
        <Grid display="flex" justifyContent={"end"} mt={2}>
          <MKButton type="submit" variant="outlined" color="info" onClick={handleAccountUpdate}>
            Update account
          </MKButton>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ProfileTab;
