const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      return context.user;
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({
        $or: [{ username: email }, { email }],
      });
      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error("Wrong password!");
      }
      const token = signToken(user);
      return { token, user };
    },
  },

  createUser: async (parent, { username, email, password }) => {
    const user = await User.create({ username, email, password });

    if (!user) {
      throw new Error("User creation failed");
    }

    const token = signToken(user);
    return { token, user };
  },

  saveBook: async (parent, { book }, context) => {
    const { user } = context;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $addToSet: { savedBooks: book } 
        },
        { new: true, runValidators: true }
      )
      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
    }
},

  deleteBook: async (parent, { bookId }, context) => {
    const { user } = context;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: bookId }},
        { new: true } 
      )
      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
      }
    }
  };



module.exports = resolvers;
