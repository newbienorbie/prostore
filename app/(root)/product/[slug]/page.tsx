import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Star } from "lucide-react";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();

  const renderStars = (rating: string) => {
    const stars = [];
    const numStars = parseInt(rating);
    const maxStars = 5;

    for (let i = 0; i < numStars; i++) {
      stars.push(<Star key={i} className="text-yellow-400 fill-yellow-400" />);
    }

    for (let i = numStars; i < maxStars; i++) {
      stars.push(
        <Star key={i + numStars} className="text-gray-300 fill-gray-300" />
      );
    }

    return stars;
  };

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* images column */}
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>
          {/* details column */}
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className="h3-bold">{product.name}</h1>
              <div className="flex">
                {renderStars(product.rating)}
                <p className="ml-2">
                  out of {product.numReviews}
                  {product.numReviews === 1 ? " review" : " reviews"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 ">
                <ProductPrice
                  value={Number(product.price)}
                  className="w-24 rounded-full bg-green-100 text-green-700 text-center px-4 py-2"
                />
              </div>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Description</p>
              <p>{product.description}</p>
            </div>
          </div>

          {/* action column */}

          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        qty: 1,
                        image: product.images![0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;
