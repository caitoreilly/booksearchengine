const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { authMiddleware } = require("./utils/auth");

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// app.use(routes);

// create a new instance of an Apollo server with graphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go to test our GQL API
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// call the async function to start the server
startApolloServer(typeDefs, resolvers);
