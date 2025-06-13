export default {
  '*.{js,ts,tsx}': () => {
    // Only lint the staged files instead of the entire codebase
    return ['pnpm run lint:fix'];
  },
};