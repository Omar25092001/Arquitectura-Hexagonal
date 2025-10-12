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

export const fuenteDatosTutorial: Tutorial = {
    id: 'fuente-datos',
    name: 'Configuración de Fuente de Datos',
    startPath: '/usuario/fuente-datos',
    steps: [
        {
            id: 'welcome',
            title: 'Guía de uso Digital Twin',
            content: 'Te guiaremos paso a paso en la configuración de tu Digital Twin. Comenzaremos seleccionando una fuente de datos.',
            target: '.tutorial-steps',
            placement: 'bottom'
        },
        {
            id: 'select-datasource',
            title: 'Selecciona una Fuente de Datos',
            content: 'Primero, elige de dónde provienen tus datos: Protocolo Directo (MQTT, WebSocket, HTTP), InfluxDB o Archivo Excel.',
            target: '.tutorial-datasource-grid',
            placement: 'bottom'
        },
        {
            id: 'protocol-dropdown',
            title: 'Selecciona el Protocolo',
            content: 'Si elegiste Protocolo Directo, selecciona el tipo específico: MQTT, WebSocket o HTTP.',
            target: '.tutorial-protocol-dropdown',
            placement: 'bottom',
            waitForElement: true
        },
        {
            id: 'config-form',
            title: 'Configura la Conexión',
            content: 'Completa los datos de conexión según el protocolo seleccionado. Asegúrate de ingresar la URL correcta y el endpoint de tu servicio.',
            target: '.tutorial-config-form',
            placement: 'top'
        },
        {
            id: 'format-help',
            title: 'Formato de Respuesta',
            content: '¿No estás seguro del formato? Haz clic en el ícono de ayuda (?) parpadeante para ver ejemplos del formato JSON que debe devolver tu servicio.',
            target: '.tutorial-format-button',
            placement: 'right',
            waitForElement: true
        },
        {
            id: 'test-connection',
            title: 'Prueba tu Conexión',
            content: 'Es importante verificar que la conexión funcione correctamente antes de avanzar al siguiente paso. Haz clic en "Probar Conexión".',
            target: '.tutorial-test-button',
            placement: 'left',
            waitForElement: true
        },
        {
            id: 'next-step',
            title: 'Avanza a Variables',
            content: 'Una vez que la conexión sea exitosa y veas el indicador verde, haz clic aquí para continuar con la configuración de variables.',
            target: '.tutorial-next-button',
            placement: 'left'
        }
    ]
};