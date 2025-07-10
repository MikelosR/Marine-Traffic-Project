import { toast } from "react-toastify";

// Show success toast with custom icon and styling
const useToastSuccess = () => {
  const showToast = (message) => {
    toast.success(
      <div className="successToastInner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 512 512"
        >
          <path
            fill="white"
            d="M437.3 30L202.7 339.3L64 200.7l-64 64L213.3 478L512 94z"
          />
        </svg>
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
        className: "successToast",
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

export default useToastSuccess;
