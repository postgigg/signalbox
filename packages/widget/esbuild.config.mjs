import { build } from 'esbuild';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: !isWatch,
  format: 'iife',
  globalName: 'HawkLeads',
  outfile: 'dist/sb.js',
  target: ['chrome90', 'safari15', 'firefox90', 'edge90'],
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
  },
};

if (isWatch) {
  const ctx = await (await import('esbuild')).context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build(buildOptions);
  console.log('Widget built successfully');
}
