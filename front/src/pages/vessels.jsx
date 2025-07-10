import { Header, Footer, VesselsTable } from "../components";
import { useLocation } from "react-router-dom";

// Parse query parameters from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Vessels() {
  // Get "search" param if present
  const query = useQuery();
  const searchTerm = query.get("search");

  return (
    <div className="page-wrapper">
      <Header />
      <VesselsTable searchParam={searchTerm} />
      <Footer />
    </div>
  );
}
