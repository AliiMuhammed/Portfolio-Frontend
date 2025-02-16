import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { hideToast } from "../Redux/slices/toastSlice";

const Toast = () => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((state) => state.toast);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideToast());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000} // 3 seconds
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        variant="filled"
        onClose={handleClose}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
