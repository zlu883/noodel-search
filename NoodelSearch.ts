import Noodel from 'noodel';
import Mark from 'mark.js';
import Noode from 'noodel/typings/main/Noode';

export default class NoodelSearch {

    private noodel: Noodel;
    private results: { noode: Noode, markInstance, marks: HTMLElement[] }[] = [];
    private noodeIndex: number = null;
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
        let current = this.results[this.noodeIndex];
        let currentMark = current.marks[this.markIndex];

        current.noode.jumpToFocus();
        if (this.focalMarkClass) currentMark.classList.add(this.focalMarkClass);

        this.noodel.nextTick(() => {
            currentMark.scrollIntoView({block: "center"});
        });
    }

    /**
     * Performs a search on the DOM content of every noode and highlights the results
     * (creates a mark for each occurrence of the search string). 
     * The search may be asynchronous so result queries should be placed in the callback.
     * @param searchString string to search for
     * @param options options passed to mark.js for the search
     * @param cb callback after the search is complete
     */
    search(searchString: string, options?: object, cb?: () => any) {
        this.clear(() => {
            let noodeCount = this.noodel.getNoodeCount();

            if (noodeCount === 0) {
                if (typeof cb === 'function') cb();
                return;
            }

            this.noodel.getRoot().traverseSubtree(noode => {
                const el = noode.getEl();

                if (!el) {
                    noodeCount--;

                    if (noodeCount === 0) {
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
                                noode,
                                marks,
                                markInstance
                            });
                            this.markCount += marks.length;
                        }

                        noodeCount--;

                        if (noodeCount === 0) {
                            if (typeof cb === 'function') cb();
                        }
                    }
                });
            }, false);
        });
    }

    /**
     * Returns the current set of search results as an array of noodes with an array of marks in each.
     */
    getResults(): { noode: Noode, marks: HTMLElement[] }[] {
        return this.results;
    }

    /**
     * Gets the DOM element of the current focal mark.
     */
    getFocalMark(): HTMLElement {
        if (this.globalMarkIndex === null) return null;
        return this.results[this.noodeIndex].marks[this.markIndex];
    }

    /**
     * Gets the position of the focal mark. Returns an object containing the noode index,
     * local mark index within the noode and the global mark index.
     */
    getFocalMarkPosition(): { noodeIndex: number, markIndex: number, globalMarkIndex: number } {
        return {
            noodeIndex: this.noodeIndex,
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
     * Change focus to the next mark. Will jump to the noode containing the mark if it's not already in focus.
     */
    next() {
        if (this.results.length === 0) {
            return;
        }

        if (this.globalMarkIndex === null) {
            this.globalMarkIndex = 0;
            this.noodeIndex = 0;
            this.markIndex = 0;
        }
        else {
            let currentMarks = this.results[this.noodeIndex].marks;

            currentMarks[this.markIndex].classList.remove(this.focalMarkClass);

            if (this.markIndex === currentMarks.length - 1) {
                if (this.noodeIndex === this.results.length - 1) {
                    this.noodeIndex = 0;
                    this.globalMarkIndex = 0;
                }
                else {
                    this.noodeIndex++;
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
     * Change focus to the previous mark. Will jump to the noode containing the mark if it's not already in focus.
     */
    prev() {
        if (this.results.length === 0) {
            return;
        }

        if (this.globalMarkIndex === null) {
            this.globalMarkIndex = this.markCount - 1;
            this.noodeIndex = this.results.length - 1;
            this.markIndex = this.results[this.noodeIndex].marks.length - 1;
        }
        else {
            let currentMarks = this.results[this.noodeIndex].marks;

            currentMarks[this.markIndex].classList.remove(this.focalMarkClass);

            if (this.markIndex === 0) {
                if (this.noodeIndex === 0) {
                    this.noodeIndex = this.results.length - 1;
                    this.globalMarkIndex = this.markCount - 1;
                }
                else {
                    this.noodeIndex--;
                    this.globalMarkIndex--;
                }

                this.markIndex = this.results[this.noodeIndex].marks.length - 1;
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
        this.noodeIndex = null;
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