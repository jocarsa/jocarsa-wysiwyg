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
			rango.setStart(nodo.firstChild, nodo.firstChild.textContent.length);
		}else{
			nodo.appendChild(document.createTextNode(""));
			rango.setStart(nodo.firstChild,0);
		}

		rango.collapse(true);
		sel.removeAllRanges();
		sel.addRange(rango);
		guardarRango(instancia);
	}

	function aplicarSpan(instancia, estilos){
		instancia.editor.focus();
		restaurarRango(instancia);

		let sel = window.getSelection();
		if(sel.rangeCount === 0) return;

		let rango = sel.getRangeAt(0);

		if(!instancia.editor.contains(rango.commonAncestorContainer)) return;

		let span = document.createElement("span");

		for(let propiedad in estilos){
			span.style[propiedad] = estilos[propiedad];
		}

		if(rango.collapsed){
			span.innerHTML = "&#8203;";
			rango.insertNode(span);
			ponerCursorDentro(span, instancia);
			sincronizarTextarea(instancia);
			return;
		}

		let contenido = rango.extractContents();
		span.appendChild(contenido);
		rango.insertNode(span);

		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function aplicarBloque(instancia, tag){
		instancia.editor.focus();
		restaurarRango(instancia);

		let sel = window.getSelection();
		if(sel.rangeCount === 0) return;

		let rango = sel.getRangeAt(0);

		let nodo = document.createElement(tag);

		if(rango.collapsed){
			nodo.innerHTML = "&#8203;";
			rango.insertNode(nodo);
			ponerCursorDentro(nodo, instancia);
			sincronizarTextarea(instancia);
			return;
		}

		let contenido = rango.extractContents();
		nodo.appendChild(contenido);
		rango.insertNode(nodo);

		sincronizarTextarea(instancia);
		guardarRango(instancia);
	}

	function crearBarra(instancia){
		let barra = document.createElement("div");
		barra.className = "jocarsa-wysiwyg-barra";

		let heading = document.createElement("select");
		heading.innerHTML = `
			<option value="">Normal</option>
			<option value="h1">Heading 1</option>
			<option value="h2">Heading 2</option>
			<option value="h3">Heading 3</option>
			<option value="h4">Heading 4</option>
			<option value="h5">Heading 5</option>
			<option value="h6">Heading 6</option>
			<option value="p">Paragraph</option>
		`;

		heading.onchange = function(){
			if(this.value !== ""){
				aplicarBloque(instancia,this.value);
				this.value = "";
			}
		};

		let separador = document.createElement("div");
		separador.className = "jocarsa-wysiwyg-separador";

		let bold = document.createElement("button");
		bold.type = "button";
		bold.innerHTML = "<b>B</b>";
		bold.onclick = function(){
			aplicarSpan(instancia,{fontWeight:"bold"});
		};

		let italic = document.createElement("button");
		italic.type = "button";
		italic.innerHTML = "<i>I</i>";
		italic.onclick = function(){
			aplicarSpan(instancia,{fontStyle:"italic"});
		};

		barra.appendChild(heading);
		barra.appendChild(separador);
		barra.appendChild(bold);
		barra.appendChild(italic);

		return barra;
	}

	function crearEditor(textarea){
		let contenedor = document.createElement("div");
		contenedor.className = "jocarsa-wysiwyg-contenedor";

		let editor = document.createElement("div");
		editor.className = "jocarsa-wysiwyg-editor";
		editor.contentEditable = true;

		editor.innerHTML = textarea.value.trim() || "<p><br></p>";

		textarea.classList.add("jocarsa-wysiwyg-textarea-oculto");

		let padre = textarea.parentNode;
		padre.insertBefore(contenedor, textarea);

		contenedor.appendChild(textarea);

		let instancia = {
			textarea:textarea,
			editor:editor,
			ultimoRango:null
		};

		let barra = crearBarra(instancia);

		contenedor.appendChild(barra);
		contenedor.appendChild(editor);

		editor.addEventListener("mouseup",function(){
			guardarRango(instancia);
		});

		editor.addEventListener("keyup",function(){
			guardarRango(instancia);
			sincronizarTextarea(instancia);
		});

		editor.addEventListener("input",function(){
			guardarRango(instancia);
			sincronizarTextarea(instancia);
		});

		editor.addEventListener("focus",function(){
			guardarRango(instancia);
		});

		sincronizarTextarea(instancia);
	}

	function init(){
		let areas = document.querySelectorAll("textarea.jocarsa-wysiwyg");
		areas.forEach(function(textarea){
			crearEditor(textarea);
		});
	}

	document.addEventListener("DOMContentLoaded",init);

	return {
		init:init
	};

})();
