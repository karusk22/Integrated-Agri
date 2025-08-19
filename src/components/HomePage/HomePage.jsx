import NavBar from "../NavBar/NavBar";
import tractorPic from '../../assets/background/tractor-pic-1.jpg';
import foodWaste from '../../assets/background/food-waste-1.jpg';
import Footer from "../Footer/Footer";
import './HomePage.css';

function HomePage() {
    return(
        <>
            <NavBar />
            <div className="flex flex-col items-center p-60">
                <h2 className="mb-7 text-2xl">Tools, trade, and trust — all in one <i>sandhai.</i></h2>
                <button className="text-white rounded-2xl pr-5 pl-5 pt-3 pb-3 bg-[#436b1f]">Browse our shop</button>
            </div>
            <div className="flex p-10">
                <div className="card mr-20 p-16">
                    <img src={tractorPic} alt="Farmer harvesting the crops using tractor under a clear sky." className="h-96 mb-10"/>
                    <p>What many see as waste, we see as possibility. Every peel, husk, and leftover holds hidden potential to create energy, feed, compost, or new products. By rethinking agricultural by-products, we reduce waste, close the loop, and build a sustainable cycle where nothing goes unused.</p>
                    <button className="mt-10 rounded-2xl pr-5 pl-5 pt-3 pb-3 bg-[#436b1f] text-white">Browse Machinery Catalog</button>
                </div>
                <div className="card p-16">
                    <img src={foodWaste} alt="" className="h-96 w-80 mb-10"/>
                    <p>Behind every harvest is the strength of innovation. Modern equipment empowers farmers to work smarter, save resources, and bring out the best from every acre. By combining tradition with technology, we cultivate not just crops, but a future of efficiency, resilience, and sustainability in agriculture.</p>
                    <button className="mt-10 rounded-2xl pr-5 pl-5 pt-3 pb-3 bg-[#436b1f] text-white">Check out Byproducts</button>
                </div>
            </div>
            <div>
                <h3>About</h3>
                <p>We are building a farmer-friendly platform that goes beyond traditional eCommerce. Our app connects farmers, traders, and buyers by creating a dedicated space for agricultural by-products and affordable farming equipment.
                For too long, by-products have been seen as waste. We believe they are hidden opportunities — valuable resources for fuel, feed, fiber, and more. Alongside this, we make essential farming tools and equipment accessible at lower costs, ensuring that no farmer is left behind because of affordability.</p>
            </div>
            <div>
                <h3>Our Vision</h3>
                <p>To create a future where no farmer struggles for tools, no harvest is wasted, and every by-product finds its true value.
                We envision a marketplace where farmers grow, trade, and thrive with dignity.</p>
            </div>
            <Footer />
        </>
    )
}

export default HomePage;