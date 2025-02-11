/*******************/
/* SISTEMA DE ARCHIVOS*/
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

function makeDraggable(win, header) {
  header.addEventListener("mousedown", function(e) {
    let offsetX = e.clientX - win.offsetLeft;
    let offsetY = e.clientY - win.offsetTop;
    
    function mouseMoveHandler(e) {
      win.style.left = (e.clientX - offsetX) + 'px';
      win.style.top = (e.clientY - offsetY) + 'px';
      win.style.zIndex = getNextZIndex();
    }
    
    function mouseUpHandler() {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    }
    
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  });
}

/*******************/
/* VENTANA TERMINAL */
/*******************/
function openTerminalWindow() {
  // Si ya existe la terminal, la traemos al frente.
  if (document.getElementById('terminal-window')) {
    document.getElementById('terminal-window').style.zIndex = getNextZIndex();
    return;
  }
  
  const win = document.createElement("div");
  win.classList.add("window", "terminal-window");
  win.id = "terminal-window";
  win.style.top = "50px";
  win.style.left = "100px";
  win.style.width = "800px";
  win.style.height = "400px";
  win.style.zIndex = getNextZIndex();
  
  // Encabezado
  const header = document.createElement("div");
  header.classList.add("window-header");
  header.innerHTML = `
    <span class="window-title">Terminal - Martin Gabriel Godinez Morales</span>
    <div class="window-controls">
      <span class="control-btn minimize"></span>
      <span class="control-btn close"></span>
    </div>
  `;
  win.appendChild(header);
  
  // Cuerpo (área de la terminal)
  const body = document.createElement("div");
  body.classList.add("terminal-body");
  win.appendChild(body);
  
  document.getElementById("window-container").appendChild(win);
  
  makeDraggable(win, header);
  
  // Cerrar la ventana
  header.querySelector(".control-btn.close").addEventListener("click", function() {
    win.parentElement.removeChild(win);
  });
  
  // Configura la terminal
  setupTerminal(body);
}

/* Función que configura la terminal (prompt, historial, comandos, etc.) */
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
        setTimeout(typeChar, 30);
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
    container.innerHTML = `<span class="prompt">${promptText}</span> <input type="text" class="commandInput" autocomplete="off" autofocus />`;
    terminalBody.appendChild(container);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    
    const inputField = container.querySelector(".commandInput");
    inputField.focus();
    
    inputField.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const command = inputField.value.trim().toLowerCase();
        container.innerHTML = `<span class="prompt">${promptText}</span> ${command}`;
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
  
  // Comandos básicos (puedes ampliar o modificar)
  const commands = {
    "help": "Comandos disponibles: ls - cd - pwd - cat - explorer - about - projects - contact - clear"
  };
  
  // Funciones del sistema de archivos (se usan las variables globales fileSystem y currentPath)
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
      if (dir.hasOwnProperty(dirName) && typeof dir[dirName] === "object") {
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
    if (dir.hasOwnProperty(fileName) && typeof dir[fileName] === "string") {
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
/* VENTANA EXPLORADOR */
/*******************/
function openExplorerWindow() {

  let explorerPath = [...currentPath];
  
  const win = document.createElement("div");
  win.classList.add("window", "explorer-window");
  win.style.top = "150px";
  win.style.left = "150px";
  win.style.width = "600px";
  win.style.height = "400px";
  win.style.zIndex = getNextZIndex();
  
  const header = document.createElement("div");
  header.classList.add("window-header");
  header.innerHTML = `
    <span class="window-title">Explorador - /${explorerPath.join("/")}</span>
    <div class="window-controls">
      <span class="control-btn minimize"></span>
      <span class="control-btn close"></span>
    </div>
  `;
  win.appendChild(header);
  
  const body = document.createElement("div");
  body.classList.add("explorer-body");
  win.appendChild(body);
  
  document.getElementById("window-container").appendChild(win);
  
  makeDraggable(win, header);
  
  header.querySelector(".control-btn.close").addEventListener("click", function() {
    win.parentElement.removeChild(win);
  });
  
  function updateExplorerBody() {
    body.innerHTML = "";
    // Si no estamos en la raíz, mostrar la opción de subir (..)
    if (explorerPath.length > 1) {
      const upItem = document.createElement("div");
      upItem.classList.add("explorer-item", "folder");
      upItem.dataset.name = "..";
      upItem.innerHTML = `<span>..</span>`;
      upItem.addEventListener("click", () => {
        explorerPath.pop();
        header.querySelector(".window-title").textContent = "Explorador - /" + explorerPath.join("/");
        updateExplorerBody();
      });
      body.appendChild(upItem);
    }
    const currentDir = getDirectory(explorerPath);
    for (const key in currentDir) {
      const item = document.createElement("div");
      if (typeof currentDir[key] === "object") {
        item.classList.add("explorer-item", "folder");
      } else {
        item.classList.add("explorer-item", "file");
      }
      item.dataset.name = key;
      item.innerHTML = `<span>${key}</span>`;
      item.addEventListener("click", () => {
        if (typeof currentDir[key] === "object") {
          explorerPath.push(key);
          header.querySelector(".window-title").textContent = "Explorador - /" + explorerPath.join("/");
          updateExplorerBody();
        } else {
          alert(currentDir[key]);
        }
      });
      body.appendChild(item);
    }
  }
  
  updateExplorerBody();
}

/*******************/
/* VENTANA AYUDA (comandos) */
/*******************/
function openHelpWindow() {
  // Si ya existe la ventana de ayuda, la traemos al frente
  if (document.getElementById("help-window")) {
    document.getElementById("help-window").style.zIndex = getNextZIndex();
    return;
  }
  
  const win = document.createElement("div");
  win.classList.add("window", "help-window");
  win.id = "help-window";
  win.style.top = "200px";
  win.style.left = "200px";
  win.style.width = "300px";
  win.style.height = "300px";
  win.style.zIndex = getNextZIndex();
  
  const header = document.createElement("div");
  header.classList.add("window-header");
  header.innerHTML = `
    <span class="window-title">Ayuda - Comandos</span>
    <div class="window-controls">
      <span class="control-btn minimize"></span>
      <span class="control-btn close"></span>
    </div>
  `;
  win.appendChild(header);
  
  const body = document.createElement("div");
  body.classList.add("help-body");
  win.appendChild(body);
  
  // Lista de comandos (puedes ampliarla o hacerla interactiva)
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
    // Opcional: al hacer clic se puede abrir o rellenar el comando en la terminal.
    li.addEventListener("click", () => {
      // Si la terminal no está abierta, la abrimos.
      let termWindow = document.getElementById("terminal-window");
      if (!termWindow) {
        openTerminalWindow();
        // Se podría simular que se ingresa el comando (según la lógica de tu terminal).
      } else {
        const inputField = termWindow.querySelector(".commandInput");
        if (inputField) {
          // Por ejemplo, colocar el comando completo en el input.
          inputField.value = cmd.split(" ")[0];
          inputField.focus();
        }
      }
    });
    ul.appendChild(li);
  });
  body.appendChild(ul);
  
  document.getElementById("window-container").appendChild(win);
  
  makeDraggable(win, header);
  
  header.querySelector(".control-btn.close").addEventListener("click", function() {
    win.parentElement.removeChild(win);
  });
}

/*******************/
/* EVENTOS DE LOS ÍCONOS DE ESCRITORIO */
/*******************/
document.getElementById("icon-terminal").addEventListener("click", function() {
  openTerminalWindow();
});
document.getElementById("icon-explorer").addEventListener("click", function() {
  openExplorerWindow();
});
document.getElementById("icon-help").addEventListener("click", function() {
  openHelpWindow();
});
