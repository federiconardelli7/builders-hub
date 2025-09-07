# Academy Architecture

This directory contains the configuration and types for the modular academy system.

## Structure

- `types.ts` - TypeScript interfaces for academy configurations
- `avalanche-developer.config.tsx` - Configuration for Avalanche Developer Academy
- `codebase-entrepreneur.config.tsx` - Configuration for Codebase Entrepreneur Academy

## Component Layout

The `AcademyLayout` component supports:
- `children` - Content displayed before the learning path (currently unused)
- `afterLearningPath` - Content displayed after the learning path (e.g., Success Stories)
- `blogs` - Blog posts displayed at the bottom (if `showBlogs` is true)

## Adding New Academies

To add a new academy (e.g., Solidity Academy):

1. Create a new config file: `solidity.config.tsx`
2. Define the academy configuration:
   ```typescript
   export const solidityConfig: AcademyConfig = {
     id: 'solidity',
     name: 'Solidity Academy',
     heroTitle: 'Solidity',
     heroAccent: 'Academy',
     heroDescription: 'Master smart contract development...',
     pathType: 'avalanche', // or create a new type
     showBlogs: true,
     features: {
       // Add custom features as needed
     }
   };
   ```
3. Create a new page at `/app/(home)/academy/solidity/page.tsx`
4. Import and use the config with `AcademyLayout`

## Academy URLs

- `/academy` - Avalanche Developer Academy (default)
- `/academy/codebase-entrepreneur` - Codebase Entrepreneur Academy
- `/academy/[slug]` - Future academies
