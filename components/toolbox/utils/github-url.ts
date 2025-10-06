/**
 * Generates a GitHub edit URL for a toolbox component
 * @param componentPath - The relative path to the component from the components/toolbox directory
 * @returns The full GitHub edit URL
 */
export function generateToolGitHubUrl(componentPath: string): string {
  // Remove leading slash if present
  const cleanPath = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath;
  
  return `https://github.com/ava-labs/builders-hub/edit/master/components/toolbox/${cleanPath}`;
}

/**
 * Generates a GitHub edit URL for a console tool
 * @param toolPath - The relative path to the tool from the console directory (e.g., "utilities/format-converter/FormatConverter.tsx")
 * @returns The full GitHub edit URL
 */
export function generateConsoleToolGitHubUrl(toolPath: string): string {
  // Remove leading slash if present
  const cleanPath = toolPath.startsWith('/') ? toolPath.slice(1) : toolPath;
  
  return generateToolGitHubUrl(`console/${cleanPath}`);
}

/**
 * Helper function to quickly add Edit on GitHub button to console tools
 * Just pass the filename and it will generate the full path
 * @param filename - Just the filename (e.g., "FormatConverter.tsx")
 * @param category - The category folder (e.g., "utilities/format-converter", "primary-network", etc.)
 * @returns The full GitHub edit URL
 */
export function quickConsoleToolGitHubUrl(filename: string, category: string): string {
  return generateConsoleToolGitHubUrl(`${category}/${filename}`);
}
