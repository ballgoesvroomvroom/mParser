const target = "test.md"
const targetviewer = "#target"

const r = {
	// regex strings for searching
	"escaped": /\\(?=[\\\/\(\)\:\'\"])/g, // used to remove slashes from escape characters 
	"brTag": /<br[\s]*(?:\/>|>)/g,
	"header": /^(?<!\\)(\s{0,3})#{1,3}(?![^\s])/,
	"images": /!\[(\[??[^\[]*?)\]\((.*?(?:\.png|\.jpg|\.webp))(?:\s["'](.*?)["'])?\)/g,
	// "links": /(?<!!)\[([^\[\r\n]*?)\]\(((?:[\w\.\\\/\:]|(?:\(.*\)))*?)\)/g, // support for nested loops
	"links": /(?<![!\\])\[([^\r\n]*)(?<!\\)\]\(([^\r\n'"]*?)(?:\s(['"(].*?['")]))?(?<!\\)\)/g,
	"code": /(?<![`\\])`(?!`)/g,
	"codeblock": /^\s{0,3}(`{3,}|~{3,})\s*([\w\-]*)/,
	"quoteblock": /^(?<!=\\)>/g,
	"bold": /\*(.*?)(?<!\\)\*/g
}

class Tokeniser {
	constructor() {
		this.tokens = []; // store created token ojects in order here

		this._contents = ""; // actual storage of token's details when constructing them
		this.contents = ""; // acts as a proxy to write ctual token details to ._contents

		this.is_raw = false; // whether to capture tags
		this.is_raw_esccond = 0; // escape condition for raw input and display such as code or code blocks

		this.linenumber = 0; // actual line number in the rendered document; not zero-based; first line is line number 1
		this.currentcontext = 0; // the current context; whether if its a paragraph or a code block

		this.additional_data = {}; // misc data
	}

	get contents() {
		return this._contents
	}

	set contents(new_content) {
		if (this._contents.length > 0) {
			// has content already; add a space as padding
			this._contents += " ";
		}
		this._contents += new_content
	}

	clear() {
		this._contents = "";
	}

	push(...data) {
		// push collected (and finalised) token into this.tokens
		let token_data = {
			"linenumber": this.linenumber,
			"currentcontext": this.currentcontext
		};

		switch (this.currentcontext) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				// all 6 headers & paragraph
				if (this._contents.length === 0) {
					// empty
					this._contents = "&nbsp;";
				};

				token_data.contents = this._contents;
				break;
			case 8:
				// images
				token_data.alt_text = data[0];
				token_data.path = data[1];
				token_data.title = data[2];
				break;
			case 9:
				// hyperlinks
				token_data.text = data[0];
				token_data.dest = data[1];
				token_data.title = data[2];
				break;
			case 10:
				// code, `
				token_data.is_opening = data[0]; // true if backtick is the start of a new code
				break;
			case 11:
				token_data.is_opening = data[0]; // true if code fence is the start; false otherwise
				token_data.language = data[1]; // code block language
		};

		this.tokens.push(token_data);
		this.clear(); // clear all the data in .contents
	}

	beautify() {
		// adds a new attribute, .beautified_tokens, that stores the new array
		// with each element of that array being an array that contains
		// the contents of the parsed document line
		console.log(this.tokens);
		let beautified_tokens = [];

		let ln = 0; // line number
		let token_length = this.tokens.length;
		for (let i = 0; i < token_length; i++) {
			if (this.tokens[i].linenumber > ln) {
				// new line
				ln++;

				beautified_tokens.push([]); // add empty array representing linenumber ln
			}
			beautified_tokens[ln -1].push(this.tokens[i]);
		}

		this.beautified_tokens = beautified_tokens;
	}
}

class Element {
	constructor(contents) {
		this.contents = contents; // actual element contents to be displayed
		this.context = 7; // paragraph
		this.tokens = [];
		this.containsInlineElemenents = false;
	}
	
	parseForInline() {
		var bold = this.contents.matchAll(r.bold);
		var bold_match = bold.next()
		
		while (true) {
			if (!)
		}
	}
	
	get tokens 
}

class Parser {
	constructor() {
		this.contents = "";
	}
	set($targetviewer) {
		// sets the targetviewer element (jQuery) for use within push method when creating elements
		this.$targetviewer = $targetviewer;
	}
	push() {
		// creates and push normal paragraphs (content: 7); clears this.contents afterwards\
		if (this.contents.length === 0) {
			// empty stuff, nothing to parse
			// even if paragraph is meant to be empty, token.contents should contain a &nbsp; tag atleast
			// added this check to remove redundant checks outside of method
			return;
		}
		var divobject = parserAction(this.$targetviewer, 7); // context is always 7
		divobject.html(this.contents);

		this.contents = "";
	}
}

function fetchfilefromserver(path) {
	return fetch(path).then(function(response) {
		return response.text()
	})
}

function readfile(file) {
	// use fileobject to return contents of uploaded file
	// file: user uploaded file
	var reader = new FileReader();
	var deferred = $.Deferred(); // object to be returned

	reader.onload = function(e) {
		deferred.resolve(e.target.result)
	}
	reader.readAsText(file);

	return deferred
}

function parserAction($targetviewer, resultCode) {
	// function to add the div elements to $targetviewer
	// returns the newly created element
	// resultCode: number; determined by parser

	switch (resultCode) {
		case 0:
			// thematic line break
			var $linebreak = $("<div>", {
				"class": "markdownHR"
			})
			$linebreak.appendTo($targetviewer)

			return null
		case 1:
			// header 1
			let $header1 = $("<div>", {
				"class": "markdownH1"
			});
			$header1.appendTo($targetviewer);
			parserAction($targetviewer, 0); // line break

			return $header1
		case 2:
			// header 2
			let $header2 = $("<div>", {
				"class": "markdownH2"
			});
			$header2.appendTo($targetviewer);
			parserAction($targetviewer, 0); // line break

			return $header2
		case 3:
		case 4:
		case 5:
		case 6:
			// header3; header4; header5; header6
			let $header3 = $("<div>", {
				"class": "markdownH3"
			});
			$header3.appendTo($targetviewer);

			return $header3
		case 7:
			// normal text; p tag
			let $paragraph = $("<div>", {
				"class": "markdownP"
			});
			$paragraph.appendTo($targetviewer);

			return $paragraph
		case 8:
			// image
			let $imagecontainer = $("<div>", {
				"class": "markdownIMG"
			})
			let $image = $("<img>")
			$imagecontainer.appendTo($targetviewer);
			$image.appendTo($imagecontainer)

			return $image
		case 9:
			// links, [text](route)
		case 10:
			// codes, `
		case 11:
			// codeblocks, ```lang
	}
}

function generate_tokens_line(text) {
	// returns a list of tokens from a single line text
	// recursive; for parsing of inline contens
	tokens = [];
	// find other tokens
	var events = {} // store all the found match here

	// match all the tokens
	var code = line_contents.matchAll(r.code);
	var code_match = code.next();

	var image = line_contents.matchAll(r.images);
	var image_match = image.next();

	var link = line_contents.matchAll(r.links);
	var link_match = link.next();

	var br = line_contents.matchAll(r.brTag);
	var br_match = br.next();
	// --------------------------------------

	// don't remove '/' being used to escape characters here, since escape characters are considered as a character; will mess up indexing real bad
	var searching = true;
	while (searching) {
		searching = false;

		if (!code_match.done) {
			searching = true;
			var result = code_match.value;
			events[result.index] = {
				"type": 10,
				"content": "`" // content field is needed for use when .is_raw is toggled on
			};

			code_match = code.next()
		}
		if (!image_match.done) {
			searching = true;
			var result = image_match.value;
			events[result.index] = {
				"type": 8,
				"content": result[0],
				"alt_text": result[1], // if alt text field is empty, will simply match and capture an empty string, ""
				"path": result[2],
				"title": result[3] != null ? result[3] : "" // optional last data
			};

			image_match = image.next()
		}
		if (!link_match.done) {
			searching = true;
			var result = link_match.value;
			events[result.index] = {
				"type": 9,
				"content": result[0],
				"text": result[1],
				"dest": result[2],
				"title": result[3] != null ? result[3] : ""
			};

			link_match = link.next()
		}
		if (!br_match.done) {
			searching = true;
			var result = br_match.value;
			events[result.index] = {
				"type": -1, // special -1; as there are no reserved type numbers for br tags
				"content": result[0]
			};

			br_match = br.next()
		}
	}
}

function generate_tokens(text) {
	// returns tokeniser_object; tokens are stored in .tokens attribute
	// lexer?
	const text_split = text.split(/\r?\n/);
	const tokeniser_object = new Tokeniser();
	console.log(tokeniser_object);

	let split_len = text_split.length;
	for (let fileline_number = 0; fileline_number < split_len; fileline_number++) {
		var line_contents = text_split[fileline_number];
		var line_contents_length = line_contents.length;
		console.log(fileline_number, line_contents);

		// match all info here
		if (!tokeniser_object.is_raw) {
			if (line_contents.length === 0) {
				// empty file line
				if (tokeniser_object.currentcontext === 10 | tokeniser_object.contents.length > 0) {
					// if previous token was a code. `example`, disregard it
					// or if previous line was not pushed; push it
					tokeniser_object.currentcontext = 7;
					tokeniser_object.push(); // not a code; disregard it
				}
				tokeniser_object.linenumber++;
				tokeniser_object.currentcontext = 7;
				tokeniser_object.push();
				tokeniser_object.linenumber++; // add for the next file line
				console.log("exit: 0")

				continue // move on to the next file line
			}
			// match entire line for headers first
			r.header.lastIndex = 0; // reset regex pointer on every capture
			var header = r.header.exec(line_contents);
			if (header !== null) {
				if (tokeniser_object.contents.length > 0) {
					tokeniser_object.push() // push whatever is inside; unless empty
				}

				tokeniser_object.linenumber++; // move to next line
				tokeniser_object.currentcontext	= header[0].length -header[1].length; // captures the 0-3 optional whitespaces at the front
				tokeniser_object.contents = line_contents.slice(header[0].length +1);
				tokeniser_object.push();

				continue; // move on to the next file line
			}
			// match entire line for codeblock
			r.codeblock.lastIndex = 0;
			var codeblock = r.codeblock.exec(line_contents);
			if (codeblock !== null) {
				if (tokeniser_object.contents.length > 0) {
					tokeniser_object.push() // push whatever is inside; unless empty
				}

				// no need to move to next line; since the next file line iteration will do that under .is_raw === true condition
				tokeniser_object.linenumber++; // move to next line
				tokeniser_object.currentcontext = 11; // codeblock context
				tokeniser_object.push(true, codeblock[2]); // push(is_starting_block, language); if no language is present, will be an empty string

				// set raw state and escape conditions
				tokeniser_object.is_raw = true;
				tokeniser_object.is_raw_esccond = 11;

				// set additional data for use when trying to capture closing fence
				tokeniser_object.additional_data.code_length = codeblock[1].length; // closing code fence must be atleast the same length
				tokeniser_object.additional_data.language = codeblock[2];
				// type of character used in opening and closing code fence must be the same as denoted in GFM spec
				// length of closing code fence must be atleast the length of opening code fence
				tokeniser_object.additional_data.closing_regexp = new RegExp(`^\\s{0,3}${codeblock[1][0]}{${codeblock[2].length},}\\s*$`)
				continue; // move onto next file line
			}

			var events = generate_tokens_line(line_contents);

			console.log(events);
			// iterate through matched tokens; forming the new document line
			// do the removing of escape characters here
			var internal_lastPointer = 0;
			for (let char_index = 0; char_index < line_contents_length; char_index++) {
				if (events[char_index] == null) {
					continue // skip until it lands on an occupied index
				}
				var data = events[char_index];
				console.log("data:", data)

				if (tokeniser_object.is_raw) {
					// previous captured token caused raw input to be enabled (most likely code, `) 
					console.log("is_raw");
					// ignore all other captured tokens if .is_raw is true
					// add its raw content to tokensier_object
					tokeniser_object.contents = line_contents.slice(internal_lastPointer, char_index);
					internal_lastPointer = char_index +data.content.length; // set pointer location for next capture
					if (tokeniser_object.is_raw_esccond === data.type) {
						// current captured token matches the escape condition; disable raw input; .is_raw = false
						// push current whats in first
						if (tokeniser_object.contents.length > 0) {
							tokeniser_object.currentcontext = 7;
							tokeniser_object.push();
						}

						// add the closing block matched tag into tokens list
						tokeniser_object.currentcontext = data.type;
						tokeniser_object.push(false); // closing block
						tokeniser_object.currentcontext = 7; // reset currentcontext so it won't trigger condition to disregard code block on a new line
						tokeniser_object.is_raw = false // toggle is_raw state
					} else {
						tokeniser_object.contents = data.content // add raw content of matched tag to tokeniser_object.content
					}
				} else {
					switch (data.type) {
						case -1: // br tags
						case 8: // images
						case 9: // links
						case 10: // code
							// add current captured text up til now
							console.log("i_l, c_i:", internal_lastPointer, char_index);
							if (internal_lastPointer -char_index === 0) {
								// empty beforehand; matched tag was the first character; no captured text beforehand to push
								// push current stored content if any
								if (tokeniser_object.contents.length > 0) {
									// from previous file line
									tokeniser_object.currentcontext = 7;
									tokeniser_object.push();
								}

								// all there is to do is to set context and add a new line if no lines have been added yet
								tokeniser_object.currentcontext = data.type;
								if (tokeniser_object.linenumber === 0) {
									tokeniser_object.linenumber++;
								};
								internal_lastPointer = char_index +data.content.length;
								break; // get out of switch statement
							};
							tokeniser_object.currentcontext = 7;
							tokeniser_object.contents = line_contents.slice(internal_lastPointer, char_index);
							console.log(line_contents.slice(internal_lastPointer, char_index), internal_lastPointer, char_index);
							tokeniser_object.linenumber++;
							tokeniser_object.push();

							tokeniser_object.currentcontext = data.type; // set context
							internal_lastPointer = char_index +data.content.length;
							console.log("next(internal_lastPointer):", data.content.length, internal_lastPointer)
					} switch (data.type) {
						case -1: // br tag
							tokeniser_object.push();
							tokeniser_object.linenumber++;
							break;
						case 8:
							// images
							tokeniser_object.push(data.alt_text, data.path, data.title);
							break;
						case 9:
							// remove escape characters
							data.text = data.text.replaceAll(r.escaped, "");
							// no need to eacape url since all escaped characters are also valid url characters
							// data.dest = data.dest.replaceAll(r.escaped, "");
							data.title = data.title.replaceAll(r.escaped, "");
							tokeniser_object.push(data.text, data.dest, data.title);
							break;
						case 10:
							// continue from first branch
							console.log(true);
							tokeniser_object.push(true); // backtick in this case is always the start since is_raw condition will capture closing tag
							// set is_raw state
							tokeniser_object.is_raw = true;
							// set escape condition
							tokeniser_object.is_raw_esccond = 10;
							break
					}
				}
			}
			console.log("<END>:", internal_lastPointer, line_contents_length)
			if (internal_lastPointer < line_contents_length) {
				// did not capture everything
				tokeniser_object.currentcontext = 7;
				tokeniser_object.contents = line_contents.slice(internal_lastPointer);
				console.log(tokeniser_object.contents)
				// no need to push since it isnt the end of the entire file (could be but will be handled at end of file)
			};
		} else {
			// raw input
			// match for escaping conditions; (entire file line)
			switch (tokeniser_object.is_raw_esccond) {
				case 11:
					var matched = tokeniser_object.additional_data["closing_regexp"].test(line_contents);
					if (matched) {
						// tokensier_object.contents should be empty
						tokeniser_object.currentcontext = 11;
						tokeniser_object.push(false) // second argument is left out; language

						// set is_raw to false
						tokeniser_object.is_raw = false;

						// move to next line for the next paragraph
						tokeniser_object.linenumber++;

						tokeniser_object.additional_data = {}; // new object; old one will be garbage collected
						continue; // dont add current file line to contents and move on to the next file line
					}
			}
			tokeniser_object.contents = line_contents;
			tokeniser_object.currentcontext = 7;
			tokeniser_object.push();

			// increment line only after pushing current line; since current linenumber is for the current .contents
			tokeniser_object.linenumber++;
		}
	}

	if (tokeniser_object.contents.length > 0) {
		// last file line did not push
		tokeniser_object.linenumber++;
		tokeniser_object.push();
	}

	tokeniser_object.beautify(); // beautify tokens for parser function to accept
	console.log(tokeniser_object.beautified_tokens);
	return tokeniser_object;
}

function new_parse(tokens) {
	const $targetviewer = $(targetviewer.concat(" .markdownpage .markdowncontents"));
	$targetviewer.empty(); // clear all rendered elements from $targetviewer

	const parser_object = new Parser();
	parser_object.set($targetviewer)

	let length = tokens.length; // total number of lines

	let link_count = 0;
	let link_title = {};

	let is_raw = false; // state for raw input & display
	let raw_count = 0; // uid for raw input containers
	let raw_datamap = {}; // mapping for raw input containers tag with their content

	for (let ln = 0; ln < length; ln++) {
		let cont_len = tokens[ln].length;
		if (cont_len === 1 && tokens[ln][0].currentcontext === -1) {
			// an empty line (denoted by one br tag in the line)
			parser_object.contents = "&nbsp;";
			parser_object.push();

			continue; // move onto the next line
		}
		for (let cn = 0; cn < cont_len; cn++) {
			var data = tokens[ln][cn];
			switch (data.currentcontext) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
					// 1 - 6 headers
					parser_object.push(); // if .contents is empty, will be handled internally

					var divobject = parserAction($targetviewer, data.currentcontext);
					console.log(data.contents);
					divobject.html(data.contents);
					break;
				case 7:
					if (is_raw) {
						raw_datamap[raw_count -1] += data.contents;
					} else {
						parser_object.contents += data.contents; // treat content as is; tokens' content already include space padding if included
					}
					break;
				case 8:
					parser_object.push();

					var divobject = parserAction($targetviewer, data.currentcontext);
					divobject.attr({
						"alt": data.alt_text,
						"src": data.path,
						"title": data.title
					});
					break;
				case 9:
					link_count++;

					parser_object.contents += `<a href=${data.dest} id=hyperlink-${link_count}>${data.text}</a>`;
					link_title[link_count] = data.title
					break;
				case 10:
					is_raw = data.is_opening;
					parser_object.contents += is_raw ? `<span class=\"markdownCODE\" id=code-${raw_count}>` : "</span>";

					if (is_raw) {
						// increment uid variable and register key, value into raw_datamap
						raw_datamap[raw_count++] = "";						
					}
					break;
				case 11:
					parser_object.push();

					is_raw = data.is_opening;
					// here
			}
		}
		parser_object.push();
	}

	// add in their raw content into corresponding containers
	for (const [container_id, content] of Object.entries(raw_datamap)) {
		$(`#code-${container_id}`).text(content)
	}

	// add in title to <a> tags since they support backslash escapes and entity and numeric character references
	for (const [container_id, content] of Object.entries(link_title)) {
		$(`#hyperlink-${container_id}`).attr({
			"title": content
		})
	}
}
	

function parse(text) {
	// main function to parse text to html (text contents of .md file)
	// despite function's name, it handles writing/displaying too
	const split = text.split(/\r?\n/g);
	console.log(split);
	const $targetviewer = $(targetviewer.concat(" .markdownpage .markdowncontents"));

	// clear all rendered elements from $targetviewer
	$targetviewer.empty();

	// variables for storage/memory purposes
	var session = {
		"linenumber": 0, // for reading purposes only; will be handled internally
		"currentcontext": 7, // 7 for paragraph; follows parserAction
		"cached_content": "", // store the current parsed content here; used in push method
		"additional_data": [], // store additional data that could be use when calling push method
		"forced": false,
		"reroute": function() { // re-route specified cases to normal cases; such as codes to paragraphs
			switch (session.currentcontext) {
				case 10:
					session.currentcontext = 7;
			}
		},
		"push": function() { // takes in cached_content with currentcontext and pushes cached_content with the appropriate context to a single line
			console.log("("+session.cached_content+")", session.forced, session.cached_content.length)
			if (session.cached_content == "" && !session.forced) {
				console.log("RETURNED");
				return
			}

			// re-route specified cases to normal cases; such as codes to paragraphs
			session.reroute();

			var divobject = parserAction($targetviewer, session.currentcontext);
			switch (session.currentcontext) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
					// headers
					divobject.html(session.cached_content);

					// reset context to paragraph
					session.currentcontext = 7;
					break
				case 7:
					// paragraphs
					divobject.html(session.cached_content == "" ? "&nbsp;" : session.cached_content); // default value to give div a width/height
					break
				case 8:
					// images
					divobject.attr({
						"src": session.additional_data[0],
						"alt": session.additional_data[1],
						"title": session.additional_data[2],
					})
					break
				case 9:
					// links
					// do nothing since <a> tag is inserted directly
				case 10:
					// codes
					// do nothing since <span class=""> tag is inserted directly

			}

			// empty content
			session.cached_content = "";

			// empty additional_data


			// reset context
			// session.currentcontext = 7; // don't reset context, needed to determine context after each push to a line

			// toggle off .forced
			session.forced = false;

			// new line
			session.linenumber++
		}
	}

	for (let i = 0; i < split.length; i++) {
		// main loop that iterates over each line of content within the file
		var msg = split[i];
		console.log("msg:", msg);
		if (msg === "" && session.currentcontext !== 10) {
			console.log("skipped");
			session.forced = true;
			session.push();
			continue // empty newline?
		}

		// search for br tags; <br /> works too; any amount of whitespace before the slash
		var msg_split = msg.split(r.brTag);
		var msg_split_len = msg_split.length; // so no need to recalculate when using for loop? optimisations, not too sure. (ã£ Â°Ð” Â°;)ã£

		// headers; since <br> tags are filtered out now
		result = msg.match(r.header); // match the entire line; regardless of split
		if (result !== null) {
			// valid header

			// push current text; if empty will handle internally in push method
			session.push();

			session.cached_content = msg_split.join("").slice(result[0].length +1); // join back the splitted line from <br> tags; clears <br> tags from our message
			session.forced = true; // session.cached_content can be empty; empty header
			console.log("HEADER", session.cached_content)
			// result[0] being the captured string, such as '#' etc
			session.currentcontext = result[0].length; // 1 for header 1, 2 for header 2 etc
			session.push();
			continue // exit when a header is found
		}

		var data = {}; // store data here with the corresponding index with msg_split
		// data for the other captures; such as images and links
		for (let ia = 0; ia < msg_split_len; ia++) {
			// capture all kinds of stuff here; links, images etc
			var i_msg = msg_split[ia]; // individual message
			if (i_msg == "") {
				// empty string; can skip all the captures
				// data[ia] will be null
				continue
			}
			var i_data = {} // individual data to be pushed to data

			var img_match = i_msg.matchAll(r.images);
			var img_match_obj = img_match.next();

			var link_match = i_msg.matchAll(r.links);
			var link_match_obj = link_match.next();

			var code_match = i_msg.matchAll(r.code);
			var code_match_obj = code_match.next();

			var codeblock_match = i_msg.matchAll(r.codeblock);
			var codeblock_match_obj = codeblock_match.next();

			var quoteblock_match = i_msg.matchAll(r.quoteblock);
			var quoteblock_match_obj = quoteblock_match.next();
			
			var all_is_running = true; // will be set false by loop and true by each iteration of .next() from .matchAll()
			var i_data_isempty = 0; // increment this as the loop goes on; not actual representation of length
			// since the while loop would need to loop over once more and the last loop doing nothing (to verify closure), if i_data_isempty is 1, only one iteration and not two, i_data is empty since nothing was added
			while (all_is_running) {
				all_is_running = false;
				i_data_isempty++;
				if (!img_match_obj.done) {
					// match the alt_text, image path, image title
					var result = img_match_obj.value;
					var alt_text = result[0].match(r.images_alttext);

					// round brackets that store the filepath and the optional title
					var info = result[0].match(r.images_info);
					if (info == null) {
						// no () shouldn't happen since r.images should capture only with parenthesis present
						// ignore this general capture and move on to the next one since no filepath definition
						img_match_obj = img_match.next();
						continue
					}

					var path = info[0].match(r.images_path);
					var title = info[0].match(r.images_title);

					if (path == null) {
						// no filepath; ignore this general capture and move on to the next one
						img_match_obj = img_match.next();
						continue
					}

					i_data[result.index] = {
						"type": "images",
						"index": result.index,
						"content": result[0],
						"alt_text": alt_text != null ? alt_text[0] : "",
						"path": path[0], // validated; can't be null
						"title": title != null ? title[0] : ""
					}
					img_match_obj = img_match.next();

					all_is_running = true;
				}
				if (!link_match_obj.done) {
					var result = link_match_obj.value;

					i_data[result.index] = {
						"type": "links",
						"index": result.index,
						"content": result[0],
						"text": result[1], // will be empty if left out; <a> tag will handle empty title 
						"link": result[2]
					}
					link_match_obj = link_match.next();

					all_is_running = true;
				}
				if (!code_match_obj.done) {
					var result = code_match_obj.value;

					i_data[result.index] = {
						"type": "codes",
						"index": result.index,
						"content": result[0],
					}
					code_match_obj = code_match.next();

					all_is_running = true;
				}
			}
			
			if (i_data_isempty === 1) {
				// i_data is empty; > 1 then it isn't empty
				continue
			}
			data[ia] = i_data
		}
		console.log(data, msg_split)
		for (let v = 0; v < msg_split_len; v++) {
			// if msg_split[v] is ""; second or more occurrence of the br tag
			// chained together, or it could be the leading br tags; either front or back
			// console.log("v", v);
			console.log("loopey loop:", msg_split[v], msg_split[v].length)

			var line_contents = []; // store the segmented contents of the line here

			// see if anything got captured
			var r_data = data[v]; // read data
			if (r_data != null && session.currentcontext !== 10) {
				// if not null; not empty data, msg_split[v] != ""
				var currentpointerindex = 0; // store the pointer index here used for slicing
				for (let index = 0; index < msg_split[v].length; index++) {
					// since r_data is populated with character index position as keys; limit should be the entire string's length
					if (r_data[index] == null) {
						continue; // move onto the next iteration
					}
					var d = r_data[index];

					if (d.index != 0) {
						line_contents.push({
							"type": 7, // set to paragraph content
							"content": msg_split[v].slice(currentpointerindex, d.index)
						})
					}
					switch (d.type) {
						case "images":
							line_contents.push({
								"type": 8,
								"alt_text": d.alt_text,
								"path": d.path,
								"title": d.title
							})
						case "links":
							line_contents.push({
								"type": 9,
								"text": d.text,
								"link": d.link
							})
						case "codes":
							line_contents.push({
								"type": 10,
								"index": d.index
							})
					}
					currentpointerindex = d.index +d.content.length;
				}
				// last push for the last content
				console.log("currpointindex:", currentpointerindex)
				if (!(currentpointerindex === msg_split[v].length)) {
					// didn't capture the entire string
					line_contents.push({
						"type": 7,
						"content": msg_split[v].slice(currentpointerindex)
					})
				}
			} else {
				line_contents = [{"type": 7, "content": msg_split[v]}]
			}

			console.log("line_contents:", line_contents);
			var line_contents_length = line_contents.length;

			// state tracking
			if (session.cached_content.length > 0) {
				// has contents before (on the previous line), add a space as a padding
				session.cached_content += "";
			}
			for (let vi = 0; vi < line_contents_length; vi++) {
				console.log("session.cached_content:", session.cached_content);
				console.log("sesstion.currentcontext:", session.currentcontext);
				var d = line_contents[vi]
				switch (d.type) {
					case 7:
						// normal paragraph
						// session.currentcontext = 7; // don't set it back
						session.cached_content += d.content;
						break
					case 8:
						// imaqges
						session.forced = false;
						session.push(); // push already existing contents
						session.currentcontext = 8;
						session.additional_data = [
							d.path,
							d.alt_text,
							d.title
						];

						session.forced = true;
						session.push();
						break
					case 9:
						// links
						console.log("links present")
						session.cached_content += `<a href="${d.link}">${d.text}</a>`
					case 10:
						// codes
						if (session.currentcontext == 10) {
							console.log("CLOSED")
							session.cached_content += "</span>";
							session.currentcontext = 7;
						} else {
							// start a new code
							console.log("OPENED")
							session.cached_content += '<span class="markdownCODE">';
							session.currentcontext = 10;
						}
				}
			}

			console.log("checking with", msg_split[v])
			session.forced = true; // set to true so even if session.cached_content is ""; add a new line anyways; needed for multiple br tags chained together
			if (session.currentcontext === 10) {
				// within code
				session.cached_content += format_tag("<br>")
			}
			if (msg_split[v +1] === "" && v +2 === msg_split_len) {
				// do a lookahead, if element ahead is a "", push
				console.log("A");
				session.push();
			} else if (msg_split[v] == "" && v +1 === msg_split_len) {
				// don't push; do nothing; last element in br split result is an empty string but already newline on previous iteration due to lookahead implementation
				console.log("B");
			} else if (v +1 === msg_split_len) {
				// do nothing; don't push; last element isnt a br tag
				console.log("C");
			} else {
				console.log("D");
				session.push();
			}
			// if (v +1 == msg_split.length && msg_split[v +1] == "") {
			// 	// empty string means a br tag was there
			// 	session.push()

			// 	// don't push if the last occurrence isnt a br tag, carry forward
			// } else if (v +1 < msg_split.length) {
			// 	// push it regardless
			// 	session.push()
			// }
		}
		// session.currentcontext
		// var master_split = []; // split each element in msg_split with imglinks as delimiter
		// // match for images
		// var images = msg.matchAll(r.images);
		// result = images.next();
		// while (!result.done) {
		// 	let alt_text = result.value[0].match(r.images_alttext);
		// 	let info = result.value[0].match(r.images_info);
		// 	let file_path = info.match(r.images_path);
		// 	let desc = info.match(r.images_desc);
		// 	if (file_path === null) {
		// 		// image path is not included
		// 		result.next();
		// 		continue
		// 	}
		// 	data[result.value.index] = [
		// 		5,
		// 		result.value[0].length,
		// 		file_path[0],
		// 		alt_text !== null ? alt_text[0] : "",
		// 		desc !== null ? desc[0] : "",
		// 	]

		// 	// remove from text
		// 	msg = msg.slice(0, result.value.index) + "*".repeat(result.value[0].length) + msg.slice(result.value.index +result.value[0].length);

		// 	// next object in the iterator
		// 	result = images.next();
		// }

		// console.log(msg, data)
		// data[msg.length] = [0, 0] // to trigger the end of paragraph/line
		// var last_stopped_i = 0; // last stop index; used for string slicing
		// var skipped = [false, 0]; // amount of iterations to skip
		// for (let s_i = 0; s_i <= msg.length; s_i++) { // <= to capture the entire paragraph/line
		// 	if (data[s_i] != null && !skipped[0]) {
		// 		switch (data[s_i][0]) {
		// 			case 5:
		// 			case 0:
		// 				// line break; push all the currently iterated contents into the document
		// 				console.log("HHHMMMMMM")
		// 				lineNumber++;
		// 				var m = msg.slice(last_stopped_i, s_i);
		// 				console.log(m, last_stopped_i, s_i);
		// 				parserAction($targetviewer, currentlineobject).html(m);
		// 			case 5:
		// 				parserAction($targetviewer, 5).attr({
		// 					"src": data[s_i][2],
		// 					"alt": data[s_i][3],
		// 					"title": data[s_i][4],
		// 				})
		// 		}
		// 		skipped = [true, data[s_i][1]]
		// 		last_stopped_i = s_i +data[s_i][1] // set pointer to after the text mask
		// 	} else if (skipped[0]) {
		// 		skipped[1] -= 1;
		// 		console.log("skipped[1]", skipped[1])
		// 		if (skipped[1] <= 0) {
		// 			// finish skipping
		// 			skipped = [false, 0]
		// 		}
		// 	}
		// }
		// if (result !== null) {
		// 	for (let img_list_i = 0; img_list_i < result.length; img_list_i++) {
		// 		var alt_text = result[img_list_i].match(/(?<=!\[).*(?=\])/)
		// 		var info = result[img_list_i].match(/(?<=\().*(?=\))/)[0]
		// 		var file_path = /.*\.(\bpng\b|\bjpg\b)/
		// 		var title = /(?<=["']).*(?=["'])/
		// 		file_path = info.match(file_path)[0]
		// 		title = info.match(title)
		// 		console.log("filepath", file_path)
		// 		parserAction($targetviewer, 5).attr({
		// 			"src": file_path,
		// 			"alt": alt_text !== null ? alt_text[0] : "",
		// 			"title": title !== null ? title[0] : ""
		// 		})
		// 	}
		// 	continue
		// }
		// // nothing else caught; render as plain text
		// parserAction($targetviewer, 4).html(split[i])
	}
	session.forced = false; // to not force an upload of empty strings
	session.push() // push whatever is remaining in the contents, will skip (done internally) if its an "" empty string
}

$(document).ready(function(e) {
	$("#buttoncontainer").on("click", function(e) {
		console.log(">:)")
		$("#uploadbutton").trigger("click")
	})
	$("#uploadbutton").click(function(event) {
		console.log(">:(");
		event.stopPropagation();
	})
	$("#uploadbutton").on("change", function(e) {
		console.log(":O");
		var file = $("#uploadbutton").prop("files")[0];
		if (typeof file === "undefined") {
			console.log("BAD");
			return
		}
		var fileobject = readfile(file);
		console.log("Created file object");
		$.when(fileobject).done(function(contents) {
			console.log("File object returned contents");
			new_parse(generate_tokens(contents).beautified_tokens)
		})

		// reset value so .onchange will fire again despite same file being reuploaded
		e.target.value = "";
	})

	// var re = fetchfilefromserver("https://raw.githubusercontent.com/ballgoesvroomvroom/demoMarkdowncontent/main/README.md").then(function(text) {
	// 	console.log(text);
	// 	parse(text)
	// })
})