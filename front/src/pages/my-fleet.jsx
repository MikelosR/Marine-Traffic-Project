import { Header, Footer, VesselsTable } from "../components";

export default function MyFleet() {
  return (
    <div className="page-wrapper">
      <Header />
      {/* My Fleet Table */}
      <VesselsTable isFleet={true} />
      <Footer />
    </div>
  );
}
