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
    startPath: string;
}

export const TutorialEjecucion: Tutorial = {
    id: 'ejecucion',
    name: 'Ejecución de Algoritmos',
    startPath: '/usuario/ejecucion',
    steps: [
        {
            id: 'welcome-ejecucion',
            title: 'Paso 3: Ejecución de la Simulación',
            content: '¡Bienvenido! Aquí puedes ejecutar la simulación y aplicar algoritmos sobre tus variables seleccionadas.',
            target: '.ejecucion-header',
            placement: 'bottom'
        },
        {
            id: 'connection-status',
            title: 'Estado de Conexión',
            content: 'Aquí puedes ver el estado actual de la conexión con tu fuente de datos.',
            target: '.ejecucion-connection-status',
            placement: 'right'
        },
        {
            id: 'simulation-controls',
            title: 'Controles de Simulación',
            content: 'Utiliza estos botones para iniciar, pausar, reiniciar o reconfigurar la simulación.',
            target: '.ejecucion-controls',
            placement: 'bottom'
        },
        {
            id: 'config-summary',
            title: 'Resumen de Configuración',
            content: 'Aquí tienes un resumen de la fuente de datos, variables seleccionadas y el estado del sistema.',
            target: '.ejecucion-summary',
            placement: 'top'
        },
        {
            id: 'monitor-switch',
            title: 'Monitorización de Variables',
            content: 'Activa o desactiva la monitorización para ver los datos en tiempo real o analizar variables específicas.',
            target: '.ejecucion-monitor-switch',
            placement: 'left'
        },
        {
            id: 'extraer-datos',
            title: 'Iniciar Extracción de Datos',
            content: 'Presiona el botón para iniciar la extracción de Datos.',
            target: '.extraer-datos',
            placement: 'top',
            waitForElement: true
        },
        {
            id: 'data-panel',
            title: 'Panel de Datos',
            content: 'Aquí se muestran los datos en tiempo real o el panel de monitorización, según la opción seleccionada.',
            target: '.ejecucion-data-panel',
            placement: 'top',
            waitForElement: true
        },
        {
            id: 'seleccionar-variable-algoritmo',
            title: 'Seleccionar variable para el algoritmo',
            content: 'Aquí puedes elegir la variable (columna) que será utilizada por los algoritmos cuando ejecutes una acción sobre los datos. La variable seleccionada será la que se envíe al algoritmo.',
            target: 'select', // O usa un selector más específico si tienes varios <select> en la página, por ejemplo: '.bg-blue-900/30 select'
            placement: 'left',
            waitForElement: true
        },
        {
            id: 'seleccionar-dato-historial',
            title: 'Selecciona un dato del historial',
            content: 'Haz clic en una fila de la tabla de historial para analizar ese registro con los algoritmos disponibles.',
            target: '.ejecucion-algorithm-run', // Esta clase ya está en el <tr> de la tabla
            placement: 'top',
            waitForElement: true
        }

    ]
};