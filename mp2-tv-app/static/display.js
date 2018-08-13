var queue = [];
var rhandlers = {
  getQueue() {
    return queue;
  },
  setQueue(newQueue) {
    queue = newQueue;
  }
}
