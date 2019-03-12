import { GapTreeNode } from "./gap-tree";

/** Returns true if n1 should come Prior to n2 */
type GapTreeNodeComparator = (n1: GapTreeNode, n2: GapTreeNode) => boolean;

/**
 * Didn't feel like making it a generic
 * https://stackoverflow.com/a/42919752/750567
 */
export class GTNPriorityQueue {
	private top = 0;
	private heap: GapTreeNode[];
	private comparator: GapTreeNodeComparator;

	constructor(comparator: GapTreeNodeComparator) {
		this.heap = [];
		this.comparator = comparator;
	}

	private parent(i: number): number {
		return ((i + 1) >>> 1) - 1;
	}

	private left(i: number): number {
		return (i << 1) + 1;
	}

	private right(i: number): number {
		return (i + 1) << 1;
	}

	/** Return true if i should come prior to j */
	private compare(i: number, j: number): boolean {
		return this.comparator(this.heap[i], this.heap[j]);
	}

	private swap(i: number, j: number): void {
		[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
	}

	private siftUp(): void {
		let node = this.size() - 1;
		while (node > this.top && this.compare(node, this.parent(node))) {
			this.swap(node, this.parent(node));
			node = this.parent(node);
		}
	}

	private siftDown(): void {
		let node = this.top;
		while ((this.left(node) < this.size() && this.compare(this.left(node), node)) || (this.right(node) < this.size() && this.compare(this.right(node), node))) {
			let maxChild = (this.right(node) < this.size() && this.compare(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
			this.swap(node, maxChild);
			node = maxChild;
		}
	}

	public size(): number {
		return this.heap.length;
	}

	public isEmpty(): boolean {
		return this.size() === 0;
	}

	public peek(): GapTreeNode {
		return this.heap[this.top];
	}

	public pushAll(values: GapTreeNode[]): number {
		values.forEach(value => {
			this.heap.push(value);
			this.siftUp();
		});
		return this.size();
	}

	public push(value: GapTreeNode): number {
		this.heap.push(value);
		this.siftUp();
		return this.size();
	}

	public pop(): GapTreeNode {
		const poppedValue = this.peek();
		const bottom = this.size() - 1;
		if (bottom > this.top) {
			this.swap(this.top, bottom);
		}
		this.heap.pop();
		this.siftDown();
		return poppedValue;
	}

	public replace(value: GapTreeNode): GapTreeNode {
		const replacedValue = this.peek();
		this.heap[this.top] = value;
		this.siftDown();
		return replacedValue;
	}
}
