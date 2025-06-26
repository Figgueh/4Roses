// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";

function InteriorPhotos() {
  return (
    <BaseLayout
      title="Interior photos"
      breadcrumb={[{ label: "Home page", route: "/" }, { label: "Interior photos" }]}
    >
      <PhotoViewer album="interior" />
    </BaseLayout>
  );
}

export default InteriorPhotos;
