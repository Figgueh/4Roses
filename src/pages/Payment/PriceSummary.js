import PropTypes from "prop-types";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

const SECURITY_DEPOSIT = 500;
const NIGHTLY_TOURIST_TAX = 2;
const MAX_TOURIST_TAX_DAYS = 7;

export default function PriceSummary({ selectedDates }) {
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

  const touristTax = NIGHTLY_TOURIST_TAX * Math.min(totalNights, MAX_TOURIST_TAX_DAYS);
  const totalPrice = totalPriceWithoutExtras + SECURITY_DEPOSIT + touristTax;

  return (
    <MKBox mt={3} p={2} borderRadius={2} border="1px solid #e0e0e0" bgcolor="#f9f9f9">
      <MKTypography variant="h6" mb={1}>
        Price Summary
      </MKTypography>

      {ranges.map((r, idx) => {
        const start = new Date(r.start);
        const end = new Date(r.end);
        const nights = (end - start) / (1000 * 60 * 60 * 24) + 1;
        return (
          <MKBox display="flex" justifyContent="space-between" key={idx} mt={1}>
            <MKTypography variant="body2">
              {start.toLocaleDateString()} - {end.toLocaleDateString()} ({nights} nights) @ €
              {r.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>
            <MKTypography variant="body2">
              €{(r.price * nights).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>
          </MKBox>
        );
      })}

      <MKBox display="flex" justifyContent="space-between" mt={1}>
        <MKTypography variant="body2">Tourist Tax</MKTypography>
        <MKTypography variant="body2">
          €{touristTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </MKTypography>
      </MKBox>

      <MKBox display="flex" justifyContent="space-between" mt={1}>
        <MKTypography variant="body2">Security Deposit</MKTypography>
        <MKTypography variant="body2">
          €{SECURITY_DEPOSIT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </MKTypography>
      </MKBox>

      <MKBox display="flex" justifyContent="space-between" mt={2} fontWeight="bold">
        <MKTypography variant="body1">Total</MKTypography>
        <MKTypography variant="body1">
          €{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </MKTypography>
      </MKBox>
    </MKBox>
  );
}

PriceSummary.propTypes = {
  selectedDates: PropTypes.object.isRequired,
};
