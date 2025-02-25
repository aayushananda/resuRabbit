import FeaturedJobs from "@/components/FeaturedJobs"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Navbar from "@/components/Navbar"

export default function Home(){
    return(
        <div>
            <Navbar />
            <Hero />
            <FeaturedJobs />
            <Footer />
        </div>
    )
}
