var queue = [];
var handlers = {
  getQueue() {
    return queue;
  },
  setQueue(newQueue) {
    queue = newQueue;
  }
}
