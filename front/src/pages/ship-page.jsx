import { Header, Footer, VesselsInfo, Loading } from "../components";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { axiosGetPublic, axiosGetPrivate } from "../api";
import Cookies from "js-cookie";

export default function ShipPage() {
  // Get vessel ID from URL
  const { id } = useParams();

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vessel, setVessel] = useState({});
  const [reload, setReload] = useState(false);

  // Fetch vessel info
  useEffect(() => {
    const fetchVessel = async () => {
      setLoading(true);
      setError(null);

      try {
        const isLoggedIn = !!Cookies.get("token");
        const response = isLoggedIn
          ? await axiosGetPrivate(`vessels/${id}`)
          : await axiosGetPublic(`vessels/${id}`);

        if (!response.success) throw new Error(response.data.error);

        setVessel(response.data);
      } catch (err) {
        console.error("Error fetching vessel:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVessel();
  }, [id, reload]);

  return (
    <div className="page-wrapper">
      <Header />
      <Loading loading={loading} />
      <VesselsInfo
        vessel={vessel}
        error={error}
        loading={loading}
        reload={reload}
        setReload={setReload}
      />
      <Footer />
    </div>
  );
}
