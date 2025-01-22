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
import { getLatestProducts } from "@/lib/actions/product.actions";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  return (
    <>
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
    </>
  );
};

export default Homepage;
