

import React from 'react';

interface ParticlesProps {
    active: boolean;
}

export const Particles: React.FC<ParticlesProps> = ({ active }) => {
    if (!active) return null;
    const particles = Array.from({ length: 15 });
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {particles.map((_, i) => {
                const x = (Math.random() - 0.5) * 150;
                const y = (Math.random() - 0.5) * 150;
                const size = Math.random() * 5 + 2;
                const duration = Math.random() * 0.5 + 0.5;
                const delay = Math.random() * 0.2;
                return (
                    <div
                        key={i}
                        className="particle"
                        // Cast style object to React.CSSProperties to allow for custom properties.
                        style={{
                            '--x': `${x}px`,
                            '--y': `${y}px`,
                            width: `${size}px`,
                            height: `${size}px`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            background: '#ef4444', /* red-500 */
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: `explode ${duration}s ease-out ${delay}s forwards`
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
};

// Add keyframes for the particle explosion animation to App.tsx or a global CSS file
// @keyframes explode {
//   from {
//     transform: translate(-50%, -50%) scale(1);
//     opacity: 1;
//   }
//   to {
//     transform: translate(var(--x), var(--y)) scale(0);
//     opacity: 0;
//   }
// }
// Note: This animation is already defined in index.html, so no changes needed there.