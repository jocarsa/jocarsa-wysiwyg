window.JocarsaWysiwyg = (function(){

	function guardarRango(instancia){
		let sel = window.getSelection();
		if(sel.rangeCount > 0){
			let rango = sel.getRangeAt(0);
			if(instancia.editor.contains(rango.commonAncestorContainer)){
				instancia.ultimoRango = rango.cloneRange();
			}
		}
	}

	function restaurarRango(instancia){
		if(instancia.ultimoRango){
			let sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(instancia.ultimoRango);
		}
	}

	function sincronizarTextarea(instancia){
		instancia.textarea.value = instancia.editor.innerHTML;
	}

	function ponerCursorDentro(nodo, instancia){
		let sel = window.getSelection();
		let rango = document.createRange();

		if(nodo.firstChild){
			if(nodo.firstChild.nodeType === 3){
				rango.setStart(nodo.firstChild, nodo.firstChild.textContent.length);
			}else{
				rango.selectNodeContents(nodo);
				rango.collapse(false);
			}
		}else{
			nodo.appendChild(document.createTextNode(""));
			rango.setStart(nodo.firstChild, 0);
		}

		rango.collapse(true);
		sel.removeAllRanges();
		sel.addRange(rango);
		guardarRango(instancia);
	}

	function enfocarYRestaurar(instancia){
		instancia.editor.focus();
		restaurarRango(instancia);
	}

	function ejecutarComando(instancia, comando, valor = null){
		enfocarYRestaurar(instancia);
		document.execCommand(comando, false, valor);
		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function aplicarBloque(instancia, tag){
		enfocarYRestaurar(instancia);

		if(tag === "p"){
			document.execCommand("formatBlock", false, "<p>");
		}else{
			document.execCommand("formatBlock", false, `<${tag}>`);
		}

		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function insertarHtml(instancia, html){
		enfocarYRestaurar(instancia);
		document.execCommand("insertHTML", false, html);
		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function crearTabla(instancia){
		let filas = parseInt(prompt("Número de filas", "2"), 10);
		if(!filas || filas < 1) return;

		let columnas = parseInt(prompt("Número de columnas", "2"), 10);
		if(!columnas || columnas < 1) return;

		let html = '<table class="jocarsa-wysiwyg-tabla"><tbody>';

		for(let i = 0; i < filas; i++){
			html += "<tr>";
			for(let j = 0; j < columnas; j++){
				html += "<td>&nbsp;</td>";
			}
			html += "</tr>";
		}

		html += "</tbody></table><p><br></p>";
		insertarHtml(instancia, html);
	}

	function insertarEnlace(instancia){
		enfocarYRestaurar(instancia);
		let url = prompt("Introduce la URL", "https://");
		if(!url) return;
		document.execCommand("createLink", false, url);
		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function quitarEnlace(instancia){
		ejecutarComando(instancia, "unlink");
	}

	function limpiarFormato(instancia){
		enfocarYRestaurar(instancia);
		document.execCommand("removeFormat", false, null);
		document.execCommand("unlink", false, null);
		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function crearBoton(html, titulo, onClick, claseExtra = ""){
		let boton = document.createElement("button");
		boton.type = "button";
		boton.className = claseExtra ? "jocarsa-wysiwyg-boton " + claseExtra : "jocarsa-wysiwyg-boton";
		boton.innerHTML = html;
		boton.title = titulo;
		boton.addEventListener("click", onClick);
		return boton;
	}

	function crearSelect(titulo, opciones, onChange, claseExtra = ""){
		let select = document.createElement("select");
		select.className = claseExtra ? "jocarsa-wysiwyg-select " + claseExtra : "jocarsa-wysiwyg-select";
		select.title = titulo;

		opciones.forEach(function(op){
			let option = document.createElement("option");
			option.value = op.value;
			option.textContent = op.label;
			if(op.selected) option.selected = true;
			select.appendChild(option);
		});

		select.addEventListener("change", onChange);
		return select;
	}

	function crearColorPicker(titulo, valorInicial, onInput){
		let input = document.createElement("input");
		input.type = "color";
		input.className = "jocarsa-wysiwyg-color";
		input.title = titulo;
		input.value = valorInicial;
		input.addEventListener("input", onInput);
		return input;
	}

	function crearBarra(instancia){
		let barra = document.createElement("div");
		barra.className = "jocarsa-wysiwyg-barra";

		let heading = crearSelect("Bloque", [
			{ value:"", label:"Normal", selected:true },
			{ value:"p", label:"Párrafo" },
			{ value:"h1", label:"Encabezado 1" },
			{ value:"h2", label:"Encabezado 2" },
			{ value:"h3", label:"Encabezado 3" },
			{ value:"h4", label:"Encabezado 4" },
			{ value:"h5", label:"Encabezado 5" },
			{ value:"h6", label:"Encabezado 6" },
			{ value:"blockquote", label:"Cita" }
		], function(){
			if(this.value !== ""){
				aplicarBloque(instancia, this.value);
				this.value = "";
			}
		});

		let fontFamily = crearSelect("Familia tipográfica", [
			{ value:"", label:"Fuente", selected:true },
			{ value:"Arial", label:"Arial" },
			{ value:"Helvetica", label:"Helvetica" },
			{ value:"Georgia", label:"Georgia" },
			{ value:"Times New Roman", label:"Times New Roman" },
			{ value:"Courier New", label:"Courier New" },
			{ value:"Verdana", label:"Verdana" },
			{ value:"Tahoma", label:"Tahoma" },
			{ value:"Trebuchet MS", label:"Trebuchet MS" }
		], function(){
			if(this.value !== ""){
				ejecutarComando(instancia, "fontName", this.value);
				this.value = "";
			}
		});

		let fontSize = crearSelect("Tamaño de fuente", [
			{ value:"", label:"Tamaño", selected:true },
			{ value:"1", label:"Muy pequeño" },
			{ value:"2", label:"Pequeño" },
			{ value:"3", label:"Normal" },
			{ value:"4", label:"Mediano" },
			{ value:"5", label:"Grande" },
			{ value:"6", label:"Muy grande" },
			{ value:"7", label:"Enorme" }
		], function(){
			if(this.value !== ""){
				ejecutarComando(instancia, "fontSize", this.value);
				this.value = "";
			}
		});

		let textoColor = crearColorPicker("Color del texto", "#222222", function(){
			ejecutarComando(instancia, "foreColor", this.value);
		});

		let fondoColor = crearColorPicker("Color de resaltado", "#fff59d", function(){
			ejecutarComando(instancia, "hiliteColor", this.value);
		});

		let separador1 = document.createElement("div");
		separador1.className = "jocarsa-wysiwyg-separador";

		let bold = crearBoton("<b>B</b>", "Negrita", function(){
			ejecutarComando(instancia, "bold");
		});

		let italic = crearBoton("<i>I</i>", "Cursiva", function(){
			ejecutarComando(instancia, "italic");
		});

		let underline = crearBoton("<u>U</u>", "Subrayado", function(){
			ejecutarComando(instancia, "underline");
		});

		let strike = crearBoton("<s>S</s>", "Tachado", function(){
			ejecutarComando(instancia, "strikeThrough");
		});

		let separador2 = document.createElement("div");
		separador2.className = "jocarsa-wysiwyg-separador";

		let ul = crearBoton("• Lista", "Lista desordenada", function(){
			ejecutarComando(instancia, "insertUnorderedList");
		});

		let ol = crearBoton("1. Lista", "Lista ordenada", function(){
			ejecutarComando(instancia, "insertOrderedList");
		});

		let quote = crearBoton("❝", "Cita", function(){
			aplicarBloque(instancia, "blockquote");
		});

		let hr = crearBoton("―", "Línea horizontal", function(){
			insertarHtml(instancia, "<hr>");
		});

		let tabla = crearBoton("Tabla", "Insertar tabla", function(){
			crearTabla(instancia);
		});

		let separador3 = document.createElement("div");
		separador3.className = "jocarsa-wysiwyg-separador";

		let left = crearBoton("⟸", "Alinear a la izquierda", function(){
			ejecutarComando(instancia, "justifyLeft");
		});

		let center = crearBoton("≡", "Centrar", function(){
			ejecutarComando(instancia, "justifyCenter");
		});

		let right = crearBoton("⟹", "Alinear a la derecha", function(){
			ejecutarComando(instancia, "justifyRight");
		});

		let justify = crearBoton("☰", "Justificar", function(){
			ejecutarComando(instancia, "justifyFull");
		});

		let separador4 = document.createElement("div");
		separador4.className = "jocarsa-wysiwyg-separador";

		let link = crearBoton("Enlace", "Insertar enlace", function(){
			insertarEnlace(instancia);
		});

		let unlink = crearBoton("Quitar enlace", "Eliminar enlace", function(){
			quitarEnlace(instancia);
		});

		let clear = crearBoton("Limpiar", "Limpiar formato", function(){
			limpiarFormato(instancia);
		});

		let undo = crearBoton("↶", "Deshacer", function(){
			ejecutarComando(instancia, "undo");
		});

		let redo = crearBoton("↷", "Rehacer", function(){
			ejecutarComando(instancia, "redo");
		});

		barra.appendChild(heading);
		barra.appendChild(fontFamily);
		barra.appendChild(fontSize);
		barra.appendChild(textoColor);
		barra.appendChild(fondoColor);

		barra.appendChild(separador1);

		barra.appendChild(bold);
		barra.appendChild(italic);
		barra.appendChild(underline);
		barra.appendChild(strike);

		barra.appendChild(separador2);

		barra.appendChild(ul);
		barra.appendChild(ol);
		barra.appendChild(quote);
		barra.appendChild(hr);
		barra.appendChild(tabla);

		barra.appendChild(separador3);

		barra.appendChild(left);
		barra.appendChild(center);
		barra.appendChild(right);
		barra.appendChild(justify);

		barra.appendChild(separador4);

		barra.appendChild(link);
		barra.appendChild(unlink);
		barra.appendChild(clear);
		barra.appendChild(undo);
		barra.appendChild(redo);

		return barra;
	}

	function crearEditor(textarea){
		if(textarea.dataset.jocarsaWysiwygInicializado === "1"){
			return;
		}

		let contenedor = document.createElement("div");
		contenedor.className = "jocarsa-wysiwyg-contenedor";

		let editor = document.createElement("div");
		editor.className = "jocarsa-wysiwyg-editor";
		editor.contentEditable = true;
		editor.spellcheck = true;

		editor.innerHTML = textarea.value.trim() || "<p><br></p>";

		textarea.classList.add("jocarsa-wysiwyg-textarea-oculto");

		let padre = textarea.parentNode;
		padre.insertBefore(contenedor, textarea);

		contenedor.appendChild(textarea);

		let instancia = {
			textarea: textarea,
			editor: editor,
			ultimoRango: null
		};

		let barra = crearBarra(instancia);

		contenedor.appendChild(barra);
		contenedor.appendChild(editor);

		editor.addEventListener("mouseup", function(){
			guardarRango(instancia);
		});

		editor.addEventListener("keyup", function(){
			guardarRango(instancia);
			sincronizarTextarea(instancia);
		});

		editor.addEventListener("input", function(){
			guardarRango(instancia);
			sincronizarTextarea(instancia);
		});

		editor.addEventListener("focus", function(){
			guardarRango(instancia);
		});

		editor.addEventListener("blur", function(){
			sincronizarTextarea(instancia);
		});

		editor.addEventListener("paste", function(e){
			e.preventDefault();

			let html = (e.clipboardData || window.clipboardData).getData("text/html");
			let text = (e.clipboardData || window.clipboardData).getData("text/plain");

			if(html && html.trim() !== ""){
				document.execCommand("insertHTML", false, html);
			}else{
				document.execCommand("insertText", false, text);
			}

			sincronizarTextarea(instancia);
			guardarRango(instancia);
		});

		textarea.dataset.jocarsaWysiwygInicializado = "1";
		sincronizarTextarea(instancia);
	}

	function init(contexto = document){
		let areas = contexto.querySelectorAll("textarea.jocarsa-wysiwyg");
		areas.forEach(function(textarea){
			crearEditor(textarea);
		});
	}

	document.addEventListener("DOMContentLoaded", function(){
		init();
	});

	return {
		init: init
	};

})();
