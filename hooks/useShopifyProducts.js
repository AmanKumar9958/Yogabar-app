import { useCallback, useEffect, useState } from 'react';

const SHOPIFY_DOMAIN = 'yogabar-clone.myshopify.com';
const ACCESS_TOKEN = '0fe239010ccce18eb5a0e80514456fac'; // Replace with your actual token

const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

const ALL_PRODUCTS_AND_COLLECTIONS_QUERY = `
  query {
    products(first: 100) {
      edges {
        node {
          id
          title
          description
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 10) {
            edges {
              node {
                availableForSale
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    }
    collections(first: 25) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

/**
 * Fetches collections and products from Shopify Storefront API
 * and structures the data for the app.
 */
export const fetchShopifyData = async () => {
  try {
    const response = await fetch(SHOPIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_AND_COLLECTIONS_QUERY }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors.map(e => e.message).join('\n'));
    }

    if (!json.data) {
      return [];
    }

    const allProducts = json.data.products.edges.map((prodEdge) => {
      const product = prodEdge.node;
      const image = product.images.edges.length > 0 ? product.images.edges[0].node.url : null;
      const collections = product.collections.edges.map(colEdge => ({
        id: colEdge.node.id,
        title: colEdge.node.title,
      }));
      
      // Determine availability by checking if ANY variant is available for sale.
      const isAvailable = product.variants.edges.some(variantEdge => variantEdge.node.availableForSale);

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        availableForSale: isAvailable, // Use our calculated availability
        image: image,
        price: {
          amount: product.priceRange.minVariantPrice.amount,
          currencyCode: product.priceRange.minVariantPrice.currencyCode,
        },
        collections: collections,
      };
    });

    const allCollections = json.data.collections.edges.map((colEdge) => {
      const collection = colEdge.node;
      return {
        id: collection.id,
        title: collection.title,
        products: allProducts.filter(p => 
          p.collections.some(c => c.id === collection.id)
        ),
      };
    });

    // Add an "All" collection that includes every product
    const allCollection = {
      id: 'all-products',
      title: 'All',
      products: allProducts,
    };

    // Filter out empty collections but ensure 'All' is always there
    const finalCollections = [allCollection, ...allCollections.filter(c => c.products.length > 0)];

    return finalCollections;
  } catch (error) {
    console.error('Error fetching Shopify data:', error);
    throw error;
  }
};

/**
 * React Hook to fetch Shopify products and manage state.
 */
export const useShopifyProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchShopifyData();
      setData(result);
      setError(null); // Clear previous errors on success
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
};
