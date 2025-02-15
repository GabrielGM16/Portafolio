/*******************/
/* SISTEMA DE ARCHIVOS */
/*******************/
const fileSystem = {
  "home": {
    "about.txt": "Soy Martin Gabriel Godinez Morales, desarrollador de software.",
    "projects": {
      "project1.txt": "Descripción del proyecto 1",
      "project2.txt": "Descripción del proyecto 2"
    },
    "contact.txt": "gmoficial16@gmail.com"
  }
};

let currentPath = ["home"];

function getDirectory(pathArray) {
  let dir = fileSystem;
  for (let i = 0; i < pathArray.length; i++) {
    if (dir && dir.hasOwnProperty(pathArray[i])) {
      dir = dir[pathArray[i]];
    } else {
      return null;
    }
  }
  return dir;
}

/*******************/
/* UTILIDADES PARA VENTANAS */
/*******************/
let currentZIndex = 200;
function getNextZIndex() {
  return ++currentZIndex;
}

/**
 * makeDraggable(win, handle)
 * Permite arrastrar el elemento `win` haciendo clic en `handle`.
 */
function makeDraggable(win, handle) {
  handle.addEventListener("mousedown", function(e) {
    let offsetX = e.clientX - win.offsetLeft;
    let offsetY = e.clientY - win.offsetTop;
    
    function mouseMoveHandler(e) {
      win.style.left = (e.clientX - offsetX) + 'px';
      win.style.top = (e.clientY - offsetY) + 'px';
      win.style.zIndex = getNextZIndex();
    }
    
    function mouseUpHandler() {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    }
    
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  });
}

/*******************/
/* VENTANA TERMINAL */
/*******************/
function openTerminalWindow() {
  // Si ya existe la terminal, la traemos al frente.
  if (document.getElementById("terminal-window")) {
    document.getElementById("terminal-window").style.zIndex = getNextZIndex();
    return;
  }

  const win = document.createElement("div");
  win.classList.add("window");
  win.id = "terminal-window";
  win.style.top = "50px";
  win.style.left = "100px";
  win.style.width = "800px";
  win.style.height = "400px";
  win.style.zIndex = getNextZIndex();

  // Encabezado personalizado de la terminal
  const toolbar = document.createElement("div");
  toolbar.classList.add("terminal-toolbar");
  toolbar.innerHTML = `
    <div class="toolbar-header">
      <div class="button-group">
        <div class="circle-12 red"></div>
        <div class="circle-12 yellow"></div>
        <div class="circle-12 green"></div>
      </div>
      <span class="terminal-title">Terminal - Martin Gabriel Godinez Morales</span>
      <!-- Podrías usar un botón "+" aquí si deseas -->
    </div>
  `;
  win.appendChild(toolbar);

  // Cuerpo de la terminal
  const body = document.createElement("div");
  body.classList.add("terminal-body");
  win.appendChild(body);

  document.getElementById("window-container").appendChild(win);

  // Hacer la ventana arrastrable usando el encabezado personalizado
  makeDraggable(win, toolbar);

  // Cerrar la ventana con el "botón" rojo
  toolbar.querySelector(".red").addEventListener("click", function() {
    win.parentElement.removeChild(win);
  });

  // Configurar la terminal (prompt, historial, comandos, etc.)
  setupTerminal(body);
}

/* Configuración de la terminal (prompt, comandos, historial, etc.) */
function setupTerminal(terminalBody) {
  const promptText = "gmorales@portafolio:~$";
  let commandHistory = [];
  let historyIndex = 0;
  
  function typeLine(text, callback) {
    const p = document.createElement("p");
    terminalBody.appendChild(p);
    let index = 0;
    function typeChar() {
      if (index < text.length) {
        p.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeChar, 20);
      } else {
        if (callback) callback();
      }
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    typeChar();
  }
  
  function createPrompt() {
    const container = document.createElement("div");
    container.classList.add("command-line");
    container.innerHTML = `
      <span class="prompt">${promptText}</span>
      <input type="text" class="commandInput" autocomplete="off" autofocus />
    `;
    terminalBody.appendChild(container);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    
    const inputField = container.querySelector(".commandInput");
    inputField.focus();
    
    inputField.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const command = inputField.value.trim().toLowerCase();
        
        // Mostramos el comando final
        container.innerHTML = `
          <span class="prompt">${promptText}</span>
          <span class="typed-command">${command}</span>
        `;
        
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        processCommand(command);
      } else if (event.key === "ArrowUp") {
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          inputField.value = commandHistory[historyIndex];
        }
        event.preventDefault();
      } else if (event.key === "ArrowDown") {
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
          historyIndex++;
          inputField.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          inputField.value = "";
        }
        event.preventDefault();
      }
    });
  }
  
  // Comandos básicos
  const commands = {
    "help": "Comandos disponibles: ls - cd - pwd - cat - explorer - about - projects - contact - clear"
  };
  
  function listDirectory() {
    const dir = getDirectory(currentPath);
    let result = "";
    for (const key in dir) {
      if (typeof dir[key] === "object") {
        result += key + "/  ";
      } else {
        result += key + "  ";
      }
    }
    typeLine(result, createPrompt);
  }
  
  function changeDirectory(dirName) {
    if (dirName === "..") {
      if (currentPath.length > 1) {
        currentPath.pop();
        typeLine("Directorio cambiado a /" + currentPath.join("/"), createPrompt);
      } else {
        typeLine("No se puede retroceder más.", createPrompt);
      }
    } else {
      const dir = getDirectory(currentPath);
      if (dir && dir.hasOwnProperty(dirName) && typeof dir[dirName] === "object") {
        currentPath.push(dirName);
        typeLine("Directorio cambiado a /" + currentPath.join("/"), createPrompt);
      } else {
        typeLine("Directorio no encontrado.", createPrompt);
      }
    }
  }
  
  function printWorkingDirectory() {
    typeLine("/" + currentPath.join("/"), createPrompt);
  }
  
  function catFile(fileName) {
    const dir = getDirectory(currentPath);
    if (dir && dir.hasOwnProperty(fileName) && typeof dir[fileName] === "string") {
      typeLine(dir[fileName], createPrompt);
    } else {
      typeLine("Archivo no encontrado o es un directorio.", createPrompt);
    }
  }
  
  function processCommand(command) {
    if (command === "") {
      createPrompt();
      return;
    }
    const tokens = command.split(" ");
    const fsCommands = ["ls", "cd", "pwd", "cat", "explorer"];
    if (fsCommands.includes(tokens[0])) {
      handleFileSystemCommand(tokens);
    } else if (commands.hasOwnProperty(command)) {
      if (command === "clear") {
        terminalBody.innerHTML = "";
        createPrompt();
      } else {
        typeLine(commands[command], createPrompt);
      }
    } else {
      // Podrías mapear "about", "projects", "contact" a catFile si quieres
      typeLine("Comando no reconocido. Escribe 'help' para ver los comandos disponibles.", createPrompt);
    }
  }
  
  function handleFileSystemCommand(tokens) {
    const cmd = tokens[0];
    if (cmd === "ls") {
      listDirectory();
    } else if (cmd === "cd") {
      if (tokens.length < 2) {
        typeLine("Uso: cd <directorio>", createPrompt);
      } else {
        changeDirectory(tokens[1]);
      }
    } else if (cmd === "pwd") {
      printWorkingDirectory();
    } else if (cmd === "cat") {
      if (tokens.length < 2) {
        typeLine("Uso: cat <archivo>", createPrompt);
      } else {
        catFile(tokens[1]);
      }
    } else if (cmd === "explorer") {
      openExplorerWindow();
    } else {
      typeLine("Comando no reconocido.", createPrompt);
    }
  }
  
  function printWelcomeMessage() {
    const messages = [
      "Bienvenido a mi portafolio interactivo.",
      "Escribe 'help' para ver los comandos disponibles."
    ];
    let i = 0;
    function printNext() {
      if (i < messages.length) {
        typeLine(messages[i], () => {
          i++;
          printNext();
        });
      } else {
        createPrompt();
      }
    }
    printNext();
  }
  
  printWelcomeMessage();
}

/*******************/
/* VENTANA EXPLORADOR (ESTILO CARD) */
/*******************/
function openExplorerWindow() {
  // Si ya existe, la traemos al frente
  if (document.getElementById("explorer-card")) {
    document.getElementById("explorer-card").style.zIndex = getNextZIndex();
    return;
  }
  
  const win = document.createElement("div");
  win.classList.add("card");
  win.id = "explorer-card";
  win.style.top = "150px";
  win.style.left = "150px";
  win.style.zIndex = getNextZIndex();
  
  // "tools" (barra superior con círculos)
  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
  `;
  win.appendChild(toolsBar);
  
  // Contenido principal
  const content = document.createElement("div");
  content.classList.add("card__content");
  // Dentro de card__content ponemos el body del explorador
  const explorerBody = document.createElement("div");
  explorerBody.classList.add("explorer-body");
  content.appendChild(explorerBody);
  
  win.appendChild(content);
  document.getElementById("window-container").appendChild(win);
  
  // Hacemos la ventana arrastrable con la barra "tools"
  makeDraggable(win, toolsBar);
  
  // Cerrar al hacer clic en el círculo rojo
  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
  
  // Lógica del explorador
  let explorerPath = [...currentPath];
  
  function updateExplorerBody() {
    explorerBody.innerHTML = ""; // Limpiar el contenido
    console.log("Ruta actual:", explorerPath);
    console.log("Contenido de directorio:", getDirectory(explorerPath)); 

    const dir = getDirectory(explorerPath);

    // Botón para subir un nivel (si no estamos en la raíz)
    if (explorerPath.length > 1) {
        const upItem = document.createElement("div");
        upItem.classList.add("explorer-item", "folder");
        upItem.innerHTML = `<span>..</span>`;
        upItem.addEventListener("click", (e) => {
            e.stopPropagation();
            explorerPath.pop();
            updateExplorerBody();
        });
        explorerBody.appendChild(upItem);
    }

    // Crear elementos de archivos y carpetas
    for (const key in dir) {
        const item = document.createElement("div");
        item.classList.add("explorer-item");

        if (typeof dir[key] === "object") {
            item.classList.add("folder"); // Si es un directorio
        } else {
            item.classList.add("file"); // Si es un archivo
        }

        item.innerHTML = `<span>${key}</span>`;

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof dir[key] === "object") {
                explorerPath.push(key);
                updateExplorerBody();
            } else {
                alert(`Archivo seleccionado: ${key}`);
            }
        });

        explorerBody.appendChild(item);
    }
}

// Inicializar la vista del explorador
updateExplorerBody();
}


/*******************/
/* VENTANA AYUDA (ESTILO CARD) */
/*******************/
function openHelpWindow() {
  // Si ya existe la ventana de ayuda, la traemos al frente
  if (document.getElementById("help-card")) {
    document.getElementById("help-card").style.zIndex = getNextZIndex();
    return;
  }
  
  const win = document.createElement("div");
  win.classList.add("card");
  win.id = "help-card";
  win.style.top = "200px";
  win.style.left = "200px";
  win.style.zIndex = getNextZIndex();
  
  // Barra superior con círculos
  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
  `;
  win.appendChild(toolsBar);
  
  // Contenido principal
  const content = document.createElement("div");
  content.classList.add("card__content");
  const helpBody = document.createElement("div");
  helpBody.classList.add("help-body");
  content.appendChild(helpBody);
  
  win.appendChild(content);
  document.getElementById("window-container").appendChild(win);
  
  // Arrastrable
  makeDraggable(win, toolsBar);
  
  // Cerrar con el círculo rojo
  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
  
  // Lista de comandos (ejemplo)
  const commandsList = [
    "ls - listar directorio",
    "cd <directorio> - cambiar directorio",
    "pwd - mostrar ruta actual",
    "cat <archivo> - ver contenido de un archivo",
    "explorer - abrir explorador de archivos",
    "about - sobre mí",
    "projects - mis proyectos",
    "contact - información de contacto",
    "clear - limpiar terminal",
    "help - mostrar esta ayuda"
  ];
  
  const ul = document.createElement("ul");
  commandsList.forEach(cmd => {
    const li = document.createElement("li");
    li.textContent = cmd;
    // Al hacer clic, abrimos (o traemos al frente) la Terminal
    li.addEventListener("click", () => {
      let termWindow = document.getElementById("terminal-window");
      if (!termWindow) {
        openTerminalWindow();
        // Esperamos un momento a que se cree la terminal
        setTimeout(() => {
          const inputField = document.querySelector(".commandInput");
          if (inputField) {
            inputField.value = cmd.split(" ")[0];
            inputField.focus();
          }
        }, 300);
      } else {
        const inputField = termWindow.querySelector(".commandInput");
        if (inputField) {
          inputField.value = cmd.split(" ")[0];
          inputField.focus();
        }
      }
    });
    ul.appendChild(li);
  });
  helpBody.appendChild(ul);
}

/*******************/
/* EVENTOS DE LOS BOTONES DEL ESCRITORIO */
/*******************/
document.getElementById("icon-terminal").addEventListener("click", openTerminalWindow);
document.getElementById("icon-explorer").addEventListener("click", openExplorerWindow);
document.getElementById("icon-help").addEventListener("click", openHelpWindow);
