import Navbar from "../Components/Navbar";
import WebBanner from "../Components/Webbannar";
// import Footer from "../components/Footer";
// import HeroSection from "../components/HeroSection";
import FeatureSection from "../Components/FeatureSection";
import Footer from "../Components/Footer";
const Home = () => {
  return (
    <>
    
      <Navbar />
      <div className="pt-20">
        <WebBanner />
      </div>
      <FeatureSection/>
      <Footer/>
    </>
  );
};

export default Home;
