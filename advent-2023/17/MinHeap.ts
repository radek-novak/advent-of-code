import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// by ChatGPT
export class MinHeap<T extends { valueOf: () => number }> {
  private heap: T[];

  constructor(init: T[] = []) {
    this.heap = init;
    this.heapifyUp();
  }

  private getLeftChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 1;
  }

  private getRightChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 2;
  }

  private getParentIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2);
  }

  private hasLeftChild(index: number): boolean {
    return this.getLeftChildIndex(index) < this.heap.length;
  }

  private hasRightChild(index: number): boolean {
    return this.getRightChildIndex(index) < this.heap.length;
  }

  private hasParent(index: number): boolean {
    return this.getParentIndex(index) >= 0;
  }

  private leftChild(index: number): T {
    return this.heap[this.getLeftChildIndex(index)];
  }

  private rightChild(index: number): T {
    return this.heap[this.getRightChildIndex(index)];
  }

  private parent(index: number): T {
    return this.heap[this.getParentIndex(index)];
  }

  private swap(indexOne: number, indexTwo: number): void {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;

    // [this.heap[indexOne], this.heap[indexTwo]] = [
    //   this.heap[indexTwo],
    //   this.heap[indexOne],
    // ];
  }
  public getHeap() {
    return this.heap;
  }
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  public add(item: T): void {
    this.heap.push(item);
    this.heapifyUp();

    if (this.heap.length > 500000) {
      this.heap = this.heap.slice(0, 400000);
    }
  }

  public remove(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const item = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown();
    return item;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.parent(index).valueOf() > this.heap[index].valueOf()
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  private heapifyDown(): void {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.rightChild(index).valueOf() < this.leftChild(index).valueOf()
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }

      if (this.heap[index].valueOf() < this.heap[smallerChildIndex].valueOf()) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }

      index = smallerChildIndex;
    }
  }
}

// Example usage with a Path class
class Path {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  valueOf(): number {
    return this.value;
  }
}
// Assume MinHeap and Path classes are defined here or imported

Deno.test("MinHeap: Add and maintain heap property", () => {
  const minHeap = new MinHeap<Path>();
  minHeap.add(new Path(10));
  minHeap.add(new Path(5));
  minHeap.add(new Path(15));

  // The root of the heap should be the smallest element
  assertEquals(minHeap.remove()?.valueOf(), 5);
  assertEquals(minHeap.remove()?.valueOf(), 10);
  assertEquals(minHeap.remove()?.valueOf(), 15);
});

Deno.test("MinHeap: Remove from empty heap", () => {
  const minHeap = new MinHeap<Path>();
  // Removing from an empty heap should return undefined
  assertEquals(minHeap.remove(), undefined);
});

Deno.test("MinHeap: Add and remove single element", () => {
  const minHeap = new MinHeap<Path>();
  minHeap.add(new Path(7));
  // After adding a single element, removing should return that element
  assertEquals(minHeap.remove()?.valueOf(), 7);
  // After removal, the heap should be empty
  assertEquals(minHeap.remove(), undefined);
});

Deno.test("MinHeap: Maintain heap property with multiple elements", () => {
  const minHeap = new MinHeap<Path>([new Path(20)]);
  minHeap.add(new Path(10));
  minHeap.add(new Path(15));
  minHeap.add(new Path(5));
  minHeap.add(new Path(30));

  // Removing elements should follow the min-heap property
  assertEquals(minHeap.remove()?.valueOf(), 5);
  assertEquals(minHeap.remove()?.valueOf(), 10);
  assertEquals(minHeap.remove()?.valueOf(), 15);
  assertEquals(minHeap.remove()?.valueOf(), 20);
  assertEquals(minHeap.remove()?.valueOf(), 30);
});
