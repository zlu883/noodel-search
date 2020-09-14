import Noodel from 'noodel';
import Mark from 'mark.js';
import Noode from 'noodel/typings/main/Noode';

export default class NoodelSearch {

    private noodel: Noodel;
    private results: {noode: Noode, markInstance, marks: HTMLSpanElement[]}[] = [];
    private currentNoodeIndex: number = null;
    private currentMarkIndex: number = null;
    private currentGlobalMarkIndex: number = null;
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

    private traverseNoodel(parent: Noode, func: (noode: Noode) => any) {
        parent.getChildren().forEach(child => {
            func(child);
            this.traverseNoodel(child, func);
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
            let allNoodes: Noode[] = [];
            
            this.traverseNoodel(this.noodel.getRoot(), noode => allNoodes.push(noode));
            let noodeCount = allNoodes.length;

            if (allNoodes.length === 0) {
                if (typeof cb === 'function') cb();
                return;
            }

            allNoodes.forEach(noode => {
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
            });
        });
    }

    /**
     * Returns the current set of search results as an array of noodes with an array of marks in each.
     */
    getResults(): {noode: Noode, marks: HTMLSpanElement[]}[] {
        return this.results;
    }

    /**
     * Gets the DOM element of the current focal mark.
     */
    getFocalMark(): HTMLElement {
        if (this.currentGlobalMarkIndex === null) return null;
        return this.results[this.currentNoodeIndex].marks[this.currentMarkIndex];
    }

    /**
     * Gets the position of the focal mark. Returns an object containing the noode index,
     * local mark index within the noode and the global mark index.
     */
    getFocalMarkPosition(): { noodeIndex: number, markIndex: number, globalMarkIndex: number } {
        return {
            noodeIndex: this.currentNoodeIndex,
            markIndex: this.currentMarkIndex,
            globalMarkIndex: this.currentGlobalMarkIndex
        };
    }

    /**
     * Gets the global count of marks.
     */
    getMarkCount(): number {
        return this.markCount;
    }

    /**
     * Change focus to the next mark. If crosses a noode boundary, will trigger a jump to the new noode.
     */
    next() {
        if (this.results.length === 0) {
            return;
        }

        if (this.currentGlobalMarkIndex === null) {
            this.currentGlobalMarkIndex = 0;
            this.currentNoodeIndex = 0;
            this.currentMarkIndex = 0;
            this.results[0].noode.jumpToFocus();
            if (this.focalMarkClass) this.results[0].marks[0].classList.add(this.focalMarkClass);
        }
        else {
            let currentMarks = this.results[this.currentNoodeIndex].marks;

            currentMarks[this.currentMarkIndex].classList.remove(this.focalMarkClass);

            if (this.currentMarkIndex === currentMarks.length - 1) {
                if (this.currentNoodeIndex === this.results.length - 1) {
                    this.currentNoodeIndex = 0;
                    this.currentGlobalMarkIndex = 0;
                }
                else {
                    this.currentNoodeIndex++;
                    this.currentGlobalMarkIndex++;
                }

                this.currentMarkIndex = 0;

                this.results[this.currentNoodeIndex].noode.jumpToFocus();
                if (this.focalMarkClass) this.results[this.currentNoodeIndex].marks[this.currentMarkIndex].classList.add(this.focalMarkClass);
            }
            else {
                this.currentMarkIndex++;
                this.currentGlobalMarkIndex++;
                if (this.focalMarkClass) currentMarks[this.currentMarkIndex].classList.add(this.focalMarkClass);
            }
        }
    }

    /**
     * Change focus to the previous mark. If crosses a noode boundary, will trigger a jump to the new noode.
     */
    prev() {
        if (this.results.length === 0) {
            return;
        }

        if (this.currentGlobalMarkIndex === null) {
            this.currentGlobalMarkIndex = this.markCount - 1;
            this.currentNoodeIndex = this.results.length - 1;
            this.currentMarkIndex = this.results[this.currentNoodeIndex].marks.length - 1;
            this.results[this.currentNoodeIndex].noode.jumpToFocus();
            if (this.focalMarkClass) this.results[this.currentNoodeIndex].marks[this.currentMarkIndex].classList.add(this.focalMarkClass);
        }
        else {
            let currentMarks = this.results[this.currentNoodeIndex].marks;

            currentMarks[this.currentMarkIndex].classList.remove(this.focalMarkClass);

            if (this.currentMarkIndex === 0) {
                if (this.currentNoodeIndex === 0) {
                    this.currentNoodeIndex = this.results.length - 1;
                    this.currentGlobalMarkIndex = this.markCount - 1;
                }
                else {
                    this.currentNoodeIndex--;
                    this.currentGlobalMarkIndex--;
                }

                this.currentMarkIndex = this.results[this.currentNoodeIndex].marks.length - 1;

                this.results[this.currentNoodeIndex].noode.jumpToFocus();
                if (this.focalMarkClass) this.results[this.currentNoodeIndex].marks[this.currentMarkIndex].classList.add(this.focalMarkClass);
            }
            else {
                this.currentMarkIndex--;
                this.currentGlobalMarkIndex--;
                if (this.focalMarkClass) currentMarks[this.currentMarkIndex].classList.add(this.focalMarkClass);
            }
        }
    }

    /**
     * Clears the search and all existing marks. May be asynchronous.
     * @param cb callback after clear complete
     */
    clear(cb?: () => any) {
        this.currentMarkIndex = null;
        this.currentNoodeIndex = null;
        this.currentGlobalMarkIndex = null;
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