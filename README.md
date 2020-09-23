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

## API

`constructor(noodel: Noodel, focalMarkClass?: string)`

Creates a search instance based on the given noodel.

- `noodel` the noodel search context
- `focalMarkClass` CSS class to apply to the focal mark

`search(searchString: string, options?: object, cb?: () => any)`

Performs a search on the DOM content of every noode and highlights the results
(creates a mark for each occurrence of the search string). 
The search may be asynchronous so result queries should be placed in the callback.

- `searchString` string to search for
- `options` options passed to mark.js for the search
- `cb` callback after the search is complete

`getResults(): { noode: Noode, marks: HTMLElement[] }[]`

Returns the current set of search results as an array of noodes with an array of marks in each.

`getFocalMark(): HTMLElement`

Gets the DOM element of the current focal mark.

`getFocalMarkPosition(): { noodeIndex: number, markIndex: number, globalMarkIndex: number }`

Gets the position of the focal mark. Returns an object containing the noode index,
local mark index within the noode and the global mark index.

`getMarkCount(): number`

Gets the global count of marks.

`next()`

Change focus to the next mark. Will jump to the noode containing the mark if it's not already in focus.

`prev()`

Change focus to the previous mark. Will jump to the noode containing the mark if it's not already in focus.

`clear(cb?: () => any)`

Clears the search and all existing marks. May be asynchronous.

- `cb` callback after clear complete

## License

MIT license

© 2020 Zuohao (Jonny) Lu
