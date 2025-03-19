# optimisedPancakeSorter

Fliplets [main] >> cp -r dist/* ../OptimisedPancakeSorter/dist/
Fliplets [main] >> cd -
/Users/piyushshukla/projects
projects >> cd OptimisedPancakeSorter
OptimisedPancakeSorter [main] >> npx cap sync android
✔ Copying web assets from public to android/app/src/main/assets/public in 34.12ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.69ms
✔ copy android in 85.90ms
✔ Updating Android plugins in 9.55ms
✔ update android in 31.73ms
[info] Sync finished in 0.12s
OptimisedPancakeSorter [main] >> cd ../Fliplets/
Fliplets [main] >> npm run build

> rest-express@1.0.0 build
> vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

vite v5.4.10 building for production...
✓ 2051 modules transformed.
../dist/public/index.html                   1.59 kB │ gzip:   0.60 kB
../dist/public/assets/index-C5Hy6vwb.css   59.40 kB │ gzip:  10.42 kB
../dist/public/assets/index-BeCI2TnH.js   960.75 kB │ gzip: 279.84 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.63s

  dist/index.js  5.9kb

⚡ Done in 5ms
Fliplets [main] >> cd -
/Users/piyushshukla/projects/OptimisedPancakeSorter
OptimisedPancakeSorter [main] >> cd -
/Users/piyushshukla/projects/Fliplets
Fliplets [main] >> cp -r dist/* ../OptimisedPancakeSorter/dist/
Fliplets [main] >> cd -
/Users/piyushshukla/projects/OptimisedPancakeSorter
OptimisedPancakeSorter [main] >> npx cap sync android
✔ Copying web assets from public to android/app/src/main/assets/public in 64.23ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.86ms
✔ copy android in 135.48ms
✔ Updating Android plugins in 10.64ms
✔ update android in 34.25ms
[info] Sync finished in 0.172s
OptimisedPancakeSorter [main] >> npm run build
