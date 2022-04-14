<%!
import sys
from io import StringIO
import csv
%>

<%
def create_option(option, value, selected):
    return '\t\t<option value="{0}"{1}>{2}</option>\n'.format(value, " selected" if selected else "", option)

def PCA_3D_Plot():
    html = first_part
    input = "\n".join(list(hda.datatype.dataprovider(hda, 'line', comment_char=none, provide_blank=True, strip_lines=False, strip_newlines=True)))
    table = csv.reader(StringIO(input), delimiter='\t')
    html += "\tvar data = [\n"
    for i, row in enumerate(table):
        if i == 0:
            header = row
        html += "\t\t\t" + str(row) + ",\n"
    html += "\t];\n"
    html += "\tvar header = " + str(header) + ";\n"
    html += second_part

    default_colour = 3
    default_data_start = 5
    for i in range(default_data_start):
        selected = False
        if i == default_colour:
             selected = True
        html += create_option(header[i], i, selected)

    html += third_part

    for i in range(len(header) - 2):
        selected = False
        if i == default_data_start:
            selected = True
        html += create_option(i, i, selected)

    html += last_part

    return html


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

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script><style id="plotly.js-style-global"></style>
<script src="https://cdn.jsdelivr.net/npm/pca-js@1.0.0/pca.min.js"></script>

<script type="text/javascript">
    function compute_pca(data, data_start) {
        // actual data used for PCA computation
        var numerical_data = filter_numerical_values(data, data_start, data[0].length);

        var vectors = PCA.getEigenVectors(numerical_data);
        var adData = PCA.computeAdjustedData(numerical_data,vectors[0],vectors[1],vectors[2])
        return PCA.transpose(adData.adjustedData)
    }
</script>

<script type="text/javascript">
    function compute_colours(colour_column, data) {
        var colour_column = unpack(data, colour_column).slice(1, data.length)
        var unique = colour_column.filter(onlyUnique);
        var colours = [];
        for(var i = 0; i < colour_column.length; i++){
          colours.push(unique.indexOf(colour_column[i]));
        }
        return colours
    }
</script>

<script type="text/javascript">
    function filter_numerical_values(data, data_start, data_end) {
        var numerical_data = [];
        for(var i = 1; i < data.length; i++){
          numerical_data.push(data[i].slice(data_start, data_end));
        }
        return numerical_data
    }
</script>

<script type="text/javascript">
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
</script>

<script type="text/javascript">
    function unpack(rows, key) {
        return rows.map(function(row)
            { return row[key]; }
      );
    }
</script>

<script type="text/javascript">
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
</script>

<script type="text/javascript">
    function update_options() {
        var arr_options = [];
        if (colour_column >= data_start) {
            colour_column = data_start - 1;
            colours = compute_colours(colour_column, data);
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
</script>

<script type="text/javascript">
    function colour_changed() {
        colour_column = document.getElementById("colour_column").value
        colours = compute_colours(colour_column, data);
        create_plot(pca_result, colours, annotations);
    }
</script>

<script type="text/javascript">
    function data_start_changed() {
        data_start = document.getElementById("data_start").value;
        update_options();
        annotations = compute_annotations(data, data_start);
        pca_result = compute_pca(data, data_start);
        create_plot(pca_result, colours, annotations);
    }
</script>

<script type="text/javascript">
'''

second_part = \
'''
    var pca_result = [];
    var colours = [];
    var annotations = [];
    var colour_column = 3;
    var data_start = 5;

    function loadVisualisation() {
        // PCA
        pca_result = compute_pca(data, data_start);
        // create colours of individual data pointse);
        colours = compute_colours(colour_column, data);
        // add metadata to hover text of individual data points
        annotations = compute_annotations(data, data_start);

        create_plot(pca_result, colours, annotations);
    }
</script>

<script type="text/javascript">
    function create_plot(pca_result, colours, annotations) {
        var layout = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
          },
          hoverlabel: { bgcolor: "#FFF" },
          xaxis: {title: 'PC 0', zeroline: false},
          yaxis: {title: 'PC 1', zeroline: false},
          zaxis: {title: 'PC 2', zeroline: false}
        };

        var trace = {
            x:unpack(pca_result, 0), y: unpack(pca_result, 1), z: unpack(pca_result, 2),
            mode: 'markers',
            marker: {
                size: 5,
                color: colours,
                opacity: 0.8},
            text: annotations,
            hovertemplate: '%{text}' +
                           '<br>PC 0: %{x:.5f}' +
                           '<br>PC 1: %{y:.5f}' +
                           '<br>PC 2: %{z:.5f}',
            type: 'scatter3d'
        };

        var data = [trace];

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
plot = PCA_3D_Plot()

%>
${plot}