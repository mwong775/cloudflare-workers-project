# Cloudflare Workers Project
Deployed application using the Cloudflare Workers

An application that will randomly send users to one of 
two webpages.

### Requirements:

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
