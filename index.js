// ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
// Translate WordPress Post
// using AWS Translate
// ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨

require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const ndjson = require("ndjson");
const htmlparser2 = require("htmlparser2");
const Translate = require("aws-sdk/clients/translate");

const siteID = process.env.HEADLESS_SITE_ID;
const headlessURL = `hl-b.getshifter.co`;
const baseURL = `https://${siteID}.hl-b.getshifter.co`;
const restURL = `${baseURL}/wp-json/wp/v2`;

let username = process.env.HEADLESS_USERNAME;
let password = process.env.HEADLESS_PASSWORD;
let username_password = `${username}:${password}`;
let buffer = new Buffer.from(username_password);
let token = buffer.toString("base64");

const translate = new Translate({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

let write = async ({ slug, content, flag }) => {
  try {
    console.log(slug);
    fs.writeFileSync(slug, content, { flag: flag });
  } catch (err) {
    console.error(err);
  }
};

async function translateText({ url, postId }) {
  write({
    slug: `../datasets/${postId}.txt`,
    content: ``,
  });

  try {
    let {
      data: { content, guid, id },
    } = await axios({
      headers: {
        Authorization: `Basic ${token}`,
      },
      method: "get",
      url: `${restURL}/posts/${postId}`,
    });

    write({
      slug: `../datasets/${postId}.html`,
      content: content.rendered,
    });

    write({
      slug: `../datasets/${postId}.en.html`,
      content: content.rendered,
    });

    const parser = new htmlparser2.Parser({
      ontext(text, i) {
        translate.translateText(
          {
            SourceLanguageCode: "ja",
            TargetLanguageCode: "en",
            Text: text,
          },
          async function (error, data) {
            let translatedText = data.TranslatedText;

            await write({
              slug: `../datasets/${postId}.txt`,
              content: `${JSON.stringify({
                text: text,
                en: data.TranslatedText,
              })}\n`,
              flag: "a+",
            });

            fs.readFile(
              `../datasets/${postId}.en.html`,
              "utf8",
              function (err, data) {
                const regex = new RegExp(`${text}`);

                write({
                  slug: `../datasets/${postId}.en.html`,
                  content: data.replace(regex, translatedText),
                });

                if (err) {
                  return console.log(err);
                }
              }
            );

            if (error) {
              console.log(error);
            }
          }
        );
      },
    });

    parser.write(content.rendered);
    parser.end();
  } catch (error) {
    console.error(error);
  }
}

translateText({ postId: 34 });