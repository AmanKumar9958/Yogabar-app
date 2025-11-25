import { useEffect, useState } from 'react';

const SHOPIFY_DOMAIN = 'yogabar-clone.myshopify.com';
const ACCESS_TOKEN = '0fe239010ccce18eb5a0e80514456fac'; // Replace with your actual token

const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

const COLLECTIONS_QUERY = `
  query {
    collections(first: 10) {
      edges {
        node {
          id
          title
          products(first: 10) {
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
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches collections and products from Shopify Storefront API
 * and flattens the "edges -> node" structure.
 */
export const fetchShopifyData = async () => {
  try {
    const response = await fetch(SHOPIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: COLLECTIONS_QUERY }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    if (!json.data || !json.data.collections) {
      return [];
    }

    // Parse and flatten data
    const collections = json.data.collections.edges.map((edge) => {
      const collection = edge.node;
      
      const products = collection.products.edges.map((prodEdge) => {
        const product = prodEdge.node;
        const image = product.images.edges.length > 0 ? product.images.edges[0].node.url : null;
        
        return {
          id: product.id,
          title: product.title,
          description: product.description,
          availableForSale: product.availableForSale,
          image: image,
          price: {
            amount: product.priceRange.minVariantPrice.amount,
            currencyCode: product.priceRange.minVariantPrice.currencyCode,
          },
        };
      });

      return {
        id: collection.id,
        title: collection.title,
        products: products,
      };
    });

    return collections;
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchShopifyData();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};
