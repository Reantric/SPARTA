import NodeManager from "../Structures/NodeManager.js";
import { Node } from "../Structures/Node.js";
import { getDrawingCanvas } from "../sketch.js";
import SetCoverer from "../SetCoverer/setCover.js";

declare namespace FlexSearch {
    class Index<T = any> {
        constructor(options?: any);
        add(id: string | number, item: T): void;
        search(query: string, limit?: number): Array<T>;
        remove(id: string | number): void;
        update(id: string | number, item: T): void;
        clear(): void;
    }
}

export class Menu {

    /**
     * Set Coverer stuff. 
     */
    private universeSize: number;
    private sets: number[][];
    private setWeights: number[];
    private nodeManager: NodeManager;
    private setNodes: Node[];
    private isHighlightedUnitary: boolean = false;
    private p: p5;
    private staticInfoText: string = '';
    private dynamicInfoText: string = '';


    /**
     * The zoom slider.
     */
    private zoomSlider: p5.Element;

    /** Search stuff */
    private searchIndex: FlexSearch.Index;
    private searchResults: Node[] = [];

    constructor(universeSize: number, sets: number[][], setWeights: number[], nodes: NodeManager, setNodes: Node[], p: p5 = getDrawingCanvas()) {
        this.universeSize = universeSize;
        this.sets = sets;
        this.setWeights = setWeights;
        this.nodeManager = nodes;
        this.setNodes = setNodes;
        this.p = p;

        // Initialize FlexSearch
        this.searchIndex = new FlexSearch.Index({ tokenize: "forward" });
        this.indexNodes();

        this.initMenu();
    }

    /**
     * Indexes the nodes' titles and information for fast searching.
     */
    private indexNodes() {
        this.nodeManager.nodes.forEach((node, index) => {
            this.searchIndex.add(index, `${node.title} ${node.information}`);
        });
    }

    /**
     * Initializes the menu.
     */
    private initMenu(){
        const menuElement = document.getElementById('menu');

        // Add Search Box
        this.addSearchBox(menuElement);

        // Add Add Node Button
        this.addButton("Add Node", () => {
            // Implement the action for adding a node
            console.log("Add Node button clicked");
        }, "add-node", menuElement);

        // Add Highlight Optimal Set Cover Button
        this.addButton("Highlight Optimal Set Cover", () => {
            this.highlightOptimalSetCover(this.getButton("highlight-button"));
        }, "highlight-button", menuElement);

        // Create zoom slider
        this.zoomSlider = this.p.select('#zoom-slider') as p5.Element;
        this.zoomSlider.value(this.p.camera2D.getScale().toString());
        (this.zoomSlider as any).input(() => {
            const zoomLevel = parseFloat(this.zoomSlider.value() as string);
            const centerX = this.p.width / 2;
            const centerY = this.p.height / 2;
            this.p.camera2D.zoom(zoomLevel / this.p.camera2D.getScale(), centerX, centerY);  // Adjust the camera zoom based on the slider
        });
    }

    /**
     * Adds a search box to the menu.
     * @param parentElement - The parent element to append the search box to.
     */
    private addSearchBox(parentElement: HTMLElement) {
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search nodes...';
        searchBox.id = 'node-search';
        searchBox.style.width = '100%';
        searchBox.style.padding = '10px';
        searchBox.style.marginBottom = '10px';
        searchBox.style.fontSize = '16px';
        searchBox.style.border = '1px solid #ccc';
        searchBox.style.borderRadius = '5px';

        const dropdown = document.createElement('ul');
        dropdown.id = 'search-results';
        dropdown.style.width = '100%';
        dropdown.style.listStyleType = 'none';
        dropdown.style.padding = '0';
        dropdown.style.margin = '5px 0 15px 0';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.borderRadius = '5px';
        dropdown.style.display = 'none';  // Initially hidden
        dropdown.style.backgroundColor = '#f9f9f9';  // Light background for better contrast

        // Add event listener for input
        searchBox.addEventListener('input', () => this.searchNodes(searchBox.value, dropdown));

        parentElement.appendChild(searchBox);
        parentElement.appendChild(dropdown);
    }

    /**
     * Searches nodes based on the query and updates search results.
     * @param query - The search query.
     */
    private searchNodes(query: string, dropdown: HTMLElement) {
        this.searchResults = this.searchIndex.search(query, 5).map(index => this.nodeManager.nodes[index]);
        dropdown.innerHTML = '';  // Clear previous results

        if (this.searchResults.length > 0) {
            dropdown.style.display = 'block';
            this.searchResults.forEach(node => {
                const listItem = document.createElement('li');
                listItem.textContent = node.title;
                listItem.style.color = '#c108ff';
                listItem.style.padding = '10px';
                listItem.style.cursor = 'pointer';
                listItem.style.backgroundColor = '#fff';
                listItem.style.borderBottom = '1px solid #ccc';

                listItem.addEventListener('mouseenter', () => {
                    listItem.style.backgroundColor = '#e6e6e6'; // Hover effect
                });
                listItem.addEventListener('mouseleave', () => {
                    listItem.style.backgroundColor = '#fff';
                });

                listItem.addEventListener('click', () => {
                    // node.select();
                    node.center();
            });
                dropdown.appendChild(listItem);
            });
        } else {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Updates the search index for a node after it has been edited.
     * @param node - The node that was edited.
     */
    public updateSearchIndex(node: Node) {
        const index = this.nodeManager.nodes.indexOf(node);
        this.searchIndex.update(index, `${node.title} ${node.information}`);
    }

    /**
     * Removes a node from the search index when it is deleted.
     * @param node - The node that was deleted.
     */
    public removeFromSearchIndex(node: Node) {
        const index = this.nodeManager.nodes.indexOf(node);
        this.searchIndex.remove(index);
    }

    /**
     * Adds a button to the menu.
     * @param label - The label for the button.
     * @param onClick - The function to execute when the button is clicked.
     * @param id - The optional id for the button.
     * @param parentElement - The parent element to append the button to.
     */
    private addButton(label: string, onClick: () => void, id: string, parentElement: HTMLElement) {
        const button = document.createElement('button');
        button.textContent = label;
        button.onclick = onClick;
        button.id = id;
        button.style.width = '100%';
        button.style.padding = '10px';
        button.style.marginBottom = '15px';  // Added margin to space buttons apart
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        parentElement.appendChild(button);
    }


    /**
     * Highlights the optimal set cover by selecting the appropriate nodes.
     * @param {number} universeSize - The size of the universe.
     * @param {number[][]} sets - The sets to be covered.
     * @param {number[]} setWeights - The weights of the sets.
     * @param {NodeManager} nodes - The node manager.
     * @param {Node[]} setNodes - The set nodes.
     */
    public highlightOptimalSetCover(highlightButton: p5.Element) {
        if (this.isHighlightedUnitary) {
            this.nodeManager.nodes.forEach(node => node.selected = 0);
            highlightButton.html('Highlight Optimal Set Cover');
            this.staticInfoText = '';
        } else {
            const setCoverer = new SetCoverer(this.universeSize, this.sets, this.setWeights);
            let result;

            if (setCoverer.getUniverseCoverable()) {
                result = setCoverer.findMinSetCover();
            } else {
                result = setCoverer.findMinSetCoverGreedy();
            }
            
            // Deselect all nodes first
            this.nodeManager.nodes.forEach(node => node.selected = 0);

            // Highlight the optimal set cover
            result.selectedSets.forEach(set => {
                const setIndex = this.sets.indexOf(set);
                if (setIndex !== -1) {
                    this.setNodes[setIndex].select();
                }
            });
            highlightButton.html('Unhighlight Optimal Set Cover');

            const minSetCount = result.selectedSets.length;
            const minWeight = result.minSetWeight;
            this.displayInfo(minSetCount, minWeight, setCoverer.getUniverseCoverable());
        }
        this.isHighlightedUnitary = !this.isHighlightedUnitary;
    }

    /**
     * Displays information about the minimum set cover.
     * @param {number} minSetCount - The minimum number of sets needed to cover the universe.
     * @param {number} minWeight - The minimum weight of the sets.
     * @param {boolean} isCoverable - Whether the universe can be fully covered.
     */
    private displayInfo(minSetCount, minWeight, isCoverable) {
        if (isCoverable) {
            this.staticInfoText = `Minimum number of SbD's needed to cover all CWE's: ${minSetCount}\nMinimum SbD utility: ${minWeight}`;
        } else {
            this.staticInfoText = `Universe cannot be fully covered. Minimum sets to cover as much as possible: ${minSetCount}\nTotal weight of selected sets: ${minWeight}`;
        }
    }

    /**
     * Calculates the count and utility of currently selected sets.
     */
    private calculateSelectedSetsInfo() {
        let selectedCount = 0;
        let totalUtility = 0;

        this.nodeManager.nodes.forEach(node => {
            if (node.isSelected() && this.setNodes.includes(node)) {
                selectedCount++;
                totalUtility += node.getSeverity();
            }
        });

        return { selectedCount, totalUtility };
    }

    /**
     * Updates the dynamic information display to include selected sets and their total utility.
     */
    private updateSelectedSetsInfo() {
        const { selectedCount, totalUtility } = this.calculateSelectedSetsInfo();
        this.dynamicInfoText = `Selected sets: ${selectedCount}\nTotal utility: ${totalUtility}`;
    }
    
    /**
     * 
     * @returns The combined text of the static and dynamic information.
     */
    public getCombinedText(){
        return `${this.dynamicInfoText}\n${this.staticInfoText}`;
    }



    /**
     * Updates the menu.
     */
    public update(){
        this.updateSelectedSetsInfo();
        this.zoomSlider.value(this.p.camera2D.getScale().toString());
    }

    /**
     * Retrieves a button by its ID as a p5.Element.
     * @param id - The ID of the button to retrieve.
     */
    private getButton(id: string): p5.Element {
        return this.p.select(`#${id}`);
    }
}
