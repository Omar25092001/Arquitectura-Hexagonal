export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    target: string; // Selector CSS del elemento a resaltar
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void;
    waitForElement?: boolean;
}


export interface Tutorial {
    id: string;
    name: string;
    steps: TutorialStep[];
}


export const TutorialModalAlgoritmo: Tutorial = {
    id: 'modal-algoritmo',
    name: 'Ejecución de Algoritmo',
    steps: [
        {
            id: 'modal-algorithm-select',
            title: 'Selecciona el algoritmo',
            content: 'Elige el algoritmo que deseas aplicar sobre los datos seleccionados.',
            target: '.modal-algorithm-select',
            placement: 'left', //   Correcto
            waitForElement: true
        },
        {
            id: 'modal-algorithm-run',
            title: 'Ejecuta el algoritmo',
            content: 'Haz clic en este botón para ejecutar el algoritmo sobre el rango de datos seleccionado.',
            target: '.modal-algorithm-run',
            placement: 'top', //   Correcto
            waitForElement: true
        },
        {
            id: 'modal-algorithm-results',
            title: 'Resultados del algoritmo',
            content: 'Aquí verás los resultados generados por el algoritmo.',
            target: '.modal-algorithm-results',
            placement: 'top', //   Correcto
            waitForElement: true
        }
    ]
};