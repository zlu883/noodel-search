# noodel-search
Simple text search plugin for Noodel.js

Because Noodel does not use native scrolling, basic Ctrl+F text search features in browsers will not be able to jump to specific occurrences of the search text. 

This plugin is a simple wrapper around the [mark.js](https://markjs.io/) library which performs DOM based text search and highlighting, integrated with the noodel context. You can use it to perform basic text search in a noodel that will trigger jumps to specific noodes as necessary.

## Installation

```
npm install noodel-search
```

or in browsers:
```
<script src="https://cdn.jsdelivr.net/npm/noodel-search/dist/noodel-search.umd.min.js"></script>
```

It needs to be used alongside Noodel's main library.

## Basic usage

```
const noodel = new Noodel(...);
const noodelSearch = new NoodelSearch(noodel);

// After noodel is mounted (i.e has elements on the page) ...

// callback after search is complete
const callback = function() {
    noodelSearch.next(); // jump to first occurrence of the text
};

// options that will be passed to mark.js, all options except callbacks can be used
const options = {
    separateWordSearch: false
}

noodelSearch.search("some string", options, callback);

```
## License

MIT license

© 2019-2020 Zuohao (Jonny) Lu
