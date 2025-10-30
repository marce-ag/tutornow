# TutorNow es una plataforma de tutorías en línea desarrollada con Node.js, Express y MySQL.



## 1️. Crear la base de datos

1. Abre XAMPP y activa los servicios de **Apache** y **MySQL**.  
2. Entra a **phpMyAdmin** desde [http://localhost/phpmyadmin](http://localhost/phpmyadmin).  
3. Da clic en **Importar** y selecciona el archivo que está en la carpeta `db/tutornow.sql`.  
4. Da clic en **Continuar** para crear la base de datos y las tablas.

El archivo `tutornow.sql` realiza lo siguiente:
- Crea la base de datos llamada **`dbtutornow`**.  
- Crea las tablas del proyecto (tutores, estudiantes, materias, sesiones, pagos, etc.).  
- Crea un usuario en MySQL con el nombre **`dbtutornow`** y la contraseña.  
- Le asigna permisos a ese usuario sobre la base de datos.



## 2️.Instalar los módulos del proyecto

Dentro de la carpeta principal del proyecto, abre una terminal y escribe:

```bash
npm install express mysql express-myconnection morgan ejs

## Repositorio GitHub

Repositorio público del proyecto:  
https://github.com/marce-ag/tutornow

