import { cloneElement } from "react";
import { useSortable } from "@dnd-kit/sortable";
import PropTypes from "prop-types";

export default function SortablePhoto({ id, children }) {
  const { attributes, listeners, isDragging, index, activeIndex, over, setNodeRef } = useSortable({
    id,
  });

  const dataPosition =
    activeIndex >= 0 && over?.id === id && !isDragging
      ? index > activeIndex
        ? "after"
        : "before"
      : undefined;

  return cloneElement(children, {
    ref: setNodeRef,
    "data-active": isDragging,
    "data-position": dataPosition,
    ...attributes,
    ...listeners,
  });
}

SortablePhoto.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.element.isRequired,
};
