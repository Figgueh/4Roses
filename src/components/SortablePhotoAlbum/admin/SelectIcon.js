import PropTypes from "prop-types";
import { MdCheckCircleOutline, MdOutlineCircle } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import classes from "./SelectIcon.module.css";

export default function SelectIcon({
  selected,
  onClickEdit,
  onClickSelect,
  color = "white",
  size = "24px",
}) {
  const Icon = selected ? MdCheckCircleOutline : MdOutlineCircle;

  return (
    <div>
      <span role="button" tabIndex={0} onClick={onClickEdit} className={classes.button}>
        <CiEdit
          color={color}
          size={size}
          className={classes.edit}
          focusable={false}
          aria-hidden="true"
        />
      </span>
      <span
        role="button"
        onClick={onClickSelect}
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
      </span>
    </div>
  );
}

SelectIcon.propTypes = {
  selected: PropTypes.bool,
  onClickSelect: PropTypes.func.isRequired,
  onClickEdit: PropTypes.func.isRequired,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
