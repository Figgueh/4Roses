import { useState } from "react";
import PropTypes from "prop-types";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import axios from "axios";
import { Alert, AlertTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SECURITY_DEPOSIT = 500;
const DISCOUNT_RATE = 0.05;
const SALES_TAX_RATE = 0.06;

function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatLocalISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function PriceSummary({ bookingData }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const guestsOver = bookingData?.guests_over ?? 0;
  const guestsUnder = bookingData?.guests_under ?? 0;
  const { selectedDates } = bookingData ?? {};

  if (!selectedDates || Object.keys(selectedDates).length === 0)
    return <MKTypography variant="body2">No dates selected</MKTypography>;

  // all selected keys include checkout as last key (by your component's convention)
  const sortedAll = Object.keys(selectedDates).sort(); // includes checkout
  // nightKeys: the actual nights to charge for — exclude checkout (last key)
  const nightKeys = sortedAll.length > 1 ? sortedAll.slice(0, -1) : []; // e.g. [ '2026-03-30', '2026-03-31' ]

  // Build contiguous ranges using nightKeys (so checkout won't make a 0-night range)
  const getPriceRangesForNights = (datesObj) => {
    const keys = nightKeys.slice(); // already sorted slice of sortedAll
    const ranges = [];
    if (keys.length === 0) return ranges;

    let rangeStart = keys[0];
    let prev = keys[0];
    let price = datesObj[rangeStart];

    for (let i = 1; i < keys.length; i++) {
      const cur = keys[i];
      const prevDate = parseLocalDate(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      const expectedStr = formatLocalISO(prevDate);
      const curPrice = datesObj[cur];

      if (cur === expectedStr && curPrice === price) {
        prev = cur; // extend
      } else {
        ranges.push({ start: rangeStart, end: prev, price });
        rangeStart = cur;
        prev = cur;
        price = curPrice;
      }
    }

    ranges.push({ start: rangeStart, end: prev, price });
    return ranges;
  };

  const ranges = getPriceRangesForNights(selectedDates);

  // days in a range (count of nightKeys included)
  const getDaysInRange = (start, end) => {
    return nightKeys.filter((d) => d >= start && d <= end).length;
  };

  // nights = days (because nightKeys represent nights themselves)
  const getNightsInRange = (start, end) => {
    // nightKeys are nights, so nights = number of entries in the range
    return Math.max(getDaysInRange(start, end), 0);
  };

  // compute total price by summing price * nights (nightKeys are nights)
  const totalPriceWithoutExtras = ranges.reduce((sum, r) => {
    const nights = getNightsInRange(r.start, r.end);
    const safePrice = Number(r.price) || 0;
    return sum + safePrice * nights;
  }, 0);

  const discountAmount = totalPriceWithoutExtras * DISCOUNT_RATE;
  const discountedAccommodationTotal = totalPriceWithoutExtras - discountAmount;

  // Tourist tax: iterate actual nights (nightKeys) up to 7 nights
  let touristTax = 0;
  let remainingTaxNights = Math.min(nightKeys.length, 7);
  for (let i = 0; i < nightKeys.length && remainingTaxNights > 0; i++) {
    const dateStr = nightKeys[i];
    const d = parseLocalDate(dateStr);
    const month = d.getMonth() + 1;
    const taxPerGuest = [11, 12, 1, 2, 3].includes(month) ? 1 : 2;
    touristTax += taxPerGuest * guestsOver;
    remainingTaxNights--;
  }

  const accommodationSubtotal = discountedAccommodationTotal;
  const salesTax = discountedAccommodationTotal * SALES_TAX_RATE;
  const totalPrice = discountedAccommodationTotal + salesTax + touristTax + SECURITY_DEPOSIT;

  const totalNights = nightKeys.length; // correct number of nights
  const dueToday = totalPrice * 0.5;
  const remainingBalance = totalPrice - dueToday;

  return (
    <MKBox mt={4} p={3} borderRadius="3px" border="1px solid #e0e0e0" bgcolor="#fafafa">
      <MKTypography variant="h6" mb={3}>
        Price Summary
      </MKTypography>

      <MKBox display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* LEFT COLUMN */}
        <MKBox
          flex={1}
          p={3}
          borderRadius="2px"
          border="1px solid #e0e0e0"
          bgcolor="#fff"
          display="flex"
          flexDirection="column"
        >
          <MKTypography variant="h6" fontWeight="bold" mb={2}>
            Total
          </MKTypography>

          {ranges.map((r, idx) => {
            const start = parseLocalDate(r.start);
            const nights = getNightsInRange(r.start, r.end);
            const rangeTotal = (Number(r.price) || 0) * nights;
            const displayEndDate = parseLocalDate(r.end);
            displayEndDate.setDate(displayEndDate.getDate() + 1); // add 1 day

            return (
              <MKBox display="flex" justifyContent="space-between" key={idx} mb={1.5}>
                <MKTypography variant="body2">
                  {formatLocalISO(start)} - {formatLocalISO(displayEndDate)} ({nights} nights) @ €
                  {(Number(r.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </MKTypography>
                <MKTypography variant="body2" textAlign="right">
                  €{rangeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

          {/* Accommodation subtotal */}
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
                €{Number(touristTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>

            <MKBox display="flex" justifyContent="space-between" mb={1}>
              <MKTypography variant="body2">Sales Tax (6%)</MKTypography>
              <MKTypography variant="body2" textAlign="right">
                €{salesTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>

            <MKBox display="flex" justifyContent="space-between">
              <MKTypography variant="body2">Security Deposit</MKTypography>
              <MKTypography variant="body2" textAlign="right">
                €{SECURITY_DEPOSIT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </MKTypography>
            </MKBox>
          </MKBox>

          {/* GRAND TOTAL */}
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

        {/* RIGHT COLUMN */}
        <MKBox
          flex={1}
          p={3}
          borderRadius="2px"
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

            <MKTypography variant="caption" color="secondary" display="block" mb={2}>
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
            onClick={async () => {
              const start_date = sortedAll[0];
              const end_date = sortedAll[sortedAll.length - 1];

              if (totalNights < 7) {
                setError("The minimum stay is 7 nights.");
                return;
              } else {
                setError("");
              }

              const { data } = await axios.get(
                `${process.env.REACT_APP_BACKEND}/reservation/check/${start_date}/${end_date}`
              );

              if (data.isBooked) {
                setError(
                  "Oops! Some of these dates are no longer available. Refresh the page to check the current availability."
                );
                return;
              }

              if (!guestsOver || guestsOver < 1) {
                setError("There must be at least 1 guest over 13");
                return;
              } else {
                setError(""); // clear the error if the rule is satisfied
              }

              navigate("/billing", {
                state: {
                  dates: selectedDates,
                  nights: totalNights,
                  price: totalPrice,
                  dueToday,
                  guestsOver,
                  guestsUnder,
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
  bookingData: PropTypes.shape({
    selectedDates: PropTypes.objectOf(PropTypes.number).isRequired,
    guests_over: PropTypes.number,
    guests_under: PropTypes.number,
  }).isRequired,
};
