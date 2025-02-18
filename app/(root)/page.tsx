// for a different title than the one set in layout
// export const metadata = {
//   title: "Home",
// };

// to test whether the loader is working
// import { resolve } from "path";

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const Homepage = async () => {
//   await delay(2000);
//   return <>Prostore</>;
// };

import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
      <ViewAllProductsButton />
    </>
  );
};

export default Homepage;
