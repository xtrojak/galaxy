import * as Plotly from "plotly";
import * as _ from "underscore";
import { request as requestDatasets } from "@galaxyproject/charts/lib/utilities/datasets";

_.extend(window.bundleEntries || {}, {
    load: function(options) {
        function unpack(rows, key) {
            return rows.map(function(row)
                { return row[key]; });}

        var chart = options.chart;
        var root = options.root;

        var pca_result = [[-3319620.1072033765, -2315287.815731736, -76118.74083265247], 
                           [-3250503.1922863396, -2227887.59391699, 76653.98224809414], 
                           [-3758033.641737464, 4303037.112285252, -1147.0858025365758], 
                           [4991670.270051215, 110691.70877630105, 32182.85157100945], 
                           [5336486.671175947, 129446.5885871675, -31571.007183913756]]


        var trace = {
            x:unpack(pca_result, 0), y: unpack(pca_result, 1), z: unpack(pca_result, 2),
            mode: 'markers',
            marker: {
                size: 5,
                line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5},
                opacity: 0.8},
            type: 'scatter3d'
        };

        var data = [trace];
        var layout = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
          }};

        $("#" + options.target).append('<div id="visualisation"><!-- Plotly chart will be drawn inside this DIV --></div>');

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
});
