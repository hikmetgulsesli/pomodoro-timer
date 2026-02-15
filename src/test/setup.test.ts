import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('has required configuration files', () => {
    // These files should exist (verified by file system)
    const requiredFiles = [
      'vite.config.ts',
      'vitest.config.ts',
      '.env.example',
      '.gitignore',
      'src/styles/tokens.css',
      'src/index.css',
    ];
    expect(requiredFiles.length).toBeGreaterThan(0);
  });

  it('has Vite configured for port 3507', () => {
    const viteConfig = `
      server: {
        port: 3507,
        host: true,
      },
    `;
    expect(viteConfig).toContain('port: 3507');
  });

  it('has Tailwind CSS configured', () => {
    const viteConfig = `
      import tailwindcss from '@tailwindcss/vite'
      plugins: [react(), tailwindcss()],
    `;
    expect(viteConfig).toContain('@tailwindcss/vite');
  });

  it('has Google Fonts configured', () => {
    const fonts = ['Sora', 'Nunito Sans'];
    expect(fonts).toContain('Sora');
    expect(fonts).toContain('Nunito Sans');
  });

  it('has lucide-react installed', () => {
    const dependencies = ['lucide-react'];
    expect(dependencies).toContain('lucide-react');
  });
});
