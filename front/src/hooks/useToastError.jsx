import { toast } from "react-toastify";

// Show error toast with custom styling and close button
const useToastError = () => {
  const showToast = (message) => {
    toast.error(
      <div className="errorToastInner">
        <span>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "errorToast",
        closeButton: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 16 16"
          >
            <path
              fill="white"
              d="M15.1 3.1L12.9.9L8 5.9L3.1.9L.9 3.1l5 4.9l-5 4.9l2.2 2.2l4.9-5l4.9 5l2.2-2.2l-5-4.9z"
            />
          </svg>
        ),
      }
    );
  };

  return showToast;
};

export default useToastError;
