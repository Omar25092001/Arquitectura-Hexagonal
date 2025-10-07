import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    target: string; // Selector CSS del elemento a resaltar
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void; // Acción a ejecutar al avanzar
    waitForElement?: boolean; // Esperar a que el elemento exista
}

interface TutorialTooltipProps {
    step: TutorialStep;
    targetRect: DOMRect;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

export default function TutorialTooltip({
    step,
    targetRect,
    onNext,
    onPrev,
    onSkip,
    currentStep,
    totalSteps
}: TutorialTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const placement = step.placement || 'bottom';

    useEffect(() => {
        // Asegurar que el tooltip esté visible después de renderizar
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            
            // Si el tooltip se sale de la pantalla, hacer scroll
            if (rect.bottom > window.innerHeight || rect.top < 0) {
                tooltipRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    }, [targetRect]);

    const getTooltipPosition = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Ancho dinámico del tooltip según viewport
        const tooltipWidth = viewportWidth < 640 ? viewportWidth - 40 : 
                            viewportWidth < 768 ? 340 : 
                            viewportWidth < 1024 ? 360 : 380;

        const tooltipPadding = 16;
        const margin = 10;
        const estimatedTooltipHeight = 280;

        let top = 0;
        let left = 0;
        let arrowPosition = 'bottom'; // Para mostrar flecha

        // En móviles, posicionar en la parte inferior de la pantalla
        if (viewportWidth < 640) {
            top = viewportHeight - estimatedTooltipHeight - 20;
            left = 20;
            return { 
                top, 
                left, 
                width: tooltipWidth,
                position: 'fixed' as const,
                arrowPosition 
            };
        }

        // Calcular posición según placement
        switch (placement) {
            case 'bottom':
                top = targetRect.bottom + tooltipPadding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                arrowPosition = 'top';
                
                // Si no cabe abajo, mover arriba
                if (top + estimatedTooltipHeight > viewportHeight) {
                    top = targetRect.top - estimatedTooltipHeight - tooltipPadding;
                    arrowPosition = 'bottom';
                }
                break;

            case 'top':
                top = targetRect.top - estimatedTooltipHeight - tooltipPadding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                arrowPosition = 'bottom';
                
                if (top < margin) {
                    top = targetRect.bottom + tooltipPadding;
                    arrowPosition = 'top';
                }
                break;

            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (estimatedTooltipHeight / 2);
                left = targetRect.left - tooltipWidth - tooltipPadding;
                arrowPosition = 'right';
                
                if (left < margin) {
                    left = targetRect.right + tooltipPadding;
                    arrowPosition = 'left';
                }
                break;

            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (estimatedTooltipHeight / 2);
                left = targetRect.right + tooltipPadding;
                arrowPosition = 'left';
                
                if (left + tooltipWidth > viewportWidth - margin) {
                    left = targetRect.left - tooltipWidth - tooltipPadding;
                    arrowPosition = 'right';
                }
                break;
        }

        // Ajustes finales para evitar salirse de la pantalla
        if (left < margin) {
            left = margin;
        } else if (left + tooltipWidth > viewportWidth - margin) {
            left = viewportWidth - tooltipWidth - margin;
        }

        if (top < margin) {
            top = margin;
        } else if (top + estimatedTooltipHeight > viewportHeight - margin) {
            top = Math.max(margin, viewportHeight - estimatedTooltipHeight - margin);
        }

        return { 
            top, 
            left, 
            width: tooltipWidth,
            position: 'fixed' as const,
            arrowPosition 
        };
    };

    const position = getTooltipPosition();

    return (
        <div
            ref={tooltipRef}
            className="z-[9999] bg-secundary border-2 border-orange-400 rounded-xl shadow-2xl animate-fadeIn overflow-hidden"
            style={{
                position: position.position,
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                maxHeight: 'calc(100vh - 40px)',
                maxWidth: 'calc(100vw - 40px)'
            }}
        >
            <div className="p-4 sm:p-6 max-h-[calc(100vh-40px)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 break-words leading-tight">
                            {step.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Paso {currentStep} de {totalSteps}
                        </p>
                    </div>
                    <button
                        onClick={onSkip}
                        className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors p-1 rounded"
                        title="Saltar tutorial"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <p className="text-gray-300 text-sm sm:text-base mb-4 leading-relaxed break-words">
                    {step.content}
                </p>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-400 transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onPrev}
                        disabled={currentStep === 1}
                        className="flex-1 px-3 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg flex items-center justify-center transition-colors text-sm disabled:cursor-not-allowed font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span>Anterior</span>
                    </button>

                    <button
                        onClick={onNext}
                        className="flex-1 px-3 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg flex items-center justify-center transition-colors text-sm font-medium shadow-lg"
                    >
                        <span>{currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}