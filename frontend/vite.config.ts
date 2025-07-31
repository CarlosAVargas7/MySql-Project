// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/DumpStack.log.tmp'] // ignora el archivo sin importar dónde esté
    }
  }
});
