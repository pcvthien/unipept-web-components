import PeptideInfo from './PeptideInfo';

export class Node {
    public id: number;
    public name: string;
    public rank: string;

    public children: Node[];
    public values: Array<{sequence: string, count: number, lca: number}>;
    public data: {count: number, self_count: number};

    /**
     * Creates a node based on a mandatory id. Name and rank are optional.
     *
     * @param id The taxon id of the node
     * @param name The name of the organism
     * @param rank The taxonomic rank of the organism
     */
    constructor(id: number, name: string = '', rank: string = 'no rank') {
        this.id = id;
        this.name = name;
        this.rank = rank;
        this.children = [];
        this.values = [];
        this.data = {count: undefined, self_count: 0};
    }

    /**
     * Searches for a node with the given taxon id in its children. Returns null
     * if it is not found.
     *
     * @param taxId The taxon id to search for
     * @return A matching Node object or null
     */
    public getChild(taxId: number): Node {
        for (const child of this.children) {
            if (child.id === taxId) {
                return child;
            }
        }
        return null;
    }

    /**
     * Returns the number of children for this node.
     *
     * @return The number of children
     */
    public getChildCount(): number {
        return this.children.length;
    }

    /**
     * !! Please use the addChild function of the parent tree instead !!
     * Adds a child to this node.
     *
     * @param node The child to add
     */
    public addChild(node: Node) {
        this.children.push(node);
    }

    /**
     * Adds a peptide value to this node and updates its self_count
     *
     * @param peptide The peptide value to add
     */
    public addValue(peptide: PeptideInfo) {
        this.values.push({
            sequence: peptide.sequence,
            count: peptide.count,
            lca: peptide.lca,
        });
        this.data.self_count += peptide.count;
    }

    /**
     * Returns the number of peptides associated with this node and all of its
     * children
     *
     * @return The number of peptides
     */
    public getCounts(): number {
        if (this.data.count === undefined) {
            this.data.count = this.data.self_count;
            if (this.getChildCount() !== 0) {
                this.data.count += this.children.reduce((sum, c) => sum + c.getCounts(), 0);
            }
        }
        return this.data.count;
    }

    /**
     * Recursively calls a function on this object and its children
     *
     * @param f The function to call
     */
    public callRecursively(f: (Node) => any) {
        f.call(this);
        if (this.children) {
            this.children.forEach((c) => {
                c.callRecursively(f);
            });
        }
    }

    /**
     * Recursively calls a function on this object and its children + data of child
     *
     * @param f The function to call
     * @return cs
     */
    public callRecursivelyPostOder(f: (a: Node, b: any) => any): any {
        let childResults = [];
        if (this.children) {
            childResults = this.children.map((c) =>
                c.callRecursivelyPostOder(f));
        }
        return f(this, childResults);
    }
}
