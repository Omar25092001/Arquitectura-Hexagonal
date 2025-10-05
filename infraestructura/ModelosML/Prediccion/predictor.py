import joblib
import numpy as np
import os
import sys
import json

def cargar_modelo(nombre_modelo):
    """Carga el modelo previamente entrenado"""
    dir_actual = os.path.dirname(os.path.abspath(__file__))
    carpeta_modelos = os.path.join(
        dir_actual,
        "..",
        "Entrenamiento",
        "GradientBoostingRegressor",
        "ModelosGradientBoosting"
    )
    ruta_modelo = os.path.join(carpeta_modelos, nombre_modelo)
    
    if not os.path.exists(ruta_modelo):
        raise Exception(f"Modelo no encontrado: {ruta_modelo}")
    
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
    try:
        if len(sys.argv) < 3:
            raise Exception("Faltan argumentos: nombreModelo y valores")
        
        nombre_modelo = sys.argv[1]
        valores_str = sys.argv[2]
        
        # Obtener número de pasos (opcional, por defecto 7)
        n_pasos = 7
        if len(sys.argv) > 3:
            try:
                n_pasos = int(sys.argv[3])
            except:
                pass
        
        # Intentar parsear como JSON
        valores_str_limpio = valores_str.replace('\\"', '"')
        
        try:
            valores = json.loads(valores_str_limpio)
        except json.JSONDecodeError as e:
            raise Exception(f"Error al parsear valores: {str(e)}. Recibido: {valores_str}")
        
        # Cargar modelo
        modelo = cargar_modelo(nombre_modelo)
        
        # Predecir múltiples valores
        predicciones = predecir_multiples(modelo, valores, n_pasos)
        
        # Resultado exitoso
        resultado = {
            "success": True,
            "predicciones": predicciones,
            "n_pasos": n_pasos
        }
        print(json.dumps(resultado))
        
    except Exception as e:
        # Resultado con error
        resultado = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(resultado))
        sys.exit(1)