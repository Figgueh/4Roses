import PropTypes from "prop-types";

function Overlay({ photo: { src, alt, srcSet }, width, height, padding, style }) {
  return (
    <div style={{ padding, ...style }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={`${width}px`}
        srcSet={srcSet?.map?.((image) => `${image.src} ${image.width}w`).join(", ")}
      />
    </div>
  );
}

Overlay.propTypes = {
  photo: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    srcSet: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};

export default Overlay;
