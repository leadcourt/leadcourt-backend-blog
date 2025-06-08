const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Firebase Auth API',
      version: '1.0.0',
      description: 'API for handling Firebase authentication with token storage',
      contact: {
        name: 'API Support',
        url: 'https://yourapi.com/support',
        email: 'support@yourapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.yoursite.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              example: 'U1234567890'
            },
            email: {
              type: 'string',
              example: 'user@example.com'
            },
            emailVerified: {
              type: 'boolean',
              example: true
            }
          }
        },
        Token: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'your.jwt.token'
            }
          }
        }
      }
    }
  },
  // Path to the API docs
  apis: ['./routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Function to setup swagger in express app
const setupSwagger = (app) => {
  // Swagger docs route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger documentation available at /api-docs');
};

module.exports = {
  setupSwagger
};