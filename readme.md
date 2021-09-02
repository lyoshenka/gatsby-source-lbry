# Gatsby LBRY source

This is a source plugin for Gatsby that uses [LBRY](https://lbry.com) to get your posts.

It downloads all markdown posts in a channel.

## Usage

### LBRY

Make sure you have the LBRY [daemon](https://github.com/lbryio/lbry-sdk) running on port 5279.

### Gatsby config

```
npm install gatsby-source-lbry
```

Add to your gatsby-config.js, setting @your-channel-name to your actual channel name

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-lbry`,
      options: {
        channel: `@your-channel-name`,
      },
    },
  ]
}
```

You may also need to add this to `onCreateNode()` in your project's `gatsby-node.js` to make it play nice
with themes that expect a slug 

```js
if (node.internal.type === `MarkdownRemark` && node.parent) {
    const parent = getNode(node.parent)
    if (parent.internal.type === "LbryPost") {
        createNodeField({ name: `slug`, node: node, value: `/` + parent.name })
        return
    }
}
```