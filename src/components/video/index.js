/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UserAuth } from "connection/auth/authContext";
import axios from "axios";

// Example admin check function
import { checkAdmin } from "connection/users/checkAdmin";

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

function SortableItem({ id, thumbnail, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    width: 240,
    height: 135,
    overflow: "hidden",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    margin: 8,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={thumbnail}
        alt=""
        onClick={onClick}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 12,
        }}
      />
    </div>
  );
}

export default function SortableVideoAlbum({ videos }) {
  const [index, setIndex] = useState(-1);
  const [items, setItems] = useState(videos);
  const { session } = UserAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (session?.user?.id) {
        const adminStatus = await checkAdmin(session.user.id);
        setIsAdmin(adminStatus);
      }
    };
    check();
  }, [session]);

  const slides = items.map((video) => ({
    type: "youtube",
    videoId: extractVideoId(video.url),
  }));

  const handleDragEnd = async (event) => {
    if (isAdmin) {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      try {
        await axios.put(`${process.env.REACT_APP_BACKEND}/videos/reorder`, {
          videos: newOrder.map((v, i) => ({ id: v.id, display_order: i + 1 })),
        });
      } catch (err) {
        console.error("Failed to save video order:", err);
      }
    }
  };

  return (
    <>
      {/* Draggable grid */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              padding: 16,
            }}
          >
            {items.map((v, i) => (
              <SortableItem
                key={v.id}
                id={v.id}
                thumbnail={v.thumbnail}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
    </>
  );
}
