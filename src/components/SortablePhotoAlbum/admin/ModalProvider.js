import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null); // optional payload (like an item ID)

  const openModal = (data) => {
    setData(data);
    setOpen(true);
  };

  const closeModal = () => {
    setData(null);
    setOpen(false);
  };

  return (
    <ModalContext.Provider value={{ open, openModal, closeModal, data }}>
      {children}
    </ModalContext.Provider>
  );
}

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useModal() {
  return useContext(ModalContext);
}
