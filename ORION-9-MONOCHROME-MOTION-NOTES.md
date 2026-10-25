# Orion-9 Monochrome Motion Upgrade

This source update changes the public-facing visual system to restrained black, white, and grayscale, and adds GSAP ScrollTrigger-based reveals and scroll progress to the existing storytelling section. It also recolors the existing Three.js logistics scene and canvas diorama toward graphite, steel, and white.

## Main changes
- Monochrome design tokens and global motion styles in `src/index.css`.
- Grayscale materials and route colors in `src/components/GlobalLogisticsScene.tsx`.
- Grayscale isometric scene palette in `src/components/HeroDiorama.tsx`.
- GSAP ScrollTrigger reveal animation, scrubbable section progress, and reduced-motion guard in `src/components/ScrollStorytelling.tsx`.
- Existing Firebase/auth/navigation and application routes retained.

## Verify before deployment
Run the existing project commands: `npm install`, `npm run lint`, and `npm run build`. Test real scrolling and the 3D scene in a browser, including a mobile viewport and the OS reduced-motion preference. The logistics figures shown by the current project may be demonstration data; do not represent them as live tracking unless connected to verified providers.
