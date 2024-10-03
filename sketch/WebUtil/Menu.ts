import NodeManager from "../Structures/NodeManager.js";
import { Node, Severity } from "../Structures/Node.js";
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
 //   private universeSize: number;
 //   private sets: number[][];
  //  private setWeights: number[];
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
    //    this.universeSize = universeSize;
     //   this.sets = sets;
     //   this.setWeights = setWeights;
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
     * Adds a node to the canvas.
     */
    public addNode() {
        // Create a modal form for node input
        const modal = document.createElement('div');
        modal.id = 'add-node-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        const form = document.createElement('div');
        form.style.backgroundColor = '#fff';
        form.style.padding = '20px';
        form.style.borderRadius = '5px';
        form.style.width = '400px';
        form.style.boxSizing = 'border-box';

        // Form Title
        const formTitle = document.createElement('h2');
        formTitle.textContent = 'Add New Node';
        formTitle.style.marginTop = '0';
        form.appendChild(formTitle);

        // Node Type Selection
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Node Type:';
        typeLabel.style.display = 'block';
        typeLabel.style.marginBottom = '5px';
        form.appendChild(typeLabel);

        const typeSelect = document.createElement('select');
        typeSelect.style.width = '100%';
        typeSelect.style.padding = '8px';
        typeSelect.style.marginBottom = '15px';
        typeSelect.style.fontSize = '16px';
        typeSelect.style.border = '1px solid #ccc';
        typeSelect.style.borderRadius = '5px';

        const optionCWE = document.createElement('option');
        optionCWE.value = 'CWE';
        optionCWE.textContent = 'CWE';
        typeSelect.appendChild(optionCWE);

        const optionSbD = document.createElement('option');
        optionSbD.value = 'SbD';
        optionSbD.textContent = 'SbD';
        typeSelect.appendChild(optionSbD);

        form.appendChild(typeSelect);

        // Title Input
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Title:';
        titleLabel.style.display = 'block';
        titleLabel.style.marginBottom = '5px';
        form.appendChild(titleLabel);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.style.width = '100%';
        titleInput.style.padding = '8px';
        titleInput.style.marginBottom = '15px';
        titleInput.style.fontSize = '16px';
        titleInput.style.border = '1px solid #ccc';
        titleInput.style.borderRadius = '5px';
        form.appendChild(titleInput);

        // Information Input
        const infoLabel = document.createElement('label');
        infoLabel.textContent = 'Information:';
        infoLabel.style.display = 'block';
        infoLabel.style.marginBottom = '5px';
        form.appendChild(infoLabel);

        const infoInput = document.createElement('textarea');
        infoInput.style.width = '100%';
        infoInput.style.padding = '8px';
        infoInput.style.marginBottom = '15px';
        infoInput.style.fontSize = '16px';
        infoInput.style.border = '1px solid #ccc';
        infoInput.style.borderRadius = '5px';
        infoInput.rows = 4;
        form.appendChild(infoInput);

        // Severity Input (Optional, only for SbD)
        const severityLabel = document.createElement('label');
        severityLabel.textContent = 'Severity (Optional, for SbD):';
        severityLabel.style.display = 'block';
        severityLabel.style.marginBottom = '5px';
        severityLabel.style.display = 'none'; // Hidden by default
        form.appendChild(severityLabel);

        const severitySelect = document.createElement('select');
        severitySelect.style.width = '100%';
        severitySelect.style.padding = '8px';
        severitySelect.style.marginBottom = '15px';
        severitySelect.style.fontSize = '16px';
        severitySelect.style.border = '1px solid #ccc';
        severitySelect.style.borderRadius = '5px';
        severitySelect.style.display = 'none'; // Hidden by default

        const severities = [
            { value: Severity.NONE, label: 'None' },
            { value: Severity.LOW, label: 'Low' },
            { value: Severity.MEDIUM, label: 'Medium' },
            { value: Severity.HIGH, label: 'High' },
            { value: Severity.CRITICAL, label: 'Critical' }
        ];

        severities.forEach(sev => {
            const option = document.createElement('option');
            option.value = sev.value.toString();
            option.textContent = sev.label;
            severitySelect.appendChild(option);
        });

        form.appendChild(severitySelect);

        // Show/Hide Severity based on Node Type
        typeSelect.addEventListener('change', () => {
            if (typeSelect.value === 'SbD') {
                severityLabel.style.display = 'block';
                severitySelect.style.display = 'block';
            } else {
                severityLabel.style.display = 'none';
                severitySelect.style.display = 'none';
            }
        });

        // Submit Button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Add Node';
        submitButton.style.width = '100%';
        submitButton.style.padding = '10px';
        submitButton.style.marginBottom = '10px';
        submitButton.style.fontSize = '16px';
        submitButton.style.backgroundColor = '#28a745';
        submitButton.style.color = '#fff';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        form.appendChild(submitButton);

        // Cancel Button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.width = '100%';
        cancelButton.style.padding = '10px';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.backgroundColor = '#dc3545';
        cancelButton.style.color = '#fff';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.cursor = 'pointer';
        form.appendChild(cancelButton);

        // Append form to modal
        modal.appendChild(form);

        // Append modal to body
        document.body.appendChild(modal);

        // Handle form submission
        submitButton.addEventListener('click', () => {
            const nodeType = typeSelect.value;
            const title = titleInput.value.trim();
            const information = infoInput.value.trim();
            const severityValue = parseInt(severitySelect.value);

            if (!title) {
                alert('Title is required.');
                return;
            }

            // Create the new node
            const p = getDrawingCanvas();
            const position = p.createVector(p.width / 2, p.height / 2); // Center of the canvas
            const newNode = new Node(title, information, position, p);

            if (nodeType === 'SbD') {
                newNode.setSbDStatus();
                newNode.setSeverity(severityValue || Severity.LOW); // Default to LOW if not specified
                this.setNodes.push(newNode); // Add to setNodes for set cover calculations
            }

            // Add the node to the NodeManager
            this.nodeManager.addNode(newNode);

            // Index the new node for search
            this.searchIndex.add(this.nodeManager.nodes.indexOf(newNode), `${newNode.title} ${newNode.information}`);

            // Remove the modal
            document.body.removeChild(modal);
        });

        // Handle cancel action
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
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
            this.addNode();
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
            // Deselect all nodes and reset the button text
            this.nodeManager.nodes.forEach(node => node.selected = 0);
            this.nodeManager.selectedNodes.clear();
            highlightButton.html('Highlight Optimal Set Cover');
            this.staticInfoText = '';
        } else {
            // Get the selected CWEs (or all CWEs if none are selected)
            let CWEs = this.nodeManager.getCWESelection();
            
            // Calculate the universe (CWE identifiers) dynamically
            const universe = CWEs.map(node => node.title);
    
            // Calculate universeSize (distinct CWEs)
            const universeSize = universe.length;
    
            // Create a map from CWE title to its index in the universe
            const CWEToIndex = Object.fromEntries(universe.map((cwe, index) => [cwe, index]));
    
            // Filter out setNodes that are deleted from `this.setNodes`
            this.setNodes = this.setNodes.filter(setNode => !setNode.deleted());
            
            // Calculate sets (CWEs mitigated by each SbD), only include non-deleted and non-hidden SbDs
            const sets = this.setNodes
                .filter(setNode => !setNode.deleted() && !setNode.isHidden())
                .map(setNode => {
                    return setNode.children
                        .map(childNode => CWEToIndex[childNode.title])
                        .filter(index => index !== undefined); // Filter out any undefined values
                });
    
            // Calculate setWeights (severity for each SbD node)
            const setWeights = this.setNodes
                .filter(setNode => !setNode.deleted() && !setNode.isHidden())
                .map(setNode => setNode.getSeverity());
    
            // Initialize SetCoverer with the dynamically calculated sets and universe size
            const setCoverer = new SetCoverer(universeSize, sets, setWeights);
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
                const setIndex = sets.findIndex(s => JSON.stringify(s) === JSON.stringify(set));
                if (setIndex !== -1) {
                    const nonHiddenSetNodes = this.setNodes.filter(setNode => !setNode.deleted() && !setNode.isHidden());
                    nonHiddenSetNodes[setIndex].select();
                }
            });
    
            // Now look at the complement of selected CWEs
            const coveredCWEIndices = new Set<number>();
            result.selectedSets.forEach(set => {
                set.forEach(cweIndex => coveredCWEIndices.add(cweIndex));
            });
    
            // Compute complement of covered CWEs with respect to the universe
            const complementCWEIndices = [];
            for (let i = 0; i < universeSize; i++) {
                if (!coveredCWEIndices.has(i)) {
                    complementCWEIndices.push(i);
                }
            }
    
            if (complementCWEIndices.length > 0) {
                // There are CWEs not covered by the first set cover
                // Proceed to run second set cover with hidden SbDs
    
                // Get the hidden SbD nodes
                const hiddenSetNodes = this.setNodes.filter(setNode => !setNode.deleted() && setNode.isHidden());
    
                const complementCWEIndexSet = new Set(complementCWEIndices);
    
                // Create mapping from old CWE indices to new indices
                const oldIndexToNewIndex = {};
                complementCWEIndices.forEach((oldIndex, newIndex) => {
                    oldIndexToNewIndex[oldIndex] = newIndex;
                });
    
                const complementUniverseSize = complementCWEIndices.length;
    
                // Create adjustedHiddenSets
                const hiddenSets = hiddenSetNodes.map(setNode => {
                    return setNode.children
                        .map(childNode => CWEToIndex[childNode.title])
                        .filter(index => index !== undefined && complementCWEIndexSet.has(index));
                });
    
                // Adjust indices in hiddenSets to new indices
                const adjustedHiddenSets = hiddenSets.map(set => {
                    return set.map(oldIndex => oldIndexToNewIndex[oldIndex]);
                });
    
                // Calculate setWeights for hidden nodes
                const hiddenSetWeights = hiddenSetNodes.map(setNode => setNode.getSeverity());
    
                // Initialize SetCoverer for complement universe
                const complementSetCoverer = new SetCoverer(complementUniverseSize, adjustedHiddenSets, hiddenSetWeights);
    
                let complementResult;
                if (complementSetCoverer.getUniverseCoverable()) {
                    complementResult = complementSetCoverer.findMinSetCover();
                } else {
                    complementResult = complementSetCoverer.findMinSetCoverGreedy();
                }
    
                // Highlight the selected hidden set nodes
                const setToIndexMap = new Map();
                adjustedHiddenSets.forEach((set, index) => {
                    setToIndexMap.set(JSON.stringify(set), index);
                });
    
                complementResult.selectedSets.forEach(set => {
                    const setIndex = setToIndexMap.get(JSON.stringify(set));
                    if (setIndex !== undefined) {
                        hiddenSetNodes[setIndex].select();
                    }
                });
    
                // Optionally, display the results for the second set cover
                const complementMinSetCount = complementResult.selectedSets.length;
                const complementMinWeight = complementResult.minSetWeight;
            }
    
            // Update button text and display the results
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
