import { useState } from "react";
import AvailabilityCalendar from "components/Booking/AvailabilityCalendar";

export default function BlockedDays() {
  const [blockingData, setBlockingData] = useState({ selectedDates: {}, guests_over: 1 });

  return (
    <>
      <AvailabilityCalendar
        icsUrls={[
          {
            url: "https://www.airbnb.ca/calendar/ical/685302237883325603.ics?s=eac91e56e2412fa2d4e6e3a2cd41361a",
            name: "Airbnb",
          },
          {
            url: "https://ical.booking.com/v1/export?t=b6fb13e3-9a9e-4502-8d65-5cda7784b6a7",
            name: "Booking.com",
          },
          {
            url: "http://www.vrbo.com/icalendar/23c22c9fe2234081906c2953e22e43d4.ics?nonTentative",
            name: "VRBO",
          },
          {
            url: `${process.env.REACT_APP_BACKEND}/bookings/calendar.ics`,
            name: "4Roses",
          },
        ]}
        selectedDates={blockingData.selectedDates}
        onSelectionChange={(selectedDates) =>
          setBlockingData((prev) => ({ ...prev, selectedDates }))
        }
      />
    </>
  );
}
