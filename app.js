const target = "test.md"
const targetviewer = "#target"

const r = {
	// regex strings for searching
	"brTag": /<br[\s]*(?:\/>|>)/g,
	"header": /^#*\s/,
	"images": /\[(?:\[??[^\[]*?\])\((?:\[??[^\[]*\))/g,
	"images_alttext": /(?<=!\[).*(?=\])/,
	"images_info": /(?<=\().*(?=\))/,
	"images_path": /.*\.(\bpng\b|\bjpg\b)/,
	"images_title": /(?<=["']).*(?=["'])/,
	"links": /(?<!\!)\[(?:\[??[^\[]*?\])\((?:\[??[^\[]*\))/g,
	"code": /(?<!`)`(?=[^`])/g,
	"codeblock": /^```[\w\-]*?(?=[\s\n])/g,
	"quoteblock": /^(?<!=\\)>/g
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
			var $linebreak = $("<div>", {
				"class": "markdownBR"
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
			// header3
			let $header3 = $("<div>", {
				"class": "markdownH3"
			});
			$header3.appendTo($targetviewer);

			return $header3
		case 4:
			// normal text; p tag
			let $paragraph = $("<div>", {
				"class": "markdownP"
			});
			$paragraph.appendTo($targetviewer);

			return $paragraph
		case 5:
			// image
			let $imagecontainer = $("<div>", {
				"class": "markdownIMG"
			})
			let $image = $("<img>")
			$imagecontainer.appendTo($targetviewer);
			$image.appendTo($imagecontainer)

			return $image
	}
}

function parse(text) {
	// main function to parse text to html (text contents of .md file)
	// despite function's name, it handles writing/displaying too
	const split = text.split("\n");
	console.log(split)
	const $targetviewer = $(targetviewer.concat(" .markdownpage .markdowncontents"));

	// clear all rendered elements from $targetviewer
	$targetviewer.empty()

	// variables for storage/memory purposes
	var session = {
		"linenumber": 0, // for reading purposes only; will be handled internally
		"currentcontext": 4, // 4 for paragraph; follows parserAction
		"cached_content": "", // store the current parsed content here; used in push method
		"additional_data": [], // store additional data that could be use when calling push method
		"forced": false,
		"push": function() { // takes in cached_content with currentcontext
			console.log(session.cached_content, session.forced)
			if (session.cached_content == "" && !session.forced) {
				return
			}

			var divobject = parserAction($targetviewer, session.currentcontext);
			switch (session.currentcontext) {
				case 1:
				case 2:
				case 3:
					// headers
					divobject.html(session.cached_content);
				case 4:
					// paragraphs
					divobject.html(session.cached_content == "" ? "&nbsp;" : session.cached_content); // default value to give div a width/height
				case 5:
					// images
					divobject.attr({
						"src": session.additional_data[0],
						"alt": session.additional_data[1],
						"title": session.additional_data[2],
					})
			}

			// empty content
			session.cached_content = "";

			// reset context
			session.currentcontext = 4;

			// toggle off .forced
			session.forced = false;

			// new line
			session.linenumber++
		}
	}

	for (let i = 0; i < split.length; i++) {
		var msg = split[i];
		console.log(msg);
		console.log("=============")

		// search for br tags; <br /> works too; any amount of whitespace before the slash
		var msg_split = msg.split(r.brTag);
		var msg_split_len = msg_split.length; // so no need to recalculate when using for loop? optimisations, not too sure. (っ °Д °;)っ
		// headers; since <br> tags are filtered out now
		result = msg.match(r.header); // match the entire line; regardless of split
		if (result !== null && result[0].length >= 2 && result[0].length <= 4) {
			// validate that captured string's length is only between 2 and 4
			// '## '; captured header 2, string length of 3; etc

			// push current text; if empty will handle internally in push method
			session.push();

			// one of the three headers
			session.cached_content = msg_split.join("").slice(result[0].length); // join back the splitted line from <br> tags; clears <br> tags from our message
			session.currentcontext = result[0].length -1; // 1 for header 1, 2 for header 2 etc
			session.push();
			continue // exit when a header is found
		}

		var data = {}; // store data here with the corresponding index with msg_split
		// data for the other captures; such as images and links
		for (let ia = 0; ia < msg_split_len; ia++) {
			// data
			var i_msg = msg_split[ia]; // individual message
			var img_match = i_msg.matchAll(r.images);
			var img_match_obj = img_match.next();

			var link_match = i_msg.matchAll(r.links);
			var link_match_obj = line_match.next();

			var code_match = i_msg.matchAll(r.code);
			var code_match_obj = code_match_obj.next();

			var codeblock_match = i_msg.matchAll(r.codeblock);
			var codeblock_match_obj = codeblock_match.next();

			var quoteblock_match = i_msg.matchAll(r.quoteblock);
			var quoteblock_match_obj = quoteblock_match.next();
			
			while (true) {
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

					data[result.index] = {
						"index": result.index,
						"content": result[0],
						"alt_text": alt_text != null ? alt_text[0] : "",
						"path": path[0], // validated; can't be null
						"title": title != null ? title[0] : ""
					}
				} else if (!link_match_obj.done) {
					var result = link_match_obj.result;
				}

			}
			
			data[ia] = {"images": img_match};
		}
		console.log(msg_split)
		if (msg_split.length == 1) {
			// console.log("no br tags");
			// no br tags
			session.cached_content += msg
		} else {
			// one or multiple br tags
			// console.log("br tags everywhere!! >:)");
			for (let v = 0; v < msg_split_len; v++) {
				// if msg_split[v] is ""; second or more occurrence of the br tag
				// chained together, or it could be the leading br tags; either front or back
				// console.log("v", v);
				session.cached_content += msg_split[v];
				session.currentcontext = 4; // set to paragraph
				session.forced = true; // set to true so even if session.cached_content is ""; add a new line anyways; needed for multiple br tags chained together

				if (v +1 == msg_split.length && msg_split[v +1] == "") {
					// empty string means a br tag was there
					session.push()

					// don't push if the last occurrence isnt a br tag, carry forward
				} else if (v +1 < msg_split.length) {
					// push it regardless
					session.push()
				}
			}
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
			parse(contents)
		})

		// reset value so .onchange will fire again despite same file being reuploaded
		e.target.value = "";
	})

	var re = fetchfilefromserver("test.md").then(function(text) {
		console.log(text);
		// text_promiseobject.then(function(returned_string){
		// 	console.log(returned_string)
		// 	parse(returned_string)
		// })
		parse(text)
	})
})
