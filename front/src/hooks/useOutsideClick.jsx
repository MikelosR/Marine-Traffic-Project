import { useEffect } from "react";

// Setup event listener for clicks outside the referenced element
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick);

    // Cleanup event listener on component unmount
    return () => document.removeEventListener("click", handleClick);
  }, [ref, callback]);
};

export default useOutsideClick;
