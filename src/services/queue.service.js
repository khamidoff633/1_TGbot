class SimpleQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minInterval = 1000; // 1 sekund orasida so'rovlar
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }

      const { task, resolve, reject } = this.queue.shift();
      
      try {
        this.lastRequestTime = Date.now();
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Har so'rovdan keyin 2 sekund kutish
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.processing = false;
  }
}

const aiQueue = new SimpleQueue();

module.exports = {
  aiQueue,
  SimpleQueue
};
