document.addEventListener("DOMContentLoaded", () => {
    const terminalBody = document.getElementById("terminal-body");
    const promptText = "gmorales@portafolio:~$";
    
    // Objeto con comandos y sus respuestas
    const commands = {
      "help": "Comandos disponibles: help, about, projects, contact, clear",
      "about": "Soy Martin Gabriel Godinez Morales, desarrollador de software apasionado por la tecnología y la innovación.",
      "projects": "Mis proyectos incluyen:<br>- Proyecto 1: Descripción breve.<br>- Proyecto 2: Descripción breve.",
      "contact": "Puedes contactarme en:<br>Email: martin@example.com<br>GitHub: github.com/martin",
      "clear": "clear"
    };
  
    // Variables para manejar el historial de comandos
    let commandHistory = [];
    let historyIndex = 0;
  
    /**
     * Función para mostrar texto con efecto de máquina de escribir.
     * @param {string} text - Texto a escribir.
     * @param {function} callback - Función a ejecutar al finalizar.
     */
    function typeLine(text, callback) {
      const p = document.createElement("p");
      terminalBody.appendChild(p);
      let index = 0;
      function typeChar() {
        if (index < text.length) {
          p.innerHTML += text.charAt(index);
          index++;
          setTimeout(typeChar, 30); // Puedes ajustar la velocidad aquí
        } else {
          if (callback) callback();
        }
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
      typeChar();
    }
  
    /**
     * Crea una nueva línea de comando (prompt + input) y la añade al final.
     */
    function createPrompt() {
      const container = document.createElement("div");
      container.classList.add("command-line");
      container.innerHTML = `<span class="prompt">${promptText}</span> <input type="text" class="commandInput" autocomplete="off" autofocus />`;
      terminalBody.appendChild(container);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      
      const inputField = container.querySelector(".commandInput");
      inputField.focus();
  
      // Manejo de teclas para el input
      inputField.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const command = inputField.value.trim().toLowerCase();
          // Fijamos el comando escrito, eliminando el input
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
  
    /**
     * Procesa el comando ingresado.
     * @param {string} command - Comando a procesar.
     */
    function processCommand(command) {
      if (command === "") {
        createPrompt();
        return;
      }
      if (commands.hasOwnProperty(command)) {
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
  
    /**
     * Imprime un mensaje de bienvenida y, al finalizar, crea el primer prompt.
     */
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
  });
  