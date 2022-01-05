# Translate Post

🚧Work In  Progress🚧

Translate WordPress Post using The WP REST API and AWS Translate

This is a Node script that will query the WordPress REST API based on the ID and parse each string found in the post contents. Each string is translated using AWS Translate, and the original string is replaced with the translation.

This is a [Shifter Headless](https://www.getshifter.io) experiment.

## Todo

1. Avoid duplicate translation requests by checking for existing translation strings
2. Post translated content back into WordPress