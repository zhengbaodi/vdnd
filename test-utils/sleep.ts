const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, ms);
  });
};

export default sleep;
