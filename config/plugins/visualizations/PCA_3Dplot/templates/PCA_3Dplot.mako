<%!
import sys
from io import StringIO
import csv
%>

<%
first_part = \
'''
<head>

<style>
.modebar-btn--logo {
    display: none
}
#visualisation {
    overflow: hidden;
}
</style>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pca-js@1.0.0/pca.min.js"></script>

<script type="text/javascript">
'''

second_part = \
'''
    var pca_result = [];
    var colours = [];
    var annotations = [];
    var colour_column = 2;
    var data_start = 5;

    function compute_pca(data, data_start) {
        // actual data used for PCA computation
        var numerical_data = filter_numerical_values(data, data_start, data[0].length);

        var vectors = PCA.getEigenVectors(numerical_data);
        var adData = PCA.computeAdjustedData(numerical_data,vectors[0],vectors[1],vectors[2])
        return PCA.transpose(adData.adjustedData)
    }

    function get_colours(colour_column, data) {
        return unpack(data, colour_column).slice(1, data.length)
    }

    function filter_numerical_values(data, data_start, data_end) {
        var numerical_data = [];
        for(var i = 1; i < data.length; i++){
          numerical_data.push(data[i].slice(data_start, data_end));
        }
        return numerical_data
    }

    function compute_annotations(data, data_start) {
        var headers = data[0].slice(0, data_start);
        var annotations = [];
        for(var i = 1; i < data.length; i++){
          var line  = data[i].slice(0, data_start);
          var annotation = ''
          for(var j = 0; j < headers.length; j++){
            annotation += `<b>${headers[j]}</b>: ${line[j]}<br>`
          }
          annotations.push(annotation);
        }
        return annotations
    }

    function unpack(rows, key) {
        return rows.map(function(row)
            { return row[key]; }
      );
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function update_options() {
        var arr_options = [];
        if (colour_column >= data_start) {
            colour_column = data_start - 1;
            colours = get_colours(colour_column, data);
            create_plot(pca_result, colours, annotations);
        }
        for (var i=0; i < data_start; i++) {
            if (colour_column == i) {
                var selected = ' selected';
            } else {
                var selected = '';
            }
            arr_options.push("<option value='" + i + "'" + selected + ">" + header[i] + "</option>");
        }
        document.getElementById("colour_column").innerHTML = arr_options;
    }

    function colour_changed() {
        colour_column = document.getElementById("colour_column").value
        colours = get_colours(colour_column, data);
        create_plot(pca_result, colours, annotations);
    }

    function data_start_changed() {
        data_start = document.getElementById("data_start").value;
        update_options();
        annotations = compute_annotations(data, data_start);
        pca_result = compute_pca(data, data_start);
        create_plot(pca_result, colours, annotations);
    }

    function loadVisualisation() {
        // PCA
        pca_result = compute_pca(data, data_start);
        // create colours of individual data pointse);
        colours = get_colours(colour_column, data);
        // add metadata to hover text of individual data points
        annotations = compute_annotations(data, data_start);

        create_plot(pca_result, colours, annotations);
    }

    function filter_based_on_colour(data, colours, target_colour) {
        var result = [];
        for (var j = 0; j < colours.length; j++){
            if (colours[j] == target_colour){
                result.push(data[j])
            }
        }
        return result
    }

    function create_plot(pca_result, colours, annotations) {
        var layout = {
            hoverlabel: { bgcolor: "#FFF" },
            scene: {
                xaxis: {title: 'PC 0'},
                yaxis: {title: 'PC 1'},
                zaxis: {title: 'PC 2',}
            }
        };

        var data = [];
        var unique_colours = colours.filter(onlyUnique);

        for (var i = 0; i < unique_colours.length; i++){
            var trace_data = filter_based_on_colour(pca_result, colours, unique_colours[i])
            var trace_annotations = filter_based_on_colour(annotations, colours, unique_colours[i])

            var trace = {
                x:unpack(trace_data, 0), y: unpack(trace_data, 1), z: unpack(trace_data, 2),
                mode: 'markers',
                name: unique_colours[i],
                marker: {
                    size: 8,
                    color: i,
                    opacity: 0.8,
                    colorscale: 'Jet'},
                text: trace_annotations,
                showlegend: true,
                hovertemplate: '%{text}' +
                               '<br>PC 0: %{x:.5f}' +
                               '<br>PC 1: %{y:.5f}' +
                               '<br>PC 2: %{z:.5f}' +
                               '<extra></extra>',
                type: 'scatter3d'
            };
            data.push(trace);
        }

        var d3 = Plotly.d3;
        var WIDTH_IN_PERCENT_OF_PARENT = 100,
            HEIGHT_IN_PERCENT_OF_PARENT = 95;
        var gd3 = d3.select("div[id='visualisation']")
            .style({
                width: WIDTH_IN_PERCENT_OF_PARENT + '%',
                'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',
                height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
                'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
            });
        var res_graph = gd3.node();
        Plotly.newPlot(res_graph, data, layout);
        window.onresize = function() { Plotly.Plots.resize( res_graph ); };
    }
</script>
</head>

<body onload="loadVisualisation()">
  <div id="combos">
    <label for="colour_column">Colour column</label>
    <select id="colour_column" onchange="colour_changed();">
'''

third_part = \
'''
</select>
    <label for="data_start">Data start column</label>
    <select id="data_start" onchange="data_start_changed();">
'''

last_part = \
'''
    </select>
  </div>
  <div id="visualisation"><!-- Plotly chart will be drawn inside this DIV --></div>
</body>
'''

def create_option(option, value, selected):
    return '\t\t<option value="{0}"{1}>{2}</option>\n'.format(value, " selected" if selected else "", option)

def create_options(header):
    default_colour = 3
    default_data_start = 5
    colour_options = ""
    for i in range(default_data_start):
        selected = False
        if i == default_colour:
             selected = True
        colour_options += create_option(header[i], i, selected)

    start_options = ""
    for i in range(len(header) - 2):
        selected = False
        if i == default_data_start:
            selected = True
        start_options += create_option(i, i, selected)

    return colour_options, start_options

def load_data():
    input = "\n".join(list(hda.datatype.dataprovider(hda, 'line', comment_char=none, provide_blank=True, strip_lines=False, strip_newlines=True)))
    tabular_file = StringIO(input)
    dialect = csv.Sniffer().sniff(tabular_file.read(1024), delimiters=";,\t")
    tabular_file.seek(0)
    table = csv.reader(tabular_file, dialect)
    data = "[\n"
    for i, row in enumerate(table):
        if i == 0:
            header = row
        data += "\t" + str(row) + ",\n"
    data += "];\n"
    return data, header

def PCA_3D_Plot():
    html = first_part
    data, header = load_data()
    html += "\tvar data =" + data
    html += "\tvar header = " + str(header) + ";\n"
    html += second_part
    colour_options, start_options = create_options(header)
    html += colour_options
    html += third_part
    html += start_options
    html += last_part
    return html

plot = PCA_3D_Plot()
%>
${plot}