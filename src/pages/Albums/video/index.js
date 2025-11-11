// Sections components
import BaseLayout from "components/BaseLayout";
import PhotoViewer from "../PhotoViewer";
import { useTranslation } from "react-i18next";

function Videos() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("Videos")}
      breadcrumb={[{ label: t("Home page"), route: "/" }, { label: t("Videos") }]}
    >
      <PhotoViewer album="video" />
    </BaseLayout>
  );
}

export default Videos;
