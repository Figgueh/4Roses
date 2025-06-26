/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { UserAuth } from "connection/auth/authContext";
import PropTypes from "prop-types";

// Material Kit 2 React components
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

// Lightbox includes
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";

import "./index.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

// Database imports
import { checkAdmin } from "connection/users/checkAdmin";

// Admin viewer imports:
import SelectIcon from "./admin/SelectIcon";
import StyledLink from "./admin/StyledLink";

import { useModal } from "./admin/ModalProvider";

// For drag and drop
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Overlay from "./dnd/Overlay";
import classes from "./dnd/SortableGallery.module.css";
import SortablePhoto from "./dnd/SortablePhoto";
// import SortablePhoto from "./dnd/SortablePhoto";

const SortablePhotoAlbum = ({ photos, setPhotos }) => {
  const [index, setIndex] = useState(-1);
  const [albumRender, setAlbumRender] = useState({});
  const { session } = UserAuth();
  const { openModal } = useModal();

  // Drag and drop functions
  const ref = useRef < HTMLDivElement > null;
  const [activePhoto, setActivePhoto] = useState();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }) => {
    const photo = photos.find((item) => item.id === active.id);

    const image = ref.current?.querySelector(`img[src="${photo?.src}"]`);
    const padding = image?.parentElement
      ? getComputedStyle(image.parentElement).padding
      : undefined;
    const { width, height } = image?.getBoundingClientRect() || {};

    if (photo !== undefined && width !== undefined && height !== undefined) {
      setActivePhoto({ photo, width, height, padding });
    }
  };

  const handleDragEnd = ({ active, over }) => {
    console.log("Drag end", { from: active.id, to: over.id });
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);

    const updated = [...photos];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    // Reassign display_order based on new array position
    const reordered = updated.map((photo, index) => ({
      ...photo,
      display_order: index + 1,
    }));

    setPhotos(reordered);
  };

  // Checks if the user is admin and displays image options if they are.
  useEffect(() => {
    const userCheck = async () => {
      if (session?.user?.id) {
        const isAdmin = await checkAdmin(session.user.id);

        const renderSortable = (Tag, index, photo, props) => {
          return (
            <SortablePhoto key={index} id={photo.id}>
              <Tag {...props}>{props.children}</Tag>
            </SortablePhoto>
          );
        };

        if (isAdmin) {
          setAlbumRender({
            extras: (_, { photo, index }) => (
              <SelectIcon
                selected={photo.selected}
                onClickEdit={(event) => {
                  openModal(photo.src);

                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClickSelect={(event) => {
                  setPhotos((prevPhotos) => {
                    const newPhotos = [...prevPhotos];
                    newPhotos[index].selected = !photo.selected;
                    return newPhotos;
                  });

                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            ),

            // All 3 are needed for drag and drop
            link: (props, { index, photo }) => renderSortable(StyledLink, index, photo, props),
            wrapper: (props, { index, photo }) => renderSortable("div", index, photo, props),
            button: (props, { index, photo }) => renderSortable("button", index, photo, props),
          });
        } else {
          setAlbumRender({});
        }
      }
    };

    userCheck();
  }, [session]);

  useEffect(() => {
    console.log(
      "Photo order",
      photos.map((p) => `${p.id} (order: ${p.display_order})`)
    );
  }, [photos]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
    >
      <SortableContext items={photos.map((p) => p.id)}>
        <div className={classes.gallery}>
          <RowsPhotoAlbum
            photos={photos}
            targetRowHeight={250}
            onClick={({ index }) => setIndex(index)}
            render={albumRender}
          />
        </div>
        <Lightbox
          slides={photos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          // enable optional lightbox plugins
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
        />
      </SortableContext>

      <DragOverlay>
        {activePhoto && <Overlay className={classes.overlay} {...activePhoto} />}
      </DragOverlay>
    </DndContext>
  );
};

SortablePhotoAlbum.propTypes = {
  photos: PropTypes.array.isRequired,
  setPhotos: PropTypes.func.isRequired,
};

export default SortablePhotoAlbum;
