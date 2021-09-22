const constants = {
  initialTags: [
    { id: 'all-notes', name: 'All Notes' },
    { id: 'favorites', name: 'Favorites' },
  ],
  scratchpadRef: '__next-notes-SCRATCHPAD',
};

const functions = {
  debounce: (callback, delay = 500) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  },
};

module.exports.constants = constants;
module.exports.functions = functions;
