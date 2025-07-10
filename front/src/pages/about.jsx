import { Header, Footer } from "../components";

const About = () => {
    return (
        <div className="page-wrapper">
            <Header />

            {/* About content */}
            <div className="about-page">
                <h1>About SeaX</h1>
                <p>
                    SeaX is a platform dedicated to providing real-time information about
                    vessels around the world. Our mission is to enhance maritime safety
                    and awareness by offering accurate and up-to-date vessel tracking
                    data.
                </p>
                <p>
                    We believe in transparency and accessibility, which is why we strive
                    to make our services available to everyone. Wether you're a maritime
                    professional, a shipping enthusiast, or just curious about the sea,
                    SeaX is here for you.
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default About;
