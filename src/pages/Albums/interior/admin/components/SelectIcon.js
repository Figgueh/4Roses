import PropTypes from "prop-types";
import { MdCheckCircleOutline, MdOutlineCircle } from "react-icons/md";
import classes from "./SelectIcon.module.css";

export default function SelectIcon({ selected, onClick, color = "white", size = "24px" }) {
  const Icon = selected ? MdCheckCircleOutline : MdOutlineCircle;

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes.button}
      aria-label={selected ? "Deselect image" : "Select image"}
    >
      <Icon
        color={color}
        size={size}
        className={classes.icon}
        focusable={false}
        aria-hidden="true"
      />
    </button>
  );
}

SelectIcon.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
