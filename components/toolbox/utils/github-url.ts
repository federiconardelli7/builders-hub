/**
 * Generates a GitHub edit URL for console tools using import.meta.url
 * Automatically extracts the file path from import.meta.url and converts it to a GitHub edit URL
 * @example
 * // In any console tool file:
 * const metadata: ConsoleToolMetadata = {
 *   ..., // other metadata
 *   githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
 * };
 */
export function generateConsoleToolGitHubUrl(importMetaUrl: string): string {
  try {
    const url = new URL(importMetaUrl);
    let filePath = url.pathname;
    
    if (process.platform === 'win32' && filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }
    
    const consoleIndex = filePath.indexOf('components/toolbox/console/');
    if (consoleIndex === -1) {
      return '';
    }
    
    const relativePath = filePath.substring(consoleIndex + 'components/toolbox/console/'.length);
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    
    // Generate the GitHub edit URL
    return `https://github.com/ava-labs/builders-hub/edit/master/components/toolbox/console/${cleanPath}`;
  } catch {
    return '';
  }
}
