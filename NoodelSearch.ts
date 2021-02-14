import Noodel from 'noodel';
import Mark from 'mark.js';
import NoodelNode from 'noodel/typings/main/NoodelNode';

export default class NoodelSearch {

    private noodel: Noodel;
    private results: { node: NoodelNode, markInstance, marks: HTMLElement[] }[] = [];
    private nodeIndex: number = null;
    private markIndex: number = null;
    private globalMarkIndex: number = null;
    private markCount = 0;
    private focalMarkClass: string = null;

    /**
     * Creates a search instance based on the given noodel.
     * @param noodel the noodel search context
     * @param focalMarkClass CSS class to apply to the focal mark
     */
    constructor(noodel: Noodel, focalMarkClass?: string) {
        this.noodel = noodel;
        if (focalMarkClass) this.focalMarkClass = focalMarkClass;
    }

    private jumpToFocalMark() {
        let current = this.results[this.nodeIndex];
        let currentMark = current.marks[this.markIndex];

        current.node.jumpToFocus();
        if (this.focalMarkClass) currentMark.classList.add(this.focalMarkClass);
    }

    /**
     * Performs a search on the DOM content of every node and highlights the results
     * (creates a mark for each occurrence of the search string). 
     * The search may be asynchronous so result queries should be placed in the callback.
     * @param searchString string to search for
     * @param options options passed to mark.js for the search
     * @param cb callback after the search is complete
     */
    search(searchString: string, options?: object, cb?: () => any) {
        this.clear(() => {
            let nodeCount = this.noodel.getNodeCount();

            if (nodeCount === 0) {
                if (typeof cb === 'function') cb();
                return;
            }

            this.noodel.getRoot().traverseSubtree(node => {
                const el = node.getEl();

                if (!el) {
                    nodeCount--;

                    if (nodeCount === 0) {
                        if (typeof cb === 'function') cb();
                    }

                    return;
                }

                const markInstance = new Mark(el);
                const marks = [];

                markInstance.mark(searchString, {
                    ...options,
                    each: (el) => {
                        marks.push(el);
                    },
                    done: () => {
                        if (marks.length > 0) {
                            this.results.push({
                                node,
                                marks,
                                markInstance
                            });
                            this.markCount += marks.length;
                        }

                        nodeCount--;

                        if (nodeCount === 0) {
                            if (typeof cb === 'function') cb();
                        }
                    }
                });
            }, false);
        });
    }

    /**
     * Returns the current set of search results as an array of nodes with an array of marks in each.
     */
    getResults(): { node: NoodelNode, marks: HTMLElement[] }[] {
        return this.results;
    }

    /**
     * Gets the DOM element of the current focal mark.
     */
    getFocalMark(): HTMLElement {
        if (this.globalMarkIndex === null) return null;
        return this.results[this.nodeIndex].marks[this.markIndex];
    }

    /**
     * Gets the position of the focal mark. Returns an object containing the node index,
     * local mark index within the node and the global mark index.
     */
    getFocalMarkPosition(): { nodeIndex: number, markIndex: number, globalMarkIndex: number } {
        return {
            nodeIndex: this.nodeIndex,
            markIndex: this.markIndex,
            globalMarkIndex: this.globalMarkIndex
        };
    }

    /**
     * Gets the global count of marks.
     */
    getMarkCount(): number {
        return this.markCount;
    }

    /**
     * Change focus to the next mark. Will jump to the node containing the mark if it's not already in focus.
     */
    next() {
        if (this.results.length === 0) {
            return;
        }

        if (this.globalMarkIndex === null) {
            this.globalMarkIndex = 0;
            this.nodeIndex = 0;
            this.markIndex = 0;
        }
        else {
            let currentMarks = this.results[this.nodeIndex].marks;

            currentMarks[this.markIndex].classList.remove(this.focalMarkClass);

            if (this.markIndex === currentMarks.length - 1) {
                if (this.nodeIndex === this.results.length - 1) {
                    this.nodeIndex = 0;
                    this.globalMarkIndex = 0;
                }
                else {
                    this.nodeIndex++;
                    this.globalMarkIndex++;
                }

                this.markIndex = 0;
            }
            else {
                this.markIndex++;
                this.globalMarkIndex++;
            }
        }

        this.jumpToFocalMark();
    }

    /**
     * Change focus to the previous mark. Will jump to the node containing the mark if it's not already in focus.
     */
    prev() {
        if (this.results.length === 0) {
            return;
        }

        if (this.globalMarkIndex === null) {
            this.globalMarkIndex = this.markCount - 1;
            this.nodeIndex = this.results.length - 1;
            this.markIndex = this.results[this.nodeIndex].marks.length - 1;
        }
        else {
            let currentMarks = this.results[this.nodeIndex].marks;

            currentMarks[this.markIndex].classList.remove(this.focalMarkClass);

            if (this.markIndex === 0) {
                if (this.nodeIndex === 0) {
                    this.nodeIndex = this.results.length - 1;
                    this.globalMarkIndex = this.markCount - 1;
                }
                else {
                    this.nodeIndex--;
                    this.globalMarkIndex--;
                }

                this.markIndex = this.results[this.nodeIndex].marks.length - 1;
            }
            else {
                this.markIndex--;
                this.globalMarkIndex--;
            }
        }

        this.jumpToFocalMark();
    }

    /**
     * Clears the search and all existing marks. May be asynchronous.
     * @param cb callback after clear complete
     */
    clear(cb?: () => any) {
        this.markIndex = null;
        this.nodeIndex = null;
        this.globalMarkIndex = null;
        this.markCount = 0;

        if (this.results.length === 0) {
            if (typeof cb === 'function') cb();
            return;
        }

        let resCounter = this.results.length;

        this.results.forEach(result => {
            result.markInstance.unmark({
                done: () => {
                    resCounter--;

                    if (resCounter === 0) {
                        this.results = [];
                        if (typeof cb === 'function') cb();
                    }
                }
            });
        });
    }
}