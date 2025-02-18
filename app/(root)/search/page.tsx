import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";
import React from "react";

const prices = [
  {
    name: "RM1 to RM50",
    value: "1-50",
  },
  {
    name: "RM51 to RM100",
    value: "51-100",
  },
  {
    name: "RM101 to RM200",
    value: "101-200",
  },
  {
    name: "RM201 to RM500",
    value: "201-500",
  },
  {
    name: "RM501 to RM1000",
    value: "501-1000",
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ["newest", "highest", "lowest", "rating"];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${
        isQuerySet ? q.charAt(0).toUpperCase() + q.slice(1) : ""
      } 
      ${isCategorySet ? `| Category ${category}` : ""}
      ${isPriceSet ? `| Price ${price}` : ""}
      ${isRatingSet ? `| Rating ${rating}` : ""}`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  // construct filter url
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* category links */}
        <div className="text-lg mb-2 mt-3 mr-3 bg-black text-white px-2 rounded-md font-semibold">
          Category
        </div>
        <div>
          <ul className="space-y-1 px-2">
            <li>
              <Link
                className={`${
                  (category === "all" || category === "") && "font-bold"
                }`}
                href={getFilterUrl({ c: "all" })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category && "font-bold"}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* pricing links */}
        <div className="text-lg mb-2 mt-7 mr-3 bg-black text-white px-2 rounded-md font-semibold">
          Price
        </div>
        <div>
          <ul className="space-y-1 px-2">
            <li>
              <Link
                className={`${price === "all" && "font-bold"}`}
                href={getFilterUrl({ p: "all" })}
              >
                Any
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value && "font-bold"}`}
                  href={getFilterUrl({ p: p.value })}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* rating links */}
        <div className="text-lg mb-2 mt-7 mr-3 bg-black text-white px-2 rounded-md font-semibold">
          Customer Ratings
        </div>
        <div>
          <ul className="space-y-1 px-2">
            <li>
              <Link
                className={`${rating === "all" && "font-bold"}`}
                href={getFilterUrl({ r: "all" })}
              >
                Any
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && "font-bold"}`}
                  href={getFilterUrl({ r: `${r}` })}
                >
                  {`${r}+ stars`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="space-y-4 md:col-span-4">
        <div className="flex-between flex-col md:flex-row my-4 ml-4">
          <div className="flex items-center">
            {(() => {
              const activeFilters = [];

              if (q !== "all" && q !== "") {
                activeFilters.push(<span key="query">Query: {q}</span>);
              }

              if (category !== "all" && category !== "") {
                activeFilters.push(
                  <span key="category">Category: {category}</span>
                );
              }

              if (price !== "all") {
                activeFilters.push(<span key="price">Price: {price}</span>);
              }

              if (rating !== "all") {
                activeFilters.push(
                  <span key="rating">Rating: {rating}+ stars</span>
                );
              }

              // Render filters with separators
              return activeFilters.map((filter, index) => (
                <React.Fragment key={index}>
                  {filter}
                  {index < activeFilters.length - 1 && (
                    <span className="mx-2">|</span>
                  )}
                </React.Fragment>
              ));
            })()}
            &nbsp;
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            rating !== "all" ||
            price !== "all" ? (
              <Button variant={"link"} asChild className="ml-2">
                <Link href="/search">Clear</Link>
              </Button>
            ) : null}
          </div>

          <div>
            Sort by{" "}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort == s && "font-bold"}`}
                href={getFilterUrl({ s })}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <div className="mt-3 ml-12">No products found</div>
          )}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
