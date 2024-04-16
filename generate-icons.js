const axios = require('axios'); // An HTTP client for Node.js and the browser, used to fetch the HTML of the Bootstrap Icons page.
const cheerio = require('cheerio'); // A fast, flexible, and lean implementation of core jQuery designed specifically for the server, used to parse the HTML and extract the SVG path data for each icon.
const ejs = require('ejs'); // A simple template engine that lets you generate dynamic HTML and other markup, used to generate the React components for each icon.
const fs = require('fs');
const path = require('path');

// The generated components are based on the Bootstrap Icons URL, for example: https://icons.getbootstrap.com/icons/alarm-fill/
// If the URL changes, then the components will not be generated correctly
const iconsUrl = 'https://icons.getbootstrap.com/';
let iconsPath = './icons/';

function toPascalCase(str) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

async function fetchIconsList(argIconNames) {
  const response = await axios.default.get(iconsUrl);
  const $ = cheerio.load(response.data);
  const icons = [];

  // If the argIconNames is not empty, then generate the components for the icons passed as arguments
  // The argIconNames are the name of the icon, for example: alarm-fill
  if (argIconNames.length === 0) {
    // This might change in the future, so it's better to use a selector that is more specific
    // Find the element with a ul class of "list-unstyled list" and under that find the li element
    $('ul.list-unstyled.list > li').each((index, element) => {
      const iconName = $(element)
        .find('a')
        .text()
        .trim();

      const iconUrl = $(element)
        .find('a')
        .attr('href');

      icons.push({ name: iconName, url: iconUrl });
    });
  } else {
    for (const argIconName of argIconNames) {
      const iconUrl = `icons/${argIconName.toLowerCase()}/`;
      icons.push({ name: argIconName, url: iconUrl });
    }
  }

  console.log("Icons fetched! Generating components...");
  return icons;
}

async function fetchIconSvg(iconUrl) {
  const response = await axios.default.get(iconUrl);

  const $ = cheerio.load(response.data);

  // Find the element with a div class of "icon-demo" and under that find the svg element
  return $('div.icon-demo').find('svg').html();
}

async function generateIconComponent(icon) {
  const template = fs.readFileSync('./templates/icon.ejs', 'utf-8');
  const svg = await fetchIconSvg(iconsUrl + icon.url);

  // Get the multiple d attributes of the path for the svg element
  const $ = cheerio.load(svg);
  const paths = $('path').map((index, element) => {
    return { d: $(element).attr('d') };
  }).get();

  // Remove the "-" from the icon name, for example: alarm-fill -> AlarmFill
  icon.name = toPascalCase(icon.name.replace(/-/g, ' '));

  const iconComponentName = `BootstrapIcon${icon.name}`;
  const component = ejs.render(template, { iconName: iconComponentName, width: 16, height: 16, paths });

  // Write the component to a file
  console.log(`Generating ${iconComponentName}...`);
  fs.writeFileSync(path.join(iconsPath, `${iconComponentName}.tsx`), component);
}

async function generateIcons() {
  const argIconNames = process.argv.slice(2);
  const icons = await fetchIconsList(argIconNames);

  if (argIconNames.some(arg => arg.startsWith('--path='))) {
    const strPathIndex = argIconNames.findIndex(arg => arg.startsWith('--path='));
    const strPath = argIconNames[strPathIndex].substring('--path='.length);
    const match = strPath.match(/(.+)/);
    if (match) {
      iconsPath = match[1];
    }
  }

  // If the iconsPath does not exist, then create it
  if (!fs.existsSync(iconsPath)) {
    fs.mkdirSync(iconsPath);
  }

  if (icons.length === 0) console.log('No icons found!');
  else {
    console.log(`Generating ${icons.length} icons...`);

    for (const icon of icons) {
      await generateIconComponent(icon);
    }
  }
}

// Run the script
generateIcons();
