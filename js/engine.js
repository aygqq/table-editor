var file;

var text = "";
var row_del = "\n";
var col_del = ",";
var row_del_out;
var col_del_out;

var contents = [[""]];

var num_cols;
var num_rows;

var intervalId;

var selected = "";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NAMES = ["Телефон", "Фамилия", "Имя", "Отчество", "Категория", "Доп. инф."]
var table = document.getElementById("contents");
initialize_empty();
get_file();


function initialize_empty() {
    text = "";
    contents = [[""]];
    row_del = "\n";
    col_del = ",";
    selected = "";
    
    while (table.firstChild) {
        table.removeChild(table.lastChild);
    }
    var head = document.createElement('tr');
    head.appendChild(create_th("-", ""));
    for (var c = 0; c < 6; c++) {
        head.appendChild(create_th(get_letter(c), NAMES[c]));
    }
    table.appendChild(head)
    add_row();
    clearInterval(intervalId);
    intervalId = setInterval(display_to_contents, 100);
    disable_buttons(true, true, false);
}

function get_letter(n) {
    n += 1;
    var s = "";
    do {
        s = LETTERS[(n - 1) % 26] + s;
        n = Math.floor((n - 1) / 26);
    } while (n > 0);
    return s;
}

function get_number(letters) {
    if (letters.length == 1) {
        return LETTERS.indexOf(letters) + 1;
    }
    return get_number(letters.slice(letters.length - 1)) + 26 * get_number(letters.slice(0, letters.length - 1));
}

function format_string_left(content, total, fill) {
    var out = String(content);
    for (var s = 0; s < total - content.length; s++) {
        out += fill;
    }
    return out;
}

function get_column_widths() {
    var col_widths = [];
    for (var c = 0; c < contents[0].length; c++) {
        col_widths[c] = 1;
    }
    for (var r = 0; r < contents.length; r++) {
        for (var c = 0; c < contents[r].length; c++) {
            if (contents[r][c].length > col_widths[c]) {
                col_widths[c] = contents[r][c].length;
            }
        }
    }
    return col_widths;
}

function load() {
    initialize_empty();
    get_file();
}

function split_text_to_contents() {
    if (text != "") {
        var rows = text.split(row_del);
        contents = [];
        num_cols = 0;
        for (var i in rows) {
            if (rows[i] != "") {
                var row = rows[i].split(col_del);
                contents.push(row);
                if (row.length > num_cols) {
                    num_cols = row.length;
                }
            }
        }
        num_rows = contents.length;
        for (var i in contents) {
            var row = contents[i];
            while (row.length < num_cols) {
                row.push("");
            }
        }
    }
}

function get_num_data_rows() {
    if (table.childNodes.length == 0) {
        return 0;
    }
    return table.childNodes.length - 1;
}

function get_num_data_cols() {
    if (table.childNodes.length == 0) {
        return 0;
    }
    if (table.childNodes[0].childNodes.length == 0) {
        return 0;
    }
    return table.childNodes[0].childNodes.length - 1;
}

function create_td(id) {
    var td = document.createElement("td");
    var input = document.createElement('input');
    input.classList.add('square');
    input.setAttribute('id', id);
    td.appendChild(input);
    td.onclick = select_cell_from_event;
    return td;
}

function create_th(id, text) {
    var th = document.createElement("th");
    th.setAttribute('id', id);
    th.classList.add('header');
    th.onclick = select_cell_from_event;
    th.innerText = text;
    return th;
}

function create_row(row_num, length) {
    var tr = document.createElement('tr');
    tr.appendChild(create_th(row_num, row_num));
    for (var c = 0; c < length; c++) {
        tr.appendChild(create_td(row_num + "-" + get_letter(c)));
    }
    return tr;
}


function contents_to_display() {
    while (table.firstChild) {
        table.removeChild(table.lastChild);
    }
    var head = document.createElement('tr');
    head.appendChild(create_th("-", ""));
    for (var c = 0; c < contents[0].length; c++) {
        head.appendChild(create_th(get_letter(c), NAMES[c]));
    }
    table.appendChild(head);
    for (var r = 0; r < contents.length; r++) {
        var tr = create_row(r + 1, contents[0].length);
        for (var c = 0; c < contents[r].length; c++) {
            tr.childNodes[c + 1].firstChild.value = contents[r][c];
        }
        table.appendChild(tr);
    }
}

function display_to_contents() {
    contents = [];
    var rows = table.childNodes;
    for (var r = 1; r < rows.length; r++) {
        var content_row = [];
        var trs = rows[r].childNodes;
        for (var c = 1; c < trs.length; c++) {
            content_row.push(trs[c].firstChild.value);
        }
        contents.push(content_row);
    }
}

function disable_buttons(bool1, bool2, bool3) {
    document.getElementById('delete').disabled = bool1;
    document.getElementById('insert').disabled = bool2;
    document.getElementById('add-row').disabled = bool3;
    // document.getElementById('add-col').disabled = bool3;
}

function has_selection() {
    return selected != null && selected != "" && selected != "-";
}

function deselect() {
    var selected_elements = document.getElementsByClassName("selected");
    while (selected_elements.length > 0) {
        selected_elements = document.getElementsByClassName("selected");
        selected_elements[0].classList.remove("selected");
    }
    selected = "";
    disable_buttons(true, true, false);
}

function select_cell(cellID) {
    // remove selected from all cells
    deselect();
    selected = cellID;
    if (has_selection() && !selected.includes("-")) {
        document.getElementById(selected).classList.add("selected");
        // highlight row or column
        var squares = table.getElementsByTagName('td');
        for (var i = 0; i < squares.length; i++) {
            if (squares[i].firstChild.getAttribute("id").split("-").includes(selected)) {
                squares[i].classList.add("selected");
            }
        }
        if (isNaN(selected)) {
            disable_buttons(true, true, false);
        } else {
            disable_buttons(get_num_data_rows() == 1, false, false);
        }
    }
}

function select_cell_from_event(e) {
    selected = e.srcElement.getAttribute("id");
    select_cell(selected);
}

function delete_selected() {
    if (has_selection()) {
        if (isNaN(selected)) {
            // if (get_num_data_cols() > 1) {
            //     delete_column(get_number(selected));
            // }
        } else {
            if (get_num_data_rows() > 1) {
                delete_row(Number(selected));
            }
        }
    }
    // deselect();
}

function delete_row(row) {
    if (row == get_num_data_rows()) {
        deselect();
    }
    var rows = table.childNodes;
    for (var r = row; r < rows.length - 1; r++) {
        var trs1 = rows[r].childNodes;
        var trs2 = rows[r + 1].childNodes;
        for (var c = 0; c < trs1.length; c++) {
            trs1[c].firstChild.value = trs2[c].firstChild.value;
        }
    }
    table.removeChild(table.lastChild);
}

function delete_column(col) {
    if (col == get_num_data_cols()) {
        deselect();
    }
    var rows = table.childNodes;
    rows[0].removeChild(rows[0].lastChild);
    for (var r = 1; r < rows.length; r++) {
        var trs = rows[r].childNodes;
        for (var c = col; c < trs.length - 1; c++) {
            trs[c].firstChild.value = trs[c + 1].firstChild.value;
        }
        rows[r].removeChild(rows[r].lastChild);
    }
}

function add_row() {
    table.appendChild(create_row(get_num_data_rows() + 1, get_num_data_cols()));
    select_cell(selected);
}

function add_column() {
    var rows = table.childNodes;
    var letter = get_letter(get_num_data_cols());
    var th = create_th(letter, letter.toUpperCase());
    rows[0].appendChild(th);
    for (var r = 1; r < rows.length; r++) {
        rows[r].appendChild(create_td(r + "-" + letter));
    }
    select_cell(selected);
}

function insert_selected() {
    if (has_selection()) {
        if (isNaN(selected)) {
            // insert_column(get_number(selected));
        } else {
            insert_row(selected);
        }
    }
}

function insert_row(row) {
    add_row();
    var rows = table.childNodes;
    var trs1, trs2;
    for (var r = rows.length - 1; r > row; r--) {
        trs1 = rows[r - 1].childNodes;
        trs2 = rows[r].childNodes;
        for (var c = 0; c < trs1.length; c++) {
            trs2[c].firstChild.value = trs1[c].firstChild.value;
        }
    }
    var trs = table.childNodes[row].childNodes;
    for (var c = 0; c < trs.length; c++) {
        trs[c].firstChild.value = "";
    }
}

function insert_column(col) {
    add_column();
    var rows = table.childNodes;
    for (var r = 1; r < rows.length; r++) {
        var trs = rows[r].childNodes;
        for (var c = trs.length - 1; c > col; c--) {
            trs[c].firstChild.value = trs[c - 1].firstChild.value;
        }
        trs[col].firstChild.value = "";
    }
}

function parse_file(json) {
    // console.log(json);
    for (var i in json.results) {
        var line = json.results[i];
        // console.log(line);
        for (var j in line) {
            // console.log(line[j]);
            if (j > 0) {
                text += ",";
            }
            text += line[j];
        }
        text += "\n";
    }
    split_text_to_contents();
    contents_to_display();
    deselect();
    disable_buttons(true, true, false);
}

function get_file() {
    // var url = 'http://localhost:8080'
    var url = 'http://' + window.location.hostname + ':8080'
    // console.log(url);
    var api = new RestClient(url);
    api.res('file');
    api.file('get').get().then(function(resfile) {
        parse_file(resfile);
    });
}

async function post_file(text) {
    var name = "";

    // const url = 'http://localhost:8080/file/set'
    const url = 'http://' + window.location.hostname + ':8080/file/set' 
    const data = JSON.stringify(contents);
    const other_params = {
        method : "POST",
        headers : { 
            "Content-Type" : "application/json; charset=UTF-8" 
        },
        body : data
    };

    let response = await fetch(url, other_params);

    if (response.ok) { // если HTTP-статус в диапазоне 200-299
        // получаем тело ответа (см. про этот метод ниже)
        let json = await response.json();
        initialize_empty();
        parse_file(json);
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
}




function format(rd, cd) {
    var t = "";
    for (var r = 0; r < contents.length; r++) {
        for (var c = 0; c < contents[0].length; c++) {
            t += contents[r][c];
            if (c != contents[0].length - 1) {
                t += cd;
            }
        }
        t += rd;
    }
    return t;
}
