import { useState } from "react";
import PropTypes from "prop-types";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import { Alert, AlertTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SECURITY_DEPOSIT = 500;
const NIGHTLY_TOURIST_TAX = 2;
const MAX_TOURIST_TAX_DAYS = 7;
const DISCOUNT_RATE = 0.05; // 5%

export default function PriceSummary({ selectedDates }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  if (!selectedDates || Object.keys(selectedDates).length === 0)
    return <MKTypography variant="body2">No dates selected</MKTypography>;

  const getPriceRanges = (dates) => {
    const sorted = Object.keys(dates).sort();
    const ranges = [];
    let rangeStart = null;
    let prevDate = null;
    let price = null;

    for (const d of sorted) {
      const currentPrice = dates[d];
      if (!rangeStart) {
        rangeStart = d;
        prevDate = d;
        price = currentPrice;
        continue;
      }
      const expected = new Date(prevDate);
      expected.setDate(expected.getDate() + 1);
      if (
        currentPrice === price &&
        new Date(d).toISOString().split("T")[0] === expected.toISOString().split("T")[0]
      ) {
        prevDate = d;
      } else {
        ranges.push({ start: rangeStart, end: prevDate, price });
        rangeStart = d;
        prevDate = d;
        price = currentPrice;
      }
    }
    if (rangeStart) ranges.push({ start: rangeStart, end: prevDate, price });
    return ranges;
  };

  const ranges = getPriceRanges(selectedDates);
  const totalNights = Object.keys(selectedDates).length;
  const totalPriceWithoutExtras = ranges.reduce(
    (sum, r) => sum + r.price * ((new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60 * 24) + 1),
    0
  );

  const discountAmount = totalPriceWithoutExtras * DISCOUNT_RATE;
  const discountedAccommodationTotal = totalPriceWithoutExtras - discountAmount;
  const touristTax = NIGHTLY_TOURIST_TAX * Math.min(totalNights, MAX_TOURIST_TAX_DAYS);
  const accommodationSubtotal = totalPriceWithoutExtras - discountAmount;
  const totalPrice = discountedAccommodationTotal + SECURITY_DEPOSIT + touristTax;

  const dueToday = totalPrice * 0.5;
  const remainingBalance = totalPrice - dueToday;

  return (
    <MKBox mt={4} p={3} borderRadius={3} border="1px solid #e0e0e0" bgcolor="#fafafa">
      <MKTypography variant="h6" mb={3}>
        Price Summary
      </MKTypography>

      {/* Two-column layout */}
      <MKBox display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* Left Column: TOTAL & Breakdown */}
        <MKBox
          flex={1}
          p={3}
          borderRadius={2}
          border="1px solid #e0e0e0"
          bgcolor="#fff"
          display="flex"
          flexDirection="column"
        >
          <MKTypography variant="h6" fontWeight="bold" mb={2}>
            Total
          </MKTypography>

          {/* Date Ranges */}
          {ranges.map((r, idx) => {
            const start = new Date(r.start);
            const end = new Date(r.end);
            const nights = (end - start) / (1000 * 60 * 60 * 24) + 1;
            return (
              <MKBox display="flex" justifyContent="space-between" key={idx} mb={1.5}>
                <MKTypography variant="body2">
                  {start.toLocaleDateString()} - {end.toLocaleDateString()} ({nights} nights) @ €
                  {r.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </MKTypography>
                <MKTypography variant="body2" textAlign="right">
                  €{(r.price * nights).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </MKTypography>
              </MKBox>
            );
          })}

          {/* Discount */}
          <MKBox display="flex" justifyContent="space-between" mb={1.5}>
            <MKTypography variant="body2">Discount (5%)</MKTypography>
            <MKTypography variant="body2" color="error" textAlign="right">
              -€{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>
          </MKBox>

          {/* Accommodation Subtotal */}
          <MKBox display="flex" justifyContent="space-between" mb={2}>
            <MKTypography variant="body2" fontWeight="medium">
              Accommodation Subtotal
            </MKTypography>
            <MKTypography variant="body2" textAlign="right">
              €{accommodationSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>
          </MKBox>

          {/* Fees & Taxes */}
          <MKBox>
            <MKTypography
              variant="subtitle2"
              fontWeight="bold"
              mb={1}
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Fees & Taxes
            </MKTypography>
            <MKBox display="flex" justifyContent="space-between" mb={1}>
              <MKTypography variant="body2">Tourist Tax</MKTypography>
              <MKTypography variant="body2" textAlign="right">
                €{touristTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>
            <MKBox display="flex" justifyContent="space-between">
              <MKTypography variant="body2">Security Deposit</MKTypography>
              <MKTypography variant="body2" textAlign="right">
                €{SECURITY_DEPOSIT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>
          </MKBox>

          {/* Grand TOTAL */}
          <MKBox
            display="flex"
            justifyContent="space-between"
            mt={3}
            pt={2}
            fontWeight="bold"
            borderTop="2px solid #aaa"
          >
            <MKTypography variant="body1" fontWeight="bold">
              TOTAL
            </MKTypography>
            <MKTypography variant="body1" fontWeight="bold">
              €{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>
          </MKBox>
        </MKBox>

        {/* Right Column: Payment Breakdown + Confirm Booking */}
        <MKBox
          flex={1}
          p={3}
          borderRadius={2}
          border="1px solid #e0e0e0"
          bgcolor="#fff"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <div>
            <MKTypography variant="subtitle1" fontWeight="bold" mb={2}>
              Payment Breakdown
            </MKTypography>

            <MKBox display="flex" justifyContent="space-between" mb={1}>
              <MKTypography variant="body2">50% Due Today</MKTypography>
              <MKTypography variant="body2" fontWeight="bold" textAlign="right">
                €{dueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>

            <MKBox display="flex" justifyContent="space-between" mb={2}>
              <MKTypography variant="body2">Remaining Balance</MKTypography>
              <MKTypography variant="body2" textAlign="right">
                €{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>

            <MKTypography variant="caption" color="text.secondary" display="block" mb={2}>
              Remaining balance must be paid in full before check-in.
            </MKTypography>
          </div>

          {error && (
            <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
              <AlertTitle>Price summary error</AlertTitle>
              {error}
            </Alert>
          )}

          <MKButton
            variant="gradient"
            color="success"
            size="large"
            onClick={() => {
              const totalNights = Object.keys(selectedDates).length;
              if (totalNights < 7) {
                setError("The minimum stay is 7 nights.");
                return;
              } else {
                setError("");
              }

              // Proceed with booking
              navigate("/confirm-booking", {
                state: {
                  dates: selectedDates,
                  nights: totalNights,
                  price: totalPrice,
                  dueToday: dueToday,
                },
              });
            }}
          >
            Confirm Booking
          </MKButton>
        </MKBox>
      </MKBox>
    </MKBox>
  );
}

PriceSummary.propTypes = {
  selectedDates: PropTypes.object.isRequired,
};
