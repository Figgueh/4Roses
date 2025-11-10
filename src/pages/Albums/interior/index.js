// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";
import { useTranslation } from "react-i18next";

function InteriorPhotos() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("Interior photos")}
      breadcrumb={[{ label: t("Home page"), route: "/" }, { label: t("Interior photos") }]}
    >
      <PhotoViewer album="interior" />
    </BaseLayout>
  );
}

export default InteriorPhotos;
