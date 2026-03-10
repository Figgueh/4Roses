require("babel-register");

const router = require("./App").default;
const Sitemap = require("react-router-sitemap").default;

function generateSitemap() {
  return new Sitemap(router).build("https://4roses.fignet.ca/").save("./public/sitemap.xml");
}

generateSitemap();
