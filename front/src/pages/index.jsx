import { Footer, Header, ShipMap } from "../components";

export default function Index() {
  return (
    <div className="page-wrapper">
      <Header />

      {/* Main ship map */}
      <ShipMap />

      <Footer />
    </div>
  );
}
