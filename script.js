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
 * Permite arrastrar una ventana haciendo clic en su handle.
 * @param {HTMLElement} win - La ventana a mover.
 * @param {HTMLElement} handle - Elemento usado para arrastrar.
 */
function makeDraggable(win, handle) {
  handle.addEventListener("mousedown", function (e) {
    let offsetX = e.clientX - win.offsetLeft;
    let offsetY = e.clientY - win.offsetTop;
    
    function mouseMoveHandler(e) {
      win.style.left = (e.clientX - offsetX) + "px";
      win.style.top = (e.clientY - offsetY) + "px";
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

  // Barra de la terminal con botones (similar a las otras ventanas)
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
    </div>
  `;
  win.appendChild(toolbar);

  // Cuerpo de la terminal
  const body = document.createElement("div");
  body.classList.add("terminal-body");
  win.appendChild(body);

  document.getElementById("window-container").appendChild(win);

  makeDraggable(win, toolbar);

  // Agregar funcionalidad de cierre (botón rojo)
  toolbar.querySelector(".circle-12.red").addEventListener("click", function () {
    win.parentElement.removeChild(win);
  });

  setupTerminal(body);
}

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
    
    inputField.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const command = inputField.value.trim().toLowerCase();
        container.innerHTML = `<span class="prompt">${promptText}</span><span class="typed-command">${command}</span>`;
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        processCommand(command, terminalBody, createPrompt);
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

  function processCommand(command, terminalBody, createPrompt) {
    if (command === "") {
      createPrompt();
      return;
    }
    const tokens = command.split(" ");
    const fsCommands = ["ls", "cd", "pwd", "cat", "explorer"];

    // Comandos especiales
    if (tokens[0] === "contact") {
      openContactWindow();
      createPrompt();
      return;
    }
    if (tokens[0] === "about") {
      catFile("about.txt");
      return;
    }
    if (tokens[0] === "projects") {
      openExplorerWindow();
      createPrompt();
      return;
    }
    
    if (fsCommands.includes(tokens[0])) {
      handleFileSystemCommand(tokens, createPrompt);
    } else if (command === "clear") {
      terminalBody.innerHTML = "";
      createPrompt();
    } else if (command === "help") {
      typeLine("Comandos disponibles: ls - cd - pwd - cat - explorer - about - projects - contact - clear", createPrompt);
    } else {
      typeLine("Comando no reconocido. Escribe 'help' para ver los comandos disponibles.", createPrompt);
    }
  }

  function handleFileSystemCommand(tokens, createPrompt) {
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
  
  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
  `;
  win.appendChild(toolsBar);
  
  const content = document.createElement("div");
  content.classList.add("card__content");
  const explorerBody = document.createElement("div");
  explorerBody.classList.add("explorer-body");
  content.appendChild(explorerBody);
  win.appendChild(content);
  document.getElementById("window-container").appendChild(win);
  
  makeDraggable(win, toolsBar);
  
  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
  
  let explorerPath = [...currentPath];
  
  function updateExplorerBody() {
    explorerBody.innerHTML = "";
    const dir = getDirectory(explorerPath);
    
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
    
    for (const key in dir) {
      const item = document.createElement("div");
      item.classList.add("explorer-item");
      if (typeof dir[key] === "object") {
        item.classList.add("folder");
      } else {
        item.classList.add("file");
      }
      item.innerHTML = `<span>${key}</span>`;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof dir[key] === "object") {
          explorerPath.push(key);
          updateExplorerBody();
        } else {
          // En lugar de alert, abrir una ventana que muestre el contenido del archivo
          openFileWindow(key, dir[key]);
        }
      });
      explorerBody.appendChild(item);
    }
  }
  
  updateExplorerBody();
}

/*******************/
/* ABRIR ARCHIVO (Ventana para mostrar contenido de archivos) */
/*******************/
function openFileWindow(fileName, fileContent) {
  // Verifica si ya existe una ventana para este archivo
  const existing = document.getElementById("file-window-" + fileName);
  if (existing) {
    existing.style.zIndex = getNextZIndex();
    return;
  }
  
  const win = document.createElement("div");
  win.classList.add("card");
  win.id = "file-window-" + fileName;
  win.style.top = "300px";
  win.style.left = "300px";
  win.style.zIndex = getNextZIndex();
  
  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
    <span style="margin-left: 10px;">${fileName}</span>
  `;
  win.appendChild(toolsBar);
  
  const content = document.createElement("div");
  content.classList.add("card__content");
  content.innerHTML = `<pre style="white-space: pre-wrap; padding: 10px;">${fileContent}</pre>`;
  win.appendChild(content);
  
  document.getElementById("window-container").appendChild(win);
  makeDraggable(win, toolsBar);
  
  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
}

/*******************/
/* VENTANA AYUDA */
/*******************/
function openHelpWindow() {
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
  
  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
  `;
  win.appendChild(toolsBar);
  
  const content = document.createElement("div");
  content.classList.add("card__content");
  const helpBody = document.createElement("div");
  helpBody.classList.add("help-body");
  content.appendChild(helpBody);
  win.appendChild(content);
  document.getElementById("window-container").appendChild(win);
  
  makeDraggable(win, toolsBar);
  
  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
  
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
    li.addEventListener("click", () => {
      let termWindow = document.getElementById("terminal-window");
      if (!termWindow) {
        openTerminalWindow();
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
/* VENTANA CONTACTO */
/*******************/
function openContactWindow() {
  if (document.getElementById("contact-card")) {
    document.getElementById("contact-card").style.zIndex = getNextZIndex();
    return;
  }
  const win = document.createElement("div");
  win.classList.add("card");
  win.id = "contact-card";
  win.style.top = "250px";
  win.style.left = "250px";
  win.style.zIndex = getNextZIndex();

  const toolsBar = document.createElement("div");
  toolsBar.classList.add("tools");
  toolsBar.innerHTML = `
    <div class="circle"><span class="box red"></span></div>
    <div class="circle"><span class="box yellow"></span></div>
    <div class="circle"><span class="box green"></span></div>
  `;
  win.appendChild(toolsBar);

  const content = document.createElement("div");
  content.classList.add("card__content");
  content.innerHTML = `
    <div style="padding: 1em; text-align: center;">
      <p>gmoficial16@gmail.com</p>
      <p>+123456789</p>
    </div>
  `;
  win.appendChild(content);
  document.getElementById("window-container").appendChild(win);

  makeDraggable(win, toolsBar);

  toolsBar.querySelector(".box.red").addEventListener("click", () => {
    win.parentElement.removeChild(win);
  });
}

/*******************/
/* VENTANA DE NOTAS (STICKY NOTES) */
/*******************/
function openNoteWindow(noteTitle, noteContent, posX = 300, posY = 300) {
  const note = document.createElement("div");
  note.classList.add("note-window");
  note.style.top = posY + "px";
  note.style.left = posX + "px";
  note.style.zIndex = getNextZIndex();

  // Barra superior de la nota con título y botón de cierre
  const noteTools = document.createElement("div");
  noteTools.classList.add("note-tools");
  noteTools.innerHTML = `
    <div class="note-title">${noteTitle}</div>
    <div class="note-close"></div>
  `;
  note.appendChild(noteTools);

  // Opcional: Agregar una sección para la foto del desarrollador
  const noteHeader = document.createElement("div");
  noteHeader.classList.add("note-header");
  noteHeader.style.textAlign = "center";
  noteHeader.style.padding = "5px";
  noteHeader.innerHTML = `<img src="img/mi-foto.jpg" alt="Mi Foto" style="width:50px; height:50px; border-radius:50%;">`;
  note.appendChild(noteHeader);

  // Contenido de la nota
  const noteContentDiv = document.createElement("div");
  noteContentDiv.classList.add("note-content");
  noteContentDiv.innerHTML = `<p>${noteContent}</p>`;
  note.appendChild(noteContentDiv);

  document.getElementById("window-container").appendChild(note);

  makeDraggable(note, noteTools);

  noteTools.querySelector(".note-close").addEventListener("click", () => {
    note.parentElement.removeChild(note);
  });
}

/*******************/
/* EVENTOS DE LOS BOTONES DEL ESCRITORIO */
/*******************/
document.getElementById("icon-terminal").addEventListener("click", openTerminalWindow);
document.getElementById("icon-explorer").addEventListener("click", openExplorerWindow);
document.getElementById("icon-help").addEventListener("click", openHelpWindow);
document.getElementById("icon-notes").addEventListener("click", () => {
  // Abre una nota de ejemplo al hacer clic en el ícono de Notas
  openNoteWindow("Nota", "Esta es una nota interactiva sobre mi trabajo y proyectos.", 350, 300);
});

/*******************/
/* INICIALIZACIÓN: Crear notas predeterminadas */
/*******************/
document.addEventListener("DOMContentLoaded", () => {
  openNoteWindow(
    "Sobre Mí",
    "Soy Martin Gabriel Godinez Morales, desarrollador de software apasionado por crear experiencias interactivas y soluciones innovadoras.",
    320,
    180
  );
  openNoteWindow(
    "Proyectos",
    "Proyecto X: Aplicación web de gestión.\nProyecto Y: Plataforma de e-commerce.",
    600,
    250
  );
  openNoteWindow(
    "Contacto",
    "gmoficial16@gmail.com\n+123456789",
    450,
    400
  );
});
