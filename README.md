# Documentación del Proyecto Web

Este repositorio contiene el código fuente de la aplicación web desarrollada mediante tecnologías estándar del lado del cliente: HTML5, CSS3 y JavaScript. Con el objetivo de optimizar la gestión del despliegue y la usabilidad del proyecto, el repositorio se ha estructurado en dos ramas de desarrollo diferenciadas según su entorno de ejecución.

---

## Estructura de Ramas (Branches) y Entornos de Ejecución

El flujo de trabajo del repositorio se divide en dos ramas principales, cuyas especificaciones se detallan a continuación:

### 1. Rama `main` (Entorno de Producción / Online)
* **Función:** Representa la versión estable y definitiva de la aplicación web.
* **Despliegue:** Esta rama está integrada y vinculada de forma automatizada con el servicio de **GitHub Pages**. Cualquier cambio o fusión de código en esta rama se despliega de inmediato en el servidor de producción.
* **Acceso:** La visualización del sitio web en producción se realiza a través del enlace público generado por GitHub Pages.

### 2. Rama `local` (Entorno de Visualización Offline)
* **Función:** Esta rama contiene el código fuente optimizado para su descarga, distribución y ejecución local en entornos donde no se disponga de una conexión a internet activa.
* **Restricción del Plugin de Redes Sociales:** Es indispensable señalar que, debido a la naturaleza técnica de los plugins de redes sociales integrados (los cuales requieren peticiones HTTP asíncronas hacia APIs externas de terceros para la carga de recursos y sincronización de datos), **dicha funcionalidad quedará inhabilitada** cuando la aplicación se ejecute estrictamente en modo offline. El resto de la interfaz, estilos y lógica local operarán con total normalidad.

---

## Persistencia de Datos y Sincronización (Supabase & PouchDB)

Para garantizar la integridad, persistencia y disponibilidad de los datos del usuario en ambos escenarios (online y offline), la arquitectura de la aplicación implementa una estrategia híbrida de almacenamiento utilizando dos sistemas de bases de datos complementarios:

### Supabase (Persistencia en la Nube / Rama `main`)
* **Propósito:** Actúa como el backend-as-a-service (BaaS) principal y base de datos relacional (basada en PostgreSQL) en el entorno de producción.
* **Comportamiento en `main`:** Almacena de forma centralizada la información global de la aplicación, gestiona la autenticación y permite la consulta de datos en tiempo real siempre que exista conectividad.
* **Comportamiento en `local`:** En el entorno sin conexión, las peticiones directas a las APIs de Supabase fallarán por falta de red, por lo que la aplicación delegará la persistencia en el almacenamiento local.

### PouchDB (Persistencia Local / Rama `local`)
* **Propósito:** Es una base de datos JavaScript en el entorno del cliente (dentro del navegador) inspirada en Apache CouchDB, diseñada específicamente para operar de forma offline.
* **Comportamiento en `local`:** Cuando el usuario interactúa con la aplicación de manera offline, todos los registros, modificaciones o datos generados se guardan localmente en el almacenamiento del navegador (IndexedDB) a través de PouchDB, asegurando que la información no se pierda al cerrar el navegador.
* **Sincronización:** PouchDB está configurado para almacenar los datos localmente y, en el momento en que se detecte una conexión activa, tiene la capacidad de sincronizar de manera bidireccional dichos datos con bases de datos remotas, mitigando la pérdida de información en el cambio de entornos.

---

## Tecnologías Implementadas

* **HTML5:** Arquitectura de software y marcado semántico de la información.
* **CSS3:** Diseño de la interfaz de usuario, hojas de estilo conceptuales, transiciones y adaptabilidad del diseño (Responsive Web Design).
* **JavaScript (ES6+):** Programación de la lógica del cliente, manipulación del Modelo de Objetos del Documento (DOM) y control de eventos.
* **Supabase SDK:** Integración de servicios en la nube, consultas a bases de datos relacionales y autenticación.
* **PouchDB API:** Gestión de base de datos NoSQL embebida en el cliente para la tolerancia a fallos de red.

---

## Instrucciones de Uso y Evaluación

### Acceso a la Versión Web (Online)
Para evaluar el despliegue del proyecto en un entorno de producción real, se puede acceder de forma directa mediante la URL provista por GitHub Pages en la sección lateral de este repositorio. En este entorno, tanto Supabase como el plugin de redes sociales operarán a su máxima capacidad.

### Ejecución de la Versión Descargable (Offline)
Para auditar el comportamiento de la aplicación en un entorno local y sin conectividad:
1. Asegúrese de clonar o alternar a la rama `local` mediante Git:
   ```bash
   git clone -b local [https://github.com/SU_USUARIO/SU_REPOSITORIO.git](https://github.com/SU_USUARIO/SU_REPOSITORIO.git)