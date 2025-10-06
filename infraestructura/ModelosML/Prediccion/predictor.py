import joblib
import numpy as np
import os
import sys
import json
import time  # ← AGREGAR ESTE IMPORT

def buscar_modelo_predictivo(id_usuario, nombre_modelo):
    """Busca un modelo predictivo específico"""
    dir_actual = os.path.dirname(os.path.abspath(__file__))
    carpeta_modelos = os.path.join(dir_actual, "ModelosPredictivos")
    
    # Construir nombre del archivo con tipo
    nombre_archivo = f"{id_usuario}_{nombre_modelo}_predictivo.pkl"
    ruta_modelo = os.path.join(carpeta_modelos, nombre_archivo)
    
    print(f"Buscando modelo predictivo: {ruta_modelo}")
    
    if not os.path.exists(ruta_modelo):
        # Listar modelos disponibles
        modelos_disponibles = listar_modelos_predictivos(id_usuario)
        error_msg = f"Modelo '{nombre_archivo}' no encontrado.\n"
        if modelos_disponibles:
            error_msg += f"Modelos predictivos disponibles para usuario {id_usuario}:\n"
            for modelo in modelos_disponibles:
                error_msg += f"  - {modelo}\n"
        else:
            error_msg += f"No se encontraron modelos predictivos para el usuario {id_usuario}"
        raise Exception(error_msg)
    
    print(f"Modelo encontrado: {ruta_modelo}")
    return ruta_modelo

def listar_modelos_predictivos(id_usuario):
    """Lista todos los modelos predictivos de un usuario"""
    dir_actual = os.path.dirname(os.path.abspath(__file__))
    carpeta_modelos = os.path.join(dir_actual, "ModelosPredictivos")
    
    if not os.path.exists(carpeta_modelos):
        return []
    
    modelos = []
    try:
        archivos = os.listdir(carpeta_modelos)
        for archivo in archivos:
            if archivo.endswith('_predictivo.pkl') and archivo.startswith(f"{id_usuario}_"):
                # Extraer nombre: usuario_nombreModelo_predictivo.pkl -> nombreModelo
                nombre_limpio = archivo.replace('.pkl', '').replace(f"{id_usuario}_", '').replace('_predictivo', '')
                modelos.append(nombre_limpio)
    except Exception as e:
        print(f"Error listando modelos: {e}")
    
    return modelos

def cargar_modelo(ruta_modelo):
    """Carga el modelo desde la ruta especificada"""
    modelo = joblib.load(ruta_modelo)
    return modelo

def predecir_multiples(modelo, valores, n_pasos=7):
    """Predice múltiples valores futuros"""
    if len(valores) < 5:
        raise Exception("Se necesitan al menos 5 valores")
    
    valores_temp = list(valores.copy())
    predicciones = []
    
    for i in range(n_pasos):
        ultimos_5 = valores_temp[-5:]
        entrada = np.array([ultimos_5])
        siguiente = float(modelo.predict(entrada)[0])
        
        predicciones.append(siguiente)
        valores_temp.append(siguiente)
    
    return predicciones

if __name__ == "__main__":
    # ⏱️ INICIAR CRONÓMETRO AL INICIO DEL PROGRAMA
    tiempo_inicio = time.time()
    
    try:
        if len(sys.argv) < 4:
            raise Exception("Faltan argumentos: usuarioId, nombreModelo y valores")
        
        # Parametros: usuarioId, nombreModelo, valores, [nPasos]
        usuario_id = sys.argv[1]
        nombre_modelo = sys.argv[2]
        valores_str = sys.argv[3]
        
        # ✅ SIEMPRE 7 pasos, sin importar lo que venga como parámetro
        n_pasos = 7
        
        print(f"PREDICTOR - Usuario: {usuario_id}, Modelo: {nombre_modelo}")
        print(f"Prediciendo los siguientes {n_pasos} valores")
        
        # Parsear valores
        valores_str_limpio = valores_str.replace('\\"', '"')
        try:
            valores = json.loads(valores_str_limpio)
        except json.JSONDecodeError as e:
            raise Exception(f"Error parseando valores: {str(e)}")
        
        # Buscar y cargar modelo
        ruta_modelo = buscar_modelo_predictivo(usuario_id, nombre_modelo)
        modelo = cargar_modelo(ruta_modelo)
        
        # Hacer predicciones (siempre 7)
        predicciones = predecir_multiples(modelo, valores, n_pasos)
        
        # ⏱️ CALCULAR TIEMPO TRANSCURRIDO
        tiempo_fin = time.time()
        tiempo_ejecucion = round(tiempo_fin - tiempo_inicio, 4)  # 4 decimales
        
        # ✅ Resultado exitoso CON TIEMPO REAL
        resultado = {
            "success": True,
            "tipo": "predictivo",
            "usuario_id": usuario_id,
            "nombre_modelo": nombre_modelo,
            "predicciones": predicciones,
            "tiempo_ejecucion": tiempo_ejecucion,  # ← AGREGAR TIEMPO REAL
            "n_pasos": n_pasos,
            "valores_entrada": valores
        }
        print(json.dumps(resultado))
        
    except Exception as e:
        # ⏱️ CALCULAR TIEMPO INCLUSO EN ERROR
        tiempo_fin = time.time()
        tiempo_ejecucion = round(tiempo_fin - tiempo_inicio, 4)
        
        # ❌ Resultado con error Y TIEMPO
        resultado = {
            "success": False,
            "tipo": "predictivo",
            "error": str(e),
            "tiempo_ejecucion": tiempo_ejecucion,  # ← AGREGAR TIEMPO INCLUSO EN ERROR
            "usuario_id": usuario_id if 'usuario_id' in locals() else None,
            "nombre_modelo": nombre_modelo if 'nombre_modelo' in locals() else None
        }
        print(json.dumps(resultado))
        sys.exit(1)