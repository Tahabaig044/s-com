import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import Skeleton from "@/components/Skeleton";
import Slider from "@/components/Slider";
import { wixClientServer } from "@/lib/wixClientServer";
import { Suspense } from "react";

// Ensure this file is treated as a Server Component
const HomePage = async () => {
  let featuredProducts = [];
  let newProducts = [];

  try {
    // Fetch data on the server side
    const wixClient = await wixClientServer();

    // Fetch featured products
    const featuredResponse = await wixClient.products.queryProducts().find();
    featuredProducts = featuredResponse?.items || [];

    // Fetch new products
    const newResponse = await wixClient.products.queryProducts().find();
    newProducts = newResponse?.items || [];

    // Debugging logs (remove in production)
    console.log("Featured Products:", featuredProducts);
    console.log("New Products:", newProducts);
  } catch (error) {
    console.error("Error fetching data from Wix Client:", error);
    // You can return an error message here or a fallback UI
    return <div>Error loading products. Please try again later.</div>;
  }

  return (
    <div>
      {/* Slider Section */}
      <Slider />

      {/* Featured Products Section */}
      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="t4s-section-title t4s-title">Featured Products</h1>
        <Suspense fallback={<Skeleton />}>
          <ProductList
           
            categoryId={process.env.FEATURED_PRODUCTS_CATEGORY_ID!}
            limit={8}
          />
        </Suspense>
      </div>

      {/* Categories Section */}
      <div className="mt-24">
        <h1 className="text-2xl px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 mb-12">
          Categories
        </h1>
        <Suspense fallback={<Skeleton />}>
          <CategoryList />
        </Suspense>
      </div>

      {/* New Products Section */}
      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="text-2xl">New Products</h1>
        <Suspense fallback={<Skeleton />}>
          <ProductList
            
            categoryId={process.env.FEATURED_PRODUCTS_NEW_CATEGORY_ID!}
            limit={8}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default HomePage;
