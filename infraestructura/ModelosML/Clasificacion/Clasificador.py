import numpy as np
import sys
import json

def clasificar_simple(datos):
    """Clasificación simple sin modelo - solo reglas lógicas"""
    
    # Calcular estadísticas
    promedio = np.mean(datos)
    variabilidad = np.std(datos)
    tendencia = "ascendente" if datos[-1] > datos[0] else "descendente"
    
    # Reglas de clasificación basadas en temperatura
    if promedio < 18:
        clase_predicha = "Frio"
        probabilidades = {"Frio": 0.85, "Normal": 0.12, "Caliente": 0.03}
    elif promedio < 25:
        clase_predicha = "Normal" 
        probabilidades = {"Frio": 0.15, "Normal": 0.70, "Caliente": 0.15}
    else:
        clase_predicha = "Caliente"
        probabilidades = {"Frio": 0.05, "Normal": 0.15, "Caliente": 0.80}
    
    # Ajustar probabilidades según variabilidad
    if variabilidad > 2.0:  # Alta variabilidad
        # Reducir confianza en la clase principal
        factor_reduccion = 0.9
        probabilidades[clase_predicha] *= factor_reduccion
        # Redistribuir el resto
        resto = (1 - probabilidades[clase_predicha]) / 2
        for clase in probabilidades:
            if clase != clase_predicha:
                probabilidades[clase] = resto
    
    # Redondear probabilidades
    for clase in probabilidades:
        probabilidades[clase] = round(probabilidades[clase], 3)
    
    # Calcular nivel de confianza basado en consistencia de datos
    confianza = max(0.6, 1.0 - (variabilidad / 10))  # Menos variabilidad = más confianza
    
    # Clasificación adicional por patrón
    patron = "estable"
    if variabilidad > 2:
        patron = "variable"
    elif abs(datos[-1] - datos[0]) > 3:
        patron = "cambiante"
    
    return {
        "clase_predicha": clase_predicha,
        "probabilidades": probabilidades,
        "confianza": round(confianza, 3),
        "caracteristicas_detectadas": {
            "temperatura_promedio": round(promedio, 2),
            "variabilidad": round(variabilidad, 2),
            "tendencia": tendencia,
            "patron": patron,
            "rango": f"{round(min(datos), 1)} - {round(max(datos), 1)}°C"
        },
        "reglas_aplicadas": [
            f"Promedio {promedio:.1f}°C → Clase {clase_predicha}",
            f"Variabilidad {variabilidad:.1f} → Confianza {confianza:.1f}",
            f"Patrón detectado: {patron}"
        ]
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) < 4:
            raise Exception("Faltan argumentos: usuarioId, nombreModelo y datos")
        
        usuario_id = sys.argv[1]
        nombre_modelo = sys.argv[2]
        datos_str = sys.argv[3]
        
        print(f"CLASIFICADOR SIMPLE - Usuario: {usuario_id}, Algoritmo: {nombre_modelo}")
        
        # Parsear datos
        datos = json.loads(datos_str.replace('\\"', '"'))
        
        if len(datos) < 2:
            raise Exception("Se necesitan al menos 2 valores para clasificar")
        
        # Clasificar usando reglas simples
        resultado_clasificacion = clasificar_simple(datos)
        
        # Resultado exitoso
        respuesta = {
            "success": True,
            "tipo": "clasificacion",
            "usuario_id": usuario_id,
            "nombre_modelo": nombre_modelo,
            "clasificacion": resultado_clasificacion,
            "datos_entrada": datos,
            "mensaje": "Clasificación realizada con reglas lógicas simples"
        }
        print(json.dumps(respuesta))
        
    except Exception as e:
        respuesta = {
            "success": False,
            "tipo": "clasificacion",
            "error": str(e),
            "usuario_id": usuario_id if 'usuario_id' in locals() else None,
            "nombre_modelo": nombre_modelo if 'nombre_modelo' in locals() else None
        }
        print(json.dumps(respuesta))
        sys.exit(1)