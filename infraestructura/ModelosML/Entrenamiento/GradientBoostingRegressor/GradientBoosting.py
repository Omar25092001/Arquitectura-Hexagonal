from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
import pandas as pd
import joblib
import os

def crear_secuencias_temporales(datos, n_steps=5):
    X, y = [], []
    for i in range(len(datos) - n_steps):
        X.append(datos[i:i + n_steps])
        y.append(datos[i + n_steps])
    return np.array(X), np.array(y)

def entrenar_y_evaluar(archivo_excel, id_usuario, nombre_archivo):
    columna_temperatura = "Temperatura interior - °C"
    print("="*60)
    print("🚀 ENTRENAMIENTO Y EVALUACIÓN DEL MODELO")
    print("="*60)
    try:
        print("\n📂 Cargando datos del Excel...")
        df = pd.read_excel(archivo_excel)
        temp_data = df[columna_temperatura].dropna().values
        print(f"✅ {len(temp_data)} registros cargados")
    except Exception as e:
        print(f"⚠️ Error: {e}")
        print("📊 Usando datos simulados...")
        np.random.seed(42)
        temp_data = 20 + 5 * np.sin(np.arange(500) * 0.1) + np.random.normal(0, 1, 500)
        print(f"✅ {len(temp_data)} registros simulados generados")

    X, y = crear_secuencias_temporales(temp_data, n_steps=5)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"✅ {len(X)} secuencias | Entrenamiento: {len(X_train)} | Prueba: {len(X_test)}")

    print("\n🤖 Entrenando modelo...")
    modelo = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    )
    modelo.fit(X_train, y_train)
    print("✅ Modelo entrenado")

    y_test_pred = modelo.predict(X_test)
    mse = mean_squared_error(y_test, y_test_pred)
    mae = mean_absolute_error(y_test, y_test_pred)
    r2 = r2_score(y_test, y_test_pred)

    print("\n📊 RESULTADOS:")
    print(f"   R² Score:    {r2:.4f}")
    print(f"   Error (MAE): {mae:.4f}°C")
    print(f"   Error (MSE): {mse:.4f}")

    print("\n📈 CALIDAD:")
    if r2 > 0.9:
        print("   ✅ Excelente (R² > 0.9)")
    elif r2 > 0.7:
        print("   ✅ Bueno (R² > 0.7)")
    elif r2 > 0.5:
        print("   ⚠️ Regular (R² > 0.5)")
    else:
        print("   ❌ Malo (R² < 0.5)")

    carpeta_modelos = "ModelosGradientBoosting"
    if not os.path.exists(carpeta_modelos):
        os.makedirs(carpeta_modelos)
        print(f"\n📁 Carpeta '{carpeta_modelos}' creada")

    nombre_modelo = f"{id_usuario}_{nombre_archivo}.pkl"
    ruta_modelo = os.path.join(carpeta_modelos, nombre_modelo)
    joblib.dump(modelo, ruta_modelo)
    print(f"\n💾 Modelo guardado en: {ruta_modelo}")

    print("\n" + "="*60)
    return modelo

if __name__ == "__main__":
    # Pedir datos al usuario
    id_usuario = input("Ingrese el ID de usuario: ")
    nombre_archivo = input("Ingrese el nombre del archivo de modelo: ")

    # Buscar archivo en carpeta DejarArchivo
    carpeta_archivos = "DejarArchivo"
    archivos = [f for f in os.listdir(carpeta_archivos) if f.endswith('.xlsx')]
    if not archivos:
        print(f"No se encontró ningún archivo .xlsx en la carpeta '{carpeta_archivos}'.")
        exit(1)
    print(f"Archivos encontrados en '{carpeta_archivos}':")
    for idx, archivo in enumerate(archivos):
        print(f"{idx+1}. {archivo}")
    archivo_excel = os.path.join(carpeta_archivos, archivos[0])
    print(f"\nUsando archivo: {archivo_excel}")

    modelo = entrenar_y_evaluar(archivo_excel, id_usuario, nombre_archivo)