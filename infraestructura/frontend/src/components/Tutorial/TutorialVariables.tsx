export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    target: string; // Selector CSS del elemento a resaltar
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void; // Acción a ejecutar al avanzar
    waitForElement?: boolean; // Esperar a que el elemento exista
}

export interface Tutorial {
    id: string;
    name: string;
    steps: TutorialStep[];
    startPath: string; // Ruta donde inicia el tutorial
}

export const TutorialVariables: Tutorial = {
    id: 'variables',
    name: 'Configuración de Variables',
    startPath: '/usuario/variables',
    steps: [
        {
            id: 'welcome-variables',
            title: 'Paso 2: Selección de Variables',
            content: '¡Bienvenido al segundo paso! Aquí elegirás las variables de tu fuente de datos con las que quieres trabajar en tu Digital Twin.',
            target: '.tutorial-steps',
            placement: 'bottom'
        },
        {
            id: 'back-button',
            title: 'Volver Atrás',
            content: 'Si necesitas cambiar la fuente de datos, puedes volver a la pantalla anterior haciendo clic en este botón.',
            target: '.tutorial-back-button',
            placement: 'right'
        },
        {
            id: 'refresh-variables',
            title: 'Detectar Variables',
            content: 'Haz clic aquí para escanear tu fuente de datos y encontrar todas las variables disponibles. Puedes usar este botón cada vez que los datos cambien.',
            target: '.tutorial-refresh-button',
            placement: 'bottom'
        },
        {
            id: 'variables-grid',
            title: 'Grid de Variables Disponibles',
            content: 'Aquí se mostrarán todas las variables detectadas desde tu fuente de datos. Haz clic en cualquier variable para seleccionarla. Las seleccionadas mostrarán un check (✓).',
            target: '.tutorial-variables-grid',
            placement: 'top',
            waitForElement: true
        },
        {
            id: 'selected-list',
            title: 'Lista de Variables Seleccionadas',
            content: 'Esta sección muestra todas las variables que has elegido. Puedes eliminar cualquiera haciendo clic en la (X) sin necesidad de buscarla en el grid.',
            target: '.tutorial-selected-list',
            placement: 'top',
            waitForElement: true
        },
        {
            id: 'variable-count',
            title: 'Contador de Variables',
            content: 'Aquí puedes ver cuántas variables has seleccionado del total disponible. Recuerda que necesitas al menos una variable para continuar.',
            target: '.tutorial-variable-count',
            placement: 'left',
            waitForElement: true
        },
        {
            id: 'next-execution',
            title: 'Continuar a Ejecución',
            content: 'Una vez que hayas seleccionado al menos una variable, este botón se activará y podrás avanzar al último paso: ejecutar algoritmos sobre tus datos.',
            target: '.tutorial-next-button',
            placement: 'left'
        }
    ]
};