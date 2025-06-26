// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";

function InteriorPhotos() {
  return (
    <BaseLayout
      title="Interior photos"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home" },
        { label: "Interior photos" },
      ]}
    >
      <PhotoViewer album="interior" />
    </BaseLayout>
  );
}

export default InteriorPhotos;
