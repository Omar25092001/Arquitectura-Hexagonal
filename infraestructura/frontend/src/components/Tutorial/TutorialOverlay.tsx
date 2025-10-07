import { useEffect, useState } from 'react';
import { useTutorial } from './TutorialContext';
import TutorialTooltip from './TutorialTooltip';

export default function TutorialOverlay() {
    const { isActive, currentStep, nextStep, prevStep, skipTutorial, currentStepIndex, activeTutorial } = useTutorial();
    const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);
    const [targetElement, setTargetElement] = useState<Element | null>(null);

    useEffect(() => {
        if (!isActive || !currentStep) {
            setHighlightedRect(null);
            setTargetElement(null);
            return;
        }

        const updateHighlight = () => {
            const element = document.querySelector(currentStep.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setHighlightedRect(rect);
                setTargetElement(element);
                
                // Scroll suave hacia el elemento si no está completamente visible
                const isFullyVisible = 
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth;

                if (!isFullyVisible) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                    
                    // Recalcular después del scroll
                    setTimeout(() => {
                        const newRect = element.getBoundingClientRect();
                        setHighlightedRect(newRect);
                    }, 500);
                }
            } else if (currentStep.waitForElement) {
                // Esperar a que el elemento exista
                setTimeout(updateHighlight, 100);
            }
        };

        updateHighlight();

        // Actualizar en resize y scroll
        const handleUpdate = () => {
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setHighlightedRect(rect);
            }
        };

        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);

        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isActive, currentStep, targetElement]);

    // Bloquear interacciones fuera del tutorial
    useEffect(() => {
        if (!isActive) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Permitir clics solo en el tooltip
            const isTooltipClick = target.closest('[data-tutorial-tooltip]');
            
            if (!isTooltipClick) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Bloquear todas las teclas excepto Escape (para salir)
            if (e.key !== 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            } else {
                skipTutorial();
            }
        };

        // Capturar eventos en fase de captura (antes que otros listeners)
        document.addEventListener('click', handleClick, true);
        document.addEventListener('mousedown', handleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);

        // Deshabilitar scroll de la página
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('mousedown', handleClick, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.body.style.overflow = '';
        };
    }, [isActive, skipTutorial]);

    if (!isActive || !currentStep) return null;

    const padding = 8;

    return (
        <>
            {/* Overlay oscuro con recorte para el elemento resaltado */}
            <div 
                className="fixed inset-0 z-[9998]"
                style={{ cursor: 'not-allowed' }}
            >
                <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {highlightedRect && (
                                <rect
                                    x={highlightedRect.left - padding}
                                    y={highlightedRect.top - padding}
                                    width={highlightedRect.width + padding * 2}
                                    height={highlightedRect.height + padding * 2}
                                    rx="8"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.75)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Borde animado alrededor del elemento resaltado */}
                {highlightedRect && (
                    <div
                        className="absolute border-4 border-orange-400 rounded-lg animate-pulse pointer-events-none"
                        style={{
                            left: `${highlightedRect.left - padding}px`,
                            top: `${highlightedRect.top - padding}px`,
                            width: `${highlightedRect.width + padding * 2}px`,
                            height: `${highlightedRect.height + padding * 2}px`,
                            transition: 'all 0.3s ease-in-out'
                        }}
                    />
                )}
            </div>

            {/* Tooltip con instrucciones */}
            {highlightedRect && (
                <div data-tutorial-tooltip>
                    <TutorialTooltip
                        step={currentStep}
                        targetRect={highlightedRect}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onSkip={skipTutorial}
                        currentStep={currentStepIndex + 1}
                        totalSteps={activeTutorial?.steps.length || 0}
                    />
                </div>
            )}
        </>
    );
}