/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { UserAuth } from "connection/auth/authContext";

// Material Kit 2 React components
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

// Lightbox includes
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import "./index.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

// Database imports
import { checkAdmin } from "connection/users/checkAdmin";

// Admin viewer imports:
import SelectIcon from "./admin/SelectIcon";
import StyledLink from "./admin/StyledLink";

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
import axios from "axios";

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const SortableVideoAlbum = ({ videos, setVideos }) => {
  const [index, setIndex] = useState(-1);
  const { session } = UserAuth();
  const [albumRender, setAlbumRender] = useState({});

  console.log(videos);

  // Drag and drop functions
  const ref = useRef(null);
  const [activeVideo, setActiveVideo] = useState();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }) => {
    const photo = videos.find((item) => item.id === active.id);

    const image = ref.current?.querySelector(`img[src="${photo?.src}"]`);
    const padding = image?.parentElement
      ? getComputedStyle(image.parentElement).padding
      : undefined;
    const { width, height } = image?.getBoundingClientRect() || {};

    if (photo !== undefined && width !== undefined && height !== undefined) {
      setActiveVideo({ photo, width, height, padding });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((p) => p.id === active.id);
    const newIndex = videos.findIndex((p) => p.id === over.id);

    // Reorder in UI
    let updatedVideos = [...videos];
    const [moved] = updatedVideos.splice(oldIndex, 1);
    updatedVideos.splice(newIndex, 0, moved);

    // Recompute display_order based on new array positions
    updatedVideos = updatedVideos.map((p, index) => ({
      ...p,
      display_order: index + 1, // or index if 0-based
    }));

    // Update backend with the full list
    await axios.put(`${process.env.REACT_APP_BACKEND}/videos/reorder`, {
      videos: updatedVideos,
    });

    setVideos(updatedVideos);
  };

  useEffect(() => {
    const userCheck = async () => {
      if (session?.user?.id) {
        const isAdmin = await checkAdmin(session.user.id);

        // Function for generating a wrapped tag with sortablePhoto to be able to drag and drop
        const renderSortable = (Tag, index, photo, props) => {
          return (
            <SortablePhoto key={index} id={photo.id}>
              <Tag {...props}>{props.children}</Tag>
            </SortablePhoto>
          );
        };

        if (isAdmin) {
          const displayVideo = await axios.get(`${process.env.REACT_APP_BACKEND}/videos/display`);
          console.log(displayVideo);
          setAlbumRender({
            // Adds the edit Icon and the select circle.
            extras: (_, { photo, index }) => (
              <SelectIcon
                selected={photo.selected}
                isDisplay={displayVideo.data.id === photo.id}
                onClickEdit={(event) => {
                  console.log(photo);

                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClickSelect={(event) => {
                  setVideos((prevPhotos) => {
                    const newPhotos = [...prevPhotos];
                    newPhotos[index] = {
                      ...newPhotos[index],
                      selected: !newPhotos[index].selected,
                    };
                    return newPhotos;
                  });

                  console.log(videos);

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
          // Don't render any admin features.
          setAlbumRender({});
        }
      }
    };

    userCheck();
  }, [session]);

  const slides = videos.map((video) => ({
    type: "youtube",
    videoId: extractVideoId(video.url),
  }));

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
      >
        {/* Thumbnails */}
        <SortableContext items={videos.map((p) => p.id)}>
          <div className={classes.gallery} ref={ref}>
            <RowsPhotoAlbum
              photos={videos.map((v) => ({
                src: v.thumbnail,
                id: v.id,
                width: 480,
                height: 270,
                selected: v.selected,
              }))}
              targetRowHeight={200}
              onClick={({ index }) => setIndex(index)}
              render={albumRender}
            />
          </div>

          {/* Lightbox */}
          <Lightbox
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            slides={slides}
            render={{
              slide: ({ slide }) => {
                if (slide.type === "youtube") {
                  return (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${slide.videoId}?autoplay=1&mute=1`}
                        title="YouTube video"
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "90vw",
                          maxHeight: "90vh",
                          aspectRatio: "16/9",
                          border: "none",
                        }}
                      />
                    </div>
                  );
                }
                return null;
              },
            }}
          />
        </SortableContext>

        {/* Having overlay which makes the image follow the cursor */}
        <DragOverlay>
          {activeVideo && <Overlay className={classes.overlay} {...activeVideo} />}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default SortableVideoAlbum;
