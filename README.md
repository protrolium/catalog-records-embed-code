# Catalog Records Embed Code
A bespoke audio embed code that mimics the first generation Zora embed codes that fell into deprecation.

## Usage

Use `get-filtered-array.mjs` to filter the catalog records by the desired criteria. The script will output a JSON file with the filtered records.

```$ node get-filtered-array.mjs```

## Deployment

Place array.json (the filtered array) in the same directory as the dist folder on your server.
The iframe embed code allows for token_id to be passed as a url query parameter.

```
<iframe src="/catalog-widget/widget-test.html?token_id=402" scrolling="no" frameborder="0" loading="lazy" style="width:100%; height:380px;"></iframe>
</div>
```