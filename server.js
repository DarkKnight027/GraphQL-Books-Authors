const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

const app = express();

/* ------------------ DATA ------------------ */

const authors = [
  { id: '1', name: 'Kate Chopin' },
  { id: '2', name: 'Paul Auster' },
  { id: '3', name: 'F. Scott Fitzgerald' }
];

const books = [
  { id: '1', name: 'The Awakening', authorId: '1' },
  { id: '2', name: 'City of Glass', authorId: '2' },
  { id: '3', name: 'The Great Gatsby', authorId: '3' },
  { id: '4', name: 'To Kill a Mockingbird', authorId: '3' },
  { id: '5', name: '1984', authorId: '2' },
  { id: '6', name: 'Brave New World', authorId: '1' }
];

/* ------------------ TYPES ------------------ */

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'Represents an author',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) =>
        books.filter(book => book.authorId === author.id)
    }
  })
});

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'Represents a book',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (book) =>
        authors.find(author => author.id === book.authorId)
    }
  })
});

/* ------------------ ROOT QUERY ------------------ */

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book:{
        type: BookType,
        description: 'A single book',
        args: {
            id: { type: GraphQLString }
        },
        resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A single author',
      args: {
        id: { type: GraphQLString }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
});

/* ------------------ SCHEMA ------------------ */

const schema = new GraphQLSchema({
  query: RootQuery
});

/* ------------------ SERVER ------------------ */

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(5000, () => {
  console.log('Server running at http://localhost:5000/graphql');
});