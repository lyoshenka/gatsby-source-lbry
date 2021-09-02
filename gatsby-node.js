const fetch = require("sync-fetch")
const yaml = require('js-yaml')

function sdk(method, params) {
  console.log("SDK", method, params)
  return fetch("http://localhost:5279", {
    "method": "POST",
    "headers": {
      "content-type": "application/json-rpc",
    },
    "body": JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
    }),
  }).json()
}

function fixUrl(url) {
  return url.replace(/^lbry:\/\//, '').replace('#', ':')
}

exports.sourceNodes = async ({actions, cache, createNodeId, createContentDigest}, options) => {
  const {createNode} = actions

  const search = sdk("claim_search", {channel: options.channel, media_type: "text/markdown"});

  if (search.error)
  {
    console.log(search)
    return null
  }

  search.result.items.forEach(post => {
    let content = fetch(
      "https://cdn.lbryplayer.xyz/api/v4/streams/free/" +
      [post.name, post.claim_id, post.value.source.sd_hash.substring(0, 6)].join("/")
    ).text().trim()

    if (!content.startsWith(`---`))
    {
      // add our own frontmatter
      const timestamp = post.value.release_time ? parseInt(post.value.release_time, 10) : post.timestamp;
      const date = new Date(timestamp * 1000)
      const frontMatter = yaml.dump({
        title: post.value.title,
        date: date.getFullYear().toString() + `-` + (date.getMonth() + 1).toString().padStart(2, '0') + `-` + date.getDate().toString().padStart(2, '0')
      })
      content = "---\n" + frontMatter + "---\n\n" + content
    }

    const nodeMetadata = {
      id: createNodeId(`lbry-post-${post.claim_id}`),
      parent: null, // this is used if nodes are derived from other nodes, a little different than a foreign key relationship, more fitting for a transformer plugin that is changing the node
      children: [],
      internal: {
        type: `LbryPost`,
        mediaType: `text/markdown`,
        content: content,
        contentDigest: createContentDigest(post),
      },
    }

    createNode(Object.assign({}, post, nodeMetadata))
  })

  return
}


// TODO: add cache: https://github.com/gatsbyjs/gatsby/blob/master/examples/creating-source-plugins/source-plugin/gatsby-node.js#L197


// exports.onCreateNode = ({node, actions, getNode}) => {
//
//   console.log(node);
//
//   const {createNodeField} = actions;
//
//   if (node.internal.type === `MarkdownRemark` && node.parent)
//   {
//     const parent = getNode(node.parent)
//     if (parent.internal.type === "LbryPost")
//     {
//       createNodeField({name: `slug`, node: node, value: `/` + parent.name})
//       return
//     }
//   }
// };


exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    channel: Joi.string().required()
      .description(`The LBRY channel that posts will be downloaded from`),
  })
}