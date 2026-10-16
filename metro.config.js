const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1. Daftarkan .wasm sebagai asset agar di-bundle oleh Metro
config.resolver.assetExts.push('wasm');

// 2. Pastikan WASM tidak di-transform (biarkan asli)
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// 3. Fix untuk expo-sqlite web worker: 
// Masalah: Expo's dependency collector hanya match `new Worker(new URL(..., import.meta.url))`
// Tapi expo-sqlite pakai `new Worker(new URL('./worker', window.location.href))`
// Workaround: enable requireContext
config.transformer.unstable_allowRequireContext = true;

// 4. Tambahkan worker entry point eksplisit untuk expo-sqlite web
// Gunakan path absolut karena package tidak export subpath ini
const expoSqliteWorkerPath = path.join(
  __dirname,
  'node_modules/expo-sqlite/web/worker.ts'
);

const originalSerializer = config.serializer;
config.serializer = {
  ...originalSerializer,
  // Daftarkan worker entrypoint agar Metro buat chunk terpisah
  unstable_workerEntrypoints: [expoSqliteWorkerPath],
};

module.exports = config;