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



export const TutorialMonitorizacion:Tutorial = {
    id: 'monitorizacion',
    name: 'Monitorización de Variables',
    steps: [
        {
            id: 'monitor-title',
            title: 'Monitorización de Variables',
            content: 'Aquí puedes asociar cada variable estándar con la variable recibida de tus sensores.',
            target: '.monitor-title',
            placement: 'bottom', // ✅ Correcto
            waitForElement: true
        },
        {
            id: 'monitor-select-variable',
            title: 'Selecciona la variable',
            content: 'Selecciona la variable de tus sensores que corresponde a cada estándar. Esta será usada para la monitorización y alertas.',
            target: '.monitor-select-variable',
            placement: 'left', // ✅ Correcto
            waitForElement: true
        },
        {
            id: 'monitor-rangos',
            title: 'Configura los rangos',
            content: 'Define los valores críticos, bajos y óptimos para cada variable. Estos rangos permiten generar alertas y visualizar el estado.',
            target: '.monitor-rangos',
            placement: 'top', // ✅ Correcto
            waitForElement: true
        },
        {
            id: 'monitor-confirm',
            title: 'Confirmar asignaciones',
            content: 'Haz clic aquí para guardar tus asignaciones y comenzar la monitorización.',
            target: '.monitor-confirm',
            placement: 'top', // ✅ Correcto
            waitForElement: true
        }
    ]
};