import { useState, useEffect } from "react";
import { UserAuth } from "connection/auth/authContext";

import MKBox from "components/MKBox";
import MKInput from "components/MKInput";
import MKAvatar from "components/MKAvatar";
import ButtonBase from "@mui/material/ButtonBase";

import { Grid } from "@mui/material";

import { updateAccount } from "connection/users/updateAccount";
import MKButton from "components/MKButton";
import Alert from "@mui/material/Alert";
import { getAllUserInfo } from "connection/users/getAllUserInfo";

function ProfileTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");

  const { session } = UserAuth();

  useEffect(() => {
    const init = async () => {
      if (!session?.user?.id) return; // Wait for session to be available
      // Fetch existing user data
      const data = await getAllUserInfo(session?.user?.id);
      const fullName = data.full_name;
      if (fullName.includes(" ")) {
        const splitName = fullName.split(" ");
        setFirstName(splitName[0]);
        setLastName(splitName[1]);
      } else {
        setFirstName(fullName);
      }
      setAvatarUrl(data.avatar_url);
    };
    init();
  }, [session]);

  const handleAccountUpdate = (event) => {
    event.preventDefault();
    var status = false;
    if (lastName != "") {
      status = updateAccount(session?.user?.id, firstName + " " + lastName, avatarUrl);
    } else {
      status = updateAccount(session?.user?.id, firstName, avatarUrl);
    }

    if (status) {
      setMessage("Account was updated successfully");
    } else {
      setMessage("An error occurred");
    }
  };

  const updateAvatarUrl = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Read the file as a data URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Grid container justifyContent="center" spacing={2} pl={5} pt={3} sx={{ flexGrow: 1 }}>
      <Grid size={1} pb={3} px={3}>
        <ButtonBase
          component="label"
          role={undefined}
          tabIndex={-1} // prevent label from tab focus
          aria-label="Avatar image"
          sx={{
            borderRadius: "40px",
            "&:has(:focus-visible)": {
              outline: "2px solid",
              outlineOffset: "2px",
            },
          }}
        >
          {!avatarUrl ? (
            // If there isn't a saved avatar then show their first name.
            <MKAvatar sx={{ bgcolor: "#9fc5e8" }} alt="Profile picture" size="xxl" shadow="xl">
              {firstName}
            </MKAvatar>
          ) : (
            // Show the avatar image
            <MKAvatar
              src={avatarUrl}
              sx={{ bgcolor: "#9fc5e8" }}
              alt="Profile picture"
              size="xxl"
              shadow="xl"
            />
          )}
          <input
            type="file"
            accept="image/*"
            style={{
              border: 0,
              clip: "rect(0 0 0 0)",
              height: "1px",
              margin: "-1px",
              overflow: "hidden",
              padding: 0,
              position: "absolute",
              whiteSpace: "nowrap",
              width: "1px",
            }}
            onChange={updateAvatarUrl}
          />
        </ButtonBase>
      </Grid>
      <Grid size={4}>
        <MKBox xl={4} ml={3} pt={2}>
          <MKInput
            type="first name"
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <MKBox pt={2}>
            <MKInput
              type="last name"
              label="Last name"
              value={lastName}
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
      <Grid item lg={12} container justifyContent="center" alignItems="center">
        {message && (
          <Alert severity="success" sx={{ mt: 1.5 }} maxWidth={500}>
            {message}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
}

export default ProfileTab;
