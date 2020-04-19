// 1. Register a FetchEvent listener that sends a custom
// response for a given request.
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 2. Return a custom request object
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if(request.method === 'GET') {
    const url = new URL(request.url);
    const apiurl = 'https://cfw-takehome.developers.workers.dev/api/variants'; // API to request URLs
    // Rewrite request to point to API url - makes request mutable, we can add correct Origin header 
    // to make the API server think this request isn't cross site
    request = new Request(apiurl, request);
    request.headers.set('Origin', new URL(apiurl).origin);
    let response = await fetch(request);
    if (response.ok) {
      let obj = await response.json(); // read response body and parse as json
      let variants = obj.variants;
      
      // randomly pick one of the two webpages
      let group = Math.random() < 0.5 ? 'v1' : 'v2'; // ~50/50 split
      let v = group === 'v1' ? variants[0] : variants[1];
      response = await fetch(v); // request (random) variant
      if(response.ok) {
        // Recreate response to modify the headers
        response = new Response(response.body, response);
        // Set CORS headers
        response.headers.set('Access-Control-Allow-Origin', url.origin);
        // Append/Add Vary header so browser caches response correctly
        response.headers.append('Vary', 'Origin');
        return rewriter.transform(response);
        
      } else {
        alert("Requesting URLs from API HTTP-Error: " + response.status);
      }
    } else {
      alert("Requesting URLs from API HTTP-Error: " + response.status);
    }
  } else {
    return new Response('Method Not Allowed :(', {
      status: 405,
    })
  }
}

const OLD_URL = 'cloudflare.com'
const NEW_URL = 'mwong775.github.io'

class ElementAttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName;
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName);
    if(attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace(OLD_URL, NEW_URL),
      )
    }
    if (element.tagName === 'a')
      element.setInnerContent('Go to my website!');
    else if (element.tagName === 'p')
      element.setInnerContent('The button below has been updated to go to my personal webpage~');
  }
}

const rewriter = new HTMLRewriter()
  .on('a', new ElementAttributeRewriter('href'))
  .on('p', new ElementAttributeRewriter())

/* 
Deploy an application that will randomly send users to one of 
two webpages.

Requirements:

1. Request the URLs from the API
  - URL: https://cfw-takehome.developers.workers.dev/api/variant
  - parse the response as JSON
  - response = array of URLs, should be saved to a variable

2. Request a (random) variant
  - fetch request to one of two URLs, return as response from the script

3. Distributed requests between variants
  - /api/variants API route will return an array of two URLs
  - Requests should be evenly distributed between the two URLs
  - when client makes request to Workers script, should return each variant
    roughly 50% of the time.
*/