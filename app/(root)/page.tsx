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

import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/product/product-list";

const Homepage = () => {
  return (
    <>
      <ProductList
        data={sampleData.products}
        title="Newest Arrivals"
        limit={4}
      />
    </>
  );
};

export default Homepage;
