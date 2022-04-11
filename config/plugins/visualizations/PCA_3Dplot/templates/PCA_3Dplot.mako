<%!
import sys
from io import StringIO
import csv

#from routes import url_for
#prefix = url_for("/")
#path = os.getcwd()
%>

<%
def PCA_3D_Plot():
    html = firstpart
    input = "\n".join(list(hda.datatype.dataprovider(hda, 'line', comment_char=none, provide_blank=True, strip_lines=False, strip_newlines=True)))
    table = csv.reader(StringIO(input), delimiter='\t')
    html += "var data = ["
    for row in table:
        html += str(row) + ",\n"
    html += "];\n"
    html += lastpart
    return html


firstpart = \
'''
<head>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src='https://cdn.jsdelivr.net/npm/pca-js@1.0.0/pca.min.js'></script>
</head>

<body>
  <div id="visualisation"><!-- Plotly chart will be drawn inside this DIV --></div>
  <script>setTimeout(function(){

function unpack(rows, key) {
	return rows.map(function(row)
	{ return row[key]; });}

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

'''

lastpart = \
'''

var data_start = 5;
var data_end = data[0].length;

var results = [];
for(var i = 1; i < data.length; i++){
  results.push(data[i].slice(data_start, data_end));
}

var vectors = PCA.getEigenVectors(results);
var adData = PCA.computeAdjustedData(results,vectors[0],vectors[1],vectors[2])
var pca_result = PCA.transpose(adData.adjustedData)

var trace = {
	x:unpack(pca_result, 0), y: unpack(pca_result, 1), z: unpack(pca_result, 2),
	mode: 'markers',
	marker: {
		size: 5,
		line: {
		color: 'rgba(217, 217, 217, 0.14)',
		width: 0.5},
		opacity: 0.8},
	text: unpack(data, 0).slice(1, data.length),
	hovertemplate: '<b>%{text}</b><br>' +
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
    }, 50);

  </script>
  <style>
  .modebar-btn--logo {
    display: none
  }
  #visualisation {
    overflow: hidden;
  }
  </style>
</body>
'''
plot = PCA_3D_Plot()

%>
${plot}