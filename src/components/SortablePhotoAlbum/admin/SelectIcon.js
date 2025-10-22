import PropTypes from "prop-types";
import { MdCheckCircleOutline, MdOutlineCircle } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import classes from "./SelectIcon.module.css";
import { Favorite } from "@mui/icons-material";

export default function SelectIcon({
  selected,
  onClickEdit,
  onClickSelect,
  isDisplay,
  color = "white",
  size = "24px",
}) {
  const Icon = selected ? MdCheckCircleOutline : MdOutlineCircle;

  return (
    <div>
      <div>
        {/* Edit metadata for image */}
        <span role="button" tabIndex={0} onClick={onClickEdit} className={classes.button}>
          <CiEdit
            color={color}
            size={size}
            className={classes.edit}
            focusable={false}
            aria-hidden="true"
          />
        </span>
      </div>
      {isDisplay && (
        <div>
          {/* Show which image is the display one */}
          <span className={classes.button}>
            <Favorite
              color={color}
              size={size}
              className={classes.fav}
              focusable={false}
              aria-hidden="true"
            />
          </span>
        </div>
      )}
      <div>
        {/* Show which image the user has selected */}
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
    </div>
  );
}

SelectIcon.propTypes = {
  selected: PropTypes.bool,
  onClickSelect: PropTypes.func.isRequired,
  onClickEdit: PropTypes.func.isRequired,
  isDisplay: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
