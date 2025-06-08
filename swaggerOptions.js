// swaggerOptions.js

export default {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Title',
        version: '1.0.0',
        description: 'API documentation for your Node.js backend',
      },
      servers: [
        {
          url: 'http://localhost:3000', // Change to match your API base URL
        },
      ],
    },
    apis: ['./routes/*.js'], // Path to the API docs in JSDoc format
  };
  