// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";

import { ModalProvider } from "../admin/ModalProvider";
import EditView from "../admin/EditView";

function InteriorPhotos() {
  return (
    <BaseLayout
      title="Interior photos"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home" },
        { label: "Interior photos" },
      ]}
    >
      <ModalProvider>
        <PhotoViewer album="interior" />
        <EditView />
      </ModalProvider>
    </BaseLayout>
  );
}

export default InteriorPhotos;
