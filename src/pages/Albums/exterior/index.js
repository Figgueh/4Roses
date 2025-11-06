// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";
import { useTranslation } from "react-i18next";

function ExteriorPhotos() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("Exterior photos")}
      breadcrumb={[{ label: t("Home page"), route: "/" }, { label: t("Exterior photos") }]}
    >
      <PhotoViewer album="exterior" />
    </BaseLayout>
  );
}

export default ExteriorPhotos;
