import PropTypes from "prop-types";
import clsx from "clsx";

import classes from "./StyledLink.module.css";

export default function StyledLink({ href, className, children, ...rest }) {
  return (
    <a href={href} className={clsx(classes.link, className)} {...rest}>
      {children}
    </a>
  );
}

StyledLink.propTypes = {
  href: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
