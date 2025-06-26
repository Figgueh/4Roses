// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";

function ExteriorPhotos() {
  return (
    <BaseLayout
      title="Exterior photos"
      breadcrumb={[{ label: "Home page", route: "/" }, { label: "Exterior photos" }]}
    >
      <PhotoViewer album="exterior" />
    </BaseLayout>
  );
}

export default ExteriorPhotos;
