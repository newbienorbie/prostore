"use client";

import { useToast } from "@/hooks/use-toast";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    // on create
    if (type === "Create") {
      const res = await createProduct(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    }

    // on update
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    }
  };

  const images = form.watch("images");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "brand"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row upload-field">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-wrap gap-4">
                        {images.map((image: string) => (
                          <Image
                            key={image}
                            src={image}
                            alt="product image"
                            className="w-20 h-20 object-cover object-center rounded-sm"
                            width={100}
                            height={100}
                          />
                        ))}
                      </div>
                      <FormControl>
                        <div className="ut-button-container">
                          <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(
                              res: { url: string }[]
                            ) => {
                              // Check if adding new images would exceed the limit
                              if (images.length + res.length > 4) {
                                toast({
                                  variant: "destructive",
                                  description: "Maximum 4 images allowed",
                                });
                                return;
                              }
                              // Add new images
                              form.setValue("images", [
                                ...images,
                                ...res.map((r) => r.url),
                              ]);
                            }}
                            onUploadError={(error: Error) => {
                              toast({
                                variant: "destructive",
                                description: `ERROR ${error.message}`,
                              });
                            }}
                            appearance={{
                              button: "ut-upload-button",
                              container: "ut-container",
                              allowedContent: "ut-allowed-content",
                            }}
                            content={{
                              button({ ready }) {
                                if (ready) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <ImagePlus className="h-4 w-4" />
                                      <span>
                                        Upload Images
                                        {images.length > 0
                                          ? ` (${images.length}/4)`
                                          : ""}
                                      </span>
                                    </div>
                                  );
                                }
                                return "Loading...";
                              },
                              allowedContent({ ready, fileTypes }) {
                                if (!ready) return null;
                                return (
                                  <div className="text-xs text-muted-foreground">
                                    Upload up to {4 - images.length} more images
                                    • {fileTypes?.join(", ")} • Max 4MB each
                                  </div>
                                );
                              },
                            }}
                          />
                        </div>
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Featured Product</FormLabel>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal ms-3">
                          Do you want this product to be featured?
                        </FormLabel>
                        <p className="text-sm text-muted-foreground ms-3">
                          Featured products will be displayed prominently on the
                          home page
                        </p>
                      </div>
                    </div>

                    {/* Banner Upload Section - Only shown when isFeatured is true */}
                    {field.value && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Banner Image</p>
                        {banner ? (
                          <div className="space-y-3">
                            <Image
                              src={banner}
                              alt="banner-image"
                              className="w-full h-[200px] object-cover object-center rounded-sm"
                              width={1920}
                              height={680}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => form.setValue("banner", null)}
                            >
                              Remove Banner
                            </Button>
                          </div>
                        ) : (
                          <div className="ut-button-container">
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(
                                res: { url: string }[]
                              ) => {
                                form.setValue("banner", res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  variant: "destructive",
                                  description: `ERROR ${error.message}`,
                                });
                              }}
                              appearance={{
                                button: "ut-upload-button",
                                container: "ut-container",
                                allowedContent: "ut-allowed-content",
                              }}
                              content={{
                                button({ ready }) {
                                  if (ready) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <ImagePlus className="h-4 w-4" />
                                        <span>Upload Banner Image</span>
                                      </div>
                                    );
                                  }
                                  return "Loading...";
                                },
                                allowedContent({ ready }) {
                                  if (!ready) return null;
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      Upload a banner image • Max 4MB
                                    </div>
                                  );
                                },
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          {/* submit */}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
