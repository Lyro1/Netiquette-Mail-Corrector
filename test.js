var isSigned = false;

function verifySubject(string)
{
	return /^(\[[A-Z0-9_-]+\])+ [A-Za-z0-9_ ]+$/.test(string);
}

function verifyMessage(string)
{
	res = "";
	var spaces = 0;
	var signature = false;
	var signaturelen = 0;
	var lines = string.split('\n');
	var i = 0;
	for(;i < lines.length;i++){
		if (lines[i].replace(/\s/g, '').length && i != 0 && !signature && i != lines.length - 1) {
			if (lines[i] != "-- " && !(i + 1 < lines.length && !lines[i+1].replace(/\s/g, '').length)) {
				if (lines[i].length < 60) {
					res += ("- Line " + (i + 1) + ": Lines <b>MUST NOT</b> be smaller than 60 characters.</br>");
				}
			}
		}
		if (lines[i].length > 72) {
			res += ("- Line " + (i + 1) + ": Lines <b>MUST NOT</b> be longer than 72 characters.</br>");
		}
		if (lines[i] == "" || lines[i].length == 0) {
			spaces++;
			if (spaces > 1) {
				res += ("- Line " + (i + 1) + ": Paragraphs <b>MUST</b> be separated by a single blank line</br>");
			}
		}
		else {
			spaces = 0;
		}
		if (lines[i] == "-- ") {
			signature = true;
			isSigned = true;
		}
		if (signature) {
			signaturelen++;
		}
	}
	if (!string.length || (i == 1 && !string.replace(/\s/g, '').length)) {
		res += ("- Your message is empty.");
	}
	else {
		if (!signature || !signaturelen) {
			res += ("- Signature is missing. Your signature <b>MUST</b> be a blank line, the following string ''-- '' \
					   on a single line and a text between 1 and 4 lines, with at least your login.</br>");
		}
		if (signaturelen > 4) {
			res += ("- Your signature is too long. It <b>MUST</b> be a text between 1 and 4 lines, with at least your login.</br>");
		}
	}
	
	return res;
}

function GetResults(subject, message)
{
	res = false;
	result_msg = "";
	$("#result").addClass("red darken-3");
	if (!verifySubject(subject)) {
		result_msg = "Your mail contains the following errors:</br>";
		result_msg += "- Invalid subject: the subject <b>MUST</b> follow this format : ([A-Z_-]+)+ [A-Za-z0-9_ ]+ </br> \
					   <i>(example: [PROJECT][GROUP] My teamate leaved the project.)</i></br>";
		msg_errors = verifyMessage(message);
		if (msg_errors != "") {
			result_msg += msg_errors;
		}
	}
	else {
		msg_errors = verifyMessage(message);
		if (msg_errors != "") {
			result_msg = "Your mail contains the following errors:</br>";
			result_msg += msg_errors;
		}
		else 
		{
			result_msg = "Your mail does not contain any error. You can send it to the ACUs. But remember to change the <i>Content-Type</i> \
						  to <i>text/plain</i>.";
			$("#result").addClass("green darken-1");
			res = true;
		}
	}
	$("#result-msg").html(result_msg);
	$("#result").css("display", "block");
	return res;
}

function correctSubject(subject) {
	var corrected = "";
	tags = subject.match(/^(\[[^\]]+\])+/g, '');
	topic = subject.replace(/^(\[[^\]]+\])+/g, '');
	if (tags && tags[0] && tags[0].length) {
		tags[0] = tags[0].toUpperCase();
		for (var i = 0; i < tags[0].length; i++) {
			var letter = tags[0].charAt(i);
			var cc = letter.charCodeAt(0);
			if (letter != "[" && letter != "]" && letter != "_" && letter != "-" && !((cc>47 && cc<58) || (cc>64 && cc<91) || (cc>96 && cc<123))) {
				continue;
			}
			corrected += letter;
		}
	}
	else {
		corrected += "[TAG]";
	}
	if (topic && topic.length && topic[0].charAt(0) != " ") {
		topic = " " + topic;
	}
	else {
		corrected += " Topic";
	}
	corrected += topic;
	return corrected;
}

function minimizeParagraphs(message) 
{
	para = [];
	var parai = 0;
	var prevlinewasspace = false;
	var lines = message.split('\n');
	if (lines.length) {
		para[0] = "";
	}
	for(i = 0;i < lines.length;i++) {
		if (!lines[i].replace(/\s/g, '').length) {
			if (prevlinewasspace) {
				continue;
			}
			else {
				parai++;
				prevlinewasspace = true;
			}
		}
		else {
			if (typeof para[parai] == 'undefined') {
				para[parai] = "";
			}
			if (!para[parai].length || para[parai][para[parai].length - 1] == " ") {
				para[parai] += lines[i];
			}	
			else {
				para[parai] += (" " + lines[i]);
			}
			prevlinewasspace = false;
		}
	}
	return para;
}

function Correct(subject, message) 
{
	if (GetResults(subject, message)) {
		para = minimizeParagraphs(message);
		res = "";
		for (i = 0; i < para.length; i++) {
			var words = para[i].split(" ");
			var linecpt = 0;
			for (j = 0; j < words.length; j++) {
				res += words[j] + " ";
				linecpt += words[j].length + 1;
				if (linecpt > 60) {
					res += "</br>";
					linecpt = 0;
				}
			}
			if (i < para.length - 1) {
				if (res.substr(res.length - 5) == "</br>") {
					res += "</br>";
				}
				else {
					res += "</br></br>";
				}
			}
		}
		if (!isSigned) 
		{
			res += "</br></br>-- </br>name.lastname</br>I used Netiquette Mail Corrector to correct my mail."
		}
		$("#corrected-subject").html(correctSubject(subject));
		$("#corrected-message").html(res);
	}
}
$(document).ready( function() {	
	$('.modal').modal();

	$("#verify").click( function() {
		subject = $("#subject").val();
		message = $("#message").val();
		GetResults(subject, message);
	});
	
	$("#correct").click( function() {
		subject = $("#subject").val();
		message = $("#message").val();
		Correct(subject, message);
	});
});
