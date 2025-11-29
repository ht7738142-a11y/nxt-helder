import { Router } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from '../services/graphqlService.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Point 196-197: GraphQL endpoint
router.use('/', auth(false), graphqlHTTP({
  schema: schema,
  graphiql: process.env.NODE_ENV === 'development', // GraphiQL IDE en dev
  customFormatErrorFn: (error) => ({
    message: error.message,
    locations: error.locations,
    path: error.path
  })
}));

export default router;
