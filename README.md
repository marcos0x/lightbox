# Lightbox
Lightbox is a tool that offers a nice and elegant way to add zooming functionality for images, html content and multi-media on your webpages. It is built on the top of the popular JavaScript framework jQuery and is both easy to implement and a snap to customize.

## Usage

### HTML
```html
<a href="full.jpg" data-toggle="lightbox"><img src="small.jpg" alt="pic"></a>
```

### JS
```javascript
$(function(){
	$('[data-toggle="lightbox"]').lightbox();
})
```

## Parameters
Paramentes in the element (with 'data-' prefix) or js (```$('[data-toggle="lightbox"]').lightbox({param: value})```)

- gallery: class or id element of gallery links
- type: auto (default) | inline | image | gallery | ajax | iframe
- class: lightbox-main (default)
- title: false (default) | html
- content: false (default) | html
- footer: false (default) | html
- behavior: default | modal

## Requirements:
jQuery
