import cf from "cloudfront";

const kvsId = "__KVS_ID__";

// This fails if the key value store is not associated with the function
const kvsHandle = cf.kvs(kvsId);

async function handler(event) {
  // Use the first part of the pathname as key, for example http(s)://domain/<key>/something/else
  const key = event.request.uri.split("/")[1];
  let value = "Not found"; // Default value
  try {
    value = await kvsHandle.get(key);
  } catch (err) {
    console.log(`Kvs key lookup failed for ${key}: ${err}`);
  }
  var response = {
    statusCode: 200,
    statusDescription: "OK",
    body: {
      encoding: "text",
      data: `Key: ${key} Value: ${value}\n`,
    },
  };
  return response;
}
