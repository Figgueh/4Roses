import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

const photos = [
  { src: "/image1.jpg", width: 800, height: 600 },
  { src: "/image2.jpg", width: 1600, height: 900 },
];

function ExteriorPhotos() {
  return <RowsPhotoAlbum photos={photos} />;
}

export default ExteriorPhotos;
