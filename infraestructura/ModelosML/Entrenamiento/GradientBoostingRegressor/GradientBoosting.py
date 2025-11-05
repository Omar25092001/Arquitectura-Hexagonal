from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import numpy as np
import pandas as pd
import joblib
import os

def crear_secuencias_temporales(datos, n_steps=5):
    """Crear secuencias para modelos predictivos"""
    X, y = [], []
    for i in range(len(datos) - n_steps):
        X.append(datos[i:i + n_steps])
        y.append(datos[i + n_steps])
    return np.array(X), np.array(y)

def crear_datos_optimizacion(datos):
    """Crear datos para optimización - buscar valores óptimos"""
    # Para optimización, usamos características que permitan encontrar el mejor resultado
    X, y = [], []
    for i in range(len(datos) - 5):
        # Usar ventana de 5 valores como características
        ventana = datos[i:i + 5]
        # El objetivo es el valor máximo de la siguiente ventana
        siguiente_ventana = datos[i + 1:i + 6]
        valor_objetivo = np.max(siguiente_ventana)  # Buscar el máximo
        
        X.append(ventana)
        y.append(valor_objetivo)
    
    return np.array(X), np.array(y)

def crear_datos_clasificacion(datos):
    """Crear datos para clasificación - categorizar valores"""
    X, y = [], []
    
    # Definir categorías basadas en rangos de temperatura
    def categorizar_temperatura(temp):
        if temp < 18:
            return 0  # Frío
        elif temp < 25:
            return 1  # Normal
        else:
            return 2  # Caliente
    
    for i in range(len(datos) - 5):
        ventana = datos[i:i + 5]
        siguiente_valor = datos[i + 5]
        categoria = categorizar_temperatura(siguiente_valor)
        
        X.append(ventana)
        y.append(categoria)
    
    return np.array(X), np.array(y)

def entrenar_modelo(archivo_excel, id_usuario, nombre_modelo, tipo_modelo):
    columna_temperatura = "Temperatura interior - °C"
    print("="*60)
    print(" ENTRENAMIENTO DE MODELO")
    print(f" Tipo: {tipo_modelo.upper()}")
    print("="*60)
    
    try:
        print("\n Cargando datos del Excel...")
        df = pd.read_excel(archivo_excel)
        temp_data = df[columna_temperatura].dropna().values
        print(f" {len(temp_data)} registros cargados")
    except Exception as e:
        print(f" Error cargando Excel: {e}")
        print("Usando datos simulados...")
        np.random.seed(42)
        # Datos más realistas con tendencias
        temp_data = 20 + 5 * np.sin(np.arange(500) * 0.1) + np.random.normal(0, 1, 500)
        temp_data = np.clip(temp_data, 15, 30)  # Mantener en rango realista
        print(f" {len(temp_data)} registros simulados generados")

    #   Crear datos según el tipo de modelo
    print(f"\n Preparando datos para modelo {tipo_modelo}...")
    
    if tipo_modelo.lower() == "predictivo":
        X, y = crear_secuencias_temporales(temp_data, n_steps=5)
        modelo = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        print(" Objetivo: Predecir valores futuros")
        
    elif tipo_modelo.lower() == "optimizacion":
        X, y = crear_datos_optimizacion(temp_data)
        modelo = GradientBoostingRegressor(
            n_estimators=150,  # Más estimadores para optimización
            learning_rate=0.05,  # Aprendizaje más lento para precisión
            max_depth=4,
            random_state=42
        )
        print("Objetivo: Encontrar valores óptimos")
        
    elif tipo_modelo.lower() == "clasificacion":
        X, y = crear_datos_clasificacion(temp_data)
        modelo = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        print(" Objetivo: Clasificar en categorías")
        print("   0: Frío (<18°C)")
        print("   1: Normal (18-25°C)")
        print("   2: Caliente (>25°C)")
    
    else:
        raise ValueError(f"Tipo de modelo inválido: {tipo_modelo}")

    # Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  {len(X)} secuencias | Entrenamiento: {len(X_train)} | Prueba: {len(X_test)}")

    # Entrenar modelo
    print(f"\n Entrenando modelo {tipo_modelo}...")
    modelo.fit(X_train, y_train)
    print(" Modelo entrenado")

    #  Evaluar según el tipo
    print("\n EVALUANDO MODELO:")
    y_test_pred = modelo.predict(X_test)
    
    if tipo_modelo.lower() in ["predictivo", "optimizacion"]:
        # Métricas de regresión
        mse = mean_squared_error(y_test, y_test_pred)
        mae = mean_absolute_error(y_test, y_test_pred)
        r2 = r2_score(y_test, y_test_pred)
        
        print(f"   R² Score:    {r2:.4f}")
        print(f"   Error (MAE): {mae:.4f}°C")
        print(f"   Error (MSE): {mse:.4f}")
        
    else:  # clasificacion
        # Métricas de clasificación
        accuracy = accuracy_score(y_test, y_test_pred)
        print(f"   Precisión:   {accuracy:.4f}")
        print("\n Reporte detallado:")
        print(classification_report(y_test, y_test_pred, 
                                  target_names=['Frío', 'Normal', 'Caliente']))

    #  Guardar modelo en la carpeta correcta
    print(f"\n Guardando modelo {tipo_modelo}...")
    carpetas_tipos = {
        "predictivo": ("../../Prediccion", "ModelosPredictivos"),
        "optimizacion": ("../../Optimizacion", "ModelosOptimizacion"), 
        "clasificacion": ("../../Clasificacion", "ModelosClasificacion")
    }
    
    carpeta_base, carpeta_modelos = carpetas_tipos[tipo_modelo.lower()]
    
    # Crear ruta absoluta
    dir_actual = os.path.dirname(os.path.abspath(__file__))
    ruta_completa = os.path.join(dir_actual, carpeta_base, carpeta_modelos)
    
    if not os.path.exists(ruta_completa):
        os.makedirs(ruta_completa, exist_ok=True)
        print(f" Carpeta creada: {ruta_completa}")

    # Guardar con nombre específico
    nombre_archivo = f"{id_usuario}_{nombre_modelo}_{tipo_modelo.lower()}.pkl"
    ruta_modelo = os.path.join(ruta_completa, nombre_archivo)
    
    joblib.dump(modelo, ruta_modelo)
    print(f" Modelo guardado: {ruta_modelo}")
    
    #   Verificar que se guardó correctamente
    tamaño = os.path.getsize(ruta_modelo)
    print(f"Tamaño del archivo: {tamaño} bytes")
    
    #  Hacer una predicción de prueba
    print(f"\n PRUEBA DEL MODELO:")
    ejemplo = X_test[0:1]  # Primer ejemplo de prueba
    prediccion = modelo.predict(ejemplo)
    
    if tipo_modelo.lower() == "clasificacion":
        categorias = ['Frío', 'Normal', 'Caliente']
        print(f"   Entrada: {ejemplo[0]}")
        print(f"   Predicción: {categorias[int(prediccion[0])]} (clase {prediccion[0]})")
        print(f"   Real: {categorias[int(y_test[0])]} (clase {y_test[0]})")
    else:
        print(f"   Entrada: {ejemplo[0]}")
        print(f"   Predicción: {prediccion[0]:.4f}°C")
        print(f"   Real: {y_test[0]:.4f}°C")

    print("\n" + "="*60)
    print(" ¡ENTRENAMIENTO COMPLETADO EXITOSAMENTE!")
    print("="*60)
    
    return modelo

if __name__ == "__main__":
    print(" SISTEMA DE ENTRENAMIENTO DE MODELOS ML")
    print("="*60)
    
    #  Menú mejorado
    print("\n Tipos de modelo disponibles:")
    print("1.  Predictivo    - Predice valores futuros de temperatura")
    print("2.  Optimización - Encuentra los valores óptimos")
    print("3.   Clasificación - Clasifica temperaturas en categorías")
    
    while True:
        try:
            opcion = input("\n Seleccione el tipo (1-3): ").strip()
            if opcion == "1":
                tipo_modelo = "predictivo"
                print(" Seleccionado: Modelo Predictivo")
                break
            elif opcion == "2":
                tipo_modelo = "optimizacion"
                print(" Seleccionado: Modelo de Optimización")
                break
            elif opcion == "3":
                tipo_modelo = "clasificacion"
                print(" Seleccionado: Modelo de Clasificación")
                break
            else:
                print(" Opción inválida. Use 1, 2 o 3")
        except KeyboardInterrupt:
            print("\n Entrenamiento cancelado")
            exit(0)

    # Pedir información del modelo
    print("\n Información del modelo:")
    id_usuario = input(" ID de usuario: ").strip()
    nombre_modelo = input(" Nombre del modelo: ").strip()

    # Validar entradas
    if not id_usuario or not nombre_modelo:
        print(" Error: El ID de usuario y nombre del modelo son obligatorios")
        exit(1)

    # Buscar archivo Excel
    carpeta_archivos = "DejarArchivo"
    archivos = [f for f in os.listdir(carpeta_archivos) if f.endswith('.xlsx')]
    
    if archivos:
        archivo_excel = os.path.join(carpeta_archivos, archivos[0])
        print(f"\n Usando archivo: {archivos[0]}")
    else:
        print(f"\n No se encontró archivo Excel en '{carpeta_archivos}'")
        print(" Se usarán datos simulados")
        archivo_excel = None

    try:
        modelo = entrenar_modelo(archivo_excel, id_usuario, nombre_modelo, tipo_modelo)
        print(f"\n ¡Modelo '{nombre_modelo}' listo para usar!")
        
    except Exception as e:
        print(f"\n Error durante el entrenamiento: {e}")
        import traceback
        traceback.print_exc()