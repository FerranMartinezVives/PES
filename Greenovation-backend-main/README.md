# Greenovation

## Estructura de Directoris

Aquesta secció descriu la funció de cada directori i arxiu important en aquest projecte.

### `./`

- `Dockerfile`: Conté totes les directrius necessàries per construir la imatge Docker del projecte.
- `jest.config.js`: Configuració per a Jest, utilitzat per a les proves unitàries.
- `package.json`: Fitxer de configuració del projecte que inclou les dependències i scripts.
- `package-lock.json`: Assegura que s'instal·len les mateixes versions de les dependències en tots els entorns.
- `README.md`: Documentació del projecte, incloent instruccions d'ús, dependències, i més.

### `./src`

Directori principal on resideix el codi font de l'aplicació.

- `api/`: Conté els components principals de l'API.
  - `controllers/`: Controladors per a manejar la lògica de negoci per a cada ruta de l'API.
  - `models/`: Models que defineixen l'estructura de les dades per a la base de dades.
  - `routes/`: Rutes de l'API que defineixen els endpoints disponibles per als clients.
- `app.ts`: Configura l'aplicació Express, incloent middleware i rutes.
- `config/`: Conté arxius de configuració globals, com ara strings de connexió a bases de dades.
- `middleware/`: Middleware personalitzat per a Express, com ara manegadors d'errors i autenticació.
- `server.ts`: Punt d'entrada de l'aplicació que inicia el servidor.
- `services/`: Serveis per a encapsular la lògica de negoci, separant-la dels controladors.
- `tests/`: Conté proves específiques del codi dins de `src`.

### `./tests`

Conté proves a nivell d'aplicació, incloent proves d'integració.

### `tsconfig.json`

Configuració del TypeScript per al projecte, definint opcions com el directori de sortida per al codi compilat.

---

Aquesta estructura està pensada per mantenir el projecte organitzat i facilitar el desenvolupament i el manteniment del codi.

## Instal·lació i execució per desenvolupament

### Instal·lació de Docker

Primer de tot, necessitem assegurar-nos que Docker estigui instal·lat en les màquines dels usuaris. Docker permetrà executar el projecte en un contenidor aïllat, facilitant la gestió de dependències i l'execució en diversos entorns.

[Pàgina oficial de instal·lació de Docker](https://docs.docker.com/engine/install/)

#### Windows, Mac i Ubuntu/Debian:

1. Anar a la pàgina oficial de Docker ([https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)) i descarregar Docker Desktop per a Windows o Mac, segons correspongui.
2. Obrir l'instal·lador descarregat i seguir les instruccions per completar la instal·lació.
3. Un cop instal·lat, iniciar Docker Desktop.

#### Linux (terminal):

Si el package manager no és apt, canviar segons convingui.
1. Obrir un terminal.
2. Actualitzar l'índex de paquets: `sudo apt-get update`
3. Instal·lar Docker des de línia de comandes: ``sudo snap install docker``
4. Verificar que Docker s'ha instal·lat correctament executant: `sudo docker run hello-world`
5. Instal·lar altres dependències:
```bash
 sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
 ```

### Preparació del projecte

Abans d'executar el projecte, assegura't que estàs al directori del projecte Greenovation on has trobat els fitxers llistats anteriorment.

#### Construcció de la imatge Docker

1. Obre un terminal al directori del projecte.
2. Executa la comanda següent per construir la imatge Docker del projecte. Aquesta comanda fa ús del `Dockerfile` present al directori. Substitueix `<nom_imatge>` amb un nom per a la teva imatge, per exemple, `greenovation-backend`.

   ```
   docker build -t <nom_imatge> .
   ```

#### Execució del contenidor Docker

Una vegada construïda la imatge, pots executar el contenidor Docker amb la següent comanda:

```
docker run -p 3000:3000 <nom_imatge>
```

Aquesta comanda executa el contenidor i mapeja el port 3000 del contenidor al port 3000 de l'host, permetent-te accedir al backend Express.js des del teu navegador o client HTTP al `localhost:3000`.

### Verificació

Per verificar que el backend està funcionant correctament, obre el teu navegador i visita `http://localhost:3000`. Hauries de veure la pàgina d'inici del projecte Express.js o una resposta JSON, depenent de la configuració inicial del teu projecte.

### Afegir el teu usuari al grup Docker

Després d'instal·lar Docker, per defecte, l'execució de comandes Docker requereix privilegis d'administrador. Per permetre al teu usuari executar comandes Docker sense necessitat d'utilitzar `sudo`, pots afegir el teu usuari al grup `docker`. Això et permetrà gestionar els contenidors Docker de manera més segura i còmoda.

Segueix aquests passos per afegir el teu usuari al grup Docker:

#### 1. Crea el grup Docker si no existeix

En alguns casos, la instal·lació de Docker no crea automàticament el grup `docker`. Pots crear-lo manualment amb el següent comandament:

```bash
sudo groupadd docker
```

#### 2. Afegeix el teu usuari al grup Docker

Substitueix `elteunomdusuari` amb el teu nom d'usuari real. Aquest comandament afegirà el teu usuari al grup `docker`, permetent-li executar comandes Docker sense `sudo`.

```bash
sudo usermod -aG docker $USER
```

#### 3. Aplica els canvis

Per aplicar els canvis i activar el grup `docker` per al teu usuari, hauràs de tancar la sessió i tornar a entrar, o bé reiniciar el sistema. Com a alternativa, pots aplicar els canvis en la sessió actual amb el següent comandament:

```bash
newgrp docker
```

### 4. Verifica la configuració

Per assegurar-te que tot està configurat correctament i que pots executar comandes Docker sense `sudo`, prova de fer correr un contenidor de prova:

```bash
docker run hello-world
```

Si veus el missatge de benvinguda de Docker, tot està configurat correctament i ja pots començar a utilitzar Docker sense necessitat d'utilitzar `sudo` per a cada comandament.

## Configurar Docker per a executar-se en l'arrancada del sistema

Per assegurar que el servei de Docker s'inicia automàticament cada vegada que arrenca el sistema, has d'habilitar el servei Docker perquè s'executi en l'arrancada. Aquesta configuració és útil per assegurar que els teus contenidors Docker poden començar a funcionar immediatament després d'un reinici sense intervenció manual.

Segueix els passos següents per configurar Docker per a executar-se automàticament en l'arrancada del teu sistema Linux:

### Habilitar el servei Docker

1. **Obre un terminal** en el teu sistema Linux.

2. **Executa el següent comandament per habilitar Docker per iniciar-se en l'arrancada**:
   ```bash
   sudo systemctl enable docker
   ```

   Aquest comandament crea un enllaç simbòlic des dels scripts d'arrancada del sistema cap al script de servei de Docker. Això indica al sistema que voldràs que el servei de Docker s'executi automàticament en l'arrancada.

### Comprovar l'estat del servei Docker

Després d'habilitar Docker per executar-se en l'arrancada, pot ser útil comprovar que el servei està configurat correctament.

1. **Per comprovar l'estat del servei Docker**, executa:
   ```bash
   sudo systemctl status docker
   ```

   Hauries de veure informació que indica que el servei està actiu i configurat per iniciar-se en l'arrancada.

### Deshabilitar Docker en l'arrancada

Si en algun moment decideixes que no vols que Docker s'executi automàticament en l'arrancada, pots deshabilitar el servei fàcilment.

1. **Per deshabilitar el servei Docker de l'arrancada automàtica**, executa:
   ```bash
   sudo systemctl disable docker
   ```

   Aquest comandament elimina l'enllaç simbòlic que habilita el servei per l'arrancada, evitant que Docker s'inicii automàticament en el futur.

Fent servir aquests passos, pots controlar fàcilment si vols o no que Docker s'inicii automàticament quan el teu sistema s'engega, facilitant la gestió dels teus contenidors Docker segons les teves necessitats.



----

### Instal·lació local (sense Docker)

Per desenvolupar localment el projecte Greenovation sense utilitzar Docker, segueix aquestes instruccions. Aquesta secció cobreix la instal·lació de Node.js a través de `nvm` (Node Version Manager), que permet gestionar múltiples versions de Node.js, i l'execució dels scripts definits en el `package.json` del projecte.

### Instal·lació de `nvm` i Node.js

`nvm` és una eina que permet instal·lar i utilitzar diferents versions de Node.js. Això és útil per assegurar-se que el projecte corre amb la versió de Node.js per la qual va ser dissenyat.

#### Instal·lació de `nvm`:

##### Linux i Mac:

1. Obre un terminal.
2. Instal·la `nvm` executant:

   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```

   o

   ```
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```

3. Tanca i torna a obrir el terminal.
4. Verifica que `nvm` s'ha instal·lat correctament amb `nvm --version`.

##### Windows:

Per a Windows, `nvm` té una versió alternativa coneguda com `nvm-windows`. Pots trobar les instruccions d'instal·lació en [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows).

#### Instal·lació de Node.js amb `nvm`:

1. Un cop `nvm` estigui instal·lat, pots instal·lar Node.js. Per instal·lar l'última versió LTS (Long Term Support) de Node.js, executa:

   ```
   nvm install node
   ```

2. Després, estableix aquesta versió com la versió per defecte amb:

   ```
   nvm use node
   ```

3. Verifica que Node.js s'ha instal·lat correctament amb `node --version`.

### Execució dels Scripts del Projecte

Dins del directori del projecte Greenovation, pots utilitzar `npm`, el gestor de paquets de Node.js, per executar diferents scripts definits en el `package.json`. Aquí tens com fer-ho:

- **Build**: Compila els fitxers TypeScript a JavaScript. Útil per a la preparació de l'entorn de producció.

  ```
  npm run build
  ```

- **Start**: Executa l'aplicació compilada. Aquest script s'ha de fer servir després de `npm run build`.

  ```
  npm run start
  ```

- **Dev**: Inicia l'aplicació en mode desenvolupament, fent servir `ts-node` per a una experiència de desenvolupament més àgil, ja que no requereix una compilació prèvia.

  ```
  npm run dev
  ```

- **Test**: Executa els tests del projecte utilitzant Jest.

  ```
  npm run test
  ```

### Nota Important

Abans d'executar aquests scripts, assegura't d'instal·lar les dependències del projecte amb `npm install` dins del directori del projecte.

Aquestes instruccions t'ajudaran a desenvolupar el projecte Greenovation localment sense la necessitat de Docker, proporcionant un entorn de desenvolupament flexible que facilita la prova i la depuració del codi.

------

## Col·laborar:
### 1. Generar clau SSH
```ssh-keygen -t ed25519 -C "[CORREU DE GITHUB]"```
Apretar Enter a totes les preguntes fins que s'hagi creat.
### 2. Copiar-la
```cat ~/.ssh/id_ed25519.pub```
o el directori on s'hagi generat la clau
### 3. Afegir la clau al GitHub
Settings -> SSH and GPG keys -> New SSH key -> enganxar la clau
### 4. Afegir la clau SSH localment 
o algo així 
```eval `ssh-agent -s` ```

```ssh-add```
