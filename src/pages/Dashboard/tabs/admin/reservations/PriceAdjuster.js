import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { Save } from "@mui/icons-material";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PriceAdjuster() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`);

        const pricingArray = Object.entries(data).map(([month, price]) => ({
          month: parseInt(month),
          price,
        }));

        setPricing(pricingArray);
      } catch (err) {
        console.error(err);
        setError("Failed to load monthly pricing.");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handlePriceChange = (monthIndex, value) => {
    setPricing((prev) =>
      prev.map((item) => (item.month === monthIndex ? { ...item, price: value } : item))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`, { pricing });

      setSuccess("All prices updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </MKBox>
    );
  }

  return (
    <MKBox p={4}>
      <MKTypography variant="h4" fontWeight="bold" mb={3}>
        Monthly Price Adjustments
      </MKTypography>

      {success && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="success" onClose={() => setSuccess(null)}>
          <AlertTitle>Price Adjustments status</AlertTitle>
          {success}
        </Alert>
      )}
      {error && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>Price Adjustments Error</AlertTitle>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Price (€)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricing.map((item) => (
              <TableRow key={item.month}>
                <TableCell>{months[item.month]}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.month, Number(e.target.value))}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MKBox mt={3} textAlign="right">
        <MKButton
          variant="gradient"
          color="info"
          size="medium"
          startIcon={<Save />}
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save All"}
        </MKButton>
      </MKBox>
    </MKBox>
  );
}
