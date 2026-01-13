const SHOPIFY_DOMAIN = 'yogabar-clone.myshopify.com';
// TODO: Replace with your actual Storefront Access Token from Shopify Admin -> Headless -> Create Storefront API
const STOREFRONT_ACCESS_TOKEN = '0fe239010ccce18eb5a0e80514456fac'; 

const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

const shopifyRequest = async (query, variables) => {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  } catch (error) {
    throw error;
  }
};

export const loginCustomer = async (email, password) => {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: { email, password }
  };

  const data = await shopifyRequest(query, variables);
  const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate;

  if (customerUserErrors.length > 0) {
    throw new Error(customerUserErrors[0].message);
  }

  return customerAccessToken;
};

export const createCustomer = async ({ firstName, lastName, email, password, phone }) => {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName,
      lastName,
      email,
      password,
      phone
    }
  };

  const data = await shopifyRequest(query, variables);
  const { customer, customerUserErrors } = data.customerCreate;

  if (customerUserErrors.length > 0) {
    throw new Error(customerUserErrors[0].message);
  }

  return customer;
};

export const createCustomerAddress = async (accessToken, address) => {
  const query = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
    address: {
      address1: address,
      city: "Bangalore", // Defaulting for now as we only ask for one address field
      province: "Karnataka",
      country: "India",
      zip: "560001"
    }
  };

  const data = await shopifyRequest(query, variables);
  const { customerUserErrors } = data.customerAddressCreate;

  if (customerUserErrors.length > 0) {
    throw new Error(customerUserErrors[0].message);
  }

  return data.customerAddressCreate.customerAddress;
};

export const getCustomer = async (accessToken) => {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        orders(first: 10, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 3) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
        defaultAddress {
          address1
          city
          province
          country
          zip
        }
        addresses(first: 1) {
          edges {
            node {
              address1
              city
              province
              country
              zip
            }
          }
        }
      }
    }
  `;

  const variables = { customerAccessToken: accessToken };
  const data = await shopifyRequest(query, variables);
  if (!data || !data.customer) {
    throw new Error('Customer details unavailable. Please log in again.');
  }
  return data.customer;
};