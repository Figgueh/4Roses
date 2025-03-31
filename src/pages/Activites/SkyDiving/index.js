// Sections components
import ActivityLayout from "layouts/sections/components/BaseLayout/ActivityLayout";
// import SkyDiving from "public/assets/image/skyDive.jpg";

const imagesPrefix = "public/assets/image";

function SkyDiving() {
  return (
    <ActivityLayout
      title="Sky Diving"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home#Sky Diving" },
        { label: "Sky Diving" },
      ]}
      items={[
        {
          name: "Skydive Algarve – Experience the Ultimate Freefall Adventure",
          url: "https://www.skydivealgarve.com/",
          photo: `${imagesPrefix}/skyDive.jpg`,
          content: [
            {
              title: "",
              content:
                "If you’re looking for an unforgettable adrenaline rush in Portugal, Skydive Algarve is the perfect destination. Located in the scenic coastal town of Alvor, this world-class skydiving center offers breathtaking views of the Algarve coastline while providing top-tier tandem skydiving and training experiences for thrill-seekers of all levels.",
            },
            {
              title: "Skydiving Experiences",
              content:
                "Skydive Algarve provides a range of skydiving options, catering to both beginners and experienced jumpers:",
              detail: [
                "Tandem Skydiving: Perfect for first-timers! Experience the thrill of freefall from 15,000 feet while securely harnessed to a professional instructor.",
                "Accelerated Freefall (AFF) Course: Want to skydive solo? This intensive training program teaches you everything you need to know to become a licensed skydiver.",
                "Experienced Skydiver Packages: If you’re already a certified skydiver, you can enjoy high-altitude jumps, beach landings, and skill-enhancing training at this top-tier drop zone.",
              ],
            },
            {
              title: "Services & Facilities",
              content:
                "To ensure a safe and comfortable experience, Skydive Algarve offers a variety of services and amenities:",
              detail: [
                "Professional Instructors: Highly experienced, multilingual instructors ensure a safe and exciting jump experience.",
                "State-of-the-Art Equipment: All gear is well-maintained and meets international safety standards.",
                "Stunning Aerial Views: Enjoy panoramic views of Portugal’s Algarve coastline, beaches, and the Atlantic Ocean as you freefall.",
                "On-Site Packing & Rigging Services: Facilities for experienced skydivers to pack and maintain their parachutes.",
                "Skydiving Photography & Video Packages: Capture your unforgettable experience with high-quality photos and videos.",
                "Café & Lounge Area: Relax before or after your jump at the on-site café.",
                "Transportation Services: Airport transfers and local accommodation recommendations for visiting jumpers.",
              ],
            },
            {
              title: "Why Choose Skydive Algarve?",
              content:
                "Whether you’re taking your first jump or you’re an experienced skydiver looking for a new challenge, Skydive Algarve offers an unparalleled experience that combines thrill, safety, and stunning scenery. Ready to take the plunge?",
              detail: [
                "The Highest Jumps in Portugal: Freefall from 15,000 feet, the maximum altitude for skydiving in Europe.",
                "Year-Round Skydiving: Thanks to the Algarve’s mild climate, you can jump almost any time of the year.",
                "Spectacular Coastal Views: One of the most scenic drop zones in the world.",
              ],
            },
          ],
        },
      ]}
    ></ActivityLayout>
  );
}

export default SkyDiving;
