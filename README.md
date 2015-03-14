# Lightbox
Lightbox is a tool that offers a nice and elegant way to add zooming functionality for images, html content and multi-media on your webpages. It is built on the top of the popular JavaScript framework jQuery and is both easy to implement and a snap to customize.

## Usage

+ Image
```html
<a href="large.jpg" data-toggle="lightbox"><img src="small.jpg" alt="pic"></a>
```

+ Image Gallery

**Option 1**

```html
<a href="large-1.jpg" data-toggle="lightbox" data-gallery="[data-toggle='lightbox']"><img src="small-1.jpg" alt="pic"></a>
<a href="large-2.jpg" data-toggle="lightbox" data-gallery="[data-toggle='lightbox']"><img src="small-2.jpg" alt="pic"></a>
<a href="large-3.jpg" data-toggle="lightbox" data-gallery="[data-toggle='lightbox']"><img src="small-3.jpg" alt="pic"></a>
```

**Option 2**

```html
<a href="large-1.jpg" data-toggle="lightbox" data-gallery=".example-gallery"><img src="small-1.jpg" alt="pic"></a>
<div class="example-gallery hidden">
	<a href="large-1.jpg"><img src="small-1.jpg" alt="pic"></a>
	<a href="large-2.jpg"><img src="small-2.jpg" alt="pic"></a>
	<a href="large-3.jpg"><img src="small-3.jpg" alt="pic"></a>
</div>
```

+ Inline

```html
<a href="#example" data-toggle="lightbox">View content</a>
<div id="example">
	<h2>Title</h2>
	<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam voluptate explicabo libero quos, ab. Incidunt esse corporis tenetur, placeat quibusdam veniam alias minima repellendus quidem officia blanditiis quaerat ipsam, vel!</p>
</div>
```

+ AJAX

```html
<a href="http://example.com" data-toggle="lightbox">Load content</a>
```

+ IFrame

```html
<a href="http://example.com" data-toggle="lightbox" data-type="iframe">Load content</a>
```

## JS

```javascript
$(function(){
	$('[data-toggle="lightbox"]').lightbox();
})
```

## Parameters
Parameters in the element (with 'data-' prefix) or js (```$('[data-toggle="lightbox"]').lightbox({param: value})```)

- gallery: Class or ID of the element with links to images
- type: auto (default) | inline | image | gallery | ajax | iframe
- class: class name (default: lightbox-main)
- title: false (default) | html
- content: false (default) | html
- footer: false (default) | html
- behavior: default | modal

## Requirements:
jQuery
