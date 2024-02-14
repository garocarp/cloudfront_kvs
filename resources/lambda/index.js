const {
  CloudFrontKeyValueStoreClient,
  PutKeyCommand,
  DescribeKeyValueStoreCommand,
  ListKeysCommand,
} = require("@aws-sdk/client-cloudfront-keyvaluestore");
// *** add these two imports: ***
const {
  SignatureV4MultiRegion,
} = require("@aws-sdk/signature-v4-multi-region");
require("@aws-sdk/signature-v4-crt");

const client = new CloudFrontKeyValueStoreClient({
  region: "us-west-2",
  signerConstructor: SignatureV4MultiRegion, // *** add this parameter. ***
});

exports.handler = async (event, context) => {
  try {
    let allKeys = []; // Array to store all keys

    // Initial input parameters for listing keys
    let input = {
      KvsARN:
        "arn:aws:cloudfront::171611574633:key-value-store/fcde280e-f6b1-49a4-9c63-f95089ae4ad6",
      MaxResults: 5, // Set as needed, maximum allowed page is 50
    };

    // Loop until there are no more tokens
    while (true) {
      // Create a command to list keys
      const command = new ListKeysCommand(input);

      // Send the command and await the response
      const response = await client.send(command);

      // Add the keys from the current page to the array
      allKeys.push(...response.Items);

      // If there is a next token, update the input for the next call
      if (response.NextToken) {
        input.NextToken = response.NextToken;
      } else {
        // If there is no next token, break out of the loop
        break;
      }
    }

    // Return the array containing all keys
    return allKeys;
  } catch (error) {
    console.error("Error in Lambda handler:", error);
    throw error;
  }
};
