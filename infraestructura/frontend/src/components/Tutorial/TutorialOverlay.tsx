import { useEffect, useState } from 'react';
import { useTutorial } from './TutorialContext';
import TutorialTooltip from './TutorialToolTip';

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
            } else if (currentStep.waitForElement) {
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

        // ✅ Actualizar cuando el DOM cambia
        let observer: MutationObserver | null = null;
        if (targetElement) {
            observer = new MutationObserver(() => {
                const rect = targetElement.getBoundingClientRect();
                setHighlightedRect(rect);
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        }

        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
            if (observer) observer.disconnect();
        };
    }, [isActive, currentStep, targetElement]);


    if (!isActive || !currentStep) return null;

    const padding = 8;

    return (
        <>
            {/* Overlay oscuro con recorte para el elemento resaltado */}
            <div
                className="fixed inset-0 z-[9998]"
                style={{ pointerEvents: 'none' }}
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