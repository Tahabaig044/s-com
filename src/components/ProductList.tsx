import { wixClientServer } from "@/lib/wixClientServer";
import { products } from "@wix/stores";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Pagination from "./Pagination";

const PRODUCT_PER_PAGE = 8;

const fetchProducts = async (query: any, retries = 3) => {
  try {
    return await query.find();
  } catch (error) {
    console.error("Error during query execution:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    if (retries > 0) {
      console.warn(`Retrying query... Attempts remaining: ${retries}`);
      return fetchProducts(query, retries - 1);
    }
    throw error; // Rethrow after retries
  }
};

const ProductList = async ({
  categoryId,
  limit,
  searchParams,
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  let products: products.Product[] = [];
  let total = 0;

  try {
    const wixClient = await wixClientServer();

    // Build product query
    const productQuery = wixClient.products
      .queryProducts()
      .startsWith("name", searchParams?.name || "")
      .eq("collectionIds", categoryId)
      .hasSome(
        "productType",
        searchParams?.type ? [searchParams.type] : ["physical", "digital"]
      )
      .gt("priceData.price", searchParams?.min || 0)
      .lt("priceData.price", searchParams?.max || 999999)
      .limit(limit || PRODUCT_PER_PAGE)
      .skip(
        searchParams?.page
          ? parseInt(searchParams.page) * (limit || PRODUCT_PER_PAGE)
          : 0
      );

    // Apply sorting if specified
    if (searchParams?.sort) {
      const [sortType, sortBy] = searchParams.sort.split(" ");
      if (sortType === "asc") productQuery.ascending(sortBy);
      if (sortType === "desc") productQuery.descending(sortBy);
    }

    // Fetch products
    const res = await fetchProducts(productQuery);
    products = res.items || [];
    total = res.totalCount || 0;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data from Wix Client:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }

  return (
    <div className="mt-12">
      {products.length > 0 ? (
        <div className="flex gap-x-8 gap-y-16 flex-wrap">
          {products.map((product) => (
            <Link
              href={"/" + product.slug}
              className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
              key={product._id}
            >
              {/* Product Image */}
              <div className="relative w-full h-80">
                <Image
                  src={product.media?.mainMedia?.image?.url || "/product.png"}
                  alt={product.name || "Product image"}
                  fill
                  sizes="25vw"
                  className="relative object-cover z-10 hover:opacity-0 transition-opacity ease-in-out duration-500"
                />
                {product.media?.items && product.media.items[1]?.image && (
                  <Image
                    src={product.media.items[1]?.image?.url || "/product.png"}
                    alt={product.name || "Product image"}
                    fill
                    sizes="25vw"
                    className="absolute object-cover"
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="flex justify-between">
                <span className="font-medium">{product.name}</span>
                <span className="font-semibold">${product.price?.price}</span>
              </div>

              {/* Short Description */}
              {product.additionalInfoSections && (
                <div
                  className="text-sm text-gray-500"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      product.additionalInfoSections.find(
                        (section: any) => section.title === "shortDesc"
                      )?.description || ""
                    ),
                  }}
                ></div>
              )}

              {/* Add to Cart Button */}
              <button className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white">
                Add to Cart
              </button>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {/* Pagination */}
      {searchParams?.cat || searchParams?.name ? (
        <Pagination
          currentPage={searchParams?.page || 0}
          hasPrev={searchParams?.page > 0}
          hasNext={products.length === (limit || PRODUCT_PER_PAGE)}
        />
      ) : null}
    </div>
  );
};

export default ProductList;


// import { wixClientServer } from "@/lib/wixClientServer";
// import { products } from "@wix/stores";
// import Image from "next/image";
// import Link from "next/link";
// import DOMPurify from "isomorphic-dompurify";
// import Pagination from "./Pagination";

// const PRODUCT_PER_PAGE = 8;

// const fetchProducts = async (query: any, retries = 3) => {
//   try {
//     return await query.find();
//   } catch (error) {
//     if (retries > 0) {
//       console.warn("Retrying query...", retries);
//       return fetchProducts(query, retries - 1);
//     }
//     throw error;
//   }
// };

// const ProductList = async ({
//   categoryId,
//   limit,
//   searchParams,
// }: {
//   categoryId: string;
//   limit?: number;
//   searchParams?: any;
// }) => {
//   let products: products.Product[] = [];
//   let total = 0;

//   try {
//     const wixClient = await wixClientServer();

//     // Build product query
//     const productQuery = wixClient.products
//       .queryProducts()
//       .startsWith("name", searchParams?.name || "")
//       .eq("collectionIds", categoryId)
//       .hasSome(
//         "productType",
//         searchParams?.type ? [searchParams.type] : ["physical", "digital"]
//       )
//       .gt("priceData.price", searchParams?.min || 0)
//       .lt("priceData.price", searchParams?.max || 999999)
//       .limit(limit || PRODUCT_PER_PAGE)
//       .skip(
//         searchParams?.page
//           ? parseInt(searchParams.page) * (limit || PRODUCT_PER_PAGE)
//           : 0
//       );

//     // Apply sorting if specified
//     if (searchParams?.sort) {
//       const [sortType, sortBy] = searchParams.sort.split(" ");
//       if (sortType === "asc") productQuery.ascending(sortBy);
//       if (sortType === "desc") productQuery.descending(sortBy);
//     }

//     // Fetch products
//     const res = await fetchProducts(productQuery);
//     products = res.items || [];
//     total = res.totalCount || 0;
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Error fetching data from Wix Client:", error.message);
//     } else {
//       console.error("An unexpected error occurred:", error);
//     }
//     // Optionally, you can render fallback content
//   }

//   return (
//     <div className="mt-12">
//       {products.length > 0 ? (
//         <div className="flex gap-x-8 gap-y-16 flex-wrap">
//           {products.map((product) => (
//             <Link
//               href={"/" + product.slug}
//               className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
//               key={product._id}
//             >
//               {/* Product Image */}
//               <div className="relative w-full h-80">
//                 <Image
//                   src={product.media?.mainMedia?.image?.url || "/product.png"}
//                   alt={product.name || "Product image"}
//                   fill
//                   sizes="25vw"
//                   className="relative object-cover z-10 hover:opacity-0 transition-opacity ease-in-out duration-500"
//                 />
//                 {product.media?.items && product.media.items[1]?.image && (
//                   <Image
//                     src={product.media.items[1]?.image?.url || "/product.png"}
//                     alt={product.name || "Product image"}
//                     fill
//                     sizes="25vw"
//                     className="absolute object-cover"
//                   />
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="flex justify-between">
//                 <span className="font-medium">{product.name}</span>
//                 <span className="font-semibold">${product.price?.price}</span>
//               </div>

//               {/* Short Description */}
//               {product.additionalInfoSections && (
//                 <div
//                   className="text-sm text-gray-500"
//                   dangerouslySetInnerHTML={{
//                     __html: DOMPurify.sanitize(
//                       product.additionalInfoSections.find(
//                         (section: any) => section.title === "shortDesc"
//                       )?.description || ""
//                     ),
//                   }}
//                 ></div>
//               )}

//               {/* Add to Cart Button */}
//               <button className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white">
//                 Add to Cart
//               </button>
//             </Link>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">No products found.</p>
//       )}

//       {/* Pagination */}
//       {searchParams?.cat || searchParams?.name ? (
//         <Pagination
//           currentPage={searchParams?.page || 0}
//           hasPrev={searchParams?.page > 0}
//           hasNext={products.length === (limit || PRODUCT_PER_PAGE)}
//         />
//       ) : null}
//     </div>
//   );
// };

// export default ProductList;




// import { wixClientServer } from "@/lib/wixClientServer";
// import { products } from "@wix/stores";
// import Image from "next/image";
// import Link from "next/link";
// import DOMPurify from "isomorphic-dompurify";
// import Pagination from "./Pagination";

// const PRODUCT_PER_PAGE = 8;

// const ProductList = async ({
//   categoryId,
//   limit,
//   searchParams,
// }: {
//   categoryId: string;
//   limit?: number;
//   searchParams?: any;
// }) => {
//   const wixClient = await wixClientServer();

//   const productQuery = wixClient.products
//     .queryProducts()
//     .startsWith("name", searchParams?.name || "")
//     .eq("collectionIds", categoryId)
//     .hasSome(
//       "productType",
//       searchParams?.type ? [searchParams.type] : ["physical", "digital"]
//     )
//     .gt("priceData.price", searchParams?.min || 0)
//     .lt("priceData.price", searchParams?.max || 999999)
//     .limit(limit || PRODUCT_PER_PAGE)
//     .skip(
//       searchParams?.page
//         ? parseInt(searchParams.page) * (limit || PRODUCT_PER_PAGE)
//         : 0
//     );
//   if (searchParams?.sort) {
//     const [sortType, sortBy] = searchParams.sort.split(" ");

//     if (sortType === "asc") {
//       productQuery.ascending(sortBy);
//     }
//     if (sortType === "desc") {
//       productQuery.descending(sortBy);
//     }
//   }

//   const res = await productQuery.find();

//   return (
//     <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//       {res.items.map((product: products.Product) => (
//         <Link
//           href={"/" + product.slug}
//           className="flex flex-col gap-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300"
//           key={product._id}
//         >
//           {/* Image Section */}
//           <div className="relative w-full h-80 rounded-t-lg overflow-hidden">
//             <Image
//               src={product.media?.mainMedia?.image?.url || "/product.png"}
//               alt={`${product.name} alternate view`}
//               fill
//               sizes="25vw"
//               className="absolute object-cover z-10 hover:opacity-0 transition-opacity duration-500"
//             />
//             {product.media?.items && (
//               <Image
//                 src={product.media?.items[1]?.image?.url || "/product.png"}
//                 alt={`${product.name} alternate view`}
//                 fill
//                 sizes="25vw"
//                 className="absolute object-cover"
//               />
//             )}
//           </div>

//           {/* Product Info */}
//           <div className="p-4 flex flex-col gap-2">
//             <div className="flex justify-between items-center">
//               <span className="text-lg font-semibold text-gray-800">
//                 {product.name}
//               </span>
//               <span className="text-lg font-bold text-lama">${product.price?.price}</span>
//             </div>

//             {product.additionalInfoSections && (
//               <div
//                 className="text-sm text-gray-600 line-clamp-2"
//                 dangerouslySetInnerHTML={{
//                   __html: DOMPurify.sanitize(
//                     product.additionalInfoSections.find(
//                       (section: any) => section.title === "shortDesc"
//                     )?.description || ""
//                   ),
//                 }}
//               ></div>
//             )}

//             <button className="mt-4 bg-lama text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
//               Add to Cart
//             </button>
//           </div>
//         </Link>
//       ))}

//       {searchParams?.cat || searchParams?.name ? (
//         <Pagination
//           currentPage={res.currentPage || 0}
//           hasPrev={res.hasPrev()}
//           hasNext={res.hasNext()}
//         />
//       ) : null}
//     </div>
//   );
// };

// export default ProductList;


