const lib = require("./gatsby-node");

const gatsbyMock = {
  actions: { createNode: () => {} },
  cache: { get: async () => {}, set: async () => {} },
  createNodeId: () => {},
  createContentDigest: () => {},
}

const options = { channel: "@lbry" }

lib.sourceNodes(gatsbyMock, options).then(res => console.log(res));
